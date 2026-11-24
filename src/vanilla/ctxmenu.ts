/** A point inside the area that owns the menu, in CSS pixels. */
export interface CtxAt {
  x: number
  y: number
}

/** How the menu was asked for: a right click, a long press, or the menu
    key (or Shift+F10) on the focused element. */
export type CtxVia = 'mouse' | 'touch' | 'key'

/** Hold this long on touch to open the menu, in ms. */
export const LONG_PRESS_MS = 500
/** A finger that moves further than this, in px, is a drag, not a press. */
export const LONG_PRESS_SLOP = 10

/**
 * Where the menu goes: below and right of the point by `gap`, then pulled
 * back so it stays inside the box. A box smaller than the menu pins it to
 * the top left corner.
 */
export function clampMenu(at: CtxAt, size: { w: number; h: number }, box: { w: number; h: number }, gap = 8): CtxAt {
  const x = Math.max(0, Math.min(at.x + gap, box.w - size.w - gap))
  const y = Math.max(0, Math.min(at.y + gap, box.h - size.h - gap))
  return { x: Math.round(x), y: Math.round(y) }
}

/** True for the keyboard's menu key and for Shift+F10. */
export function isMenuKey(e: { key: string; shiftKey?: boolean }): boolean {
  return e.key === 'ContextMenu' || (e.key === 'F10' && !!e.shiftKey)
}

/** The next item index for a key in a list of `n`, from `at` (-1 when
    none has focus), or -1 when the key does not move. Wraps. */
export function stepIndex(key: string, at: number, n: number): number {
  if (n <= 0) return -1
  if (key === 'ArrowDown') return at < 0 || at >= n - 1 ? 0 : at + 1
  if (key === 'ArrowUp') return at <= 0 ? n - 1 : at - 1
  if (key === 'Home') return 0
  if (key === 'End') return n - 1
  return -1
}

export interface ContextTriggerOptions {
  /** The menu was asked for at `at`, relative to the area, over `target`. */
  onOpen: (at: CtxAt, via: CtxVia, target: Element) => void
  longPress?: number
  slop?: number
}

/**
 * Wires the three ways to ask for a context menu on `area`: right click,
 * a long press on touch or pen, and the menu key or Shift+F10 while focus
 * is inside it. The long press eats the click that follows it, and the
 * browser's own contextmenu event that some phones fire during the press,
 * so one hold opens one menu. The key opens at the middle of the focused
 * element.
 */
export function contextTrigger(area: HTMLElement, options: ContextTriggerOptions): { dispose(): void } {
  const wait = options.longPress ?? LONG_PRESS_MS
  const slop = options.slop ?? LONG_PRESS_SLOP
  const win = area.ownerDocument.defaultView
  let timer: ReturnType<typeof setTimeout> | null = null
  let start: { x: number; y: number; target: Element } | null = null
  let firedAt = 0

  const rel = (cx: number, cy: number): CtxAt => {
    const r = area.getBoundingClientRect()
    return { x: cx - r.left, y: cy - r.top }
  }
  const cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
    start = null
  }
  const recent = () => Date.now() - firedAt < 800

  function onContext(e: MouseEvent) {
    e.preventDefault()
    if (recent()) return
    const touching = start !== null
    if (touching) {
      // The browser beat the timer: open once, as the long press.
      const s = start!
      cancel()
      firedAt = Date.now()
      options.onOpen(rel(s.x, s.y), 'touch', s.target)
      return
    }
    options.onOpen(rel(e.clientX, e.clientY), 'mouse', e.target as Element)
  }

  function onDown(e: PointerEvent) {
    if (e.pointerType === 'mouse' || e.button > 0) return
    cancel()
    start = { x: e.clientX, y: e.clientY, target: e.target as Element }
    timer = setTimeout(() => {
      const s = start
      cancel()
      if (!s) return
      firedAt = Date.now()
      options.onOpen(rel(s.x, s.y), 'touch', s.target)
    }, wait)
  }

  function onMove(e: PointerEvent) {
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > slop) cancel()
  }

  function onClick(e: Event) {
    if (!recent()) return
    e.preventDefault()
    e.stopPropagation()
  }

  function onKey(e: KeyboardEvent) {
    if (!isMenuKey(e)) return
    e.preventDefault()
    const t = (e.target as HTMLElement) ?? area
    const ar = area.getBoundingClientRect()
    const r = t === area ? ar : t.getBoundingClientRect()
    options.onOpen(rel(r.left + r.width / 2, r.top + r.height / 2), 'key', t)
  }

  area.addEventListener('contextmenu', onContext)
  area.addEventListener('pointerdown', onDown)
  area.addEventListener('pointermove', onMove)
  area.addEventListener('pointerup', cancel)
  area.addEventListener('pointercancel', cancel)
  area.addEventListener('click', onClick, true)
  area.addEventListener('keydown', onKey)
  win?.addEventListener('scroll', cancel, true)

  return {
    dispose() {
      cancel()
      area.removeEventListener('contextmenu', onContext)
      area.removeEventListener('pointerdown', onDown)
      area.removeEventListener('pointermove', onMove)
      area.removeEventListener('pointerup', cancel)
      area.removeEventListener('pointercancel', cancel)
      area.removeEventListener('click', onClick, true)
      area.removeEventListener('keydown', onKey)
      win?.removeEventListener('scroll', cancel, true)
    },
  }
}

export interface CtxPanelOptions {
  /** An item was chosen. The panel is already closed. */
  onPick?: (item: HTMLElement) => void
  /** The panel closed, by a pick, Escape, Tab or a press outside. */
  onClose?: () => void
}

export interface CtxPanelHandle {
  /** Shows the panel at `at` inside a box of `box`, focuses the first
      item, and remembers `opener` to hand focus back to. */
  show(at: CtxAt, box: { w: number; h: number }, opener?: HTMLElement | null): void
  close(returnFocus?: boolean): void
  readonly isOpen: boolean
  dispose(): void
}

/**
 * The panel half of a context menu: a `.hb-ctx` of `.hb-menu-item`
 * buttons. Shown, it is placed inside its box, takes focus, moves with
 * the arrows, Home, End and a first letter; Escape closes and returns
 * focus to the opener, Tab closes, a press outside closes. A pick closes
 * and returns focus too.
 */
export function ctxPanel(panel: HTMLElement, options: CtxPanelOptions = {}): CtxPanelHandle {
  const doc = panel.ownerDocument
  let isOpen = false
  let opener: HTMLElement | null = null
  panel.setAttribute('role', 'menu')
  panel.hidden = true

  const items = () =>
    [...panel.querySelectorAll<HTMLElement>('.hb-menu-item')].filter(
      (i) => !i.hasAttribute('disabled') && i.getAttribute('aria-disabled') !== 'true',
    )

  function show(at: CtxAt, box: { w: number; h: number }, from?: HTMLElement | null) {
    opener = from ?? null
    for (const i of panel.querySelectorAll<HTMLElement>('.hb-menu-item')) {
      i.setAttribute('role', 'menuitem')
      i.tabIndex = -1
    }
    panel.hidden = false
    const p = clampMenu(at, { w: panel.offsetWidth, h: panel.offsetHeight }, box)
    panel.style.left = `${p.x}px`
    panel.style.top = `${p.y}px`
    if (!isOpen) doc.addEventListener('pointerdown', onOutside, true)
    isOpen = true
    items()[0]?.focus()
  }

  function close(returnFocus = true) {
    if (!isOpen) return
    isOpen = false
    panel.hidden = true
    doc.removeEventListener('pointerdown', onOutside, true)
    if (returnFocus) opener?.focus()
    options.onClose?.()
  }

  function onOutside(e: Event) {
    if (!panel.contains(e.target as Node)) close(false)
  }

  function onKey(e: KeyboardEvent) {
    const list = items()
    const at = list.indexOf(doc.activeElement as HTMLElement)
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return }
    if (e.key === 'Tab') { close(false); return }
    let next = stepIndex(e.key, at, list.length)
    if (next < 0 && e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const ch = e.key.toLowerCase()
      for (let k = 1; k <= list.length; k++) {
        const i = (at + k) % list.length
        if ((list[i]!.textContent ?? '').trim().toLowerCase().startsWith(ch)) { next = i; break }
      }
    }
    if (next < 0) return
    e.preventDefault()
    list[next]?.focus()
  }

  function onClick(e: Event) {
    const item = (e.target as Element).closest<HTMLElement>('.hb-menu-item')
    if (!item || !items().includes(item)) return
    close()
    options.onPick?.(item)
  }

  panel.addEventListener('keydown', onKey)
  panel.addEventListener('click', onClick)

  return {
    show,
    close,
    get isOpen() {
      return isOpen
    },
    dispose() {
      close(false)
      panel.removeEventListener('keydown', onKey)
      panel.removeEventListener('click', onClick)
    },
  }
}
