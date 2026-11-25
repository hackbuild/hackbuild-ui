import { focusables } from './focus'

export interface BarMoreOptions {
  /** The more panel opened (true) or closed (false). */
  onToggle?: (open: boolean) => void
}

export interface BarMoreHandle {
  open(): void
  close(returnFocus?: boolean): void
  toggle(): void
  readonly isOpen: boolean
  dispose(): void
}

/**
 * The overflow of a one row toolbar (CLEVIS): `.hb-bar-more` holds a
 * `.hb-bar-more-btn` and a `.hb-bar-more-panel`. Under 641 px the panel
 * folds behind the button and drops under the bar when open; wider, the
 * stylesheet lays its controls into the row and the button is not shown.
 * The panel holds real controls (a seed field, a file button), so it is a
 * disclosure, not a menu: the button opens it and focus goes to its first
 * control; Escape closes and returns focus; a press outside or focus
 * leaving closes.
 */
export function barMore(wrap: HTMLElement, options: BarMoreOptions = {}): BarMoreHandle {
  const doc = wrap.ownerDocument
  const btn = wrap.querySelector<HTMLElement>('.hb-bar-more-btn')
  const panel = wrap.querySelector<HTMLElement>('.hb-bar-more-panel')
  if (!btn || !panel) throw new Error('barMore: needs .hb-bar-more-btn and .hb-bar-more-panel')
  let open = false
  btn.setAttribute('aria-expanded', 'false')
  if (panel.id) btn.setAttribute('aria-controls', panel.id)

  function set(on: boolean) {
    if (on === open) return
    open = on
    wrap.classList.toggle('is-open', on)
    btn!.setAttribute('aria-expanded', String(on))
    options.onToggle?.(on)
  }
  function show() {
    set(true)
    focusables(panel!)[0]?.focus()
  }
  function close(returnFocus = false) {
    if (!open) return
    set(false)
    if (returnFocus) btn!.focus()
  }
  const onClick = () => (open ? close() : show())
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.preventDefault()
      close(true)
    }
  }
  const onDown = (e: Event) => {
    if (open && !wrap.contains(e.target as Node)) close()
  }
  const onOut = (e: FocusEvent) => {
    const to = e.relatedTarget as Node | null
    if (open && to && !wrap.contains(to)) close()
  }
  btn.addEventListener('click', onClick)
  wrap.addEventListener('keydown', onKey)
  wrap.addEventListener('focusout', onOut)
  doc.addEventListener('pointerdown', onDown)
  return {
    open: show,
    close,
    toggle: onClick,
    get isOpen() { return open },
    dispose() {
      btn.removeEventListener('click', onClick)
      wrap.removeEventListener('keydown', onKey)
      wrap.removeEventListener('focusout', onOut)
      doc.removeEventListener('pointerdown', onDown)
    },
  }
}
