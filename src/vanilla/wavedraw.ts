/** A selection on the strip, in seconds, start before end. */
export interface WaveSel {
  start: number
  end: number
}

/** Min and max per column: `n` pairs from samples between -1 and 1. */
export function wavePeaks(samples: ArrayLike<number>, n: number): Array<[number, number]> {
  const out: Array<[number, number]> = []
  const len = samples.length
  if (!len || n < 1) return out
  for (let c = 0; c < n; c++) {
    const a = Math.floor((c * len) / n)
    const b = Math.max(a + 1, Math.floor(((c + 1) * len) / n))
    let lo = 1
    let hi = -1
    for (let i = a; i < b && i < len; i++) {
      const v = samples[i]!
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
    out.push([Math.max(-1, lo), Math.min(1, hi)])
  }
  return out
}

/** A time for the strip's readout: m:ss.d. */
export function waveTime(sec: number): string {
  const tenths = Math.round(Math.max(0, sec) * 10)
  const m = Math.floor(tenths / 600)
  const r = tenths - m * 600
  return `${m}:${String(Math.floor(r / 10)).padStart(2, '0')}.${r % 10}`
}

/** Two times as a selection inside 0 to dur, start first; null when it has no length. */
export function waveSel(a: number, b: number, dur: number): WaveSel | null {
  const c = (v: number) => Math.max(0, Math.min(dur, v))
  const start = c(Math.min(a, b))
  const end = c(Math.max(a, b))
  return end - start > 0 ? { start, end } : null
}

/** The readout line: the playhead over the length, and the selection when there is one. */
export function waveLine(at: number, dur: number, sel: WaveSel | null): string {
  const base = `${waveTime(at)} / ${waveTime(dur)}`
  return sel ? `${base}, picked ${waveTime(sel.start)} to ${waveTime(sel.end)}` : base
}

export interface WaveDrawerOptions {
  samples?: ArrayLike<number> | null
  /** Length in seconds. */
  duration?: number
  /** Playhead in seconds. */
  at?: number
  sel?: WaveSel | null
  /** Start open. Default true. */
  open?: boolean
  onSeek?: (at: number) => void
  onSelect?: (sel: WaveSel | null) => void
  onToggle?: (open: boolean) => void
}

export interface WaveDrawerHandle {
  setSamples(samples: ArrayLike<number> | null, duration?: number): void
  setAt(at: number): void
  setSel(sel: WaveSel | null): void
  readonly at: number
  readonly sel: WaveSel | null
  readonly isOpen: boolean
  toggle(open?: boolean): void
  draw(): void
  dispose(): void
}

/**
 * A waveform drawer over `.hb-wavedraw` markup: a head with a
 * `.hb-wavedraw-toggle` and a `.hb-wavedraw-time` readout, and a body
 * with a `.hb-wavedraw-canvas`. A press seeks, a drag picks a span,
 * arrows move the playhead (shift arrows grow the span), Home and End
 * jump, Escape drops the span. The toggle folds the strip to its head.
 */
export function waveDrawer(root: HTMLElement, options: WaveDrawerOptions = {}): WaveDrawerHandle {
  const doc = root.ownerDocument
  const win = doc.defaultView
  const canvas = root.querySelector<HTMLCanvasElement>('.hb-wavedraw-canvas')
  if (!canvas) throw new Error('waveDrawer: no .hb-wavedraw-canvas')
  const toggleBtn = root.querySelector<HTMLElement>('.hb-wavedraw-toggle')
  const timeEl = root.querySelector<HTMLElement>('.hb-wavedraw-time')
  const body = root.querySelector<HTMLElement>('.hb-wavedraw-body')
  let samples = options.samples ?? null
  let dur = options.duration ?? 0
  let at = options.at ?? 0
  let sel = options.sel ?? null
  let open = options.open ?? true
  let anchor = -1
  let down: { x: number; t: number } | null = null

  canvas.tabIndex = 0
  canvas.setAttribute('role', 'slider')
  canvas.setAttribute('aria-label', canvas.getAttribute('aria-label') ?? 'playhead')
  canvas.style.touchAction = 'none'
  if (body && !body.id) body.id = `hb-wavedraw-${Math.random().toString(36).slice(2, 8)}`
  if (toggleBtn && body) toggleBtn.setAttribute('aria-controls', body.id)

  const css = (name: string, fb: string) => {
    try { return (win?.getComputedStyle(root).getPropertyValue(name) || fb).trim() } catch { return fb }
  }

  function readout() {
    if (timeEl) timeEl.textContent = waveLine(at, dur, sel)
    canvas!.setAttribute('aria-valuemin', '0')
    canvas!.setAttribute('aria-valuemax', String(Math.round(dur * 10) / 10))
    canvas!.setAttribute('aria-valuenow', String(Math.round(at * 10) / 10))
    canvas!.setAttribute('aria-valuetext', waveLine(at, dur, sel))
  }

  function draw() {
    readout()
    root.classList.toggle('is-open', open)
    if (body) body.hidden = !open
    toggleBtn?.setAttribute('aria-expanded', String(open))
    if (!open) return
    const g = canvas!.getContext?.('2d')
    if (!g) return
    const dpr = win?.devicePixelRatio || 1
    const w = (canvas!.width = Math.max(1, Math.round(canvas!.clientWidth * dpr)))
    const h = (canvas!.height = Math.max(1, Math.round(canvas!.clientHeight * dpr)))
    g.clearRect(0, 0, w, h)
    const x = (t: number) => (dur > 0 ? (t / dur) * w : 0)
    if (sel) {
      g.fillStyle = css('--hb-pink-18', 'rgba(254,3,134,.18)')
      g.fillRect(x(sel.start), 0, Math.max(dpr, x(sel.end) - x(sel.start)), h)
    }
    g.fillStyle = css('--hb-ink', '#1a1a1a')
    const cols = Math.max(1, Math.floor(w / dpr))
    const peaks = samples ? wavePeaks(samples, cols) : []
    const mid = h / 2
    peaks.forEach(([lo, hi], i) => {
      const y0 = mid - hi * mid * 0.92
      const y1 = mid - lo * mid * 0.92
      g.fillRect(i * dpr, y0, dpr, Math.max(dpr, y1 - y0))
    })
    if (!peaks.length) g.fillRect(0, Math.round(mid), w, dpr)
    g.fillStyle = css('--hb-pink', '#FE0386')
    g.fillRect(Math.round(x(at) - dpr), 0, 2 * dpr, h)
  }

  const timeAt = (clientX: number) => {
    const r = canvas!.getBoundingClientRect()
    return r.width > 0 ? Math.max(0, Math.min(dur, ((clientX - r.left) / r.width) * dur)) : 0
  }
  function seek(t: number) {
    at = Math.max(0, Math.min(dur, t))
    draw()
    options.onSeek?.(at)
  }
  function pick(s: WaveSel | null) {
    sel = s
    draw()
    options.onSelect?.(sel)
  }

  function onDown(e: PointerEvent) {
    if (e.button !== undefined && e.button !== 0) return
    down = { x: e.clientX, t: timeAt(e.clientX) }
    canvas!.setPointerCapture?.(e.pointerId)
    canvas!.focus()
  }
  function onMove(e: PointerEvent) {
    if (!down || Math.abs(e.clientX - down.x) < 4) return
    sel = waveSel(down.t, timeAt(e.clientX), dur)
    draw()
  }
  function onUp(e: PointerEvent) {
    if (!down) return
    const moved = Math.abs(e.clientX - down.x) >= 4
    const t0 = down.t
    down = null
    if (moved) pick(waveSel(t0, timeAt(e.clientX), dur))
    else seek(t0)
  }
  function onKey(e: KeyboardEvent) {
    const step = dur / 100
    let to = at
    if (e.key === 'ArrowRight') to = at + step
    else if (e.key === 'ArrowLeft') to = at - step
    else if (e.key === 'Home') to = 0
    else if (e.key === 'End') to = dur
    else if (e.key === 'Escape' && sel) { e.preventDefault(); pick(null); return }
    else return
    e.preventDefault()
    if (e.shiftKey) {
      if (anchor < 0) anchor = sel ? (to > at ? sel.start : sel.end) : at
      pick(waveSel(anchor, to, dur))
    } else anchor = -1
    seek(to)
  }
  function onToggle() { toggle() }
  function toggle(next = !open) {
    if (next === open) return
    open = next
    draw()
    options.onToggle?.(open)
  }

  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('keydown', onKey)
  toggleBtn?.addEventListener('click', onToggle)
  const ro = win && 'ResizeObserver' in win ? new (win as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver(() => draw()) : null
  ro?.observe(canvas)
  draw()

  return {
    setSamples(s, d) { samples = s; if (d !== undefined) dur = d; draw() },
    setAt(t) { at = Math.max(0, Math.min(dur, t)); draw() },
    setSel(s) { sel = s ? waveSel(s.start, s.end, dur) : null; draw() },
    get at() { return at },
    get sel() { return sel },
    get isOpen() { return open },
    toggle,
    draw,
    dispose() {
      ro?.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('keydown', onKey)
      toggleBtn?.removeEventListener('click', onToggle)
    },
  }
}
