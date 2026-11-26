// Mask editing by hand: a wand that flood selects by colour on the source
// image, a brush that adds and erases, a lasso that fills the polygon it
// draws. The mask lives in image pixels, one byte a pixel, 0 drops and
// 255 keeps, so it lines up with the source at any zoom. The algorithms
// are plain functions; `maskEditor` binds them to a canvas.

import { emitter } from './emit'
import { isTyping } from './focus'
import { undoStack } from './undo'
import { toImage } from './vision'

export type MaskTool = 'wand' | 'brush' | 'eraser' | 'lasso' | 'polygon' | 'rect' | 'ellipse' | 'flood' | 'pan'
export type MaskMode = 'add' | 'erase'
export interface MaskPt { x: number; y: number }

/** Pixels as ImageData carries them: rgba, row by row. */
export interface MaskPixels { data: Uint8ClampedArray; width: number; height: number }

export interface MaskToolDef {
  id: MaskTool
  label: string
  icon: 'wand' | 'brush' | 'eraser' | 'lasso' | 'polygon' | 'select-rect' | 'select-ellipse' | 'bucket' | 'hand'
  /** One letter, printed on the rail and bound on the editor. */
  key: string
  /** The gesture in add mode; `maskHint` gives it for either mode. */
  hint: string
  /** Tools of one group share a place in the rail (the shapes); the rail shows six. */
  group?: string
}

/** One table builds the rail, the letters on it and the keydown map. */
export const MASK_TOOLS: MaskToolDef[] = [
  { id: 'wand', label: 'wand', icon: 'wand', key: 'w', hint: maskHint('wand', 'add') },
  { id: 'brush', label: 'brush', icon: 'brush', key: 'b', hint: maskHint('brush', 'add') },
  { id: 'eraser', label: 'eraser', icon: 'eraser', key: 'e', hint: maskHint('eraser', 'add') },
  { id: 'lasso', label: 'lasso', icon: 'lasso', key: 'l', hint: maskHint('lasso', 'add'), group: 'shape' },
  { id: 'polygon', label: 'polygon', icon: 'polygon', key: 'p', hint: maskHint('polygon', 'add'), group: 'shape' },
  { id: 'rect', label: 'rectangle', icon: 'select-rect', key: 'm', hint: maskHint('rect', 'add'), group: 'shape' },
  { id: 'ellipse', label: 'ellipse', icon: 'select-ellipse', key: 'o', hint: maskHint('ellipse', 'add'), group: 'shape' },
  { id: 'flood', label: 'flood fill', icon: 'bucket', key: 'g', hint: maskHint('flood', 'add') },
  { id: 'pan', label: 'pan', icon: 'hand', key: 'h', hint: maskHint('pan', 'add') },
]

/** The hint pill for a tool in a mode. */
export function maskHint(tool: MaskTool, mode: MaskMode): string {
  const add = mode === 'add'
  const swap = `x swaps to ${add ? 'erase' : 'add'}`
  if (tool === 'wand') return `tap a colour to ${add ? 'add' : 'cut'} it. shift ${add ? 'cuts' : 'adds'}, ${swap}`
  if (tool === 'brush') return `paint to ${add ? 'add' : 'erase'}. [ and ] size, ${swap}`
  if (tool === 'eraser') return 'paint to erase. shift adds, [ and ] size'
  if (tool === 'polygon') return `press corner by corner, enter or the first corner ${add ? 'fills' : 'cuts'}. backspace drops a corner, esc all`
  if (tool === 'rect' || tool === 'ellipse') return `drag a ${tool === 'rect' ? 'box' : 'ring'} to ${add ? 'add' : 'cut'} it. shift ${add ? 'cuts' : 'adds'}, ${swap}`
  if (tool === 'flood') return `tap to fill the patch of one colour. shift ${add ? 'cuts' : 'adds'}, ${swap}`
  if (tool === 'pan') return 'drag to move the picture. space pans from any tool'
  return `drag around a shape, lift to ${add ? 'fill' : 'cut'}. esc drops it, ${swap}`
}

/* Algorithms -------------------------------------------------------------- */

/** Colour distance as a percent of the rgb cube's diagonal, 0 to 100. */
export function colourDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return (Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) / 441.673) * 100
}

/**
 * The magic wand: the pixels within `tolerance` percent of the colour at
 * x, y, as 1 in a byte a pixel. `contiguous` (default) floods from the
 * seed through 4 neighbours; off, it takes every pixel of that colour.
 * A seed off the image selects nothing.
 */
export function wandSelect(img: MaskPixels, x: number, y: number, tolerance: number, contiguous = true): Uint8Array {
  const { data, width: w, height: h } = img
  const sel = new Uint8Array(w * h)
  const sx = Math.floor(x)
  const sy = Math.floor(y)
  if (sx < 0 || sy < 0 || sx >= w || sy >= h) return sel
  const s = (sy * w + sx) * 4
  const r = data[s]!, g = data[s + 1]!, b = data[s + 2]!
  const lim = (Math.max(0, tolerance) / 100) * 441.673
  const lim2 = lim * lim + 1e-9
  const near = (i: number) => {
    const o = i * 4
    const dr = data[o]! - r, dg = data[o + 1]! - g, db = data[o + 2]! - b
    return dr * dr + dg * dg + db * db <= lim2
  }
  if (!contiguous) {
    for (let i = 0; i < w * h; i++) if (near(i)) sel[i] = 1
    return sel
  }
  // seen: 1 queued. Each pixel is queued once, so the stack never passes w * h.
  const seen = new Uint8Array(w * h)
  const stack = new Int32Array(w * h)
  let top = 0
  const seed = sy * w + sx
  stack[top++] = seed
  seen[seed] = 1
  while (top) {
    const i = stack[--top]!
    if (!near(i)) continue
    sel[i] = 1
    const px = i % w
    if (px > 0 && !seen[i - 1]) { seen[i - 1] = 1; stack[top++] = i - 1 }
    if (px < w - 1 && !seen[i + 1]) { seen[i + 1] = 1; stack[top++] = i + 1 }
    if (i >= w && !seen[i - w]) { seen[i - w] = 1; stack[top++] = i - w }
    if (i < w * (h - 1) && !seen[i + w]) { seen[i + w] = 1; stack[top++] = i + w }
  }
  return sel
}

/** Even odd test: is x, y inside the polygon. */
export function pointInPolygon(x: number, y: number, pts: MaskPt[]): boolean {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i]!, b = pts[j]!
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

/**
 * The lasso: every pixel whose centre lies inside the polygon (even odd),
 * as 1 in a byte a pixel. One scanline a row, so a long freehand path
 * costs its edges times its rows. Under three points selects nothing.
 */
export function polygonFill(w: number, h: number, pts: MaskPt[]): Uint8Array {
  const sel = new Uint8Array(w * h)
  if (pts.length < 3) return sel
  let y0 = Infinity, y1 = -Infinity
  for (const p of pts) { if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y }
  const from = Math.max(0, Math.floor(y0))
  const to = Math.min(h - 1, Math.ceil(y1))
  const xs: number[] = []
  for (let y = from; y <= to; y++) {
    const cy = y + 0.5
    xs.length = 0
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i]!, b = pts[j]!
      if ((a.y > cy) !== (b.y > cy)) xs.push(a.x + ((cy - a.y) * (b.x - a.x)) / (b.y - a.y))
    }
    xs.sort((p, q) => p - q)
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const s = Math.max(0, Math.ceil(xs[k]! - 0.5))
      const e = Math.min(w - 1, Math.ceil(xs[k + 1]! - 0.5) - 1)
      for (let x = s; x <= e; x++) sel[y * w + x] = 1
    }
  }
  return sel
}

/** The pixels inside the box between two corners, in image pixels. */
export function rectFill(w: number, h: number, a: MaskPt, b: MaskPt): Uint8Array {
  const out = new Uint8Array(w * h)
  const x0 = Math.max(0, Math.floor(Math.min(a.x, b.x))), x1 = Math.min(w, Math.ceil(Math.max(a.x, b.x)))
  const y0 = Math.max(0, Math.floor(Math.min(a.y, b.y))), y1 = Math.min(h, Math.ceil(Math.max(a.y, b.y)))
  for (let y = y0; y < y1; y++) out.fill(255, y * w + x0, y * w + x1)
  return out
}

/** The pixels inside the ellipse that fills the box between two corners. */
export function ellipseFill(w: number, h: number, a: MaskPt, b: MaskPt): Uint8Array {
  const out = new Uint8Array(w * h)
  const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2
  const rx = Math.abs(b.x - a.x) / 2, ry = Math.abs(b.y - a.y) / 2
  if (rx < 0.5 || ry < 0.5) return out
  const y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(h - 1, Math.ceil(cy + ry))
  for (let y = y0; y <= y1; y++) {
    const dy = (y + 0.5 - cy) / ry
    if (dy * dy > 1) continue
    const dx = rx * Math.sqrt(1 - dy * dy)
    const x0 = Math.max(0, Math.round(cx - dx)), x1 = Math.min(w, Math.round(cx + dx))
    if (x1 > x0) out.fill(255, y * w + x0, y * w + x1)
  }
  return out
}

/** Grow (dilate) or shrink (erode) the kept area by r pixels, a square step at a time, as the original's expand and shrink did. */
export function morphMask(mask: Uint8Array, w: number, h: number, r: number, grow: boolean): Uint8Array {
  let cur = mask
  for (let k = 0; k < Math.max(0, Math.round(r)); k++) {
    const next = new Uint8Array(cur.length)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let hit = !grow
        for (let dy = -1; dy <= 1 && hit !== grow; dy++) {
          const yy = y + dy
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx
            const v = xx >= 0 && xx < w && yy >= 0 && yy < h ? cur[yy * w + xx]! > 127 : false
            if (grow && v) { hit = true; break }
            if (!grow && !v) { hit = false; break }
          }
        }
        next[y * w + x] = hit ? 255 : 0
      }
    }
    cur = next
  }
  return cur
}

/** Round off jagged edges: a box blur of radius r, then a cut at half, as the original's smooth did. */
export function smoothMask(mask: Uint8Array, w: number, h: number, r = 2): Uint8Array {
  const tmp = new Float32Array(mask.length)
  const out = new Uint8Array(mask.length)
  for (let y = 0; y < h; y++) {
    let acc = 0
    for (let x = -r; x <= r; x++) acc += mask[y * w + Math.min(w - 1, Math.max(0, x))]!
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / (2 * r + 1)
      acc += mask[y * w + Math.min(w - 1, x + r + 1)]! - mask[y * w + Math.max(0, x - r)]!
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x]!
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / (2 * r + 1) > 127 ? 255 : 0
      acc += tmp[Math.min(h - 1, y + r + 1) * w + x]! - tmp[Math.max(0, y - r) * w + x]!
    }
  }
  return out
}

/** Write a selection into the mask: add keeps it, erase drops it.
    Returns how many pixels changed. */
export function applySelection(mask: Uint8Array, sel: Uint8Array, mode: MaskMode): number {
  const v = mode === 'add' ? 255 : 0
  let n = 0
  for (let i = 0; i < mask.length; i++) if (sel[i] && mask[i] !== v) { mask[i] = v; n++ }
  return n
}

/** One brush dab: pixels whose centre is within r of cx, cy. A dab is
    never smaller than one pixel. Returns how many pixels changed. */
export function stampDisc(mask: Uint8Array, w: number, h: number, cx: number, cy: number, r: number, mode: MaskMode): number {
  const v = mode === 'add' ? 255 : 0
  const rr = Math.max(0.5, r)
  const r2 = rr * rr
  const x0 = Math.max(0, Math.floor(cx - rr)), x1 = Math.min(w - 1, Math.ceil(cx + rr))
  const y0 = Math.max(0, Math.floor(cy - rr)), y1 = Math.min(h - 1, Math.ceil(cy + rr))
  let n = 0
  for (let y = y0; y <= y1; y++) {
    const dy = y + 0.5 - cy
    for (let x = x0; x <= x1; x++) {
      const dx = x + 0.5 - cx
      if (dx * dx + dy * dy > r2) continue
      const i = y * w + x
      if (mask[i] !== v) { mask[i] = v; n++ }
    }
  }
  // A dab finer than the pixel grid still marks the pixel under it.
  const px = Math.floor(cx), py = Math.floor(cy)
  if (px >= 0 && py >= 0 && px < w && py < h && mask[py * w + px] !== v) { mask[py * w + px] = v; n++ }
  return n
}

/** A brush segment from a to b: a dab every half radius, so a fast drag
    leaves no gaps. Returns how many pixels changed. */
export function strokeSegment(mask: Uint8Array, w: number, h: number, a: MaskPt, b: MaskPt, r: number, mode: MaskMode): number {
  const dist = Math.hypot(b.x - a.x, b.y - a.y)
  const steps = Math.max(1, Math.ceil(dist / Math.max(0.5, r / 2)))
  let n = 0
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    n += stampDisc(mask, w, h, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, r, mode)
  }
  return n
}

/** Keep what was dropped and drop what was kept, in place. */
export function invertMask(mask: Uint8Array): Uint8Array {
  for (let i = 0; i < mask.length; i++) mask[i] = 255 - mask[i]!
  return mask
}

/** Share of the image the mask keeps, 0 to 1. */
export function maskCoverage(mask: Uint8Array): number {
  if (!mask.length) return 0
  let s = 0
  for (let i = 0; i < mask.length; i++) s += mask[i]!
  return s / (mask.length * 255)
}

/** The brush after `[` (-1) or `]` (+1): 5 px steps held in 1 to 200,
    as the original. */
export function nextBrushSize(size: number, dir: 1 | -1, step = 5, min = 1, max = 200): number {
  return Math.min(max, Math.max(min, Math.round(size + dir * step)))
}

export type MaskOutput = 'alpha' | 'matte' | 'cutout'

/**
 * The mask as rgba. `alpha`: white, alpha is the mask. `matte`: opaque,
 * white keeps and black drops. `cutout`: the source pixels with the mask
 * as alpha (needs `source`).
 */
export function maskRgba(mask: Uint8Array, kind: MaskOutput = 'alpha', source?: Uint8ClampedArray): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(mask.length * 4)
  if (kind === 'cutout' && (!source || source.length < out.length)) throw new Error('cutout needs the source pixels')
  for (let i = 0, o = 0; i < mask.length; i++, o += 4) {
    const m = mask[i]!
    if (kind === 'alpha') { out[o] = 255; out[o + 1] = 255; out[o + 2] = 255; out[o + 3] = m }
    else if (kind === 'matte') { out[o] = m; out[o + 1] = m; out[o + 2] = m; out[o + 3] = 255 }
    else { out[o] = source![o]!; out[o + 1] = source![o + 1]!; out[o + 2] = source![o + 2]!; out[o + 3] = Math.round((m * source![o + 3]!) / 255) }
  }
  return out
}

/** The overlay tint: `rgb` where the mask keeps, at `alpha` of it. */
export function tintRgba(mask: Uint8Array, rgb: [number, number, number], alpha = 0.5, into?: Uint8ClampedArray): Uint8ClampedArray {
  const out = into && into.length === mask.length * 4 ? into : new Uint8ClampedArray(mask.length * 4)
  for (let i = 0, o = 0; i < mask.length; i++, o += 4) {
    out[o] = rgb[0]; out[o + 1] = rgb[1]; out[o + 2] = rgb[2]; out[o + 3] = Math.round(mask[i]! * alpha)
  }
  return out
}

/** '#FE0386' or 'rgb(254, 3, 134)' as three bytes; pink when unreadable. */
export function parseRgb(css: string): [number, number, number] {
  const s = css.trim()
  let m = /^#([0-9a-f]{6})$/i.exec(s)
  if (m) { const n = parseInt(m[1]!, 16); return [n >> 16, (n >> 8) & 255, n & 255] }
  m = /^#([0-9a-f]{3})$/i.exec(s)
  if (m) return [...m[1]!].map((c) => parseInt(c + c, 16)) as [number, number, number]
  const r = /rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(s)
  if (r) return [+r[1]!, +r[2]!, +r[3]!]
  return [254, 3, 134]
}

/* Controller -------------------------------------------------------------- */

/** An image to mask: pixels, anything a canvas can draw, or a url. */
export type MaskSource = MaskPixels | CanvasImageSource | string

export interface MaskEditorState {
  tool: MaskTool
  mode: MaskMode
  /** Brush diameter in css pixels, so the ring matches the finger. */
  size: number
  /** Wand reach, percent of the colour cube, 0 to 100. */
  tolerance: number
  contiguous: boolean
  canUndo: boolean
  canRedo: boolean
  /** Share the mask keeps, 0 to 1. */
  coverage: number
  width: number
  height: number
  ready: boolean
  /** A brush or lasso gesture is under way. */
  drawing: boolean
}

export interface MaskEditorOptions {
  image?: MaskSource
  tool?: MaskTool
  mode?: MaskMode
  /** Default 24 px, 44 px on a coarse pointer. */
  size?: number
  /** Default 6, as the original. */
  tolerance?: number
  contiguous?: boolean
  /** Undo depth, default 50. */
  history?: number
  /** Where the letters are heard. Default the canvas; false binds none. */
  keys?: HTMLElement | false
  /** Mask tint, default the `--hb-pink` token. */
  tint?: string
  /** After every edit that changed the mask, undo and redo included. */
  onEdit?: (mask: Uint8Array) => void
  /** The image failed to load. */
  onError?: (err: Error) => void
}

export interface MaskEditorHandle {
  readonly state: MaskEditorState
  setImage(src: MaskSource): Promise<void>
  setTool(tool: MaskTool): void
  setMode(mode: MaskMode): void
  /** Add to erase and back: the x key. */
  swap(): void
  setSize(px: number): void
  /** `[` and `]`. */
  stepSize(dir: 1 | -1): void
  setTolerance(pct: number): void
  setContiguous(on: boolean): void
  /** Edits in image pixels, for scripts and tests. Each is one undo step. */
  wandAt(x: number, y: number, mode?: MaskMode): void
  paint(points: MaskPt[], radius: number, mode?: MaskMode): void
  lassoFill(points: MaskPt[], mode?: MaskMode): void
  /** The flood tool at a point: the contiguous patch of one colour. */
  floodAt(x: number, y: number, mode?: MaskMode): void
  /** A rectangle, or with `ellipse` the ellipse in it, between two corners. */
  shapeFill(a: MaskPt, b: MaskPt, ellipse?: boolean, mode?: MaskMode): void
  /** Grow the kept area by px (default 3). */
  expand(px?: number): void
  /** Shrink the kept area by px (default 3). */
  shrink(px?: number): void
  /** Round off jagged edges (box blur radius, default 2, cut at half). */
  smooth(r?: number): void
  clear(): void
  invert(): void
  undo(): boolean
  redo(): boolean
  /** Drop the brush or lasso gesture under way: Esc. */
  cancel(): void
  /** A copy of the mask. */
  mask(): Uint8Array
  /** Replace the mask; one undo step. Throws on a wrong length. */
  setMask(mask: ArrayLike<number>): void
  toImageData(kind?: MaskOutput): ImageData
  toBlob(kind?: MaskOutput, type?: string): Promise<Blob>
  subscribe(fn: (s: MaskEditorState) => void): () => void
  dispose(): void
}

type Ctx = CanvasRenderingContext2D

/** The nearest ancestor that scrolls, for the pan tool. */
function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p)
    if (/(auto|scroll)/.test(o.overflow + o.overflowX + o.overflowY)) return p
  }
  return null
}

function isPixels(s: unknown): s is MaskPixels {
  return !!s && typeof s === 'object' && 'data' in s && 'width' in s && 'height' in s && !(typeof HTMLElement !== 'undefined' && s instanceof HTMLElement)
}

function coarsePointer(): boolean {
  try { return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches } catch { return false }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (!/^(data|blob):/.test(url)) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('the image did not load'))
    img.src = url
  })
}

/**
 * The mask editor over one canvas. The canvas is sized to the image and
 * scaled by css; pointers map to image pixels through its box. Press and
 * drag with the current tool; shift flips add and erase for that gesture.
 * Letters from `MASK_TOOLS`, x swaps, `[` `]` size, ctrl z and ctrl shift
 * z (or ctrl y) undo and redo, Esc drops a gesture. The canvas gets
 * `touch-action: none` so a drag never scrolls the page.
 */
export function maskEditor(canvas: HTMLCanvasElement, options: MaskEditorOptions = {}): MaskEditorHandle {
  const doc = canvas.ownerDocument
  const ctx = canvas.getContext('2d') as Ctx | null
  const changed = emitter<MaskEditorState>()
  const history = undoStack<Uint8Array>(options.history ?? 50)
  const css = (name: string, fb: string) => {
    try { return (getComputedStyle(canvas).getPropertyValue(name) || fb).trim() } catch { return fb }
  }
  const tint = parseRgb(options.tint ?? css('--hb-pink', '#FE0386'))
  const ringAdd = css('--hb-slime', '#a6e22e')
  const ringErase = css('--hb-lit-err', '#ff5c4d')
  const edge = css('--hb-void', '#0a0a0a')

  let w = 0
  let h = 0
  let src: MaskPixels | null = null
  let srcCanvas: HTMLCanvasElement | null = null
  let tintCanvas: HTMLCanvasElement | null = null
  let tintData: ImageData | null = null
  let mask: Uint8Array = new Uint8Array(0)
  let coverage = 0
  let ready = false
  let loadSeq = 0

  let tool: MaskTool = options.tool ?? 'wand'
  let mode: MaskMode = options.mode ?? 'add'
  let size = options.size ?? (coarsePointer() ? 44 : 24)
  let tolerance = options.tolerance ?? 6
  let contiguous = options.contiguous ?? true

  type Gesture =
    | { kind: 'brush'; id: number; mode: MaskMode; last: MaskPt; before: Uint8Array; n: number }
    | { kind: 'lasso'; id: number; mode: MaskMode; pts: MaskPt[] }
    | { kind: 'shape'; id: number; mode: MaskMode; a: MaskPt; b: MaskPt; ellipse: boolean }
    | { kind: 'pan'; id: number; x: number; y: number; el: HTMLElement | null }
  let gesture: Gesture | null = null
  /** Polygon corners placed so far; they outlive a single pointer gesture. */
  let poly: { mode: MaskMode; pts: MaskPt[] } | null = null
  let spaceDown = false
  let hover: MaskPt | null = null

  canvas.style.touchAction = 'none'
  canvas.dataset.tool = tool
  canvas.dataset.mode = mode

  const state = (): MaskEditorState => ({
    tool, mode, size, tolerance, contiguous,
    canUndo: history.canUndo, canRedo: history.canRedo,
    coverage, width: w, height: h, ready, drawing: !!gesture,
  })
  const notify = () => changed.emit(state())

  /* Drawing ---------------------------------------------------------------- */

  let frame = 0
  let tintDirty = true
  function schedule() {
    if (!ctx || frame) return
    if (typeof requestAnimationFrame === 'function') frame = requestAnimationFrame(() => { frame = 0; draw() })
    else draw()
  }
  function scale(): number {
    const r = canvas.getBoundingClientRect()
    return r.width > 0 && w > 0 ? r.width / w : 1
  }
  function draw() {
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)
    if (!ready) return
    if (srcCanvas) ctx.drawImage(srcCanvas, 0, 0)
    if (tintCanvas) {
      const tc = tintCanvas.getContext('2d')
      if (tintDirty && tc) {
        tintData = tintData ?? tc.createImageData(w, h)
        tintRgba(mask, tint, 0.5, tintData.data)
        tc.putImageData(tintData, 0, 0)
        tintDirty = false
      }
      ctx.drawImage(tintCanvas, 0, 0)
    }
    const k = 1 / scale()
    const g = gesture
    if (g?.kind === 'lasso' && g.pts.length > 1) {
      ctx.beginPath()
      ctx.moveTo(g.pts[0]!.x, g.pts[0]!.y)
      for (const p of g.pts) ctx.lineTo(p.x, p.y)
      ctx.closePath()
      ctx.setLineDash([])
      ctx.lineWidth = 4 * k
      ctx.strokeStyle = edge
      ctx.stroke()
      ctx.setLineDash([6 * k, 4 * k])
      ctx.lineWidth = 2 * k
      ctx.strokeStyle = g.mode === 'add' ? ringAdd : ringErase
      ctx.stroke()
      ctx.setLineDash([])
    }
    const ring = (m: MaskMode, path: () => void, closed: boolean) => {
      ctx.beginPath(); path(); if (closed) ctx.closePath()
      ctx.setLineDash([]); ctx.lineWidth = 4 * k; ctx.strokeStyle = edge; ctx.stroke()
      ctx.setLineDash([6 * k, 4 * k]); ctx.lineWidth = 2 * k; ctx.strokeStyle = m === 'add' ? ringAdd : ringErase; ctx.stroke()
      ctx.setLineDash([])
    }
    if (g?.kind === 'shape') {
      const x = Math.min(g.a.x, g.b.x), y = Math.min(g.a.y, g.b.y), bw = Math.abs(g.b.x - g.a.x), bh = Math.abs(g.b.y - g.a.y)
      ring(g.mode, () => (g.ellipse ? ctx.ellipse(x + bw / 2, y + bh / 2, bw / 2, bh / 2, 0, 0, Math.PI * 2) : ctx.rect(x, y, bw, bh)), true)
    }
    if (poly && poly.pts.length) {
      const pts = hover ? [...poly.pts, hover] : poly.pts
      ring(poly.mode, () => { ctx.moveTo(pts[0]!.x, pts[0]!.y); for (const p of pts) ctx.lineTo(p.x, p.y) }, false)
      for (const p of poly.pts) { ctx.fillStyle = edge; ctx.fillRect(p.x - 3 * k, p.y - 3 * k, 6 * k, 6 * k) }
    }
    if ((tool === 'brush' || tool === 'eraser') && hover) {
      const m = g?.kind === 'brush' ? g.mode : tool === 'eraser' ? 'erase' : mode
      ctx.beginPath()
      ctx.arc(hover.x, hover.y, (size / 2) * k, 0, Math.PI * 2)
      ctx.lineWidth = 3.5 * k
      ctx.strokeStyle = edge
      ctx.stroke()
      ctx.lineWidth = 1.5 * k
      ctx.strokeStyle = m === 'add' ? ringAdd : ringErase
      ctx.stroke()
    }
  }

  /* Edits ------------------------------------------------------------------ */

  function edited() {
    coverage = maskCoverage(mask)
    tintDirty = true
    schedule()
    notify()
    options.onEdit?.(mask)
  }
  /** One undo step around a change; nothing is recorded when nothing moved. */
  function step(run: () => number) {
    if (!ready) return
    const before = mask.slice()
    if (run() > 0) { history.push(before); edited() }
  }
  const radiusFor = (px: number) => (px / 2) / scale()

  /* Image ------------------------------------------------------------------ */

  async function setImage(source: MaskSource): Promise<void> {
    const seq = ++loadSeq
    ready = false
    notify()
    let pixels: MaskPixels
    let drawn: HTMLCanvasElement | null = null
    try {
      if (isPixels(source)) {
        pixels = { data: source.data, width: source.width, height: source.height }
        if (ctx) {
          drawn = doc.createElement('canvas')
          drawn.width = pixels.width
          drawn.height = pixels.height
          const c = drawn.getContext('2d')!
          const id = c.createImageData(pixels.width, pixels.height)
          id.data.set(pixels.data)
          c.putImageData(id, 0, 0)
        }
      } else {
        const el = typeof source === 'string' ? await loadImage(source) : source
        if (seq !== loadSeq) return
        const anyEl = el as { naturalWidth?: number; naturalHeight?: number; videoWidth?: number; videoHeight?: number; width: number | SVGAnimatedLength; height: number | SVGAnimatedLength }
        const iw = anyEl.naturalWidth || anyEl.videoWidth || (typeof anyEl.width === 'number' ? anyEl.width : 0)
        const ih = anyEl.naturalHeight || anyEl.videoHeight || (typeof anyEl.height === 'number' ? anyEl.height : 0)
        if (!(iw > 0 && ih > 0)) throw new Error('the image has no size')
        drawn = doc.createElement('canvas')
        drawn.width = iw
        drawn.height = ih
        const c = drawn.getContext('2d')
        if (!c) throw new Error('no 2d canvas in this browser')
        c.drawImage(el, 0, 0, iw, ih)
        // A cross origin image without cors taints the canvas; this throws.
        const id = c.getImageData(0, 0, iw, ih)
        pixels = { data: id.data, width: iw, height: ih }
      }
    } catch (e) {
      if (seq !== loadSeq) return
      const err = e instanceof Error ? e : new Error(String(e))
      options.onError?.(err)
      notify()
      throw err
    }
    if (seq !== loadSeq) return
    src = pixels
    srcCanvas = drawn
    w = pixels.width
    h = pixels.height
    canvas.width = w
    canvas.height = h
    mask = new Uint8Array(w * h)
    coverage = 0
    history.clear()
    gesture = null
    if (ctx) {
      tintCanvas = doc.createElement('canvas')
      tintCanvas.width = w
      tintCanvas.height = h
      tintData = null
    }
    tintDirty = true
    ready = true
    schedule()
    notify()
  }

  /* Pointer ---------------------------------------------------------------- */

  const at = (e: PointerEvent, clamp = false) => {
    const r = canvas.getBoundingClientRect()
    return w ? toImage(e.clientX, e.clientY, r, w, h, clamp) : null
  }
  const flip = (m: MaskMode): MaskMode => (m === 'add' ? 'erase' : 'add')

  function onDown(e: PointerEvent) {
    if (!ready || gesture || (e.pointerType === 'mouse' && e.button !== 0)) return
    const p = at(e)
    if (!p) return
    e.preventDefault()
    try { canvas.focus({ preventScroll: true }) } catch { /* focus is a courtesy */ }
    const base: MaskMode = tool === 'eraser' ? 'erase' : mode
    const m = e.shiftKey ? flip(base) : base
    if (tool === 'pan' || spaceDown) {
      canvas.setPointerCapture?.(e.pointerId)
      gesture = { kind: 'pan', id: e.pointerId, x: e.clientX, y: e.clientY, el: scrollParent(canvas) }
      notify()
      return
    }
    if (tool === 'wand') { wandAt(p.x, p.y, m); return }
    if (tool === 'flood') { floodAt(p.x, p.y, m); return }
    if (tool === 'polygon') {
      const k = 1 / scale()
      if (poly && poly.pts.length > 2 && Math.hypot(p.x - poly.pts[0]!.x, p.y - poly.pts[0]!.y) <= 10 * k) { closePolygon(); return }
      if (!poly) poly = { mode: m, pts: [] }
      poly.pts.push(p)
      schedule()
      notify()
      return
    }
    canvas.setPointerCapture?.(e.pointerId)
    if (tool === 'rect' || tool === 'ellipse') {
      gesture = { kind: 'shape', id: e.pointerId, mode: m, a: p, b: p, ellipse: tool === 'ellipse' }
    } else if (tool === 'brush' || tool === 'eraser') {
      const before = mask.slice()
      const n = stampDisc(mask, w, h, p.x, p.y, radiusFor(size), m)
      gesture = { kind: 'brush', id: e.pointerId, mode: m, last: p, before, n }
      hover = p
      tintDirty = true
    } else {
      gesture = { kind: 'lasso', id: e.pointerId, mode: m, pts: [p] }
    }
    schedule()
    notify()
  }

  function onMove(e: PointerEvent) {
    const g = gesture
    if (g && e.pointerId !== g.id) return
    if (g?.kind === 'pan') {
      if (g.el) { g.el.scrollLeft -= e.clientX - g.x; g.el.scrollTop -= e.clientY - g.y }
      g.x = e.clientX
      g.y = e.clientY
      return
    }
    const p = at(e, true)
    if (!p) return
    hover = e.pointerType === 'touch' && !g ? null : p
    if (g?.kind === 'shape') g.b = p
    if (g?.kind === 'brush') {
      g.n += strokeSegment(mask, w, h, g.last, p, radiusFor(size), g.mode)
      g.last = p
      tintDirty = true
    } else if (g?.kind === 'lasso') {
      const q = g.pts[g.pts.length - 1]!
      if (Math.hypot(p.x - q.x, p.y - q.y) * scale() >= 2) g.pts.push(p)
    }
    schedule()
  }

  function onUp(e: PointerEvent) {
    const g = gesture
    if (!g || e.pointerId !== g.id) return
    gesture = null
    if (e.pointerType === 'touch') hover = null
    if (g.kind === 'pan') { notify(); return }
    if (g.kind === 'shape') {
      const sel = g.ellipse ? ellipseFill(w, h, g.a, g.b) : rectFill(w, h, g.a, g.b)
      step(() => applySelection(mask, sel, g.mode))
      schedule()
      notify()
      return
    }
    if (g.kind === 'brush') {
      if (g.n > 0) { history.push(g.before); edited() } else notify()
    } else {
      step(() => applySelection(mask, polygonFill(w, h, g.pts), g.mode))
      schedule()
      notify()
    }
  }

  function onLeave(e: PointerEvent) {
    if (!gesture && e.pointerType !== 'touch') { hover = null; schedule() }
  }

  function cancel() {
    if (poly) { poly = null; schedule(); notify() }
    const g = gesture
    if (!g) return
    gesture = null
    if (g.kind === 'brush') { mask.set(g.before); tintDirty = true }
    schedule()
    notify()
  }

  function onCancel(e: PointerEvent) { if (gesture && e.pointerId === gesture.id) cancel() }

  /* Keys ------------------------------------------------------------------- */

  const keyEl = options.keys === false ? null : options.keys ?? canvas
  function onKey(e: KeyboardEvent) {
    if (e.defaultPrevented || e.altKey || isTyping(e.target)) return
    const k = e.key.toLowerCase()
    const mod = e.ctrlKey || e.metaKey
    let took = true
    if (mod && k === 'z') { if (e.shiftKey) redo(); else undo() }
    else if (mod && k === 'y') redo()
    else if (mod) took = false
    else if (k === 'escape') { if (gesture || poly) cancel(); else took = false }
    else if (k === 'enter' && poly) closePolygon()
    else if (k === 'backspace' && poly) { poly.pts.pop(); if (!poly.pts.length) poly = null; schedule(); notify() }
    else if (k === ' ') { spaceDown = true; canvas.dataset.tool = 'pan' }
    else if (k === 'x') swap()
    else if (k === '[') stepSize(-1)
    else if (k === ']') stepSize(1)
    else {
      const t = MASK_TOOLS.find((d) => d.key === k)
      if (t) setTool(t.id)
      else took = false
    }
    if (took) e.preventDefault()
  }

  function onKeyUp(e: KeyboardEvent) { if (e.key === ' ' && spaceDown) { spaceDown = false; canvas.dataset.tool = tool } }
  keyEl?.addEventListener('keyup', onKeyUp)
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onCancel)
  canvas.addEventListener('pointerleave', onLeave)
  keyEl?.addEventListener('keydown', onKey)

  /* Api -------------------------------------------------------------------- */

  function setTool(t: MaskTool) {
    if (t === tool || !MASK_TOOLS.some((d) => d.id === t)) return
    cancel()
    tool = t
    canvas.dataset.tool = t
    if (t !== 'brush' && t !== 'eraser' && t !== 'polygon') hover = null
    schedule()
    notify()
  }
  function setMode(m: MaskMode) {
    if (m === mode) return
    mode = m
    canvas.dataset.mode = m
    schedule()
    notify()
  }
  function swap() { setMode(flip(mode)) }
  function setSize(px: number) {
    const v = Math.min(200, Math.max(1, Math.round(px)))
    if (v === size || !Number.isFinite(v)) return
    size = v
    schedule()
    notify()
  }
  function stepSize(dir: 1 | -1) { setSize(nextBrushSize(size, dir)) }
  function setTolerance(pct: number) {
    const v = Math.min(100, Math.max(0, pct))
    if (v === tolerance || !Number.isFinite(v)) return
    tolerance = v
    notify()
  }
  function setContiguous(on: boolean) { if (on !== contiguous) { contiguous = on; notify() } }

  function wandAt(x: number, y: number, m: MaskMode = mode) {
    if (!src) return
    const s = src
    step(() => applySelection(mask, wandSelect(s, x, y, tolerance, contiguous), m))
  }
  /** Fill the patch of one colour under a point, always contiguous (the flood tool). */
  function floodAt(x: number, y: number, m: MaskMode = mode) {
    if (!src) return
    const s = src
    step(() => applySelection(mask, wandSelect(s, x, y, tolerance, true), m))
  }
  function closePolygon() {
    const pg = poly
    poly = null
    if (pg && pg.pts.length > 2) step(() => applySelection(mask, polygonFill(w, h, pg.pts), pg.mode))
    schedule()
    notify()
  }
  function shapeFill(a: MaskPt, b: MaskPt, ellipse = false, m: MaskMode = mode) {
    step(() => applySelection(mask, ellipse ? ellipseFill(w, h, a, b) : rectFill(w, h, a, b), m))
  }
  function replace(next: Uint8Array): number {
    let n = 0
    for (let i = 0; i < mask.length; i++) if (mask[i] !== next[i]) { mask[i] = next[i]!; n++ }
    return n
  }
  function expand(px = 3) { step(() => replace(morphMask(mask, w, h, px, true))) }
  function shrink(px = 3) { step(() => replace(morphMask(mask, w, h, px, false))) }
  function smooth(r = 2) { step(() => replace(smoothMask(mask, w, h, r))) }
  function paint(points: MaskPt[], radius: number, m: MaskMode = mode) {
    if (!points.length) return
    step(() => {
      let n = stampDisc(mask, w, h, points[0]!.x, points[0]!.y, radius, m)
      for (let i = 1; i < points.length; i++) n += strokeSegment(mask, w, h, points[i - 1]!, points[i]!, radius, m)
      return n
    })
  }
  function lassoFill(points: MaskPt[], m: MaskMode = mode) {
    step(() => applySelection(mask, polygonFill(w, h, points), m))
  }
  function clear() { step(() => { let n = 0; for (let i = 0; i < mask.length; i++) if (mask[i]) { mask[i] = 0; n++ } return n }) }
  function invert() { step(() => { invertMask(mask); return mask.length }) }
  function undo(): boolean {
    cancel()
    const prev = history.undo(mask.slice())
    if (!prev) return false
    mask = prev
    edited()
    return true
  }
  function redo(): boolean {
    cancel()
    const next = history.redo(mask.slice())
    if (!next) return false
    mask = next
    edited()
    return true
  }

  function toImageData(kind: MaskOutput = 'alpha'): ImageData {
    if (!ready) throw new Error('no image yet')
    const rgba = maskRgba(mask, kind, src?.data)
    if (typeof ImageData !== 'undefined') return new ImageData(rgba, w, h)
    if (!ctx) throw new Error('no ImageData in this environment')
    const id = ctx.createImageData(w, h)
    id.data.set(rgba)
    return id
  }

  function toBlob(kind: MaskOutput = 'alpha', type = 'image/png'): Promise<Blob> {
    const out = doc.createElement('canvas')
    out.width = w
    out.height = h
    const c = out.getContext('2d')
    if (!c) return Promise.reject(new Error('no 2d canvas in this browser'))
    c.putImageData(toImageData(kind), 0, 0)
    return new Promise((resolve, reject) => out.toBlob((b) => (b ? resolve(b) : reject(new Error('the browser made no image'))), type))
  }

  if (options.image !== undefined) setImage(options.image).catch(() => { /* reported through onError */ })

  return {
    get state() { return state() },
    setImage, setTool, setMode, swap, setSize, stepSize, setTolerance, setContiguous,
    wandAt, floodAt, paint, lassoFill, shapeFill, expand, shrink, smooth, clear, invert, undo, redo, cancel,
    mask: () => mask.slice(),
    setMask(m) {
      if (m.length !== mask.length) throw new Error(`mask is ${m.length} bytes, the image needs ${mask.length}`)
      step(() => { let n = 0; for (let i = 0; i < mask.length; i++) { const v = m[i]! & 255; if (mask[i] !== v) { mask[i] = v; n++ } } return n })
    },
    toImageData, toBlob,
    subscribe(fn) { return changed.on(fn) },
    dispose() {
      loadSeq++
      if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onCancel)
      canvas.removeEventListener('pointerleave', onLeave)
      keyEl?.removeEventListener('keydown', onKey)
      keyEl?.removeEventListener('keyup', onKeyUp)
      changed.clear()
      history.dispose()
    },
  }
}
