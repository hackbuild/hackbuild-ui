import { emitter } from './emit'

export interface PersistedOptions<T> {
  /** Stored with the value. A stored value of another version is run
      through `migrate`, or dropped for the initial value. Default 1. */
  version?: number
  /** Default: localStorage, or none where the browser blocks it. */
  storage?: Storage | null
  /** Turn an older stored value into this version. Return undefined to
      drop it. */
  migrate?: (value: unknown, fromVersion: number) => T | undefined
  /** Follow writes from other tabs. Default true. */
  sync?: boolean
}

export interface Persisted<T> {
  readonly key: string
  get(): T
  set(value: T): void
  update(fn: (value: T) => T): void
  /** Back to the initial value, and the stored copy removed. */
  reset(): void
  subscribe(fn: (value: T) => void): () => void
  /** Why the last write did not reach storage, or null. */
  readonly error: string | null
  dispose(): void
}

function defaultStorage(): Storage | null {
  try {
    return (globalThis as { localStorage?: Storage }).localStorage ?? null
  } catch {
    return null
  }
}

/**
 * A value kept in localStorage under `key` as `{"v": version, "value": ...}`.
 * Reads that fail, unparsable JSON and a version with no migration give
 * the initial value. Writes that fail keep the value for this tab and set
 * `error`. Writes from other tabs arrive through `subscribe`.
 */
export function persisted<T>(key: string, initial: T, options: PersistedOptions<T> = {}): Persisted<T> {
  const version = options.version ?? 1
  const storage = options.storage === undefined ? defaultStorage() : options.storage
  const changed = emitter<T>()
  let error: string | null = storage ? null : 'storage is blocked here. kept for this tab only.'

  function read(): T {
    if (!storage) return initial
    try {
      const raw = storage.getItem(key)
      if (raw === null) return initial
      const box = JSON.parse(raw) as { v?: unknown; value?: unknown }
      if (!box || typeof box !== 'object' || !('value' in box)) return initial
      if (box.v === version) return box.value as T
      const from = typeof box.v === 'number' ? box.v : 0
      const moved = options.migrate?.(box.value, from)
      return moved === undefined ? initial : moved
    } catch {
      return initial
    }
  }

  let value = read()

  function write(next: T) {
    if (!storage) return
    try {
      storage.setItem(key, JSON.stringify({ v: version, value: next }))
      error = null
    } catch {
      error = 'storage is full or blocked. kept for this tab only.'
    }
  }

  function set(next: T) {
    value = next
    write(next)
    changed.emit(value)
  }

  const win = (globalThis as { addEventListener?: Window['addEventListener'] }).addEventListener ? (globalThis as unknown as Window) : null
  function onStorage(e: StorageEvent) {
    if (e.key !== key || (e.storageArea && e.storageArea !== storage)) return
    value = read()
    changed.emit(value)
  }
  const sync = options.sync !== false && !!storage && !!win
  if (sync) win!.addEventListener('storage', onStorage)

  return {
    key,
    get: () => value,
    set,
    update: (fn) => set(fn(value)),
    reset() {
      value = initial
      try {
        storage?.removeItem(key)
      } catch {
        // blocked storage: the value is reset for this tab
      }
      changed.emit(value)
    },
    subscribe: changed.on,
    get error() {
      return error
    },
    dispose() {
      if (sync) win!.removeEventListener('storage', onStorage)
      changed.clear()
    },
  }
}
