import { getCurrentInstance, onBeforeUnmount, ref, type Ref } from 'vue'

export interface LiveAnnounce {
  /** Bind to a visually hidden aria-live region. */
  text: Ref<string>
  /** Queue a message. Sent at once when the gap has passed, otherwise the
      newest message waits for the gap and older waiting ones are dropped. */
  say: (message: string) => void
  /** Drop a waiting message. */
  clear: () => void
}

/**
 * A rate limited live region for values that change many times a second:
 * one announcement per `gapMs` at most, the newest wins, a repeat of the
 * last message is not sent again.
 */
export function useLiveAnnounce(gapMs = 4000): LiveAnnounce {
  const text = ref('')
  let last = -Infinity
  let pending = ''
  let timer: ReturnType<typeof setTimeout> | undefined

  function flush() {
    timer = undefined
    if (!pending || pending === text.value) { pending = ''; return }
    text.value = pending
    pending = ''
    last = Date.now()
  }

  function say(message: string) {
    if (!message || message === text.value) return
    pending = message
    const wait = last + gapMs - Date.now()
    if (wait <= 0) flush()
    else if (!timer) timer = setTimeout(flush, wait)
  }

  function clear() {
    pending = ''
    if (timer) clearTimeout(timer)
    timer = undefined
  }

  if (getCurrentInstance()) onBeforeUnmount(clear)
  return { text, say, clear }
}
