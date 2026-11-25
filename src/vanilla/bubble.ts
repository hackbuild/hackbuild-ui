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

export interface BubbleBox {
  /** The bubble centre in px from the host's left. */
  x: number
  /** The anchor y in px from the host's top; the bubble sits above it, or under it when `below`. */
  y: number
  /** No room above the point: the bubble hangs under it, tail up. */
  below: boolean
  /** The tail's offset in px from the bubble centre, so it still points at the anchor. */
  tail: number
}

/**
 * Where a bubble of `w` by `h` anchored at (`x`, `y`) goes so it stays in a
 * host of `hostW` by `hostH`, `pad` px in from every edge. It slides
 * sideways first, then hangs under the point when the top has no room. The
 * tail keeps pointing at `x` while the bubble slides. `gap` is the space
 * between the point and the bubble, the tail's length.
 */
export function clampBubble(
  x: number, y: number, w: number, h: number, hostW: number, hostH: number, pad = 8, gap = 10,
): BubbleBox {
  const half = w / 2
  const lo = pad + half
  const hi = hostW - pad - half
  const cx = hi < lo ? hostW / 2 : Math.min(hi, Math.max(lo, x))
  const ay = Math.min(hostH - pad, Math.max(pad, y))
  let below = false
  let by = ay
  if (ay - gap - h < pad) {
    if (ay + gap + h <= hostH - pad) below = true
    else by = Math.min(hostH - pad, pad + gap + h)
  }
  const room = Math.max(0, half - 12)
  const tail = Math.min(room, Math.max(-room, x - cx))
  return { x: cx, y: by, below, tail }
}

/** clampBubble for a mounted `.hb-bubble`: its own size, and the host's,
    the offset parent by default. Null while it is hidden or detached. */
export function measureBubble(el: HTMLElement, x: number, y: number, pad = 8, host?: HTMLElement | null): BubbleBox | null {
  const box = host ?? (el.offsetParent as HTMLElement | null)
  if (!box || el.hidden || !el.offsetWidth) return null
  return clampBubble(x, y, el.offsetWidth, el.offsetHeight, box.clientWidth, box.clientHeight, pad)
}

/** Put a `.hb-bubble` at (`x`, `y`) inside its stage host: writes
    `--hb-x`, `--hb-y`, `--hb-tail` and `.is-below`. For a projected point,
    call it every frame. Returns the box, or null when it could not measure. */
export function placeBubble(el: HTMLElement, x: number, y: number, options: { pad?: number; host?: HTMLElement | null } = {}): BubbleBox | null {
  el.classList.add('is-in-host')
  el.style.setProperty('--hb-x', `${x}px`)
  el.style.setProperty('--hb-y', `${y}px`)
  const b = measureBubble(el, x, y, options.pad, options.host)
  if (!b) return null
  el.style.setProperty('--hb-x', `${b.x}px`)
  el.style.setProperty('--hb-y', `${b.y}px`)
  el.style.setProperty('--hb-tail', `${b.tail}px`)
  el.classList.toggle('is-below', b.below)
  return b
}
