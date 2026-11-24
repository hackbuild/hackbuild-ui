// Speech bubble lifetime: shown for reading time, held while the voice
// speaks. 1.5 s plus 60 ms per character.

/** How long a bubble stays up for this text, in ms. */
export function bubbleTtl(text: string, base = 1500, perChar = 60): number {
  return Math.round(base + perChar * text.trim().length)
}

export interface BubbleTimerHandle {
  /** Restart the clock for new text. */
  show(text: string): void
  /** While true the bubble stays; the clock restarts when it goes false. */
  hold(on: boolean): void
  dispose(): void
}

/** Calls `expire` once the text's reading time has passed with no hold.
    `ttl` fixes the time in ms; leave it out for reading time. */
export function bubbleTimer(expire: () => void, ttl?: number): BubbleTimerHandle {
  let timer: ReturnType<typeof setTimeout> | undefined
  let held = false
  let ms = 0
  function arm() {
    clearTimeout(timer)
    if (!held && ms > 0) timer = setTimeout(expire, ms)
  }
  return {
    show(text) {
      ms = ttl ?? bubbleTtl(text)
      arm()
    },
    hold(on) {
      held = on
      if (on) clearTimeout(timer)
      else arm()
    },
    dispose() {
      clearTimeout(timer)
    },
  }
}
