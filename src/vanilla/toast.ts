// The toast store: one transient toast at a time, a kind, one action,
// and errors held until the person dismisses them, so a failure is never
// gone before it is read. Pure state: HbToaster and any page render it.
import { emitter } from './emit'

export type ToastKind = 'info' | 'ok' | 'warn' | 'err'

export interface ToastAction {
  label: string
  run: () => void
}

export interface ToastOptions {
  kind?: ToastKind
  /** ms on screen. Default 1400; ignored for held toasts. */
  duration?: number
  action?: ToastAction
  /** Stay until dismissed. Default true for kind err. */
  hold?: boolean
}

export interface ToastItem {
  id: number
  message: string
  kind: ToastKind
  action?: ToastAction
  held: boolean
}

export interface ToastSnapshot {
  /** The transient toast, or null. */
  current: ToastItem | null
  /** Held toasts, oldest first, at most `maxHeld`. */
  held: ToastItem[]
}

export interface ToastStore {
  toast(message: string, options?: ToastOptions | number): number
  dismiss(id: number): void
  clear(): void
  readonly state: ToastSnapshot
  subscribe(fn: (s: ToastSnapshot) => void): () => void
}

export interface ToastTimers {
  set: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>
  clear: (id: ReturnType<typeof setTimeout>) => void
}

// Call the globals bare. Stored as methods, timers.set(...) runs setTimeout
// with this bound to the object, and Chrome throws illegal invocation.
const globalTimers: ToastTimers = {
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (id) => clearTimeout(id),
}

export function toastStore(maxHeld = 3, timers: ToastTimers = globalTimers): ToastStore {
  const ev = emitter<ToastSnapshot>()
  let state: ToastSnapshot = { current: null, held: [] }
  let n = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  const set = (s: ToastSnapshot) => { state = s; ev.emit(state) }

  return {
    toast(message, options) {
      const o: ToastOptions = typeof options === 'number' ? { duration: options } : options ?? {}
      const kind = o.kind ?? 'info'
      const held = o.hold ?? kind === 'err'
      const item: ToastItem = { id: ++n, message, kind, action: o.action, held }
      if (held) {
        set({ ...state, held: [...state.held, item].slice(-maxHeld) })
      } else {
        if (timer) timers.clear(timer)
        set({ ...state, current: item })
        timer = timers.set(() => { if (state.current?.id === item.id) set({ ...state, current: null }) }, o.duration ?? 1400)
      }
      return item.id
    },
    dismiss(id) {
      if (state.current?.id === id) set({ ...state, current: null })
      else set({ ...state, held: state.held.filter((t) => t.id !== id) })
    },
    clear() {
      if (timer) timers.clear(timer)
      set({ current: null, held: [] })
    },
    get state() { return state },
    subscribe: (fn) => ev.on(fn),
  }
}
