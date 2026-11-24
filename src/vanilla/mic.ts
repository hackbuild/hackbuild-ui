// Mic input over the browser's speech recognition: interim words while
// you talk, a restart when the browser ends a session, results dropped
// while a gate is up (the character is speaking) so it does not hear
// itself, and a blocked state that names the way around.
import { emitter } from './emit'

export type MicState = 'off' | 'asking' | 'listening' | 'hearing' | 'blocked' | 'unsupported'

export const MIC_WORDS: Record<MicState, { label: string; note: string }> = {
  off: { label: 'start the mic', note: '' },
  asking: { label: 'stop the mic', note: 'allow the mic in the browser prompt.' },
  listening: { label: 'stop the mic', note: 'listening.' },
  hearing: { label: 'stop the mic', note: 'hearing you.' },
  blocked: { label: 'mic blocked', note: 'mic blocked here. allow it in site settings, or type instead.' },
  unsupported: { label: 'no speech input', note: 'no speech input in this browser. type instead.' },
}

/** True while the mic is taking input or asking to. */
export function micLive(state: MicState): boolean {
  return state === 'asking' || state === 'listening' || state === 'hearing'
}

interface ResultList {
  length: number
  [i: number]: { isFinal: boolean; 0: { transcript: string } }
}

export interface RecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((e: { error?: string }) => void) | null
  onresult: ((e: { resultIndex: number; results: ResultList }) => void) | null
  onspeechstart: (() => void) | null
  onspeechend: (() => void) | null
  start(): void
  stop(): void
}

export interface MicInputOptions {
  /** Make a recognizer. Default: the browser's, or null where there is none. */
  make?: () => RecognitionLike | null
  /** Default: navigator.language, then 'en-US'. */
  lang?: string
  /** Wait before restarting a session the browser ended. Default 150 ms. */
  restartMs?: number
  /** Drop results while this returns true, such as while the voice speaks. */
  gate?: () => boolean
  onInterim?: (text: string) => void
  onFinal?: (text: string) => void
  /** Default: performance.now. */
  now?: () => number
}

export interface MicInput {
  start(): void
  stop(): void
  /** Drop results for this many ms, the tail after the voice stops. */
  muteFor(ms: number): void
  readonly state: MicState
  subscribe(fn: (state: MicState) => void): () => void
  dispose(): void
}

function browserRecognizer(): RecognitionLike | null {
  const g = globalThis as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike }
  const SR = g.SpeechRecognition ?? g.webkitSpeechRecognition
  return SR ? new SR() : null
}

export function micInput(options: MicInputOptions = {}): MicInput {
  const changed = emitter<MicState>()
  const now = options.now ?? (() => (globalThis.performance ?? Date).now())
  let rec: RecognitionLike | null = null
  try {
    rec = (options.make ?? browserRecognizer)()
  } catch {
    rec = null
  }
  let state: MicState = rec ? 'off' : 'unsupported'
  let on = false
  let running = false
  let mutedUntil = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  function put(next: MicState) {
    if (next === state) return
    state = next
    changed.emit(next)
  }

  function run() {
    if (!rec || running) return
    try {
      rec.start()
      running = true
    } catch {
      // already starting
    }
  }

  if (rec) {
    const nav = (globalThis as { navigator?: { language?: string } }).navigator
    rec.lang = options.lang ?? nav?.language ?? 'en-US'
    rec.interimResults = true
    rec.continuous = true
    rec.onstart = () => { if (on) put('listening') }
    rec.onspeechstart = () => { if (on) put('hearing') }
    rec.onspeechend = () => { if (on) put('listening') }
    rec.onresult = (e) => {
      if (options.gate?.() || now() < mutedUntil) return
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) final += r[0].transcript
        else interim += r[0].transcript
      }
      if (final.trim()) options.onFinal?.(final.trim())
      else if (interim.trim()) options.onInterim?.(interim.trim())
    }
    rec.onend = () => {
      running = false
      if (on) {
        clearTimeout(timer)
        timer = setTimeout(() => { if (on) run() }, options.restartMs ?? 150)
      } else if (state !== 'blocked') put('off')
    }
    rec.onerror = (e) => {
      running = false
      if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
        on = false
        clearTimeout(timer)
        put('blocked')
      }
    }
  }

  return {
    start() {
      if (!rec || on) return
      on = true
      put('asking')
      run()
    },
    stop() {
      if (!rec) return
      on = false
      clearTimeout(timer)
      try {
        rec.stop()
      } catch {
        // not running
      }
      put('off')
    },
    muteFor(ms) {
      mutedUntil = Math.max(mutedUntil, now() + ms)
    },
    get state() {
      return state
    },
    subscribe: changed.on,
    dispose() {
      on = false
      clearTimeout(timer)
      if (rec) {
        rec.onstart = rec.onend = rec.onerror = rec.onresult = rec.onspeechstart = rec.onspeechend = null
        try {
          rec.stop()
        } catch {
          // not running
        }
      }
      changed.clear()
    },
  }
}
