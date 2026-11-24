// Touch pad for moving a body: a stick or a d-pad over one square base.
// Pointer capture keeps the drag after the finger leaves the base, held
// arrow keys or WASD give the same vector, and release returns to rest.
// Screen axes: x right, y down, so forward is y < 0.
import { isTyping } from './focus'

export interface PadVector { x: number; y: number }
export type PadMode = 'stick' | 'dpad'

const ZERO: PadVector = { x: 0, y: 0 }
const r3 = (n: number) => Math.round(n * 1000) / 1000 || 0

/** Offset from the centre to a vector in the unit circle. Inside the dead
    zone it is zero; past it the length is rescaled so it starts at zero. */
export function stickVector(dx: number, dy: number, radius: number, dead = 0.12): PadVector {
  const h = Math.hypot(dx, dy)
  if (!radius || !h) return { ...ZERO }
  const len = Math.min(1, h / radius)
  if (len <= dead) return { ...ZERO }
  const m = (len - dead) / (1 - dead)
  return { x: r3((dx / h) * m), y: r3((dy / h) * m) }
}

/** A vector snapped to the eight d-pad directions, at full length. */
export function snap8(v: PadVector): PadVector {
  if (!v.x && !v.y) return { ...ZERO }
  const k = Math.round(Math.atan2(v.y, v.x) / (Math.PI / 4))
  const a = (k * Math.PI) / 4
  return { x: r3(Math.cos(a)), y: r3(Math.sin(a)) }
}

/** Keys that move, by `KeyboardEvent.key` lowercased. */
export const PAD_KEYS: Record<string, 'up' | 'down' | 'left' | 'right'> = {
  arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down',
  arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
}

/** Held keys to a vector; opposite keys cancel, diagonals are length 1. */
export function keyVector(held: Iterable<string>): PadVector {
  const dirs = new Set<string>()
  for (const k of held) { const d = PAD_KEYS[k.toLowerCase()]; if (d) dirs.add(d) }
  const x = (dirs.has('right') ? 1 : 0) - (dirs.has('left') ? 1 : 0)
  const y = (dirs.has('down') ? 1 : 0) - (dirs.has('up') ? 1 : 0)
  if (!x && !y) return { ...ZERO }
  const h = Math.hypot(x, y)
  return { x: r3(x / h), y: r3(y / h) }
}

/** Compass word for a vector: '', n, ne, e, se, s, sw, w, nw. */
export function dirWord(v: PadVector): string {
  if (!v.x && !v.y) return ''
  const s = snap8(v)
  return (s.y < 0 ? 'n' : s.y > 0 ? 's' : '') + (s.x > 0 ? 'e' : s.x < 0 ? 'w' : '')
}

export interface PadOptions {
  mode?: PadMode
  dead?: number
  /** Also listen for the move keys on the window, ignored while typing. */
  keys?: boolean
  /** Window key that fires onAction; '' for none. */
  actionKey?: string
  onMove?: (v: PadVector) => void
  onAction?: () => void
  /** Where window keys are read; defaults to globalThis. */
  keyTarget?: EventTarget
}

export interface PadHandle {
  value(): PadVector
  set(v: PadVector): void
  dispose(): void
}

interface PadEl extends EventTarget {
  getBoundingClientRect(): { left: number; top: number; width: number; height: number }
  setPointerCapture?(id: number): void
  releasePointerCapture?(id: number): void
  hasPointerCapture?(id: number): boolean
  style: { setProperty(k: string, v: string): void }
  setAttribute(k: string, v: string): void
}

/** Wires the base element. Writes --hb-pad-x and --hb-pad-y (-1 to 1)
    and data-dir on it, so the knob and the d-pad arrows follow in CSS. */
export function pad(el: PadEl, opts: PadOptions = {}): PadHandle {
  const mode = opts.mode ?? 'stick'
  const dead = opts.dead ?? 0.12
  let v: PadVector = { ...ZERO }
  let pid: number | null = null
  const held = new Set<string>()

  function write(next: PadVector) {
    const n = mode === 'dpad' ? snap8(next) : next
    if (n.x === v.x && n.y === v.y) return
    v = n
    el.style.setProperty('--hb-pad-x', String(v.x))
    el.style.setProperty('--hb-pad-y', String(v.y))
    el.setAttribute('data-dir', dirWord(v))
    opts.onMove?.({ ...v })
  }
  function fromPointer(e: PointerEvent) {
    const r = el.getBoundingClientRect()
    const radius = Math.min(r.width, r.height) / 2
    write(stickVector(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2), radius, dead))
  }
  function down(e: Event) {
    const p = e as PointerEvent
    if (pid !== null || (p.button ?? 0) !== 0) return
    pid = p.pointerId
    el.setPointerCapture?.(pid)
    p.preventDefault?.()
    fromPointer(p)
  }
  function move(e: Event) {
    const p = e as PointerEvent
    if (p.pointerId !== pid) return
    fromPointer(p)
  }
  function up(e: Event) {
    const p = e as PointerEvent
    if (p.pointerId !== pid) return
    if (el.hasPointerCapture?.(pid)) el.releasePointerCapture?.(pid)
    pid = null
    write(held.size ? keyVector(held) : ZERO)
  }
  function keydown(e: Event) {
    const k = e as KeyboardEvent
    if (k.defaultPrevented || k.ctrlKey || k.metaKey || k.altKey) return
    const key = (k.key ?? '').toLowerCase()
    if (k.currentTarget !== el && isTyping(k.target)) return
    if (opts.actionKey && key === opts.actionKey.toLowerCase() && k.currentTarget !== el) {
      if (!k.repeat) opts.onAction?.()
      k.preventDefault?.()
      return
    }
    if (!PAD_KEYS[key]) return
    k.preventDefault?.()
    held.add(key)
    if (pid === null) write(keyVector(held))
  }
  function keyup(e: Event) {
    const key = ((e as KeyboardEvent).key ?? '').toLowerCase()
    if (!held.delete(key)) return
    if (pid === null) write(keyVector(held))
  }
  function blur() { held.clear(); if (pid === null) write(ZERO) }

  el.addEventListener('pointerdown', down)
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
  el.addEventListener('lostpointercapture', up)
  const kt = opts.keys ? (opts.keyTarget ?? globalThis) : el
  kt.addEventListener('keydown', keydown)
  kt.addEventListener('keyup', keyup)
  kt.addEventListener('blur', blur)
  el.setAttribute('data-dir', '')

  return {
    value: () => ({ ...v }),
    set(n) { write({ x: r3(n.x), y: r3(n.y) }) },
    dispose() {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('lostpointercapture', up)
      kt.removeEventListener('keydown', keydown)
      kt.removeEventListener('keyup', keyup)
      kt.removeEventListener('blur', blur)
      if (pid !== null && el.hasPointerCapture?.(pid)) el.releasePointerCapture?.(pid)
      pid = null
    },
  }
}
