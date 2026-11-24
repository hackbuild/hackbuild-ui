import { ref, type Ref } from 'vue'
import { undoStack } from '../vanilla/undo'
import { onEnd } from './scope'

export interface UseUndo<T> {
  canUndo: Ref<boolean>
  canRedo: Ref<boolean>
  push: (before: T) => void
  undo: (current: T) => T | undefined
  redo: (current: T) => T | undefined
  clear: () => void
}

/** Undo and redo over snapshots, with reactive can flags for the header
    buttons. Over `undoStack` from the vanilla entry. */
export function useUndo<T>(limit = 80): UseUndo<T> {
  const s = undoStack<T>(limit)
  const canUndo = ref(false)
  const canRedo = ref(false)
  const off = s.subscribe(() => {
    canUndo.value = s.canUndo
    canRedo.value = s.canRedo
  })
  onEnd(() => {
    off()
    s.dispose()
  })
  return {
    canUndo,
    canRedo,
    push: (b) => s.push(b),
    undo: (c) => s.undo(c),
    redo: (c) => s.redo(c),
    clear: () => s.clear(),
  }
}
