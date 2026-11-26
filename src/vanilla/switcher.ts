import { menu, type MenuHandle } from './menu'

/** One tool the bar's name can switch to. */
export interface SwitchTool {
  id: string
  /** The name as the bar prints it. */
  label: string
  /** Where the tool lives. With it the item is a link. */
  href?: string
  /** One line under the name in the menu. */
  note?: string
}

export interface ToolSwitchOptions {
  /** The tool on screen; its item carries aria-current. */
  current?: string
  /** A tool was picked. Not called for the tool already on screen. */
  onPick?: (id: string, item: HTMLElement) => void
  onToggle?: (open: boolean) => void
}

export interface ToolSwitchHandle extends MenuHandle {
  readonly current: string
  setCurrent(id: string): void
}

/** The HTML of the switcher's menu items; the name of each in plain text. */
export function switchItemsHtml(tools: readonly SwitchTool[], current = ''): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return tools
    .map((t) => {
      const cur = t.id === current ? ' aria-current="true"' : ''
      const body = `<span class="hb-toolswitch-item-name">${esc(t.label)}</span>${t.note ? `<span class="hb-toolswitch-item-note">${esc(t.note)}</span>` : ''}`
      return t.href
        ? `<a class="hb-menu-item hb-toolswitch-item" href="${esc(t.href)}" data-value="${esc(t.id)}"${cur}>${body}</a>`
        : `<button type="button" class="hb-menu-item hb-toolswitch-item" data-value="${esc(t.id)}"${cur}>${body}</button>`
    })
    .join('')
}

/**
 * The bar's tool name as the switcher, over `.hb-toolswitch` markup: a
 * `.hb-toolswitch-btn` (a `.hb-toolswitch-name`, the accent, a chevron)
 * and a `.hb-menu` of `.hb-toolswitch-item`s. Keys, focus and outside
 * press are the menu's. The item of the tool on screen carries
 * aria-current and picking it only closes the menu.
 */
export function toolSwitch(wrap: HTMLElement, options: ToolSwitchOptions = {}): ToolSwitchHandle {
  const trigger = wrap.querySelector<HTMLElement>('.hb-toolswitch-btn') ?? undefined
  let current = options.current ?? wrap.querySelector<HTMLElement>('.hb-toolswitch-item[aria-current="true"]')?.dataset.value ?? ''
  const mark = () => {
    for (const i of wrap.querySelectorAll<HTMLElement>('.hb-toolswitch-item')) {
      if (i.dataset.value === current) i.setAttribute('aria-current', 'true')
      else i.removeAttribute('aria-current')
    }
  }
  mark()
  const m = menu(wrap, {
    trigger,
    onToggle: (open) => {
      wrap.classList.toggle('is-open', open)
      options.onToggle?.(open)
    },
    onSelect(value, item) {
      if (value === current) return
      current = value
      mark()
      options.onPick?.(value, item)
    },
  })
  return {
    open: m.open,
    toggle: m.toggle,
    close: m.close,
    get isOpen() { return m.isOpen },
    dispose: m.dispose,
    get current() { return current },
    setCurrent(id) { current = id; mark() },
  }
}
