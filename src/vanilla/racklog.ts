/** How loud a log line is. */
export type LogLevel = 'info' | 'ok' | 'warn' | 'error'

/** One line of a rack log. `t` is a clock string or milliseconds since epoch. */
export interface RackLogLine {
  t: string | number
  line: string
  level?: LogLevel
}

/** The short word printed in the level column. */
export const LEVEL_WORDS: Record<LogLevel, string> = { info: 'info', ok: 'ok', warn: 'warn', error: 'err' }

/** A clock string, hh:mm:ss, for a time in milliseconds; a string passes through. */
export function logTime(t: string | number): string {
  if (typeof t === 'string') return t
  const d = new Date(t)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/** The lines at or above a level, oldest first, at most `max` of the newest. */
export function logLines(lines: readonly RackLogLine[], opts: { min?: LogLevel; max?: number } = {}): RackLogLine[] {
  const rank: Record<LogLevel, number> = { info: 0, ok: 0, warn: 1, error: 2 }
  const min = rank[opts.min ?? 'info']
  const kept = lines.filter((l) => rank[l.level ?? 'info'] >= min)
  return opts.max && kept.length > opts.max ? kept.slice(kept.length - opts.max) : kept
}

/** The row element of one line. */
export function logRow(doc: Document, l: RackLogLine): HTMLLIElement {
  const level = l.level ?? 'info'
  const li = doc.createElement('li')
  li.className = `hb-racklog-row is-${level}`
  const t = doc.createElement('time')
  t.className = 'hb-racklog-t'
  t.textContent = logTime(l.t)
  const text = doc.createElement('span')
  text.className = 'hb-racklog-line'
  text.textContent = l.line
  const lv = doc.createElement('span')
  lv.className = 'hb-racklog-level'
  lv.textContent = LEVEL_WORDS[level]
  li.append(t, text, lv)
  return li
}

export interface RackLogOptions {
  lines?: RackLogLine[]
  /** Keep at most this many lines; the oldest go first. Default 500. */
  max?: number
  /** Keep the newest line in view while the reader is at the foot. Default true. */
  follow?: boolean
}

export interface RackLogHandle {
  add(line: RackLogLine): void
  set(lines: readonly RackLogLine[]): void
  clear(): void
  readonly count: number
  dispose(): void
}

/**
 * A rack log over an `ol.hb-racklog`: one row per line with the time, the
 * line and the level at the right edge. New lines go to the foot and stay
 * in view while the reader has not scrolled up. An empty log shows its
 * `data-empty` text.
 */
export function rackLog(el: HTMLElement, options: RackLogOptions = {}): RackLogHandle {
  const doc = el.ownerDocument
  const max = options.max ?? 500
  const follow = options.follow ?? true
  el.setAttribute('role', 'log')
  el.setAttribute('aria-live', 'polite')
  if (!el.hasAttribute('tabindex')) el.tabIndex = 0
  const atFoot = () => el.scrollHeight - el.scrollTop - el.clientHeight < 8
  const trim = () => { while (el.children.length > max) el.firstElementChild!.remove() }
  const empty = () => el.classList.toggle('is-empty', el.children.length === 0)
  function add(l: RackLogLine) {
    const stick = follow && atFoot()
    el.append(logRow(doc, l))
    trim()
    empty()
    if (stick) el.scrollTop = el.scrollHeight
  }
  function set(lines: readonly RackLogLine[]) {
    el.replaceChildren(...logLines(lines, { max }).map((l) => logRow(doc, l)))
    empty()
    if (follow) el.scrollTop = el.scrollHeight
  }
  set(options.lines ?? [])
  return {
    add,
    set,
    clear: () => set([]),
    get count() { return el.children.length },
    dispose() {},
  }
}
