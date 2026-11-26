import type { HotkeyRegistry } from './hotkeys'

export interface ChipGroupOptions {
  /** Several on at once (toggle buttons). Default false: one on (radios). */
  multi?: boolean
  /** Values on at the start. Default: the chips marked `.is-on`. */
  value?: string[]
  /** Called with the values on after each change. */
  onChange?: (values: string[]) => void
  /** Bind each chip's `data-key` letter in this registry. */
  registry?: HotkeyRegistry
  /** Key map heading for those letters. */
  group?: string
}

export interface ChipGroupHandle {
  readonly value: string[]
  /** Set the values on, without calling onChange. */
  set(values: string[]): void
  dispose(): void
}

const chipsOf = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>('[data-value]')]
const usable = (c: HTMLElement) => !c.hasAttribute('disabled') && c.getAttribute('aria-disabled') !== 'true'

/**
 * Chips with `data-value` inside `el`. Single: a radiogroup, one chip in
 * the tab order, arrows move and choose with wrap, Home and End. Multi:
 * toggle buttons with aria-pressed, each in the tab order. A chip with an
 * empty value is the off choice: in multi it clears the others. A chip's
 * `data-key` letter chooses it through `registry`.
 */
export function chipGroup(el: HTMLElement, options: ChipGroupOptions = {}): ChipGroupHandle {
  const multi = !!options.multi
  el.setAttribute('role', multi ? 'group' : 'radiogroup')
  let value: string[] = options.value ?? chipsOf(el).filter((c) => c.classList.contains('is-on')).map((c) => c.dataset.value!)
  if (!multi) value = value.slice(0, 1)

  function draw() {
    const chips = chipsOf(el)
    const focusAt = Math.max(0, chips.findIndex((c) => value.includes(c.dataset.value!)))
    chips.forEach((c, i) => {
      const on = value.includes(c.dataset.value!)
      c.classList.toggle('is-on', on)
      if (multi) {
        c.removeAttribute('role')
        c.setAttribute('aria-pressed', String(on))
      } else {
        c.setAttribute('role', 'radio')
        c.setAttribute('aria-checked', String(on))
        c.tabIndex = i === focusAt ? 0 : -1
      }
    })
  }

  function choose(v: string) {
    if (multi) {
      if (v === '') value = ['']
      else {
        const rest = value.filter((x) => x !== '')
        value = rest.includes(v) ? rest.filter((x) => x !== v) : [...rest, v]
      }
    } else {
      if (value[0] === v) return
      value = [v]
    }
    draw()
    options.onChange?.([...value])
  }

  function onClick(e: Event) {
    const c = (e.target as Element).closest<HTMLElement>('[data-value]')
    if (!c || !el.contains(c) || !usable(c)) return
    choose(c.dataset.value!)
  }

  function onKey(e: KeyboardEvent) {
    if (multi) return
    const chips = chipsOf(el).filter(usable)
    const at = chips.indexOf(e.target as HTMLElement)
    if (at < 0) return
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (at + 1) % chips.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (at - 1 + chips.length) % chips.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = chips.length - 1
    else return
    e.preventDefault()
    choose(chips[next]!.dataset.value!)
    chips[next]!.focus()
  }

  let unbind: (() => void) | null = null
  if (options.registry) {
    const keyed = chipsOf(el).filter((c) => c.dataset.key)
    unbind = options.registry.add(
      keyed.map((c) => ({
        keys: c.dataset.key!,
        label: (c.getAttribute('aria-label') ?? c.textContent ?? '').trim(),
        group: options.group,
        run: () => { if (usable(c)) choose(c.dataset.value!) },
      })),
    )
  }

  el.addEventListener('click', onClick)
  el.addEventListener('keydown', onKey)
  draw()

  return {
    get value() {
      return [...value]
    },
    set(values) {
      value = multi ? [...values] : values.slice(0, 1)
      draw()
    },
    dispose() {
      unbind?.()
      el.removeEventListener('click', onClick)
      el.removeEventListener('keydown', onKey)
    },
  }
}

export interface ToolRailOptions {
  /** The tool on at the start. Default: the button marked `.is-on`. */
  value?: string
  onChange?: (id: string) => void
  /** Bind each tool's `data-key` letter in this registry. */
  registry?: HotkeyRegistry
  group?: string
}

export interface ToolRailHandle {
  readonly value: string
  set(id: string): void
  dispose(): void
}

/**
 * A tool rail over `.hb-toolrail`: buttons with `data-tool`, a `data-key`
 * letter and a `data-hint`. One tool is on (aria-pressed); arrows move
 * along the rail and choose, Home and End jump. The letters come from the
 * same buttons and are bound in `registry`, so the printed key, the
 * keydown map and the key map are one table. `.hb-toolrail-hint` shows
 * the hint of the tool that is on.
 *
 * Tools inside a `.hb-railgroup` share one place in the rail, as the
 * shape tools of the earlier mask studio do: the rail shows the group's
 * last used tool, the others wait in its `.hb-railgroup-menu` as
 * `data-pick` items. Pressing the shown tool when it is on, the cross
 * arrow (right on a vertical rail, down on a horizontal one) or a right
 * click opens the menu; a letter still picks any tool directly.
 */
export function toolRail(el: HTMLElement, options: ToolRailOptions = {}): ToolRailHandle {
  const doc = el.ownerDocument
  el.setAttribute('role', 'toolbar')
  const vertical = el.getAttribute('aria-orientation') !== 'horizontal'
  if (vertical) el.setAttribute('aria-orientation', 'vertical')
  const tools = () => [...el.querySelectorAll<HTMLElement>('[data-tool]')]
  const groups = () => [...el.querySelectorAll<HTMLElement>('.hb-railgroup')]
  const membersOf = (g: HTMLElement) => [...g.querySelectorAll<HTMLElement>('[data-tool]')]
  const menuOf = (g: HTMLElement) => g.querySelector<HTMLElement>('.hb-railgroup-menu')
  const itemsOf = (g: HTMLElement) => [...g.querySelectorAll<HTMLElement>('[data-pick]')].filter(usable)
  const hint = el.querySelector<HTMLElement>('.hb-toolrail-hint')
  let value = options.value ?? tools().find((t) => t.classList.contains('is-on'))?.dataset.tool ?? tools()[0]?.dataset.tool ?? ''
  // the member each group shows in the rail: the tool last used from it
  const shown = new Map<HTMLElement, string>()
  let openGroup: HTMLElement | null = null

  function draw() {
    for (const t of tools()) {
      const on = t.dataset.tool === value
      t.classList.toggle('is-on', on)
      t.setAttribute('aria-pressed', String(on))
      t.tabIndex = on ? 0 : -1
      if (on && hint) hint.textContent = t.dataset.hint ?? ''
    }
    for (const g of groups()) {
      const ms = membersOf(g)
      const has = ms.find((m) => m.dataset.tool === value)
      const id = has?.dataset.tool ?? shown.get(g) ?? ms[0]?.dataset.tool ?? ''
      shown.set(g, id)
      for (const m of ms) {
        const vis = m.dataset.tool === id
        m.hidden = !vis
        if (vis) {
          m.setAttribute('aria-haspopup', 'menu')
          m.setAttribute('aria-expanded', String(openGroup === g))
        }
      }
      for (const i of g.querySelectorAll<HTMLElement>('[data-pick]')) {
        i.setAttribute('role', 'menuitemradio')
        i.setAttribute('aria-checked', String(i.dataset.pick === value))
        i.tabIndex = -1
      }
      g.classList.toggle('is-on', !!has)
    }
  }

  function choose(id: string) {
    if (id === value) return
    value = id
    draw()
    options.onChange?.(id)
  }

  function place(g: HTMLElement, m: HTMLElement) {
    const btn = membersOf(g).find((x) => !x.hidden)
    const win = doc.defaultView
    if (!btn || !win) return
    const r = btn.getBoundingClientRect()
    const mw = m.offsetWidth || 180
    const mh = m.offsetHeight || 0
    let left = vertical ? r.right + 6 : r.left
    let top = vertical ? r.top : r.bottom + 6
    left = Math.max(6, Math.min(left, win.innerWidth - mw - 6))
    top = Math.max(6, Math.min(top, win.innerHeight - mh - 6))
    m.style.left = `${left}px`
    m.style.top = `${top}px`
  }

  function openMenu(g: HTMLElement, focus = true) {
    const m = menuOf(g)
    if (!m) return
    if (openGroup && openGroup !== g) closeMenu(false)
    openGroup = g
    m.hidden = false
    g.classList.add('is-open')
    place(g, m)
    draw()
    doc.addEventListener('pointerdown', onOutside)
    if (focus) (itemsOf(g).find((i) => i.dataset.pick === value) ?? itemsOf(g)[0])?.focus()
  }

  function closeMenu(returnFocus = true) {
    const g = openGroup
    if (!g) return
    openGroup = null
    const m = menuOf(g)
    if (m) m.hidden = true
    g.classList.remove('is-open')
    doc.removeEventListener('pointerdown', onOutside)
    draw()
    if (returnFocus) membersOf(g).find((x) => !x.hidden)?.focus()
  }

  function onOutside(e: Event) {
    if (openGroup && !openGroup.contains(e.target as Node)) closeMenu(false)
  }

  function onClick(e: Event) {
    const target = e.target as Element
    const item = target.closest<HTMLElement>('[data-pick]')
    if (item && el.contains(item)) {
      if (!usable(item)) return
      choose(item.dataset.pick!)
      closeMenu()
      return
    }
    const t = target.closest<HTMLElement>('[data-tool]')
    if (!t || !el.contains(t) || !usable(t)) return
    const g = t.closest<HTMLElement>('.hb-railgroup')
    // a group's button opens its menu when its tool is already on
    if (g && el.contains(g) && t.dataset.tool === value) {
      if (openGroup === g) closeMenu()
      else openMenu(g)
      return
    }
    choose(t.dataset.tool!)
  }

  function onContext(e: Event) {
    const g = (e.target as Element).closest<HTMLElement>('.hb-railgroup')
    if (!g || !el.contains(g)) return
    e.preventDefault()
    openMenu(g)
  }

  function onKey(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    if (openGroup && openGroup.contains(target) && target.dataset.pick !== undefined) {
      const list = itemsOf(openGroup)
      const at = list.indexOf(target)
      let to = -1
      if (e.key === 'ArrowDown') to = (at + 1) % list.length
      else if (e.key === 'ArrowUp') to = (at - 1 + list.length) % list.length
      else if (e.key === 'Home') to = 0
      else if (e.key === 'End') to = list.length - 1
      else if (e.key === 'Escape' || (vertical && e.key === 'ArrowLeft')) { e.preventDefault(); closeMenu(); return }
      else if (e.key === 'Tab') { closeMenu(false); return }
      else return
      e.preventDefault()
      list[to]?.focus()
      return
    }
    const list = tools().filter((t) => usable(t) && !t.hidden)
    const at = list.indexOf(target)
    if (at < 0) return
    const g = target.closest<HTMLElement>('.hb-railgroup')
    if (g && e.key === (vertical ? 'ArrowRight' : 'ArrowDown')) {
      e.preventDefault()
      openMenu(g)
      return
    }
    const next = vertical ? 'ArrowDown' : 'ArrowRight'
    const prev = vertical ? 'ArrowUp' : 'ArrowLeft'
    let to = -1
    if (e.key === next) to = (at + 1) % list.length
    else if (e.key === prev) to = (at - 1 + list.length) % list.length
    else if (e.key === 'Home') to = 0
    else if (e.key === 'End') to = list.length - 1
    else return
    e.preventDefault()
    choose(list[to]!.dataset.tool!)
    // a group may have swapped the button it shows
    const now = tools().find((t) => t.dataset.tool === list[to]!.dataset.tool && !t.hidden) ?? list[to]!
    now.focus()
  }

  let unbind: (() => void) | null = null
  if (options.registry) {
    unbind = options.registry.add(
      tools().filter((t) => t.dataset.key).map((t) => ({
        keys: t.dataset.key!.toLowerCase(),
        label: (t.getAttribute('aria-label') ?? t.textContent ?? '').trim(),
        group: options.group ?? 'tools',
        run: () => { if (usable(t)) choose(t.dataset.tool!) },
      })),
    )
  }

  el.addEventListener('click', onClick)
  el.addEventListener('keydown', onKey)
  el.addEventListener('contextmenu', onContext)
  for (const g of groups()) { const m = menuOf(g); if (m) { m.hidden = true; m.setAttribute('role', 'menu') } }
  draw()

  return {
    get value() {
      return value
    },
    set(id) {
      value = id
      draw()
    },
    dispose() {
      unbind?.()
      closeMenu(false)
      el.removeEventListener('click', onClick)
      el.removeEventListener('keydown', onKey)
      el.removeEventListener('contextmenu', onContext)
    },
  }
}

/**
 * A toggle row over `.hb-togrow`: the whole row is one button with
 * role="switch", label and description inside, the switch drawn at the
 * end. A press flips aria-checked and `.is-on`.
 */
export function toggleRow(el: HTMLElement, onChange?: (on: boolean) => void): { readonly on: boolean; set(on: boolean): void; dispose(): void } {
  el.setAttribute('role', 'switch')
  let on = el.getAttribute('aria-checked') === 'true'
  const draw = () => { el.setAttribute('aria-checked', String(on)); el.classList.toggle('is-on', on) }
  function onClick() {
    if (!usable(el)) return
    on = !on
    draw()
    onChange?.(on)
  }
  el.addEventListener('click', onClick)
  draw()
  return {
    get on() {
      return on
    },
    set(v) {
      on = v
      draw()
    },
    dispose() {
      el.removeEventListener('click', onClick)
    },
  }
}

export interface RadioCardsOptions {
  /** The value chosen at the start. Default: the radio already checked. */
  value?: string
  /** Called with the value after the user picks a card. */
  onChange?: (value: string) => void
  /** Group name for radios that carry none. */
  name?: string
}

export interface RadioCardsHandle {
  readonly value: string
  /** Check the card with this value, without calling onChange. */
  set(value: string): void
  dispose(): void
}

let rcSeq = 0

/**
 * Radio cards over `.hb-rcards`: `label.hb-rcard` rows, each a native
 * radio and a `.hb-rcard-title`, `.hb-rcard-desc`, `.hb-rcard-trade`.
 * The group gets role radiogroup and one name, so the browser gives
 * Tab into the checked card and arrows between cards; each radio is
 * named by its title and described by its meaning and trade.
 */
export function radioCards(el: HTMLElement, options: RadioCardsOptions = {}): RadioCardsHandle {
  if (!el.getAttribute('role')) el.setAttribute('role', 'radiogroup')
  rcSeq += 1
  const base = `hb-rc-${rcSeq}`
  const name = options.name ?? base
  const inputs = () => [...el.querySelectorAll<HTMLInputElement>('input[type=radio]')]
  inputs().forEach((input, i) => {
    if (!input.name) input.name = name
    const card = input.closest('.hb-rcard')
    if (!card) return
    const part = (cls: string, tag: string) => {
      const p = card.querySelector<HTMLElement>(cls)
      if (p && !p.id) p.id = `${base}-${i}-${tag}`
      return p?.id
    }
    const title = part('.hb-rcard-title', 'n')
    if (title) input.setAttribute('aria-labelledby', title)
    const desc = [part('.hb-rcard-desc', 'd'), part('.hb-rcard-trade', 't')].filter(Boolean).join(' ')
    if (desc) input.setAttribute('aria-describedby', desc)
    card.classList.toggle('is-disabled', input.disabled)
  })
  const current = () => inputs().find((r) => r.checked)?.value ?? ''
  const set = (v: string) => { for (const r of inputs()) r.checked = r.value === v }
  if (options.value !== undefined) set(options.value)
  function onChange(e: Event) {
    const t = e.target as HTMLInputElement
    if (t.type === 'radio' && t.checked) options.onChange?.(t.value)
  }
  el.addEventListener('change', onChange)
  return {
    get value() {
      return current()
    },
    set,
    dispose() {
      el.removeEventListener('change', onChange)
    },
  }
}
