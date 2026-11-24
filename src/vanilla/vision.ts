// Prompt canvas, instance list, dual range and compare split: the pure
// parts, framework free. Every prompt lives in image pixels, never in
// screen pixels, so a decoder gets the same numbers at any zoom.

/* Prompts -------------------------------------------------------------- */

/** A point or a box on the image, in image pixels. `positive` false marks
    what the mask must leave out. */
export type SegPrompt =
  | { kind: 'point'; x: number; y: number; positive: boolean }
  | { kind: 'box'; x0: number; y0: number; x1: number; y1: number; positive: boolean }

export type PromptTool = 'positive' | 'negative' | 'box'

/** Key letters on the tool rail: p add, n leave out, b box. */
export const PROMPT_KEYS: Record<string, PromptTool> = { p: 'positive', n: 'negative', b: 'box' }

export interface PromptRect { left: number; top: number; width: number; height: number }

/** Where an image of w by h sits inside a box with object-fit contain. */
export function containRect(box: { width: number; height: number }, w: number, h: number): PromptRect {
  if (!(w > 0 && h > 0 && box.width > 0 && box.height > 0)) return { left: 0, top: 0, width: box.width, height: box.height }
  const s = Math.min(box.width / w, box.height / h)
  const width = w * s
  const height = h * s
  return { left: (box.width - width) / 2, top: (box.height - height) / 2, width, height }
}

/**
 * A pointer at client x, y over an element showing a w by h image with
 * object-fit contain, in image pixels. Null on the letterbox, so a press
 * there places nothing. `clamp` pins a drag that leaves the image to its
 * edge instead.
 */
export function toImage(clientX: number, clientY: number, el: PromptRect, w: number, h: number, clamp = false): { x: number; y: number } | null {
  const r = containRect(el, w, h)
  const u = (clientX - el.left - r.left) / r.width
  const v = (clientY - el.top - r.top) / r.height
  if (!clamp && (u < 0 || v < 0 || u > 1 || v > 1)) return null
  return { x: Math.min(w, Math.max(0, u * w)), y: Math.min(h, Math.max(0, v * h)) }
}

/** An image pixel as a percent of the element, for placing a marker. */
export function toView(x: number, y: number, el: { width: number; height: number }, w: number, h: number): { left: number; top: number } {
  const r = containRect(el, w, h)
  return {
    left: el.width ? ((r.left + (x / w) * r.width) / el.width) * 100 : 0,
    top: el.height ? ((r.top + (y / h) * r.height) / el.height) * 100 : 0,
  }
}

/** Two corners as an ordered box clamped to the image, whole pixels. */
export function normBox(a: { x: number; y: number }, b: { x: number; y: number }, w: number, h: number) {
  const c = (v: number, m: number) => Math.round(Math.min(m, Math.max(0, v)))
  return { x0: c(Math.min(a.x, b.x), w), y0: c(Math.min(a.y, b.y), h), x1: c(Math.max(a.x, b.x), w), y1: c(Math.max(a.y, b.y), h) }
}

/** A drag shorter than this many image pixels on either side is a tap. */
export function isBox(b: { x0: number; y0: number; x1: number; y1: number }, min = 4): boolean {
  return b.x1 - b.x0 >= min && b.y1 - b.y0 >= min
}

/** A point moved by dx, dy image pixels, held inside the image. */
export function nudge(p: { x: number; y: number }, dx: number, dy: number, w: number, h: number) {
  return { x: Math.min(w, Math.max(0, Math.round(p.x + dx))), y: Math.min(h, Math.max(0, Math.round(p.y + dy))) }
}

/** The arrow key step on an image: 1 percent of the long side, 10 with
    shift, never under one pixel. */
export function promptStep(w: number, h: number, big = false): number {
  return Math.max(1, Math.round(Math.max(w, h) * (big ? 0.1 : 0.01)))
}

/** The line a screen reader hears when a prompt lands. */
export function promptWord(p: SegPrompt): string {
  const sign = p.positive ? 'keep' : 'leave out'
  return p.kind === 'point'
    ? `${sign} point at ${Math.round(p.x)}, ${Math.round(p.y)}`
    : `${sign} box ${Math.round(p.x0)}, ${Math.round(p.y0)} to ${Math.round(p.x1)}, ${Math.round(p.y1)}`
}

/**
 * Hover throttle for a mask preview: at most one call per `ms` (50, as the
 * original decoded at the cursor), and the last point always lands once
 * the gap is up, so the preview ends where the pointer stopped.
 */
export function hoverThrottle<T>(fn: (v: T) => void, ms = 50, clock: { now(): number; set(f: () => void, t: number): unknown; clear(id: unknown): void } = {
  now: () => Date.now(),
  set: (f, t) => setTimeout(f, t),
  clear: (id) => clearTimeout(id as ReturnType<typeof setTimeout>),
}) {
  let last = -Infinity
  let timer: unknown = null
  let pending: { v: T } | null = null
  const fire = (v: T) => { last = clock.now(); pending = null; fn(v) }
  const call = (v: T) => {
    const gap = clock.now() - last
    if (gap >= ms) { if (timer !== null) { clock.clear(timer); timer = null } fire(v); return }
    pending = { v }
    if (timer === null) timer = clock.set(() => { timer = null; if (pending) fire(pending.v) }, ms - gap)
  }
  call.cancel = () => { if (timer !== null) clock.clear(timer); timer = null; pending = null }
  return call
}

/* Instances ------------------------------------------------------------ */

/** Ten mask colours, cycled per instance: the pink, the plate set and the
    lit set, so a mask reads on paper and on the void. Data only. */
export const INSTANCE_COLOURS = ['#FE0386', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#14b8a6', '#ffb020', '#a6e22e', '#ff5c4d', '#58a6ff']

export function instanceColour(i: number): string {
  const n = INSTANCE_COLOURS.length
  return INSTANCE_COLOURS[((Math.floor(i) % n) + n) % n]
}

/** A decoder score 0 to 1 as a whole percent, clamped: a model that
    returns 1.01 never reads 101 percent. Missing reads empty. */
export function scorePct(s: number | null | undefined): string {
  if (typeof s !== 'number' || !Number.isFinite(s)) return ''
  return `${Math.round(Math.min(1, Math.max(0, s)) * 100)}%`
}

/* Dual range ----------------------------------------------------------- */

function snap(v: number, min: number, step: number): number {
  if (!(step > 0)) return v
  const k = Math.round((v - min) / step)
  return +(min + k * step).toFixed(10)
}

/**
 * A lo and hi pair held in min to max on the step, lo never above hi less
 * `gap`. `moved` names the thumb that moved: the other one holds and the
 * moved one stops at it.
 */
export function clampPair(lo: number, hi: number, o: { min?: number; max?: number; step?: number; gap?: number; moved?: 'lo' | 'hi' } = {}): [number, number] {
  const min = o.min ?? 0
  const max = o.max ?? 1
  const step = o.step ?? 0
  const gap = Math.max(0, o.gap ?? 0)
  let a = Math.min(max, Math.max(min, snap(lo, min, step)))
  let b = Math.min(max, Math.max(min, snap(hi, min, step)))
  if (b - a < gap - 1e-9) {
    if (o.moved === 'hi') b = Math.min(max, a + gap)
    else a = Math.max(min, b - gap)
    if (b - a < gap - 1e-9) { if (o.moved === 'hi') a = Math.max(min, b - gap); else b = Math.min(max, a + gap) }
  }
  return [+a.toFixed(10), +b.toFixed(10)]
}

/** Percent along the track for a value, for the filled band. */
export function rangePct(v: number, min = 0, max = 1): number {
  return max > min ? Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100)) : 0
}

/* Compare split -------------------------------------------------------- */

/** The divider after a key: arrows move 5 percent, shift 1 percent for
    fine work, page keys 25, home and end the edges. Null for other keys. */
export function splitKey(key: string, pos: number, fine = false): number | null {
  const s = fine ? 0.01 : 0.05
  let v: number
  switch (key) {
    case 'ArrowLeft': case 'ArrowDown': v = pos - s; break
    case 'ArrowRight': case 'ArrowUp': v = pos + s; break
    case 'PageDown': v = pos - 0.25; break
    case 'PageUp': v = pos + 0.25; break
    case 'Home': v = 0; break
    case 'End': v = 1; break
    default: return null
  }
  return +Math.min(1, Math.max(0, v)).toFixed(4)
}

/** The divider under a pointer at client x over a box. */
export function splitAt(clientX: number, box: { left: number; width: number }): number {
  return box.width > 0 ? +Math.min(1, Math.max(0, (clientX - box.left) / box.width)).toFixed(4) : 0.5
}
