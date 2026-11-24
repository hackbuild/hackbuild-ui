import { emitter } from './emit'

/** One piece of work in progress: a model loading, a file reading. */
export interface ActivityTask {
  key: string
  label: string
  /** 0 to 1 when the size of the work is known, else null. */
  fraction: number | null
  /** Clock time of the first report under this key. */
  started: number
  /** Why it failed, or null. A failed task stays until ended. */
  error: string | null
  /** Stops the work; offered as a cancel button. */
  cancel?: () => void
}

export interface ActivityOptions {
  now?: () => number
  setTimer?: (fn: () => void, ms: number) => unknown
  clearTimer?: (id: unknown) => void
}

export interface Activity {
  /** Report under a stable key. A known key keeps its start time. */
  set(key: string, label: string, fraction?: number | null, cancel?: () => void): void
  end(key: string): void
  fail(key: string, message: string): void
  /** Run the task's cancel and drop it. */
  cancel(key: string): void
  /** Run `work` as a task of unknown size. With `delayMs`, the task shows
      only if still running then, so fast or cached work does not flicker.
      A failure keeps the task with its message; the error is thrown on. */
  track<T>(key: string, label: string, work: () => Promise<T>, delayMs?: number): Promise<T>
  /** Oldest first: what the person has waited on longest. */
  list(): ActivityTask[]
  subscribe(fn: (tasks: ActivityTask[]) => void): () => void
  dispose(): void
}

/** The store behind an activity bar: what the app is busy with now. */
export function activity(options: ActivityOptions = {}): Activity {
  const now = options.now ?? (() => Date.now())
  const setTimer = options.setTimer ?? ((fn, ms) => setTimeout(fn, ms))
  const clearTimer = options.clearTimer ?? ((id) => clearTimeout(id as ReturnType<typeof setTimeout>))
  const tasks = new Map<string, ActivityTask & { id: number }>()
  const timers = new Set<unknown>()
  const changed = emitter<ActivityTask[]>()
  let seq = 0

  const list = (): ActivityTask[] =>
    [...tasks.values()].sort((a, b) => a.started - b.started).map(({ id: _id, ...t }) => t)
  const emit = () => changed.emit(list())

  function set(key: string, label: string, fraction: number | null = null, cancel?: () => void): number {
    const prev = tasks.get(key)
    const id = prev?.id ?? ++seq
    tasks.set(key, { key, label, fraction, started: prev?.started ?? now(), error: null, cancel: cancel ?? prev?.cancel, id })
    emit()
    return id
  }

  function end(key: string) {
    if (tasks.delete(key)) emit()
  }

  function fail(key: string, message: string) {
    const prev = tasks.get(key)
    if (prev) tasks.set(key, { ...prev, error: message, fraction: null })
    else tasks.set(key, { key, label: key, fraction: null, started: now(), error: message, id: ++seq })
    emit()
  }

  return {
    set(key, label, fraction, cancel) {
      set(key, label, fraction, cancel)
    },
    end,
    fail,
    cancel(key) {
      const t = tasks.get(key)
      if (!t) return
      tasks.delete(key)
      t.cancel?.()
      emit()
    },
    async track(key, label, work, delayMs = 0) {
      let mine: number | null = null
      let timer: unknown = null
      if (delayMs > 0) {
        timer = setTimer(() => {
          timers.delete(timer)
          timer = null
          mine = set(key, label)
        }, delayMs)
        timers.add(timer)
      } else mine = set(key, label)
      const stop = () => {
        if (timer !== null) { clearTimer(timer); timers.delete(timer); timer = null }
      }
      try {
        const out = await work()
        stop()
        // a finished run clears only the record it made
        if (mine !== null && tasks.get(key)?.id === mine) end(key)
        return out
      } catch (err) {
        stop()
        const t = tasks.get(key)
        if (!t || t.id === mine) fail(key, err instanceof Error ? err.message : String(err))
        throw err
      }
    },
    list,
    subscribe: changed.on,
    dispose() {
      for (const t of timers) clearTimer(t)
      timers.clear()
      tasks.clear()
      changed.clear()
    },
  }
}

/** What an activity line shows: the oldest task, its percent, the rest. */
export interface ActivitySummary {
  /** The oldest task, or null when idle. */
  first: ActivityTask | null
  /** ' 42%' when the size is known, else ''. */
  percent: string
  /** How many more tasks run behind the first. */
  more: number
  /** One line per task, for a title. */
  detail: string
}

/** ' 42%' for a known fraction, '' for an unknown one. */
export function percentText(fraction: number | null): string {
  return fraction === null ? '' : ` ${Math.round(Math.max(0, Math.min(1, fraction)) * 100)}%`
}

export function summarize(tasks: readonly ActivityTask[]): ActivitySummary {
  const first = tasks[0] ?? null
  return {
    first,
    percent: first ? percentText(first.fraction) : '',
    more: Math.max(0, tasks.length - 1),
    detail: tasks.map((t) => `${t.label}${t.error ? `: ${t.error}` : percentText(t.fraction)}`).join('\n'),
  }
}

/**
 * Draw a store into `.hb-activity` markup: `.hb-activity-label`,
 * `.hb-activity-more` and a `.hb-activity-line` holding a
 * `.hb-activity-fill`. The root is hidden while idle; `.is-known` marks a
 * known fraction, `.is-err` a failed first task.
 */
export function activityLine(el: HTMLElement, store: Pick<Activity, 'list' | 'subscribe'>): { dispose(): void } {
  const label = el.querySelector<HTMLElement>('.hb-activity-label')
  const more = el.querySelector<HTMLElement>('.hb-activity-more')
  const fill = el.querySelector<HTMLElement>('.hb-activity-fill')
  if (!el.getAttribute('role')) el.setAttribute('role', 'status')
  function draw(tasks: ActivityTask[]) {
    const s = summarize(tasks)
    el.hidden = !s.first
    el.title = s.detail
    el.classList.toggle('is-known', !!s.first && s.first.fraction !== null)
    el.classList.toggle('is-err', !!s.first?.error)
    if (label) label.textContent = s.first ? `${s.first.label}${s.first.error ? ' failed' : s.percent}` : ''
    if (more) { more.textContent = s.more ? `+${s.more}` : ''; more.hidden = !s.more }
    if (fill) fill.style.width = s.first && s.first.fraction !== null ? `${Math.round(s.first.fraction * 100)}%` : ''
  }
  draw(store.list())
  const off = store.subscribe(draw)
  return { dispose: off }
}
