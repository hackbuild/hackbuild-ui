import { emitter } from './emit'

export interface UndoStack<T> {
  /** Record the state from before a change. Clears redo. */
  push(before: T): void
  /** The state to go back to, given the state now; undefined when empty. */
  undo(current: T): T | undefined
  /** The state to go forward to, given the state now. */
  redo(current: T): T | undefined
  readonly canUndo: boolean
  readonly canRedo: boolean
  /** Depth of each side, for a label such as 'undo (3)'. */
  readonly sizes: { undo: number; redo: number }
  clear(): void
  subscribe(fn: () => void): () => void
  dispose(): void
}

/**
 * Undo and redo over snapshots. The caller pushes the state from before
 * each change and hands in the state now on undo and redo, so the stack
 * never holds a stale copy of the present. The oldest step drops past
 * `limit` (default 80).
 */
export function undoStack<T>(limit = 80): UndoStack<T> {
  const back: T[] = []
  const ahead: T[] = []
  const changed = emitter<void>()

  return {
    push(before) {
      back.push(before)
      if (back.length > limit) back.splice(0, back.length - limit)
      ahead.length = 0
      changed.emit()
    },
    undo(current) {
      if (!back.length) return undefined
      ahead.push(current)
      const prev = back.pop()
      changed.emit()
      return prev
    },
    redo(current) {
      if (!ahead.length) return undefined
      back.push(current)
      const next = ahead.pop()
      changed.emit()
      return next
    },
    get canUndo() {
      return back.length > 0
    },
    get canRedo() {
      return ahead.length > 0
    },
    get sizes() {
      return { undo: back.length, redo: ahead.length }
    },
    clear() {
      back.length = 0
      ahead.length = 0
      changed.emit()
    },
    subscribe: changed.on,
    dispose() {
      changed.clear()
    },
  }
}
