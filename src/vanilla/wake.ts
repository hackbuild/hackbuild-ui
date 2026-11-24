// The wake gate: one row per subsystem (brain, voice, memory, body), the
// note built from size, origin and storage quota, the pills that mirror
// the rows once the gate closes, and the failure line. Only required rows
// block: a voice or body failure marks its own row and pill, a brain
// failure writes one line with the fixes and gives the buttons back.
import { mbText, type SizeSource } from './models'

export type WakeState = 'waiting' | 'loading' | 'ready' | 'error' | 'off'

export interface WakeSystem {
  id: string
  label: string
  state: WakeState
  /** 0 to 1 while loading, or null when the total is unknown. */
  pct?: number | null
  /** What the row says now: 'waiting', '1.2 / 5.3 gb', 'ready, webgpu', the error. */
  note?: string
  /** Only required rows hold the gate. Default false. */
  required?: boolean
}

export interface GateNoteInput {
  /** Download size of the picked brain in MB, or null when unknown. */
  sizeMB?: number | null
  sizeSource?: SizeSource
  /** 'file' when the page was opened from disk. */
  origin?: 'http' | 'file'
  /** Storage quota the browser reports, in MB, or null when it does not say. */
  quotaMB?: number | null
  /** false when the probe found no webgpu adapter. */
  webgpu?: boolean
  /** What else downloads on the first run: 'the voice and memory models'. */
  extras?: string
}

export interface GateNote {
  text: string
  /** A line in it names a problem: no webgpu or a small quota. */
  warn: boolean
}

/** The three things that make a large download fail, stated by the button. */
export function gateNote(o: GateNoteInput): GateNote {
  const bits: string[] = []
  let warn = false
  if (o.webgpu === false) {
    bits.push('no webgpu here. the brain runs on the cpu and will crawl. use desktop chrome or edge, or pick a lighter model.')
    warn = true
  }
  if (o.sizeMB) {
    const plus = o.extras ? `, plus ${o.extras}` : ''
    bits.push(`first run downloads about ${mbText(o.sizeMB)} (${o.sizeSource ?? 'unknown'}) for the brain${plus}. after that it loads from cache.`)
  }
  if (o.origin === 'file') bits.push('opened as a file. the model is cached in indexeddb instead of opfs.')
  if (o.quotaMB && o.sizeMB && o.quotaMB < o.sizeMB * 1.2) {
    bits.push(`this browser reports only ${mbText(o.quotaMB)} of storage quota.`)
    warn = true
  }
  return { text: bits.join(' '), warn }
}

export type WakePillState = 'off' | 'load' | 'ok' | 'warn' | 'err'

export interface WakePill {
  key: string
  label: string
  state: WakePillState
  title?: string
}

/** Header pills from the same rows: a failed optional row is a warn pill
    with the error as its title, since the rest still works. */
export function wakePills(systems: readonly WakeSystem[]): WakePill[] {
  return systems.map((s) => {
    const state: WakePillState =
      s.state === 'ready' ? 'ok'
        : s.state === 'loading' ? 'load'
          : s.state === 'error' ? (s.required ? 'err' : 'warn')
            : 'off'
    return { key: s.id, label: s.label, state, title: s.note || undefined }
  })
}

export interface WakeSummary {
  /** Some row is loading. */
  busy: boolean
  /** Every required row is ready. */
  ready: boolean
  /** Required rows that failed. */
  failed: string[]
  /** Optional rows that failed: they show on their row and pill only. */
  degraded: string[]
}

export function wakeSummary(systems: readonly WakeSystem[]): WakeSummary {
  const req = systems.filter((s) => s.required)
  return {
    busy: systems.some((s) => s.state === 'loading'),
    ready: req.length > 0 && req.every((s) => s.state === 'ready'),
    failed: req.filter((s) => s.state === 'error').map((s) => s.label),
    degraded: systems.filter((s) => !s.required && s.state === 'error').map((s) => s.label),
  }
}

/** Bar width in percent for a row; null draws the sweep. */
export function wakeBar(s: WakeSystem): number | null {
  if (s.state === 'ready' || s.state === 'error' || s.state === 'off') return 100
  if (s.state === 'waiting') return 0
  return s.pct === null || s.pct === undefined ? null : Math.max(0, Math.min(100, s.pct * 100))
}

/** The one failure line: what would not load, the error, two fixes. */
export function wakeError(label: string, raw: string, fixes = 'pick a smaller model from the list, or open this page over http in desktop chrome.'): string {
  const why = String(raw || 'no reason given').replace(/\.+$/, '')
  return `the ${label} would not load: ${why}. ${fixes}`
}
