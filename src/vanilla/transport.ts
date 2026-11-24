// Transport for clips: rate steps, chapter maths, the time line, the
// Space and Escape keys, and chrome that hides while the pointer rests.
import { isTyping } from './focus'
import { clockTime } from './transcript'

export interface Chapter { t: number; label: string }

/** Playback rates the speed button steps through. */
export const RATES = [0.25, 0.5, 1, 1.5, 2]

/** The next rate up (dir 1, wrapping to the slowest) or down (dir -1). */
export function nextRate(rate: number, dir: 1 | -1 = 1, rates: number[] = RATES): number {
  if (!rates.length) return rate
  const i = rates.findIndex((r) => r >= rate - 1e-9)
  const at = i < 0 ? rates.length - 1 : rates[i] === rate ? i : dir > 0 ? i - 1 : i
  const n = at + dir
  return rates[(n + rates.length) % rates.length]
}

/** Rate as the button reads it: 1x, 0.5x, 1.5x. */
export function rateText(rate: number): string {
  return `${Number(rate.toFixed(2))}x`
}

/** Index of the chapter playing at `t`, -1 before the first. Chapters are
    sorted by start here, so the caller may pass them in any order. */
export function chapterAt(chapters: Chapter[], t: number): number {
  let at = -1
  const order = sortedIdx(chapters)
  for (const i of order) if (chapters[i].t <= t + 1e-6) at = i
  return at
}

function sortedIdx(chapters: Chapter[]): number[] {
  return chapters.map((_, i) => i).sort((a, b) => chapters[a].t - chapters[b].t)
}

/** Where previous or next lands. Previous goes to the start of the
    current chapter when more than `grace` seconds in, else the one
    before; next goes to the following start, or `duration` after the
    last. With no chapters it returns null and the caller steps. */
export function chapterStep(chapters: Chapter[], t: number, dir: 1 | -1, duration = Infinity, grace = 2): number | null {
  if (!chapters.length) return null
  const starts = chapters.map((c) => c.t).sort((a, b) => a - b)
  if (dir > 0) {
    const n = starts.find((s) => s > t + 1e-6)
    return n ?? (Number.isFinite(duration) ? duration : starts[starts.length - 1])
  }
  const before = starts.filter((s) => s <= t + 1e-6)
  if (!before.length) return 0
  const cur = before[before.length - 1]
  if (t - cur > grace || before.length === 1) return cur
  return before[before.length - 2]
}

/** Each chapter's share of the clip, for the strip widths. */
export function chapterSpans(chapters: Chapter[], duration: number): { i: number; from: number; to: number; share: number }[] {
  const order = sortedIdx(chapters)
  const d = Number.isFinite(duration) && duration > 0 ? duration : 0
  return order.map((i, k) => {
    const from = chapters[i].t
    const to = k + 1 < order.length ? chapters[order[k + 1]].t : d || from
    return { i, from, to, share: d ? Math.max(0, to - from) / d : 1 / order.length }
  })
}

/** 00:12 / 01:30, or 00:12 alone while the length is unknown. */
export function timeLine(t: number, duration: number): string {
  return Number.isFinite(duration) && duration > 0 ? `${clockTime(t)} / ${clockTime(duration)}` : clockTime(t)
}

export interface TransportKeysOptions {
  /** Space: play or pause. */
  toggle?: () => void
  /** Escape: stop everything. */
  stop?: () => void
  /** Left and right arrows: step back or on. */
  step?: (dir: 1 | -1) => void
}

/** Space toggles, Escape stops, arrows step. Ignored while typing, with a
    modifier, on a handled event, and where the focused control already
    owns the key (Space on a button, arrows on a slider). */
export function transportKeys(target: EventTarget, opts: TransportKeysOptions): { dispose(): void } {
  function onKey(e: Event) {
    const k = e as KeyboardEvent
    if (k.defaultPrevented || k.ctrlKey || k.metaKey || k.altKey || isTyping(k.target)) return
    const el = k.target as HTMLElement | null
    const tag = el?.tagName ?? ''
    const role = el?.getAttribute?.('role') ?? ''
    if (k.key === ' ' || k.code === 'Space') {
      if (tag === 'BUTTON' || tag === 'A' || role === 'button' || !opts.toggle) return
      if (k.repeat) return
      k.preventDefault(); opts.toggle()
    } else if (k.key === 'Escape') {
      if (!opts.stop) return
      opts.stop()
    } else if (k.key === 'ArrowLeft' || k.key === 'ArrowRight') {
      if ((tag === 'INPUT' && (el as HTMLInputElement).type === 'range') || role === 'slider' || !opts.step) return
      k.preventDefault(); opts.step(k.key === 'ArrowLeft' ? -1 : 1)
    }
  }
  target.addEventListener('keydown', onKey)
  return { dispose: () => target.removeEventListener('keydown', onKey) }
}

export interface IdleOptions {
  /** Rest time before the chrome hides, in ms. */
  ms?: number
  /** Element whose pointer movement wakes the chrome; defaults to el. */
  watch?: EventTarget
  /** Only hide while this returns true, such as while playing. */
  when?: () => boolean
  onIdle?: (idle: boolean) => void
}

interface IdleEl extends EventTarget {
  classList: { toggle(c: string, on: boolean): void }
  contains?(n: unknown): boolean
}

/** Adds is-idle to `el` after the pointer rests. Pointer, key or focus
    inside wakes it; it never hides while focus is inside. */
export function idleChrome(el: IdleEl, opts: IdleOptions = {}): { wake(): void; dispose(): void } {
  const ms = opts.ms ?? 2500
  const watch = opts.watch ?? el
  let timer: ReturnType<typeof setTimeout> | null = null
  let idle = false
  function set(on: boolean) {
    if (on === idle) return
    idle = on; el.classList.toggle('is-idle', on); opts.onIdle?.(on)
  }
  function arm() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      const doc = (globalThis as { document?: Document }).document
      const focusIn = !!doc && !!el.contains?.(doc.activeElement)
      if (!focusIn && (opts.when?.() ?? true)) set(true)
      else arm()
    }, ms)
  }
  function wake() { set(false); arm() }
  const evs = ['pointermove', 'pointerdown', 'keydown', 'focusin']
  for (const ev of evs) watch.addEventListener(ev, wake)
  if (watch !== el) el.addEventListener('focusin', wake)
  arm()
  return {
    wake,
    dispose() {
      if (timer) clearTimeout(timer)
      for (const ev of evs) watch.removeEventListener(ev, wake)
      if (watch !== el) el.removeEventListener('focusin', wake)
      set(false)
    },
  }
}
