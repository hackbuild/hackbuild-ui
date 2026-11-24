/** What a route accepts: an input `accept` string ('.glb,.vrm',
    'image/*', 'audio/wav'), a list of those parts, or a test. */
export type DropAccept = string | string[] | ((file: { name: string; type: string }) => boolean)

export interface DropRoute {
  /** Stable name, reported in the state while a file hovers. */
  name: string
  accept: DropAccept
  /** The files of the drop this route takes, at least one. */
  on: (files: File[], event: DragEvent) => void
}

export interface DropState {
  /** A file is over the target. */
  over: boolean
  /** The route the hovering files go to, when their types say so. Null
      when the types are unknown until the drop, or split across routes. */
  route: string | null
  /** Every hovering file has a known type and no route takes it. */
  rejected: boolean
  /** Files hovering, when the browser says. */
  count: number
}

export interface DropRoutesOptions {
  /** An element that shows the hover state: it gets `.is-over` while a
      file hovers, `.is-reject` when no route takes it, and `data-route`. */
  overlay?: HTMLElement
  onState?: (state: DropState) => void
  /** Files no route took. */
  onReject?: (files: File[], event: DragEvent) => void
  /** Return false to ignore drops for now, as while a job runs. */
  enabled?: () => boolean
}

export interface DropRoutesHandle {
  readonly state: DropState
  dispose(): void
}

function parts(accept: string | string[]): string[] {
  return (Array.isArray(accept) ? accept : accept.split(','))
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
}

/** True when a file of this name and type passes `accept`. A file with no
    name is judged on its type alone. */
export function accepts(accept: DropAccept, file: { name: string; type: string }): boolean {
  if (typeof accept === 'function') return accept(file)
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return parts(accept).some((p) => {
    if (p.startsWith('.')) return name.endsWith(p)
    if (p.endsWith('/*')) return type.startsWith(p.slice(0, -1))
    return type === p
  })
}

function hasFiles(e: DragEvent): boolean {
  return [...(e.dataTransfer?.types ?? [])].includes('Files')
}

/**
 * Routes dropped files by type. Listens on `target` (default the window)
 * and keeps a hover state with a depth count, so moving over children
 * does not flicker. Each route gets its own files in one call; files no
 * route takes go to `onReject`. A drag that carries no files is left alone.
 * On an element target a handled drop does not reach a window router.
 */
export function dropRoutes(
  target: Window | Document | HTMLElement,
  routes: DropRoute[],
  options: DropRoutesOptions = {},
): DropRoutesHandle {
  let depth = 0
  let state: DropState = { over: false, route: null, rejected: false, count: 0 }

  function publish(next: DropState) {
    const same =
      next.over === state.over && next.route === state.route && next.rejected === state.rejected && next.count === state.count
    state = next
    if (same) return
    const o = options.overlay
    if (o) {
      o.classList.toggle('is-over', next.over)
      o.classList.toggle('is-reject', next.rejected)
      if (next.route) o.dataset.route = next.route
      else delete o.dataset.route
    }
    options.onState?.(next)
  }

  function guess(e: DragEvent): DropState {
    const items = [...(e.dataTransfer?.items ?? [])].filter((i) => i.kind === 'file')
    const types = items.map((i) => i.type)
    if (!types.length || types.some((t) => !t)) return { over: true, route: null, rejected: false, count: items.length }
    const hits = types.map((type) => routes.find((r) => typeof r.accept !== 'function' && accepts(r.accept, { name: '', type })))
    const names = new Set(hits.map((h) => h?.name ?? null))
    const rejected = hits.every((h) => !h) && routes.every((r) => typeof r.accept !== 'function' && parts(r.accept).every((p) => !p.startsWith('.')))
    return { over: true, route: names.size === 1 ? [...names][0]! : null, rejected, count: items.length }
  }

  const on = () => options.enabled?.() !== false

  function onEnter(e: Event) {
    const d = e as DragEvent
    if (!on() || !hasFiles(d)) return
    d.preventDefault()
    depth++
    publish(guess(d))
  }
  function onOver(e: Event) {
    const d = e as DragEvent
    if (!on() || !hasFiles(d)) return
    d.preventDefault()
    if (!state.over) publish(guess(d))
  }
  function onLeave(e: Event) {
    if (!hasFiles(e as DragEvent) || depth === 0) return
    depth--
    if (depth === 0) publish({ over: false, route: null, rejected: false, count: 0 })
  }
  function onDrop(e: Event) {
    const d = e as DragEvent
    if (!hasFiles(d)) return
    d.preventDefault()
    depth = 0
    publish({ over: false, route: null, rejected: false, count: 0 })
    if (!on()) return
    const files = [...(d.dataTransfer?.files ?? [])]
    const groups = new Map<DropRoute, File[]>()
    const left: File[] = []
    for (const f of files) {
      const r = routes.find((x) => accepts(x.accept, f))
      if (r) groups.set(r, [...(groups.get(r) ?? []), f])
      else left.push(f)
    }
    if (groups.size && 'tagName' in target) d.stopPropagation()
    for (const [r, fs] of groups) r.on(fs, d)
    if (left.length) options.onReject?.(left, d)
  }
  function onEnd() {
    depth = 0
    publish({ over: false, route: null, rejected: false, count: 0 })
  }

  target.addEventListener('dragenter', onEnter)
  target.addEventListener('dragover', onOver)
  target.addEventListener('dragleave', onLeave)
  target.addEventListener('drop', onDrop)
  target.addEventListener('dragend', onEnd)

  return {
    get state() {
      return state
    },
    dispose() {
      target.removeEventListener('dragenter', onEnter)
      target.removeEventListener('dragover', onOver)
      target.removeEventListener('dragleave', onLeave)
      target.removeEventListener('drop', onDrop)
      target.removeEventListener('dragend', onEnd)
      onEnd()
    },
  }
}
