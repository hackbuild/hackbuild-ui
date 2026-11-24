// Artboard: the pure parts, framework free. A board has its own size in
// board pixels. The view is a zoom relative to fit plus a pan in screen
// pixels, so the board stays fitted when the box resizes. Layers sit on
// the board by centre, scale and rotation; erase strokes are stored in
// the layer's own pixels, so they survive move, scale and rotate.

export interface ArtTransform {
  /** Centre on the board, board pixels. */
  x: number
  y: number
  /** Board pixels per layer pixel. */
  scale: number
  /** Degrees, clockwise, -180 to 180. */
  rot: number
}

export interface ArtLayer {
  id: string | number
  /** `image` draws `src`; `slot` renders the `layer` slot. */
  kind: 'image' | 'slot'
  src?: string
  /** Natural size, layer pixels. */
  w: number
  h: number
  transform: ArtTransform
  /** Erase mask url in layer pixels: red where erased. */
  mask?: string
  label?: string
  hidden?: boolean
  /** Shown, never picked. */
  locked?: boolean
}

/** Zoom relative to fit, pan in screen pixels from the centre. */
export interface ArtView { zoom: number; x: number; y: number }

export type ArtTool = 'move' | 'erase' | 'restore'

export interface ArtStroke {
  id: string | number
  tool: 'erase' | 'restore'
  /** Brush diameter, layer pixels. */
  size: number
  /** Layer pixels. */
  points: { x: number; y: number }[]
}

/** Key letters for the tools. */
export const ART_KEYS: Record<string, ArtTool> = { v: 'move', e: 'erase', r: 'restore' }

export const ART_FIT: ArtView = { zoom: 1, x: 0, y: 0 }

/** Board pixels to screen pixels at zoom 1: the board fits the box with
    `pad` on each side. */
export function fitScale(vw: number, vh: number, bw: number, bh: number, pad = 16): number {
  if (!(bw > 0 && bh > 0)) return 1
  const s = Math.min((vw - 2 * pad) / bw, (vh - 2 * pad) / bh)
  return s > 0 ? s : Math.min(vw / bw, vh / bh) || 1
}

export interface ArtRect { left: number; top: number; scale: number }

/** Where the board sits in the box: top left corner in box pixels and
    screen pixels per board pixel. */
export function boardRect(view: ArtView, vw: number, vh: number, bw: number, bh: number, fit: number): ArtRect {
  const scale = fit * view.zoom
  return { left: vw / 2 + view.x - (bw * scale) / 2, top: vh / 2 + view.y - (bh * scale) / 2, scale }
}

/** A box point in board pixels. */
export function toBoard(px: number, py: number, r: ArtRect): { x: number; y: number } {
  return { x: (px - r.left) / r.scale, y: (py - r.top) / r.scale }
}

/**
 * The view zoomed by `factor` about box point px, py: the board point
 * under it stays under it. Zoom is clamped to min and max.
 */
export function zoomAt(view: ArtView, factor: number, px: number, py: number, vw: number, vh: number, bw: number, bh: number, fit: number, min = 0.25, max = 16): ArtView {
  const zoom = Math.min(max, Math.max(min, view.zoom * factor))
  const b = toBoard(px, py, boardRect(view, vw, vh, bw, bh, fit))
  const s = fit * zoom
  const left = px - b.x * s
  const top = py - b.y * s
  return { zoom, x: left - vw / 2 + (bw * s) / 2, y: top - vh / 2 + (bh * s) / 2 }
}

/** Wheel delta to a zoom factor. Lines count as 16 px; a pinch on a
    trackpad arrives as ctrl wheel and moves faster. */
export function wheelFactor(deltaY: number, deltaMode = 0, ctrl = false): number {
  const d = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 400 : deltaY
  return Math.exp(-d * (ctrl ? 0.01 : 0.0015))
}

/** Two touches then and now: the zoom factor and the pan of their midpoint. */
export function pinch(a0: Pt, b0: Pt, a1: Pt, b1: Pt): { factor: number; mid0: Pt; mid1: Pt } {
  const d0 = Math.hypot(b0.x - a0.x, b0.y - a0.y)
  const d1 = Math.hypot(b1.x - a1.x, b1.y - a1.y)
  return {
    factor: d0 > 0 ? d1 / d0 : 1,
    mid0: { x: (a0.x + b0.x) / 2, y: (a0.y + b0.y) / 2 },
    mid1: { x: (a1.x + b1.x) / 2, y: (a1.y + b1.y) / 2 },
  }
}

interface Pt { x: number; y: number }

/** A board point in the layer's own pixels, origin top left. */
export function toLayer(L: Pick<ArtLayer, 'w' | 'h' | 'transform'>, bx: number, by: number): Pt {
  const t = L.transform
  const r = (-t.rot * Math.PI) / 180
  const dx = bx - t.x
  const dy = by - t.y
  const lx = dx * Math.cos(r) - dy * Math.sin(r)
  const ly = dx * Math.sin(r) + dy * Math.cos(r)
  return { x: lx / t.scale + L.w / 2, y: ly / t.scale + L.h / 2 }
}

/** A layer pixel on the board. */
export function fromLayer(L: Pick<ArtLayer, 'w' | 'h' | 'transform'>, lx: number, ly: number): Pt {
  const t = L.transform
  const r = (t.rot * Math.PI) / 180
  const x = (lx - L.w / 2) * t.scale
  const y = (ly - L.h / 2) * t.scale
  return { x: t.x + x * Math.cos(r) - y * Math.sin(r), y: t.y + x * Math.sin(r) + y * Math.cos(r) }
}

/** Corners on the board: top left, top right, bottom right, bottom left. */
export function layerCorners(L: Pick<ArtLayer, 'w' | 'h' | 'transform'>): Pt[] {
  return [fromLayer(L, 0, 0), fromLayer(L, L.w, 0), fromLayer(L, L.w, L.h), fromLayer(L, 0, L.h)]
}

/** The topmost shown, unlocked layer under a board point, or null. The
    last layer in the list is on top. */
export function hitLayer<T extends ArtLayer>(layers: T[], bx: number, by: number): T | null {
  for (let i = layers.length - 1; i >= 0; i--) {
    const L = layers[i]
    if (L.hidden || L.locked) continue
    const p = toLayer(L, bx, by)
    if (p.x >= 0 && p.y >= 0 && p.x <= L.w && p.y <= L.h) return L
  }
  return null
}

/** Degrees into -180 to 180. Shift snaps to 15; otherwise the square
    angles catch within 4 unless alt is held. */
export function snapRot(deg: number, shift = false, alt = false): number {
  let d = (((deg + 180) % 360) + 360) % 360 - 180
  if (shift) d = Math.round(d / 15) * 15
  else if (!alt) for (const s of [-180, -90, 0, 90, 180]) if (Math.abs(d - s) < 4) d = s
  if (d === -180) d = 180
  return Math.round(d * 10) / 10
}

/** A value caught on a guide within `tol`, unless alt is held. */
export function snapTo(v: number, guide: number, tol: number, alt = false): { v: number; snapped: boolean } {
  return !alt && Math.abs(v - guide) < tol ? { v: guide, snapped: true } : { v, snapped: false }
}

/** Zoom as the screen reads it: board pixels at 100 percent. */
export function zoomWord(scale: number): string {
  return `${Math.round(scale * 100)}%`
}

/** Points along a stroke closer than this fraction of the brush are dropped. */
export function addStrokePoint(points: Pt[], p: Pt, size: number): boolean {
  const last = points[points.length - 1]
  if (last && Math.hypot(p.x - last.x, p.y - last.y) < size * 0.2) return false
  points.push({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 })
  return true
}

interface Ctx2d {
  globalCompositeOperation: string
  fillStyle: unknown
  beginPath(): void
  arc(x: number, y: number, r: number, a: number, b: number): void
  fill(): void
}

/**
 * Paints a stroke into a mask canvas the size of the layer times `k`:
 * red over for erase, cut out for restore. Dabs every quarter brush so a
 * fast drag leaves no gaps.
 */
export function applyStroke(ctx: Ctx2d, s: ArtStroke, k = 1, colour = '#ff3b3b'): void {
  const r = Math.max(0.5, (s.size / 2) * k)
  ctx.globalCompositeOperation = s.tool === 'restore' ? 'destination-out' : 'source-over'
  ctx.fillStyle = colour
  const dab = (x: number, y: number) => { ctx.beginPath(); ctx.arc(x * k, y * k, r, 0, Math.PI * 2); ctx.fill() }
  s.points.forEach((p, i) => {
    const q = s.points[i - 1]
    if (q) {
      const n = Math.ceil(Math.hypot(p.x - q.x, p.y - q.y) * k / (r / 2))
      for (let j = 1; j < n; j++) dab(q.x + ((p.x - q.x) * j) / n, q.y + ((p.y - q.y) * j) / n)
    }
    dab(p.x, p.y)
  })
  ctx.globalCompositeOperation = 'source-over'
}

/** View keys on the focused board: + and - zoom, 0 fits, 1 shows board
    pixels at 100 percent. */
export function artViewKey(key: string): 'in' | 'out' | 'fit' | 'actual' | null {
  if (key === '+' || key === '=') return 'in'
  if (key === '-' || key === '_') return 'out'
  if (key === '0') return 'fit'
  if (key === '1') return 'actual'
  return null
}
