import { readonly, ref } from 'vue'
import { toastStore, type ToastItem, type ToastOptions } from '../vanilla/toast'

export interface ToastState {
  message: string
  visible: boolean
  /** The transient toast with its kind and action, or null. */
  current: ToastItem | null
  /** Errors and other held toasts, until dismissed. */
  held: ToastItem[]
}

const store = toastStore()
const state = ref<ToastState>({ message: '', visible: false, current: null, held: [] })
store.subscribe((s) => {
  state.value = {
    message: s.current?.message ?? state.value.message,
    visible: !!s.current,
    current: s.current,
    held: s.held,
  }
})

/**
 * One transient toast at a time, bottom center, gone in about a second;
 * errors stay until dismissed. Render HbToaster once near the app root,
 * then call toast() from anywhere. Over `toastStore` from the vanilla entry.
 *
 *   toast('saved')
 *   toast('no answer from your endpoint. check the url.', { kind: 'err', action: { label: 'retry', run } })
 */
export function useToast() {
  function toast(message: string, options?: ToastOptions | number) {
    return store.toast(message, options)
  }
  return { toast, dismiss: store.dismiss, clear: store.clear, state: readonly(state) }
}
