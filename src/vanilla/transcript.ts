// Transcript, level rail and file queue: the numbers and words, no DOM.
// Ported from the earlier transcription tool: dropped lines merged back
// with their reason, the rail folded to bars with the noise floor and gate
// in the same scale as the speech, and each file a strip with a status
// word and a measured meta line. Segment fields match the transcribe
// package: speaker, confidence, words and edited are optional.

export interface TranscriptWord {
  start: number
  end: number
  text: string
  confidence?: number
}

export interface TranscriptSeg {
  /** Seconds. */
  start: number
  end: number
  text: string
  /** Still being heard; the words may change. */
  partial?: boolean
  /** Set by hand; no diarization runs here. */
  speaker?: string
  /** 0 to 1, when the engine gives one. */
  confidence?: number
  words?: TranscriptWord[]
  /** A person changed the text, speaker or times. */
  edited?: boolean
}

export interface DroppedSeg extends TranscriptSeg {
  /** empty, watermark, outro, phantom, loop, repeat. */
  why: string
}

export type TimeFormat = 'range' | 'clock' | 'seconds'

/** 75 to '01:15', 3700 to '1:01:40', not finite to '--:--'. */
export function clockTime(t: number): string {
  if (!Number.isFinite(t)) return '--:--'
  const s = Math.max(0, Math.floor(t))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const x = s % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return h ? `${h}:${p(m)}:${p(x)}` : `${p(m)}:${p(x)}`
}

/** The gutter text for a segment. range: '1.80 to 3.60'; clock: '00:01'; seconds: '1.80'. */
export function segTime(s: Pick<TranscriptSeg, 'start' | 'end'>, format: TimeFormat = 'range'): string {
  if (format === 'clock') return clockTime(s.start)
  if (format === 'seconds') return s.start.toFixed(2)
  return `${s.start.toFixed(2)} to ${s.end.toFixed(2)}`
}

export interface TranscriptRow {
  seg: TranscriptSeg
  /** Index into segments, or into dropped when `dropped` is true. */
  index: number
  dropped: boolean
  why?: string
}

/** Kept segments, with dropped ones merged in by start time when `showDropped`, filtered by `query`. */
export function transcriptRows(
  segments: readonly TranscriptSeg[],
  dropped: readonly DroppedSeg[] = [],
  o: { showDropped?: boolean; query?: string } = {},
): TranscriptRow[] {
  let rows: TranscriptRow[] = segments.map((seg, index) => ({ seg, index, dropped: false }))
  if (o.showDropped && dropped.length) {
    rows = rows.concat(dropped.map((seg, index) => ({ seg, index, dropped: true, why: seg.why })))
    rows.sort((a, b) => a.seg.start - b.seg.start)
  }
  const q = (o.query ?? '').trim().toLowerCase()
  if (q) rows = rows.filter((r) => r.seg.text.toLowerCase().includes(q) || (r.seg.speaker ?? '').toLowerCase().includes(q))
  return rows
}

/** Text cut into plain and matched parts for a search highlight; case is ignored. */
export function markParts(text: string, query = ''): { text: string; hit: boolean }[] {
  const q = query.trim().toLowerCase()
  if (!q) return [{ text, hit: false }]
  const out: { text: string; hit: boolean }[] = []
  const low = text.toLowerCase()
  let i = 0
  for (let j = low.indexOf(q); j >= 0; j = low.indexOf(q, i)) {
    if (j > i) out.push({ text: text.slice(i, j), hit: false })
    out.push({ text: text.slice(j, j + q.length), hit: true })
    i = j + q.length
  }
  if (i < text.length || !out.length) out.push({ text: text.slice(i), hit: false })
  return out
}

/** The legend line: '3 lines dropped: 2 phantom, 1 outro', or '' when none. */
export function droppedLine(dropped: readonly Pick<DroppedSeg, 'why'>[]): string {
  if (!dropped.length) return ''
  const by = new Map<string, number>()
  for (const d of dropped) by.set(d.why, (by.get(d.why) ?? 0) + 1)
  const parts = [...by].sort((a, b) => b[1] - a[1]).map(([w, n]) => `${n} ${w}`)
  return `${dropped.length} ${dropped.length === 1 ? 'line' : 'lines'} dropped: ${parts.join(', ')}`
}

/** Index of the segment under `t` seconds, or -1. */
export function nowIndex(segments: readonly Pick<TranscriptSeg, 'start' | 'end'>[], t: number | null | undefined): number {
  if (t === null || t === undefined) return -1
  return segments.findIndex((s) => t >= s.start && t < s.end)
}

/* Level rail. */

export interface RailBarsInput {
  /** Speech band level per frame, dBFS: the transcribe rail's `db`. */
  env: ArrayLike<number>
  /** Per frame 1 or true where the gate kept the audio (the rail's `open`), or kept regions in seconds. */
  vad?: ArrayLike<number | boolean> | readonly (readonly [number, number])[] | null
  /** Seconds; needed when `vad` is regions. */
  duration?: number
  noiseDb?: number | null
  thrDb?: number | null
}

export interface RailBars {
  /** 0 to 1 per bar, scaled so the loudest frame fills the rail. */
  samples: number[]
  kept: boolean[]
  /** Noise floor and gate, 0 to 1 in the same scale, or null. */
  floor: number | null
  gate: number | null
}

const amp = (db: number) => Math.pow(10, db / 20)

/**
 * Frames folded to `bins` bars: the loudest frame per bar, kept when half
 * or more of its frames passed the gate. As the earlier tool drew it, the
 * scale is amplitude over the loudest frame, and the floor and gate lines
 * sit in that same scale, so a slider that moves the gate moves its line.
 */
export function railBars(i: RailBarsInput, bins = 240): RailBars {
  const F = i.env.length
  const n = Math.max(1, Math.min(Math.floor(bins), F || 1))
  const open = new Float32Array(F)
  const v = i.vad
  if (v && v.length && Array.isArray(v[0])) {
    const dur = i.duration ?? 0
    if (dur > 0) for (const [a, b] of v as readonly (readonly [number, number])[]) {
      for (let k = Math.max(0, Math.floor((a / dur) * F)), e = Math.min(F, Math.ceil((b / dur) * F)); k < e; k++) open[k] = 1
    }
  } else if (v) {
    for (let k = 0; k < F; k++) open[k] = (v as ArrayLike<number | boolean>)[k] ? 1 : 0
  }
  const top = new Float32Array(n).fill(-Infinity)
  const keep = new Float32Array(n)
  const count = new Uint32Array(n)
  for (let k = 0; k < F; k++) {
    const b = Math.min(n - 1, Math.floor((k * n) / F))
    const d = i.env[k] ?? -90
    if (d > top[b]!) top[b] = d
    keep[b]! += open[k]!
    count[b]!++
  }
  let peak = -Infinity
  for (let b = 0; b < n; b++) if (top[b]! > peak) peak = top[b]!
  const scale = Number.isFinite(peak) ? 1 / amp(peak) : 1
  const fit = (db: number | null | undefined) => (db === null || db === undefined || !Number.isFinite(db) ? null : Math.min(1, amp(db) * scale))
  const samples: number[] = []
  const kept: boolean[] = []
  for (let b = 0; b < n; b++) {
    samples.push(F && Number.isFinite(top[b]!) ? Math.min(1, amp(top[b]!) * scale) : 0)
    kept.push(count[b]! > 0 && keep[b]! / count[b]! >= 0.5)
  }
  return { samples, kept, floor: fit(i.noiseDb), gate: fit(i.thrDb) }
}

/** Time labels along the rail: `n` labels at 0, 1/n ... (n-1)/n of the duration. */
export function railTicks(duration: number, n = 10): string[] {
  const out: string[] = []
  for (let k = 0; k < n; k++) out.push(clockTime((k / n) * duration))
  return out
}

/** '-52 dB' from a dBFS figure, '-' when unknown. */
export function dbText(db: number | null | undefined): string {
  return db === null || db === undefined || !Number.isFinite(db) ? '-' : `${Math.round(db)} dB`
}

/* Queue strip. */

export type StripStatus = 'queued' | 'decoding' | 'working' | 'running' | 'done' | 'empty' | 'failed' | 'stopped'
export type StripTone = 'ok' | 'busy' | 'bad' | ''

export const STRIP_WORDS: Record<StripStatus, string> = {
  queued: 'queued', decoding: 'decoding', working: 'transcribing', running: 'running',
  done: 'done', empty: 'no speech', failed: 'failed', stopped: 'stopped',
}

const TONES: Record<StripStatus, StripTone> = {
  queued: '', decoding: 'busy', working: 'busy', running: 'busy', done: 'ok', empty: 'busy', failed: 'bad', stopped: '',
}

/** The status word and tone. A queue job's running state takes its phase: decoding, then working. */
export function stripStatus(status: StripStatus, phase?: 'decoding' | 'working' | null): { word: string; tone: StripTone } {
  const s: StripStatus = status === 'running' && phase ? phase : status
  return { word: STRIP_WORDS[s] ?? s, tone: TONES[s] ?? '' }
}

export interface StripFigure {
  label?: string
  value: string
  /** lo: red, hi: good. */
  tone?: 'lo' | 'hi'
}

/** The meta line, in the earlier tool's order: duration, size, snr (red under 8, good over 20, vendor), lift, speech, speed, lines. */
export function stripMeta(m: {
  duration?: number; size?: number; snrDb?: number; gainDb?: number; density?: number; rtf?: number; lines?: number
}): StripFigure[] {
  const out: StripFigure[] = []
  if (m.duration) out.push({ value: clockTime(m.duration) })
  if (m.size !== undefined) out.push({ value: m.size >= 1e9 ? `${(m.size / 1e9).toFixed(1)} gb` : `${Math.round(m.size / 1e6)} mb` })
  if (m.snrDb !== undefined) out.push({ label: 'snr', value: `${m.snrDb.toFixed(1)} dB`, tone: m.snrDb < 8 ? 'lo' : m.snrDb > 20 ? 'hi' : undefined })
  if (m.gainDb !== undefined) out.push({ label: 'lift', value: `${m.gainDb.toFixed(1)} dB` })
  if (m.density !== undefined) out.push({ label: 'speech', value: `${Math.round(m.density * 100)}%` })
  if (m.rtf) out.push({ value: `${m.rtf.toFixed(1)}x rt` })
  if (m.lines !== undefined) out.push({ value: `${m.lines} ${m.lines === 1 ? 'line' : 'lines'}` })
  return out
}
