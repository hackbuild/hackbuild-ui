/**
 * The stroke set: app chrome and tool panel icons drawn as lines on a 24
 * grid, square caps, mitre joins, currentColor, no fills. The stroke width
 * follows --hb-border (1.5 px, 2 px in the zine scope) through
 * `.hb-icon.is-stroke`; without the stylesheet it is 2 grid units.
 *
 * Send, microphone, stop, volume, mute, gear, memory, x, flip, frame,
 * upload, download, play, redo, trash and sun are the FERRULE and ARBOR
 * drawings. The rest are drawn in the same idiom. Names match the Font
 * Awesome names they replace, so `<HbIcon name="trash">` picks the line
 * drawing and a name the set does not carry falls back to the solid glyph.
 */
import type { IconName } from './index'

export interface StrokeIconDef {
  /** path data on the 24 grid, drawn as lines */
  d: string
}

// Every value below is a literal (no concatenation, no call) and the one
// top level call carries a pure mark, so a bundle that imports none of the icons drops the table. Rings
// are written out: `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a...`.

const EYE = 'M2 12c3-5 6.5-7 10-7s7 2 10 7c-3 5-6.5 7-10 7s-7-2-10-7zM9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'
const MIC = 'M9 3h6v11H9zM5 11v1a7 7 0 0 0 14 0v-1M12 19v3'
const VIDEO = 'M3 6h12v12H3zM15 10l6-3v10l-6-3'
const SEND = 'M3 12h16M13 6l6 6-6 6'
const REDO = 'M20 12a8 8 0 1 1-3-6.2M20 4v5h-5'

export const strokeIcons = {
  // ported from FERRULE and ARBOR
  send: { d: SEND },
  microphone: { d: MIC },
  stop: { d: 'M6 6h12v12H6z' },
  volume: { d: 'M4 9v6h4l5 4V5L8 9zM17 8a5 5 0 0 1 0 8' },
  mute: { d: 'M4 9v6h4l5 4V5L8 9zM17 9l4 6M21 9l-4 6' },
  gear: { d: 'M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2' },
  memory: { d: 'M4 5h16v14H4zM8 9h8M8 13h5' },
  x: { d: 'M5 5l14 14M19 5L5 19' },
  flip: { d: 'M4 8h13l-3-3M20 16H7l3 3' },
  frame: { d: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5' },
  upload: { d: 'M12 16V4M7 9l5-5 5 5M4 20h16' },
  download: { d: 'M12 4v11M7 11l5 5 5-5M5 20h14' },
  play: { d: 'M7 5l11 7-11 7z' },
  redo: { d: REDO },
  trash: { d: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6' },
  sun: { d: 'M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M12 2v3M12 19v3M2 12h3M19 12h3' },

  // drawn in the same idiom
  'paper-plane': { d: SEND },
  refresh: { d: REDO },
  undo: { d: 'M4 12a8 8 0 1 0 3-6.2M4 4v5h5' },
  plus: { d: 'M12 5v14M5 12h14' },
  minus: { d: 'M5 12h14' },
  check: { d: 'M5 12l5 5 9-10' },
  'arrow-right': { d: 'M4 12h14M12 6l6 6-6 6' },
  'arrow-left': { d: 'M20 12H6M12 6l-6 6 6 6' },
  'arrow-up': { d: 'M12 20V6M6 12l6-6 6 6' },
  'arrow-down': { d: 'M12 4v14M6 12l6 6 6-6' },
  external: { d: 'M14 4h6v6M20 4l-9 9M17 14v6H4V7h6' },
  link: { d: 'M9 15l6-6M11 6l2-2a4 4 0 0 1 6 6l-2 2M13 18l-2 2a4 4 0 0 1-6-6l2-2' },
  copy: { d: 'M8 8h12v12H8zM16 8V4H4v12h4' },
  pen: { d: 'M4 20v-4L15 5l4 4L8 20zM12 8l4 4' },
  eye: { d: EYE },
  'eye-slash': { d: 'M2 12c3-5 6.5-7 10-7s7 2 10 7c-3 5-6.5 7-10 7s-7-2-10-7zM9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M4 4l16 16' },
  thumbtack: { d: 'M8 3h8M10 3v6l-4 5h12l-4-5V3M12 14v7' },
  search: { d: 'M4 10a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M15 15l6 6' },
  filter: { d: 'M3 4h18l-7 8v7l-4 2v-9z' },
  sliders: { d: 'M4 6h16M4 12h16M4 18h16M8 4v4M15 10v4M10 16v4' },
  menu: { d: 'M4 6h16M4 12h16M4 18h16' },
  grip: { d: 'M9 5v1M15 5v1M9 11.5v1M15 11.5v1M9 18v1M15 18v1' },
  power: { d: 'M12 3v8M7 6a7 7 0 1 0 10 0' },
  lock: { d: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4' },
  'lock-open': { d: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0' },
  shuffle: { d: 'M3 7h4l10 10h3M3 17h4L17 7h3M18 4l3 3-3 3M18 14l3 3-3 3' },
  dice: { d: 'M4 4h16v16H4zM8 8v.5M16 8v.5M12 12v.5M8 16v.5M16 16v.5' },
  question: { d: 'M8 8a4 4 0 1 1 6 3.5c-1.3.8-2 1.6-2 3v1M12 19v.5' },
  info: { d: 'M3 3h18v18H3zM12 11v6M12 7v.5' },
  warning: { d: 'M12 3l10 18H2zM12 10v5M12 18v.5' },
  clock: { d: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 7v5l3 3' },
  folder: { d: 'M3 5h6l2 2h10v12H3z' },
  'folder-open': { d: 'M3 19V5h6l2 2h8v4M3 19l3-8h15l-3 8z' },
  'floppy-disk': { d: 'M4 4h13l3 3v13H4zM8 4v5h7V4M8 20v-6h8v6' },
  pause: { d: 'M8 5v14M16 5v14' },
  backward: { d: 'M19 5l-9 7 9 7zM6 5v14' },
  forward: { d: 'M5 5l9 7-9 7zM18 5v14' },
  repeat: { d: 'M4 11V7h14l-3-3M20 13v4H6l3 3' },
  record: { d: 'M5 12a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M12 12v.5' },
  wave: { d: 'M2 12h3l2-4 3 9 3-13 3 13 2-5h4' },
  'microphone-slash': { d: 'M9 3h6v11H9zM5 11v1a7 7 0 0 0 14 0v-1M12 19v3M3 3l18 18' },
  camera: { d: 'M3 7h4l2-3h6l2 3h4v13H3zM8.5 13a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0' },
  video: { d: VIDEO },
  'video-slash': { d: 'M3 6h12v12H3zM15 10l6-3v10l-6-3M3 3l18 18' },
  image: { d: 'M3 4h18v16H3zM3 16l5-5 4 4 3-3 6 6M15 8v.5' },
  crosshairs: { d: 'M5 12a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M12 2v5M12 17v5M2 12h5M17 12h5' },
  display: { d: 'M3 4h18v12H3zM8 20h8M12 16v4' },
  brain: { d: 'M12 4H9a3 3 0 0 0-3 3a3 3 0 0 0-2 5a3 3 0 0 0 2 5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3a3 3 0 0 0 2-5a3 3 0 0 0-2-5a3 3 0 0 0-3-3zM12 4v16' },
  'code-branch': { d: 'M6 3v18M18 3v4a5 5 0 0 1-5 5H6' },
  'circle-nodes': { d: 'M4 4h4v4H4zM16 4h4v4h-4zM10 16h4v4h-4zM8 6h8M7 8l4 8M17 8l-4 8' },
  paw: { d: 'M7 16l5-5 5 5v4H7zM5 9v2M9 5v2M15 5v2M19 9v2' },
  heart: { d: 'M12 20l-8-8a4.5 4.5 0 0 1 8-5a4.5 4.5 0 0 1 8 5z' },
  comment: { d: 'M4 4h16v12h-9l-5 4v-4H4z' },
  microchip: { d: 'M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4' },
  'shield-halved': { d: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM12 3v18' },
  wrench: { d: 'M14 3a6 6 0 0 0-5.5 8.5L3 17v4h4l5.5-5.5A6 6 0 0 0 21 10l-4 1-4-4 1-4z' },
  bolt: { d: 'M13 3L5 14h6l-1 7 8-11h-6z' },
  cube: { d: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9' },
  plug: { d: 'M9 3v5M15 3v5M6 8h12v4a6 6 0 0 1-12 0zM12 18v3' },
  wind: { d: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7' },
  'ear-listen': { d: 'M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 0M10 9a2 2 0 0 1 4 0' },
  'layer-group': { d: 'M12 4l9 5-9 5-9-5zM3 14l9 5 9-5' },
  // mask tools
  wand: { d: 'M3 21L14 10M16 3v3M16 12v3M10 9h3M19 9h3M12 5l1.5 1.5M20 5l-1.5 1.5' },
  brush: { d: 'M20 4l-7 7M11 9l4 4-2 2-4-4zM9 13c-3 0-5 2-5 7c5 0 7-2 7-5' },
  eraser: { d: 'M4 16l9-9 7 7-6 6H8zM9 11l7 7M14 20h6' },
  lasso: { d: 'M12 4c5 0 9 2.5 9 5.5s-4 5.5-9 5.5s-9-2.5-9-5.5s4-5.5 9-5.5zM6 14c-1 2 0 4 2 4s2 2 1 3' },
} as const satisfies Record<string, StrokeIconDef>

export type StrokeIconName = keyof typeof strokeIcons

/** Any name HbIcon draws: the stroke set or the baked Font Awesome set. */
export type HbIconName = StrokeIconName | IconName

export const strokeIconNames = /* @__PURE__ */ Object.keys(strokeIcons) as StrokeIconName[]

/** The names first drawn in FERRULE and ARBOR. */
export const strokePortedNames: StrokeIconName[] = [
  'send', 'microphone', 'stop', 'volume', 'mute', 'gear', 'memory', 'x',
  'flip', 'frame', 'upload', 'download', 'play', 'redo', 'trash', 'sun',
]

export function strokeIconDef(name: string): StrokeIconDef | undefined {
  return (strokeIcons as Record<string, StrokeIconDef>)[name]
}

export interface StrokeIconOptions {
  /** rendered size in px, square; default 16 */
  size?: number
  /** accessible name; without it the icon is aria-hidden */
  label?: string
  /** extra classes after `hb-icon is-stroke` */
  className?: string
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** The icon as an SVG string, or an empty string for an unknown name. */
export function strokeIcon(name: string, opts: StrokeIconOptions = {}): string {
  const def = strokeIconDef(name)
  if (!def) return ''
  const size = opts.size ?? 16
  const cls = 'hb-icon is-stroke' + (opts.className ? ' ' + esc(opts.className) : '')
  const a11y = opts.label ? `role="img" aria-label="${esc(opts.label)}"` : 'aria-hidden="true"'
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" ${a11y}><path d="${def.d}"/></svg>`
}

/** The icon as an element, or null for an unknown name. */
export function strokeIconEl(name: string, opts: StrokeIconOptions = {}, doc: Document = document): SVGSVGElement | null {
  const html = strokeIcon(name, opts)
  if (!html) return null
  const t = doc.createElement('template')
  t.innerHTML = html
  return t.content.firstElementChild as SVGSVGElement
}

/**
 * The Font Awesome name in a class string such as `fa-solid fa-gear` or
 * `fa fa-gear fa-lg`, or undefined when the string carries none.
 */
export function faClassName(cls: string): string | undefined {
  const skip = new Set(['solid', 'regular', 'light', 'thin', 'duotone', 'brands', 'sharp', 'fw', 'lg', 'sm', 'xs', 'xl', '2x', '3x', '4x', '5x', 'spin', 'pulse', 'beat', 'fade', 'flip', 'shake', 'bounce', 'border', 'pull-left', 'pull-right', 'inverse', 'li', 'ul', 'stack', 'stack-1x', 'stack-2x', 'rotate-90', 'rotate-180', 'rotate-270', 'flip-horizontal', 'flip-vertical', 'flip-both'])
  for (const tok of cls.trim().split(/\s+/)) {
    const m = /^fa-([a-z0-9-]+)$/.exec(tok)
    if (m && !skip.has(m[1])) return m[1]
  }
  return undefined
}
