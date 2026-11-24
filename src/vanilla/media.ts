// Spoken text, method cards, image slots, camera tiles, run history and
// seeds: the pure parts, framework free.

import { mbText } from './models'

/* Spoken text ---------------------------------------------------------- */

/** One spoken word. Times in seconds from the start of the line; `char`
    is its offset in the text, for boundary events. */
export interface SpokenWord {
  text: string
  start?: number
  end?: number
  char?: number
}

/**
 * Words with estimated times, for a voice that reports no timing: an even
 * share of about 2.2 words a second at rate 1, the pace a system voice
 * speaks a line. Boundary events or measured times replace the estimate.
 */
export function spokenWords(text: string, opts: { rate?: number; start?: number; wps?: number } = {}): SpokenWord[] {
  const rate = opts.rate && opts.rate > 0 ? opts.rate : 1
  const each = 1 / ((opts.wps ?? 2.2) * rate)
  const out: SpokenWord[] = []
  const re = /\S+/g
  let m: RegExpExecArray | null
  let t = opts.start ?? 0
  while ((m = re.exec(text))) {
    out.push({ text: m[0], start: t, end: t + each, char: m.index })
    t += each
  }
  return out
}

/** Words as given: strings get char offsets as if joined by spaces. */
export function toSpoken(words: ReadonlyArray<string | SpokenWord>): SpokenWord[] {
  let c = 0
  return words.map((w) => {
    const o: SpokenWord = typeof w === 'string' ? { text: w } : { ...w }
    if (o.char === undefined) o.char = c
    c = o.char + o.text.length + 1
    return o
  })
}

/**
 * The word being spoken at `time`: -1 before the first, the length of the
 * list once the last has ended, so every word then reads done. Null time,
 * or words with no times, give -1.
 */
export function spokenIndex(words: ReadonlyArray<SpokenWord>, time: number | null | undefined): number {
  if (time === null || time === undefined || !words.length) return -1
  let k = -1
  for (let i = 0; i < words.length; i++) {
    const s = words[i].start
    if (s === undefined) continue
    if (s <= time) k = i
    else break
  }
  if (k === -1) return -1
  const last = words[words.length - 1]
  if (k === words.length - 1 && last.end !== undefined && time >= last.end) return words.length
  return k
}

/** The word a boundary event at `charIndex` falls in. */
export function wordAtChar(words: ReadonlyArray<SpokenWord>, charIndex: number): number {
  let k = 0
  for (let i = 0; i < words.length; i++) {
    const c = words[i].char ?? 0
    if (charIndex >= c) k = i
    else break
  }
  return k
}

/* Method cards --------------------------------------------------------- */

export type MethodState = 'ready' | 'stored' | 'download' | 'loading' | 'failed' | 'unsupported'

export const METHOD_WORDS: Record<MethodState, string> = {
  ready: 'ready',
  stored: 'stored',
  download: 'download',
  loading: 'loading',
  failed: 'failed',
  unsupported: 'not on this device',
}

/** The figures on the right of a method card: '~15 s', '120 mb'. A
    download names its size; a size of 0 reads 'no download'. */
export function methodMeta(m: { time?: string; sizeMB?: number | null; state?: MethodState }): string[] {
  const out: string[] = []
  if (m.time) out.push(m.time)
  if (m.sizeMB === 0) out.push('no download')
  else if (typeof m.sizeMB === 'number') out.push(m.state === 'download' ? `download ${mbText(m.sizeMB)}` : mbText(m.sizeMB))
  return out
}

/** Quality 0 to `of` as lit squares. */
export function qualitySquares(q: number | null | undefined, of = 3): boolean[] {
  const n = Math.max(0, Math.min(of, Math.round(q ?? 0)))
  return Array.from({ length: of }, (_, i) => i < n)
}

/* Image slot and camera ------------------------------------------------ */

export type ImageSource = 'upload' | 'camera' | 'paste' | 'sample' | 'drop'
export type CameraFault = 'denied' | 'missing' | 'busy' | 'unsupported' | 'failed'

/** What a camera failure means and what to do instead. */
export function cameraFault(err: unknown): { kind: CameraFault; text: string } {
  const name = (err as { name?: string } | null)?.name ?? ''
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError')
    return { kind: 'denied', text: 'camera blocked. allow it in the site settings, or upload a file.' }
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError')
    return { kind: 'missing', text: 'no camera found. upload a file instead.' }
  if (name === 'NotReadableError' || name === 'AbortError' || name === 'TrackStartError')
    return { kind: 'busy', text: 'the camera is in use by another app. close it, or upload a file.' }
  if (name === 'unsupported')
    return { kind: 'unsupported', text: 'this browser has no camera access. upload a file instead.' }
  const msg = (err as { message?: string } | null)?.message
  return { kind: 'failed', text: `camera failed${msg ? `: ${msg.toLowerCase().replace(/\.$/, '')}` : ''}. upload a file instead.` }
}

type MediaLike = { getUserMedia?: (c: MediaStreamConstraints) => Promise<MediaStream> }

/** Ask for the camera. Rejects with an error whose name `cameraFault`
    reads; a browser with no mediaDevices rejects as 'unsupported'. */
export function openCamera(
  video: MediaTrackConstraints | boolean = { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
  devices: MediaLike | undefined = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices,
): Promise<MediaStream> {
  if (!devices?.getUserMedia) return Promise.reject(Object.assign(new Error('no mediaDevices'), { name: 'unsupported' }))
  return devices.getUserMedia({ video, audio: false })
}

/** Stop every track of a stream. */
export function closeCamera(stream: { getTracks(): Array<{ stop(): void }> } | null | undefined): void {
  stream?.getTracks().forEach((t) => t.stop())
}

/** Freeze the current video frame to a PNG blob. */
export function captureFrame(video: HTMLVideoElement, type = 'image/png'): Promise<Blob> {
  const c = document.createElement('canvas')
  c.width = video.videoWidth || 640
  c.height = video.videoHeight || 480
  c.getContext('2d')?.drawImage(video, 0, 0, c.width, c.height)
  return new Promise((ok, bad) => c.toBlob((b) => (b ? ok(b) : bad(new Error('capture failed'))), type))
}

/* Run history and seeds ------------------------------------------------ */

export interface HistoryLike {
  id: string | number
}

export type ThumbKind = 'image' | 'svg' | 'label' | 'none'

/** What a history thumb holds: an image url, svg markup (a waveform for
    an audio run), a short label such as '0:42' or 'wav', or nothing. */
export function thumbKind(thumb: string | null | undefined): ThumbKind {
  const t = String(thumb ?? '').trim()
  if (!t) return 'none'
  if (/^<svg[\s>]/i.test(t)) return 'svg'
  if (/^(data:image\/|blob:|https?:\/\/|\/|\.{0,2}\/)/i.test(t) || /\.(png|jpe?g|webp|gif|avif|svg)(\?|#|$)/i.test(t)) return 'image'
  return 'label'
}

/** An img src for an image or svg thumb; svg markup becomes a data url, so
    it renders as an image and runs no script. '' for a label or nothing. */
export function thumbSrc(thumb: string | null | undefined): string {
  const k = thumbKind(thumb)
  if (k === 'image') return String(thumb).trim()
  if (k === 'svg') return `data:image/svg+xml,${encodeURIComponent(String(thumb).trim())}`
  return ''
}

/** Newest first, the same id moved to the front, at most `cap`. */
export function historyPush<T extends HistoryLike>(items: readonly T[], item: T, cap = 8): T[] {
  return [item, ...items.filter((x) => x.id !== item.id)].slice(0, Math.max(1, cap))
}

/** The meta line of a run: 'sd turbo, seed 12345, 2 steps'. */
export function runMeta(r: { model?: string; seed?: number | null; steps?: number | null; ms?: number | null }): string {
  const out: string[] = []
  if (r.model) out.push(r.model)
  if (r.seed !== undefined && r.seed !== null) out.push(`seed ${r.seed}`)
  if (r.steps) out.push(`${r.steps} step${r.steps === 1 ? '' : 's'}`)
  if (r.ms !== undefined && r.ms !== null) out.push(r.ms < 1000 ? `${Math.round(r.ms)} ms` : `${(r.ms / 1000).toFixed(1)} s`)
  return out.join(', ')
}

export const SEED_MAX = 4294967295

/** A random seed, 0 to 2^32 - 2. */
export function rollSeed(rand: () => number = Math.random): number {
  return Math.floor(rand() * SEED_MAX)
}

/** A typed seed as a whole number in range, or null when it is not one. */
export function parseSeed(v: string | number): number | null {
  const s = typeof v === 'number' ? String(v) : v.trim()
  if (!/^\d+$/.test(s)) return null
  const n = Number(s)
  return n < SEED_MAX ? n : null
}

/** The seed for the next run: kept when locked, rolled when not. */
export function nextSeed(seed: number, locked: boolean, rand: () => number = Math.random): number {
  return locked ? seed : rollSeed(rand)
}
