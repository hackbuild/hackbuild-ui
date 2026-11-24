/** A listener set. `on` returns the function that removes the listener. */
export interface Emitter<T> {
  on(fn: (value: T) => void): () => void
  emit(value: T): void
  clear(): void
}

export function emitter<T>(): Emitter<T> {
  const fns = new Set<(value: T) => void>()
  return {
    on(fn) {
      fns.add(fn)
      return () => { fns.delete(fn) }
    },
    emit(value) {
      for (const fn of [...fns]) fn(value)
    },
    clear() {
      fns.clear()
    },
  }
}
