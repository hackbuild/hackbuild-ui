import { shallowRef, type ShallowRef } from 'vue'
import { confirmDialog, type ConfirmDialog, type ConfirmRequest } from '../vanilla/confirm'
import { onEnd } from './scope'

let shared: ConfirmDialog | null = null

export interface UseConfirm {
  /** The request to show in one HbModal in the shell, or null. */
  current: Readonly<ShallowRef<ConfirmRequest | null>>
  /** Resolves true on confirm, false otherwise. */
  confirm: (request: ConfirmRequest) => Promise<boolean>
  answer: (ok: boolean) => void
}

/**
 * The promise dialog for large destructive actions. Every caller shares
 * one queue: the shell renders `current` in one HbModal and calls
 * `answer`. Over `confirmDialog` from the vanilla entry.
 */
export function useConfirm(): UseConfirm {
  shared ??= confirmDialog()
  const dialog = shared
  const current = shallowRef<ConfirmRequest | null>(dialog.current)
  const off = dialog.subscribe((c) => { current.value = c })
  onEnd(off)
  return {
    current,
    confirm: (request) => dialog.ask(request),
    answer: (ok) => dialog.answer(ok),
  }
}
