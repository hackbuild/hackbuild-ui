import { emitter } from './emit'

export type CopyState = 'idle' | 'copied' | 'failed'

export interface CopierOptions {
  /** Back to idle after this many ms. Default 1500. */
  resetMs?: number
  /** Default: navigator.clipboard. */
  clipboard?: { writeText(text: string): Promise<void> } | null
  /** For the fallback copy where the clipboard API is missing. */
  doc?: Document
}

export interface Copier {
  copy(text: string): Promise<boolean>
  readonly state: CopyState
  subscribe(fn: (state: CopyState) => void): () => void
  dispose(): void
}

/** Copy text and say whether it worked, for a copy button's mark. Falls
    back to a hidden textarea where the clipboard API is missing. */
export function copier(options: CopierOptions = {}): Copier {
  const changed = emitter<CopyState>()
  let state: CopyState = 'idle'
  let timer: ReturnType<typeof setTimeout> | undefined

  function put(next: CopyState) {
    state = next
    changed.emit(next)
    if (timer) clearTimeout(timer)
    timer = next === 'idle' ? undefined : setTimeout(() => put('idle'), options.resetMs ?? 1500)
  }

  function fallback(text: string): boolean {
    const doc = options.doc ?? (globalThis as { document?: Document }).document
    if (!doc?.body) return false
    const ta = doc.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    doc.body.append(ta)
    ta.select()
    try {
      return doc.execCommand?.('copy') === true
    } catch {
      return false
    } finally {
      ta.remove()
    }
  }

  return {
    async copy(text) {
      const clip =
        options.clipboard === undefined
          ? (globalThis as { navigator?: { clipboard?: { writeText(t: string): Promise<void> } } }).navigator?.clipboard ?? null
          : options.clipboard
      let ok = false
      if (clip) {
        try {
          await clip.writeText(text)
          ok = true
        } catch {
          ok = fallback(text)
        }
      } else ok = fallback(text)
      put(ok ? 'copied' : 'failed')
      return ok
    },
    get state() {
      return state
    },
    subscribe: changed.on,
    dispose() {
      if (timer) clearTimeout(timer)
      changed.clear()
    },
  }
}
