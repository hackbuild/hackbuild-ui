import { readonly, ref } from 'vue'

export interface ToastState {
  message: string
  visible: boolean
}

const state = ref<ToastState>({ message: '', visible: false })
let timer: ReturnType<typeof setTimeout> | undefined

/**
 * One toast at a time, bottom center, gone in about a second. Render
 * HbToaster once near the app root, then call toast() from anywhere.
 */
export function useToast() {
  function toast(message: string, duration = 1400) {
    state.value = { message, visible: true }
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      state.value = { ...state.value, visible: false }
    }, duration)
  }

  return { toast, state: readonly(state) }
}
