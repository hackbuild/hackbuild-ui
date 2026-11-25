import { focusables } from './focus'

export interface BarMoreOptions {
  /** The more panel opened (true) or closed (false). */
  onToggle?: (open: boolean) => void
  /** Fit the bar around the wrap to its own width with barFit, with these
      options. On by default when the wrap sits in `.hb-bar.is-overflow`;
      false leaves the fold to the page. */
  fit?: boolean | BarFitOptions
}

export interface BarMoreHandle {
  open(): void
  close(returnFocus?: boolean): void
  toggle(): void
  readonly isOpen: boolean
  /** The barFit handle, or null when fitting is off. */
  readonly fit: BarFitHandle | null
  dispose(): void
}

/**
 * The overflow of a one row toolbar (CLEVIS): `.hb-bar-more` holds a
 * `.hb-bar-more-btn` and a `.hb-bar-more-panel`. On a folded bar (see
 * barFit) the panel sits behind the button and drops under the bar when
 * open; unfolded, the stylesheet lays its controls into the row and the
 * button is not shown.
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
  const bar = wrap.parentElement
  const fitOn = options.fit ?? !!bar?.matches('.hb-bar.is-overflow')
  const fitter = fitOn && bar ? barFit(bar, typeof fitOn === 'object' ? fitOn : {}) : null
  return {
    open: show,
    close,
    toggle: onClick,
    get isOpen() { return open },
    fit: fitter,
    dispose() {
      fitter?.dispose()
      btn.removeEventListener('click', onClick)
      wrap.removeEventListener('keydown', onKey)
      wrap.removeEventListener('focusout', onOut)
      doc.removeEventListener('pointerdown', onDown)
    },
  }
}

export interface BarFitOptions {
  /** Bar width in px under which the row folds even when it fits. */
  foldBelow?: number
  /** True when the bar's row runs past its width. Reads scrollWidth
      against clientWidth by default; tests pass their own. */
  overflows?: (bar: HTMLElement) => boolean
  /** The fold or the spill changed. */
  onChange?: (state: BarFitState) => void
}

export interface BarFitState {
  /** The row is one line: labels dropped, the more slot behind its button. */
  folded: boolean
  /** Items moved from the row into the more panel. */
  spilled: number
}

export interface BarFitHandle extends BarFitState {
  /** Measure now and fold or spill to fit. */
  fit(): void
  /** Measure only when the bar or an item in its row changed size since
      the last fit, or after restore. */
  update(): void
  /** Put every spilled item back in its place in the row. A framework
      calls this before it patches the row and update after. */
  restore(): void
  dispose(): void
}

// scrollWidth equals clientWidth both when the row fits and when it runs
// over by under a pixel, and a wrapping row breaks on that fraction, so
// the right edge of the last box is read from its rect.
function wide(bar: HTMLElement): boolean {
  const view = bar.ownerDocument.defaultView
  if (!view) return false
  const cs = view.getComputedStyle(bar)
  const edge = bar.getBoundingClientRect().right - parseFloat(cs.paddingRight || '0') - parseFloat(cs.borderRightWidth || '0')
  let right = -Infinity
  const walk = (parent: Element) => {
    for (const c of parent.children) {
      const d = view.getComputedStyle(c).display
      if (d === 'contents') walk(c)
      else if (d !== 'none') right = Math.max(right, c.getBoundingClientRect().right + parseFloat(view.getComputedStyle(c).marginRight || '0'))
    }
  }
  walk(bar)
  return right > edge + 0.5
}

/**
 * Fit a one row toolbar (`.hb-bar.is-overflow`) to its own width, not the
 * window's: a bar in a narrow column folds at any window width. Unfolded,
 * the row is tried on one line; if it runs over, or the bar is under
 * `foldBelow` px, the bar takes `.is-folded` (labels drop, the more slot
 * goes behind its button). If the folded row still runs over, items from
 * the end of the row before `.hb-bar-more` move into the start of the
 * more panel, last first, until it fits. Items after `.hb-bar-more` (the
 * end slot) never move. A ResizeObserver on the bar and its row keeps it
 * current. `.is-none` on `.hb-bar-more` marks an empty panel, which hides
 * the button.
 */
export function barFit(bar: HTMLElement, options: BarFitOptions = {}): BarFitHandle {
  const foldBelow = options.foldBelow ?? 641
  const overflows = options.overflows ?? wide
  const doc = bar.ownerDocument
  const view = doc.defaultView as (Window & typeof globalThis) | null
  const moved: { el: Element; next: Node | null }[] = []
  let folded = false
  let dirty = true
  let sig = ''
  let raf = 0

  const wrap = () => bar.querySelector<HTMLElement>(':scope > .hb-bar-more')
  const panel = () => bar.querySelector<HTMLElement>(':scope > .hb-bar-more > .hb-bar-more-panel')
  const sign = () => [bar.clientWidth, ...[...bar.children].map((c) => (c as HTMLElement).offsetWidth)].join(' ')

  function restore() {
    for (let i = moved.length - 1; i >= 0; i--) {
      const { el, next } = moved[i]
      bar.insertBefore(el, next && next.parentNode === bar ? next : wrap())
    }
    moved.length = 0
    dirty = true
  }

  function fit() {
    const active = doc.activeElement as HTMLElement | null
    const was = `${folded} ${moved.length}`
    restore()
    const w = bar.clientWidth
    let fold = w < foldBelow
    if (!fold) {
      bar.classList.remove('is-folded')
      bar.classList.add('is-probe')
      fold = overflows(bar)
      bar.classList.remove('is-probe')
    }
    folded = fold
    bar.classList.toggle('is-folded', fold)
    const box = panel()
    const more = wrap()
    if (fold && box && more) {
      const row: Element[] = []
      for (const c of bar.children) {
        if (c === more) break
        if (!c.classList.contains('hb-spacer')) row.push(c)
      }
      while (row.length && overflows(bar)) {
        const el = row.pop()!
        moved.push({ el, next: el.nextSibling })
        box.prepend(el)
      }
    }
    if (more && box) more.classList.toggle('is-none', !box.firstElementChild)
    if (active && active.isConnected && doc.activeElement !== active) active.focus({ preventScroll: true })
    dirty = false
    sig = sign()
    observe()
    if (`${folded} ${moved.length}` !== was) options.onChange?.({ folded, spilled: moved.length })
  }

  function update() {
    if (dirty || sign() !== sig) fit()
  }

  const ro = view && typeof view.ResizeObserver === 'function'
    ? new view.ResizeObserver(() => {
        if (raf) return
        raf = view.requestAnimationFrame(() => { raf = 0; update() })
      })
    : null
  function observe() {
    if (!ro) return
    ro.disconnect()
    ro.observe(bar)
    for (const c of bar.children) ro.observe(c)
  }

  // A web font that lands late widens the labels without resizing the
  // bar or, on a folded row, any item in it.
  const fonts = (doc as Document & { fonts?: FontFaceSet }).fonts
  const onFonts = () => fit()
  fonts?.addEventListener?.('loadingdone', onFonts)
  fit()
  return {
    fit,
    update,
    restore,
    get folded() { return folded },
    get spilled() { return moved.length },
    dispose() {
      fonts?.removeEventListener?.('loadingdone', onFonts)
      ro?.disconnect()
      if (raf) view?.cancelAnimationFrame(raf)
      restore()
      bar.classList.remove('is-folded', 'is-probe')
      wrap()?.classList.remove('is-none')
    },
  }
}
