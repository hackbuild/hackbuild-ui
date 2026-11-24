import { emitter } from './emit'

export type EventTone = 'pink' | 'info' | 'ok' | 'warn' | 'err' | 'dim'

export interface EventKind {
  /** Printed in the tag column; default the kind in capitals. */
  tag?: string
  tone?: EventTone
}

export interface EventLogOptions {
  /** Rows kept; the oldest go first. Default 160. */
  max?: number
  /** Stay on the newest row. Default true. */
  follow?: boolean
  /** Within this many px of the foot counts as at the foot. Default 80. */
  slack?: number
  /** Tag and tone per kind. Unknown kinds print their name, no tone. */
  kinds?: Record<string, EventKind>
  /** Called when following turns on or off, by a scroll or by follow(). */
  onFollow?: (on: boolean) => void
}

export interface EventLogHandle {
  /** Add a row at the foot. */
  push(kind: string, text: string, t?: string): HTMLElement
  /** Add or replace the live row under `key`; null removes it. A fraction
      from 0 to 1 draws the bar, undefined leaves the bar out. */
  live(key: string, text: string | null, fraction?: number | null): HTMLElement | null
  /** Hide the rows of these kinds. */
  hide(kinds: string[]): void
  follow(on: boolean): void
  readonly following: boolean
  /** After rows were added by someone else: trim and keep the foot in view. */
  sync(): void
  clear(): void
  dispose(): void
}

/** The default kinds: speech, actions, failures, perception and loads on
    one timeline, each with its colour. */
export const EVENT_KINDS: Record<string, EventKind> = {
  you: { tag: 'you', tone: 'info' },
  me: { tag: 'me', tone: 'pink' },
  act: { tag: 'act', tone: 'ok' },
  fail: { tag: 'fail', tone: 'err' },
  warn: { tag: 'warn', tone: 'warn' },
  sense: { tag: 'eye', tone: 'dim' },
  note: { tag: 'note', tone: 'dim' },
  think: { tag: 'think', tone: 'warn' },
  load: { tag: 'load', tone: 'dim' },
}

export function kindOf(kinds: Record<string, EventKind>, kind: string): Required<EventKind> {
  const k = kinds[kind]
  return { tag: k?.tag ?? kind, tone: k?.tone ?? ('' as EventTone) }
}

/**
 * A tagged line log over `.hb-evlog`. Rows go in `.hb-evlog-rows` (or `el`
 * when there is none) as `.hb-evlog-row` with a tag column and the text.
 * Live rows are replaced in place under a key, so a download reports on the
 * same timeline without flooding it. While following, the newest row stays
 * in view; scrolling up stops following until the reader comes back down
 * or calls follow(true).
 */
export function eventLog(el: HTMLElement, options: EventLogOptions = {}): EventLogHandle {
  const max = options.max ?? 160
  const slack = options.slack ?? 80
  const kinds = { ...EVENT_KINDS, ...options.kinds }
  const box = el.querySelector<HTMLElement>('.hb-evlog-rows') ?? el
  const doc = el.ownerDocument
  const followed = emitter<boolean>()
  if (options.onFollow) followed.on(options.onFollow)
  let following = options.follow ?? true
  let hidden = new Set<string>()
  let busy = false

  function setFollow(on: boolean) {
    if (on === following) return
    following = on
    followed.emit(on)
  }

  function toFoot() {
    busy = true
    box.scrollTop = box.scrollHeight
    busy = false
  }

  function trim() {
    const rows = box.querySelectorAll('.hb-evlog-row:not(.is-live)')
    for (let i = 0; i < rows.length - max; i++) rows[i].remove()
  }

  function row(kind: string, text: string, t?: string): HTMLElement {
    const k = kindOf(kinds, kind)
    const r = doc.createElement('div')
    r.className = `hb-evlog-row${k.tone ? ` is-${k.tone}` : ''}`
    r.dataset.kind = kind
    const tag = doc.createElement('b')
    tag.className = 'hb-evlog-tag'
    tag.textContent = k.tag
    r.append(tag)
    if (t) {
      const ts = doc.createElement('span')
      ts.className = 'hb-evlog-t'
      ts.textContent = t
      r.append(ts)
    }
    const body = doc.createElement('span')
    body.className = 'hb-evlog-text'
    body.textContent = text
    r.append(body)
    if (hidden.has(kind)) r.hidden = true
    return r
  }

  function onScroll() {
    if (busy) return
    setFollow(box.scrollHeight - box.scrollTop - box.clientHeight <= slack)
  }
  box.addEventListener('scroll', onScroll, { passive: true })

  function sync() {
    trim()
    if (following) toFoot()
  }

  return {
    push(kind, text, t) {
      const r = row(kind, text, t)
      const firstLive = box.querySelector('.hb-evlog-row.is-live')
      box.insertBefore(r, firstLive)
      sync()
      return r
    },
    live(key, text, fraction) {
      let r = [...box.querySelectorAll<HTMLElement>('.hb-evlog-row.is-live')].find((x) => x.dataset.live === key) ?? null
      if (text === null) {
        r?.remove()
        return null
      }
      const next = row(key === 'think' ? 'think' : 'load', text)
      next.classList.add('is-live')
      next.dataset.live = key
      if (fraction !== undefined && fraction !== null) {
        const bar = doc.createElement('span')
        bar.className = 'hb-evlog-bar'
        const fill = doc.createElement('i')
        fill.style.width = `${Math.round(Math.max(0, Math.min(1, fraction)) * 100)}%`
        bar.append(fill)
        next.append(bar)
      }
      if (r) r.replaceWith(next)
      else box.append(next)
      r = next
      sync()
      return r
    },
    hide(list) {
      hidden = new Set(list)
      for (const r of box.querySelectorAll<HTMLElement>('.hb-evlog-row')) r.hidden = hidden.has(r.dataset.kind ?? '')
      if (following) toFoot()
    },
    follow(on) {
      setFollow(on)
      if (on) toFoot()
    },
    get following() {
      return following
    },
    sync,
    clear() {
      box.querySelectorAll('.hb-evlog-row').forEach((r) => r.remove())
    },
    dispose() {
      box.removeEventListener('scroll', onScroll)
      followed.clear()
    },
  }
}
