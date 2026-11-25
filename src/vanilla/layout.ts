import { tabs, type TabsHandle } from './tabs'

/** The six page layouts of the rebuild plan, one per original family. */
export type LayoutKind = 'stage-rack' | 'canvas-rail' | 'drop-first' | 'conversation' | 'gate' | 'form-frame'
export const LAYOUT_KINDS: ReadonlyArray<LayoutKind> = ['stage-rack', 'canvas-rail', 'drop-first', 'conversation', 'gate', 'form-frame']

/** One rack tab. The first is the live result, never settings. */
export interface RackTab {
  id: string
  label: string
}

/** Class to data-ux marker: the screen gate reads these. */
export const LAYOUT_MARKERS: ReadonlyArray<readonly [string, string]> = [
  ['.hb-lay-bar', 'bar'],
  ['.hb-lay-subject', 'subject'],
  ['.hb-rack', 'rack'],
  ['.hb-lay-verbs', 'verbs'],
  ['.hb-lay-inset', 'inset'],
  ['.hb-rack-detail', 'detail'],
]

export interface LayoutOptions {
  /** Default: the root's data-layout, else its is-<kind> class. */
  kind?: LayoutKind
  /** A rack tab was selected. */
  onTab?: (id: string) => void
  /** drop first: files dropped on the subject or picked. */
  onFiles?: (files: File[]) => void
  /** conversation: the composer was sent (Enter or its submit). */
  onSend?: (text: string) => void
  /** gate: the pink button was pressed. */
  onGo?: () => void
  /** canvas and rail: a tool was picked from the rail. */
  onTool?: (tool: string) => void
}

export interface LayoutHandle {
  readonly kind: LayoutKind
  /** The rack's tabs, when the layout has a rack. */
  readonly rack: TabsHandle | null
  /** canvas and rail: press a tool by its data-tool. */
  tool(name: string): void
  dispose(): void
}

function kindOf(root: HTMLElement): LayoutKind {
  const d = root.dataset.layout as LayoutKind | undefined
  if (d && LAYOUT_KINDS.includes(d)) return d
  return LAYOUT_KINDS.find((k) => root.classList.contains(`is-${k}`)) ?? 'stage-rack'
}

/**
 * Wires a layout written in the class layer: `.hb-lay.is-<kind>` holding
 * `.hb-lay-bar`, `.hb-lay-body`, `.hb-lay-stage` with `.hb-lay-subject`,
 * `.hb-lay-verbs` and `.hb-lay-inset`, and `.hb-rack` with a `.hb-tabs`
 * strip of `role="tab"` buttons and `.hb-rack-pane` panels. Sets the
 * data-ux markers, runs the rack tabs, and per kind: the drop zone
 * (`.hb-lay-drop` and a file input in the subject; `[data-pick]` in the zone and
 * `[data-add]` in the verb row open it), the composer (`form.hb-lay-composer`
 * with a textarea, Enter sends, Shift Enter adds a line), the gate button
 * (`.hb-gate-go`) and the tool rail (`.hb-lay-tools [data-tool]`, one
 * pressed at a time).
 */
export function layout(root: HTMLElement, options: LayoutOptions = {}): LayoutHandle {
  const kind = options.kind ?? kindOf(root)
  root.classList.add('hb-lay', `is-${kind}`)
  root.dataset.layout = kind
  for (const [sel, ux] of LAYOUT_MARKERS) {
    for (const el of root.querySelectorAll<HTMLElement>(sel)) {
      const have = (el.dataset.ux ?? '').split(/\s+/).filter(Boolean)
      if (!have.includes(ux)) el.dataset.ux = [...have, ux].join(' ')
    }
  }
  const offs: Array<() => void> = []
  const on = <K extends keyof HTMLElementEventMap>(el: EventTarget, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
    el.addEventListener(type, fn as EventListener)
    offs.push(() => el.removeEventListener(type, fn as EventListener))
  }

  const strip = root.querySelector<HTMLElement>('.hb-rack > .hb-tabs')
  if (strip) {
    const panes = [...root.querySelectorAll<HTMLElement>('.hb-rack > .hb-rack-pane')]
    strip.querySelectorAll<HTMLElement>('[role="tab"]').forEach((t, i) => {
      const pane = panes[i]
      if (!pane) return
      if (!pane.id) pane.id = `hb-rack-pane-${Math.random().toString(36).slice(2, 8)}`
      if (!t.getAttribute('aria-controls')) t.setAttribute('aria-controls', pane.id)
      if (!pane.getAttribute('role')) pane.setAttribute('role', 'tabpanel')
    })
  }
  const rack = strip ? tabs(strip, { onChange: (v) => options.onTab?.(v) }) : null

  const subject = root.querySelector<HTMLElement>('.hb-lay-subject')
  const drop = root.querySelector<HTMLElement>('.hb-lay-drop')
  if (kind === 'drop-first' && subject) {
    const take = (list: FileList | null | undefined) => {
      const files = list ? [...list] : []
      if (files.length) options.onFiles?.(files)
    }
    on(subject, 'dragover', (e) => { e.preventDefault(); drop?.classList.add('is-hot') })
    on(subject, 'dragleave', () => drop?.classList.remove('is-hot'))
    on(subject, 'drop', (e) => { e.preventDefault(); drop?.classList.remove('is-hot'); take(e.dataTransfer?.files) })
    const input = subject.querySelector<HTMLInputElement>('input[type="file"]')
    if (input) {
      on(input, 'change', () => { take(input.files); input.value = '' })
      // the pick button in the zone, and once a result exists the add files verb
      for (const b of root.querySelectorAll<HTMLElement>('.hb-lay-drop [data-pick], .hb-lay-verbs [data-add]')) on(b, 'click', () => input.click())
    }
  }

  const composer = root.querySelector<HTMLFormElement>('form.hb-lay-composer')
  if (kind === 'conversation' && composer) {
    const area = composer.querySelector<HTMLTextAreaElement>('textarea')
    const send = () => {
      const text = area?.value.trim() ?? ''
      if (!text) return
      options.onSend?.(text)
      if (area) area.value = ''
    }
    on(composer, 'submit', (e) => { e.preventDefault(); send() })
    if (area) on(area, 'keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send() } })
  }

  const go = root.querySelector<HTMLElement>('.hb-gate-go')
  if (kind === 'gate' && go) on(go, 'click', () => { if (go.getAttribute('aria-busy') !== 'true') options.onGo?.() })

  const rail = root.querySelector<HTMLElement>('.hb-lay-tools')
  const tools = () => [...(rail?.querySelectorAll<HTMLElement>('[data-tool]') ?? [])]
  const press = (name: string, notify: boolean) => {
    let hit = false
    for (const t of tools()) {
      const me = t.dataset.tool === name
      hit ||= me
      t.setAttribute('aria-pressed', String(me))
    }
    if (hit && notify) options.onTool?.(name)
  }
  if (rail) {
    const first = tools().find((t) => t.getAttribute('aria-pressed') === 'true') ?? tools()[0]
    if (first?.dataset.tool) press(first.dataset.tool, false)
    on(rail, 'click', (e) => {
      const t = (e.target as Element).closest<HTMLElement>('[data-tool]')
      if (t && rail.contains(t) && t.dataset.tool) press(t.dataset.tool, true)
    })
  }

  return {
    kind,
    rack,
    tool: (name) => press(name, true),
    dispose() {
      rack?.dispose()
      for (const off of offs.splice(0)) off()
    },
  }
}

/** Named forms of layout(), one per kind. */
export const stageRack = (root: HTMLElement, o: Omit<LayoutOptions, 'kind'> = {}) => layout(root, { ...o, kind: 'stage-rack' })
export const canvasRail = (root: HTMLElement, o: Omit<LayoutOptions, 'kind'> = {}) => layout(root, { ...o, kind: 'canvas-rail' })
export const dropFirst = (root: HTMLElement, o: Omit<LayoutOptions, 'kind'> = {}) => layout(root, { ...o, kind: 'drop-first' })
export const conversation = (root: HTMLElement, o: Omit<LayoutOptions, 'kind'> = {}) => layout(root, { ...o, kind: 'conversation' })
export const gate = (root: HTMLElement, o: Omit<LayoutOptions, 'kind'> = {}) => layout(root, { ...o, kind: 'gate' })
export const formFrame = (root: HTMLElement, o: Omit<LayoutOptions, 'kind'> = {}) => layout(root, { ...o, kind: 'form-frame' })

/** A gate check's state: waiting, loading (pink fill), ready, failed. */
export type GateCheckState = 'wait' | 'load' | 'ok' | 'err'

/** A gate check's fill in percent and its words at the right. */
export function gateCheckView(state: GateCheckState, value = 0, note = ''): { pct: number; words: string } {
  const pct = Math.round(Math.min(1, Math.max(0, state === 'ok' ? 1 : value)) * 100)
  const words = note || (state === 'ok' ? 'ready' : state === 'load' ? `${pct}%` : state === 'err' ? 'failed' : 'waiting')
  return { pct, words }
}
