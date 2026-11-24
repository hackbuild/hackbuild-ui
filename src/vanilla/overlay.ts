import { focusables } from './focus'

export type CloseReason = 'escape' | 'scrim' | 'button' | 'api'

export interface OverlayOptions {
  /** Start open. Default false: the root gets `hidden`. */
  open?: boolean
  /** A button that toggles the overlay; its aria-expanded follows. */
  trigger?: HTMLElement
  /** Accessible name, written to aria-label on the dialog. */
  label?: string
  /** Default true. */
  closeOnEscape?: boolean
  /** Close on a click on the dimmed area around the panel. Default true. */
  closeOnScrim?: boolean
  /** Keep Tab inside the panel. Default true. */
  trap?: boolean
  /** Stop the page behind from scrolling while open. Default true. */
  lockScroll?: boolean
  /** The element to focus on open. Default: the first focusable in the
      panel, else the panel. */
  initialFocus?: () => HTMLElement | null | undefined
  onOpen?: () => void
  onClose?: (reason: CloseReason) => void
}

export interface OverlayHandle {
  open(): void
  close(reason?: CloseReason): void
  toggle(): void
  readonly isOpen: boolean
  dispose(): void
}

export interface DrawerOptions extends OverlayOptions {
  /** 'bottom' is the phone sheet: `.is-sheet`, 74 percent tall, and one
      sheet open at a time (opening one closes the others). 'auto' is the
      sheet under `breakpoint` and the right drawer from it, live. */
  side?: 'left' | 'right' | 'bottom' | 'auto'
  /** Width in px where side 'auto' turns from sheet to right drawer.
      Default 761, where the suite's tab strip returns. */
  breakpoint?: number
}

// Open overlays, newest last. Escape and the Tab trap act on the top one.
const stack: object[] = []
let locks = 0
let savedOverflow = ''

function lock(doc: Document) {
  if (locks++ === 0) {
    savedOverflow = doc.body.style.overflow
    doc.body.style.overflow = 'hidden'
  }
}
function release(doc: Document) {
  if (locks > 0 && --locks === 0) doc.body.style.overflow = savedOverflow
}

// Drawers that are or can turn into bottom sheets, with their roots.
// Opening a sheet closes the other open sheets.
const sheets = new Map<OverlayHandle, HTMLElement>()

function overlay(root: HTMLElement, panel: HTMLElement, o: OverlayOptions, group?: Map<OverlayHandle, HTMLElement>): OverlayHandle {
  const doc = root.ownerDocument
  const me = {}
  let isOpen = false
  let back: HTMLElement | null = null
  let locked = false

  if (!panel.getAttribute('role') && !root.getAttribute('role')) panel.setAttribute('role', 'dialog')
  const dialog = root.getAttribute('role') === 'dialog' ? root : panel
  dialog.setAttribute('aria-modal', 'true')
  if (o.label) dialog.setAttribute('aria-label', o.label)
  if (!panel.hasAttribute('tabindex')) panel.tabIndex = -1
  o.trigger?.setAttribute('aria-expanded', 'false')

  function onKey(e: KeyboardEvent) {
    if (!isOpen || stack[stack.length - 1] !== me || e.defaultPrevented) return
    if (e.key === 'Escape' && o.closeOnEscape !== false) {
      e.preventDefault()
      close('escape')
      return
    }
    if (e.key !== 'Tab' || o.trap === false) return
    const items = focusables(panel)
    if (!items.length) { e.preventDefault(); panel.focus(); return }
    const first = items[0]!
    const last = items[items.length - 1]!
    const active = doc.activeElement
    const inside = !!active && panel.contains(active)
    if (e.shiftKey && (active === first || !inside)) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && (active === last || !inside)) { e.preventDefault(); first.focus() }
  }

  function onClick(e: MouseEvent) {
    if (!isOpen) return
    const t = e.target as Element
    if (t === root && o.closeOnScrim !== false) { close('scrim'); return }
    const btn = t.closest?.('[data-hb-close]')
    if (btn && root.contains(btn)) close('button')
  }

  function onTrigger() {
    toggle()
  }

  function open() {
    if (isOpen) return
    if (group && root.classList.contains('is-sheet')) {
      for (const [other, el] of [...group]) if (other !== handle && el.classList.contains('is-sheet')) other.close('api')
    }
    isOpen = true
    back = doc.activeElement as HTMLElement | null
    root.hidden = false
    stack.push(me)
    if (o.lockScroll !== false) { lock(doc); locked = true }
    doc.addEventListener('keydown', onKey)
    o.trigger?.setAttribute('aria-expanded', 'true')
    const target = o.initialFocus?.() ?? focusables(panel)[0] ?? panel
    target.focus()
    o.onOpen?.()
  }

  function close(reason: CloseReason = 'api') {
    if (!isOpen) return
    isOpen = false
    root.hidden = true
    const at = stack.indexOf(me)
    if (at >= 0) stack.splice(at, 1)
    if (locked) { release(doc); locked = false }
    doc.removeEventListener('keydown', onKey)
    o.trigger?.setAttribute('aria-expanded', 'false')
    if (back && back.isConnected) back.focus()
    back = null
    o.onClose?.(reason)
  }

  function toggle() {
    if (isOpen) close('button')
    else open()
  }

  root.addEventListener('click', onClick)
  o.trigger?.addEventListener('click', onTrigger)
  root.hidden = true

  const handle: OverlayHandle = {
    open,
    close,
    toggle,
    get isOpen() {
      return isOpen
    },
    dispose() {
      if (isOpen) close('api')
      group?.delete(handle)
      root.removeEventListener('click', onClick)
      o.trigger?.removeEventListener('click', onTrigger)
    },
  }
  group?.set(handle, root)
  if (o.open) open()
  return handle
}

/**
 * A modal over `.hb-modal > .hb-panel` markup. On open, focus moves into
 * the panel and Tab stays inside it; Escape and a click on the dim area
 * close it; focus goes back to what had it before. Any element inside
 * with `data-hb-close` closes it. Escape acts on the newest open overlay
 * only, and a handler that already took the key (preventDefault) wins.
 * With closeOnEscape false the modal still holds Escape while it is the
 * newest: the key closes nothing, and never falls to the overlay beneath.
 */
export function modal(el: HTMLElement, options: OverlayOptions = {}): OverlayHandle {
  return overlay(el, el.querySelector<HTMLElement>(':scope > .hb-panel') ?? el, options)
}

/** A drawer over `.hb-drawer > .hb-drawer-panel` markup, with the modal's
    focus, Escape, scrim and return rules. `side` sets `.is-left`, or
    `.is-sheet` for the bottom sheet; one sheet is open at a time. Side
    'auto' follows the width live: a sheet under `breakpoint`, the right
    drawer from it. */
export function drawer(el: HTMLElement, options: DrawerOptions = {}): OverlayHandle {
  const side = options.side ?? 'right'
  el.classList.toggle('is-left', side === 'left')
  el.classList.toggle('is-sheet', side === 'bottom')
  const panel = el.querySelector<HTMLElement>(':scope > .hb-drawer-panel') ?? el
  const view = el.ownerDocument.defaultView
  const query = side === 'auto' && typeof view?.matchMedia === 'function'
    ? view.matchMedia(`(min-width: ${options.breakpoint ?? 761}px)`)
    : null
  const read = () => { el.classList.toggle('is-sheet', !query?.matches) }
  if (side === 'auto') read()
  query?.addEventListener('change', read)
  const handle = overlay(el, panel, options, side === 'bottom' || side === 'auto' ? sheets : undefined)
  if (!query) return handle
  const dispose = handle.dispose
  handle.dispose = () => { query.removeEventListener('change', read); dispose() }
  return handle
}
