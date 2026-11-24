export interface MenuOptions {
  /** The button that opens the menu. Default: the first button in the
      wrap that is not inside the menu. */
  trigger?: HTMLElement
  /** The `.hb-menu` panel. Default: the first `.hb-menu` in the wrap. */
  menu?: HTMLElement
  /** An item was chosen. Its value is `data-value`, else its text. */
  onSelect?: (value: string, item: HTMLElement) => void
}

export interface MenuHandle {
  open(focus?: 'first' | 'last'): void
  close(returnFocus?: boolean): void
  readonly isOpen: boolean
  dispose(): void
}

/**
 * A menu over `.hb-menu-wrap` markup: a trigger and a `.hb-menu` of
 * `.hb-menu-item` buttons. The trigger opens it and focus goes to the
 * first item (the last with ArrowUp). In the menu, up and down move with
 * wrap, Home and End jump, a letter moves to the next item starting with
 * it, Escape closes and returns focus to the trigger, Tab closes. A click
 * outside closes. Disabled items are skipped.
 */
export function menu(wrap: HTMLElement, options: MenuOptions = {}): MenuHandle {
  const doc = wrap.ownerDocument
  const panel = options.menu ?? wrap.querySelector<HTMLElement>('.hb-menu')
  if (!panel) throw new Error('menu: no .hb-menu inside the wrap')
  const trigger =
    options.trigger ?? [...wrap.querySelectorAll<HTMLElement>('button')].find((b) => !panel.contains(b))
  if (!trigger) throw new Error('menu: no trigger button')

  panel.setAttribute('role', 'menu')
  trigger.setAttribute('aria-haspopup', 'menu')
  trigger.setAttribute('aria-expanded', 'false')
  if (panel.id) trigger.setAttribute('aria-controls', panel.id)
  panel.hidden = true
  let isOpen = false

  const items = () =>
    [...panel.querySelectorAll<HTMLElement>('[role="menuitem"],.hb-menu-item')].filter(
      (i) => !i.hasAttribute('disabled') && i.getAttribute('aria-disabled') !== 'true',
    )
  for (const i of panel.querySelectorAll<HTMLElement>('.hb-menu-item')) {
    i.setAttribute('role', 'menuitem')
    i.tabIndex = -1
  }

  function open(focus: 'first' | 'last' = 'first') {
    if (!isOpen) {
      isOpen = true
      panel!.hidden = false
      trigger!.setAttribute('aria-expanded', 'true')
      doc.addEventListener('pointerdown', onOutside)
    }
    const list = items()
    ;(focus === 'last' ? list[list.length - 1] : list[0])?.focus()
  }

  function close(returnFocus = true) {
    if (!isOpen) return
    isOpen = false
    panel!.hidden = true
    trigger!.setAttribute('aria-expanded', 'false')
    doc.removeEventListener('pointerdown', onOutside)
    if (returnFocus) trigger!.focus()
  }

  function onOutside(e: Event) {
    if (!wrap.contains(e.target as Node)) close(false)
  }

  function onTriggerClick() {
    if (isOpen) close()
    else open('first')
  }

  function onTriggerKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); open('first') }
    else if (e.key === 'ArrowUp') { e.preventDefault(); open('last') }
  }

  function onMenuKey(e: KeyboardEvent) {
    const list = items()
    const at = list.indexOf(doc.activeElement as HTMLElement)
    let next = -1
    if (e.key === 'ArrowDown') next = at < 0 || at === list.length - 1 ? 0 : at + 1
    else if (e.key === 'ArrowUp') next = at <= 0 ? list.length - 1 : at - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = list.length - 1
    else if (e.key === 'Escape') { e.preventDefault(); close(); return }
    else if (e.key === 'Tab') { close(false); return }
    else if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const ch = e.key.toLowerCase()
      for (let k = 1; k <= list.length; k++) {
        const i = (at + k) % list.length
        if ((list[i]!.textContent ?? '').trim().toLowerCase().startsWith(ch)) { next = i; break }
      }
      if (next < 0) return
    } else return
    e.preventDefault()
    list[next]?.focus()
  }

  function onMenuClick(e: Event) {
    const item = (e.target as Element).closest<HTMLElement>('[role="menuitem"]')
    if (!item || !panel!.contains(item) || !items().includes(item)) return
    options.onSelect?.(item.dataset.value ?? (item.textContent ?? '').trim(), item)
    close()
  }

  trigger.addEventListener('click', onTriggerClick)
  trigger.addEventListener('keydown', onTriggerKey)
  panel.addEventListener('keydown', onMenuKey)
  panel.addEventListener('click', onMenuClick)

  return {
    open,
    close,
    get isOpen() {
      return isOpen
    },
    dispose() {
      close(false)
      trigger.removeEventListener('click', onTriggerClick)
      trigger.removeEventListener('keydown', onTriggerKey)
      panel.removeEventListener('keydown', onMenuKey)
      panel.removeEventListener('click', onMenuClick)
    },
  }
}
