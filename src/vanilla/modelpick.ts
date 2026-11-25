// The model picker as a pure view: display ready rows in, a choice out.
// The kit never reads a catalogue record; a view layer turns its records
// into ModelRow and writes every word once. HbModelSelect, HbModelSheet
// and the vanilla modelSheet() share these helpers.

/** Groups, in the order the sheet shows them. */
export type ModelRowGroup = 'here' | 'start' | 'small' | 'better' | 'uncensored' | 'reasoning' | 'none' | 'own'
export const MODEL_GROUPS: ReadonlyArray<{ id: ModelRowGroup; label: string }> = [
  { id: 'here', label: 'on this machine' },
  { id: 'start', label: 'start here' },
  { id: 'small', label: 'small and fast' },
  { id: 'better', label: 'better' },
  { id: 'uncensored', label: 'uncensored' },
  { id: 'reasoning', label: 'reasoning' },
  { id: 'none', label: 'no download' },
  { id: 'own', label: 'your own' },
]

export type ModelBackend = 'gpu' | 'cpu' | 'browser' | 'remote'
export type ModelPickState = 'none' | 'stored' | 'loaded' | 'loading' | 'error'

/** A choice the chosen model offers: backend, quant, context, language. */
export interface ModelOption {
  key: string
  label: string
  choices: ReadonlyArray<{ value: string; label: string }>
  value: string
}

/** One model, ready to draw. Every string is final text. */
export interface ModelRow {
  id: string
  name: string
  group: ModelRowGroup
  /** Download size, "1.7 gb". */
  size?: string
  /** GPU memory needed, "needs 2.3 gb". */
  memory?: string
  /** Bytes to fetch, for the load all total of several jobs. */
  bytes?: number
  backend?: ModelBackend
  /** fast, medium or slow on this machine. */
  speed?: string
  /** Two to four words: "best all round". */
  verdict?: string
  uncensored?: boolean
  noncommercial?: boolean
  state?: ModelPickState
  /** 0 to 1 while loading. */
  progress?: number
  /** Nothing to fetch: a script, or a model the browser has built in. */
  noDownload?: boolean
  /** Why this machine cannot run it; the row greys and shows this first. */
  unfit?: string
  /** The chevron detail: licence, source, context, quant, where the size came from. */
  detail?: ReadonlyArray<{ label: string; value: string }>
  /** Shown under the list only while this row is chosen. */
  options?: ReadonlyArray<ModelOption>
}

export interface ModelFilters {
  query: string
  /** On by default: rows that do not fit this machine are left out. */
  fits: boolean
  uncensored: boolean
  /** Only rows flagged noDownload. */
  nodownload: boolean
}

export const MODEL_FILTERS_DEFAULT: Readonly<ModelFilters> = { query: '', fits: true, uncensored: false, nodownload: false }

/** The "your own" forms: a GGUF repo and file, an ONNX hub repo, MLC weights by url, an endpoint and key. */
export type OwnKind = 'gguf' | 'onnx' | 'mlc' | 'endpoint'
export interface OwnField { key: string; label: string; placeholder: string; secret?: boolean }
export const OWN_FORMS: ReadonlyArray<{ kind: OwnKind; label: string; fields: ReadonlyArray<OwnField> }> = [
  { kind: 'gguf', label: 'gguf', fields: [{ key: 'repo', label: 'repo', placeholder: 'owner/name' }, { key: 'file', label: 'file', placeholder: 'model.q4_k_m.gguf' }] },
  { kind: 'onnx', label: 'onnx', fields: [{ key: 'repo', label: 'hub repo', placeholder: 'owner/name' }] },
  { kind: 'mlc', label: 'mlc', fields: [{ key: 'url', label: 'weights url', placeholder: 'https://' }] },
  { kind: 'endpoint', label: 'endpoint', fields: [{ key: 'url', label: 'url', placeholder: 'https://' }, { key: 'key', label: 'key', placeholder: 'kept on this machine', secret: true }] },
]

/** The fields of one form are filled. */
export function ownReady(kind: OwnKind, values: Record<string, string>): boolean {
  const form = OWN_FORMS.find((f) => f.kind === kind)
  return !!form && form.fields.filter((f) => !f.secret).every((f) => (values[f.key] ?? '').trim().length > 0)
}

function hay(row: ModelRow): string {
  return [row.name, row.verdict, row.backend, row.size].filter(Boolean).join(' ').toLowerCase()
}

/** Rows that pass the search and the filters, order kept. */
export function filterModelRows(rows: ReadonlyArray<ModelRow>, f: Partial<ModelFilters> = {}): ModelRow[] {
  const q = (f.query ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean)
  return rows.filter((r) => {
    if ((f.fits ?? true) && r.unfit) return false
    if (f.uncensored && !r.uncensored) return false
    if (f.nodownload && !r.noDownload) return false
    const h = hay(r)
    return q.every((w) => h.includes(w))
  })
}

/** Rows by group in sheet order, empty groups left out. */
export function groupModelRows(rows: ReadonlyArray<ModelRow>): Array<{ id: ModelRowGroup; label: string; rows: ModelRow[] }> {
  return MODEL_GROUPS.map((g) => ({ ...g, rows: rows.filter((r) => r.group === g.id) })).filter((g) => g.rows.length > 0)
}

function pct(p: number | undefined): string {
  return `${Math.round(Math.min(1, Math.max(0, p ?? 0)) * 100)}%`
}

/** The right edge of a row: loaded, stored, the progress, failed, or the size to fetch. */
export function stateWord(row: ModelRow): string {
  switch (row.state) {
    case 'loaded': return 'loaded'
    case 'stored': return 'stored'
    case 'loading': return pct(row.progress)
    case 'error': return 'failed'
    default: return row.noDownload ? 'built in' : (row.size ?? '')
  }
}

/** The load button's words: "load, 1.7 gb", "loading, 40%", "ready". */
export function loadLabel(row: ModelRow | undefined): string {
  if (!row) return 'load'
  if (row.state === 'loaded') return 'ready'
  if (row.state === 'loading') return `loading, ${pct(row.progress)}`
  if (row.state === 'stored' || row.noDownload || !row.size) return 'load'
  return `load, ${row.size}`
}

/** The row can be loaded now: chosen, fits, not loaded or loading. */
export function canLoad(row: ModelRow | undefined): boolean {
  return !!row && !row.unfit && row.state !== 'loaded' && row.state !== 'loading'
}

/** Bytes as the sheet writes them: "320 mb", "1.7 gb". */
export function bytesText(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 mb'
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1).replace(/\.0$/, '')} gb`
  return `${Math.max(1, Math.round(bytes / 1e6))} mb`
}

/**
 * The line under the name. A row that fits: speed and memory, then the
 * verdict. A row that does not: the reason first (it may wrap), then the
 * facts; the verdict gives way to it.
 */
export function rowSub(row: ModelRow): { lead: string; facts: string; unfit: boolean } {
  const facts = [row.speed, row.memory].filter(Boolean).join(', ')
  if (row.unfit) return { lead: row.unfit, facts, unfit: true }
  return { lead: row.verdict ?? '', facts, unfit: false }
}

/** The sub line as plain text in drawing order. */
export function rowSubText(row: ModelRow): string {
  const s = rowSub(row)
  return (s.unfit ? [s.lead, s.facts] : [s.facts, s.lead]).filter(Boolean).join(', ')
}

/** Several jobs: what "load all" fetches and its words. Rows already loaded or stored cost nothing. */
export function loadAll(chosen: ReadonlyArray<ModelRow | undefined>): { ids: string[]; label: string } {
  const todo = chosen.filter((r): r is ModelRow => canLoad(r))
  const bytes = todo.filter((r) => r.state !== 'stored').reduce((n, r) => n + (r.bytes ?? 0), 0)
  return { ids: todo.map((r) => r.id), label: bytes > 0 ? `load all, ${bytesText(bytes)}` : 'load all' }
}

// ---- vanilla views -------------------------------------------------------

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The closed line's words. */
export function lineWords(row: ModelRow | undefined, empty = 'no model'): { name: string; meta: string; state: string } {
  if (!row) return { name: empty, meta: '', state: '' }
  const state = row.state === 'loaded' ? 'ready' : row.state === 'loading' ? `${Math.round((row.progress ?? 0) * 100)}%` : row.state === 'stored' ? 'stored' : row.state === 'error' ? 'failed' : ''
  return { name: row.name, meta: row.state === 'loaded' || row.state === 'stored' ? '' : (row.size ?? ''), state }
}

/** The sheet's list as HTML: group heads, rows, the open detail. */
export function sheetListHtml(rows: ReadonlyArray<ModelRow>, chosen: string, openDetail = ''): string {
  const groups = groupModelRows(rows)
  if (!groups.length) return '<p class="hb-msheet-none">nothing matches. turn a filter off or clear the search.</p>'
  return groups.map((g) => `<div class="hb-msheet-gh" role="presentation">${esc(g.label)}</div><ul class="hb-msheet-group" role="presentation">${g.rows.map((r) => {
    const s = rowSub(r)
    const sub = s.unfit
      ? `<b>${esc(s.lead)}</b>${s.facts ? `, ${esc(s.facts)}` : ''}`
      : `${r.backend ? `<span class="hb-mrow-chip">${esc(r.backend)}</span>` : ''}${esc(s.facts)}${s.facts && s.lead ? ', ' : ''}<b>${esc(s.lead)}</b>`
    const pickOpen = r.unfit ? `<div class="hb-mrow-pick is-off">` : `<button type="button" class="hb-mrow-pick" data-pick="${esc(r.id)}">`
    const pickClose = r.unfit ? '</div>' : '</button>'
    const marks = `${r.uncensored ? '<i title="uncensored">u</i>' : ''}${r.noncommercial ? '<i title="not for commercial use">nc</i>' : ''}`
    const more = r.detail?.length || r.state === 'stored'
      ? `<button type="button" class="hb-mrow-more" data-more="${esc(r.id)}" aria-expanded="${openDetail === r.id}" aria-label="about ${esc(r.name)}"></button>` : ''
    const bar = r.state === 'loading' ? `<div class="hb-mrow-bar" aria-hidden="true"><i style="width:${Math.round((r.progress ?? 0) * 100)}%"></i></div>` : ''
    const detail = openDetail === r.id
      ? `<div class="hb-mrow-detail" data-ux="detail">${r.detail?.length ? `<dl>${r.detail.map((d) => `<dt>${esc(d.label)}</dt><dd>${esc(d.value)}</dd>`).join('')}</dl>` : ''}${r.state === 'stored' ? `<button type="button" class="hb-btn hb-btn-sm hb-btn-danger" data-remove="${esc(r.id)}">remove from this machine</button>` : ''}</div>` : ''
    return `<li class="hb-mrow${r.id === chosen ? ' is-chosen' : ''}${r.unfit ? ' is-unfit' : ''}" role="option" aria-selected="${r.id === chosen}"${r.unfit ? ' aria-disabled="true"' : ''}><div class="hb-mrow-line">${pickOpen}<span class="hb-mrow-name">${esc(r.name)}${marks}</span><span class="hb-mrow-sub">${sub}</span><span class="hb-mrow-state${r.state ? ` is-${r.state}` : ''}">${esc(stateWord(r))}</span>${pickClose}${more}</div>${bar}${detail}</li>`
  }).join('')}</ul>`).join('')
}

export interface ModelSheetOptions {
  rows: ModelRow[]
  chosen?: string
  title?: string
  filters?: Partial<ModelFilters>
  onChoose?: (id: string) => void
  onLoad?: (id: string) => void
  onCancel?: (id: string) => void
  onRemove?: (id: string) => void
  onOption?: (id: string, key: string, value: string) => void
  /** Show the "your own" forms, as HbModelSheet does. Default true when onCustom is set. */
  own?: boolean
  /** A "your own" form was sent: its kind and the field values. */
  onCustom?: (kind: OwnKind, values: Record<string, string>) => void
}

export interface ModelSheetHandle {
  /** New rows (progress, state); the chosen id stays unless given. */
  update(rows: ModelRow[], chosen?: string): void
  readonly chosen: string
  dispose(): void
}

/**
 * The open picker's body over a host element (put it in a `.hb-drawer-panel`
 * and open it with drawer()): search, the three filters, the grouped rows
 * with their chevron detail, the chosen row's options and the foot with the
 * one pink load button. Pure: it draws rows and reports presses.
 */
export function modelSheet(host: HTMLElement, o: ModelSheetOptions): ModelSheetHandle {
  let rows = o.rows
  let chosen = o.chosen ?? ''
  let openDetail = ''
  const f: ModelFilters = { ...MODEL_FILTERS_DEFAULT, ...o.filters }
  const title = o.title ?? 'pick a model'
  host.classList.add('hb-msheet')
  host.innerHTML = `<div class="hb-msheet-find"><input class="hb-input" type="search" aria-label="search ${esc(title)}" placeholder="search by name or word"><div class="hb-msheet-filters" role="group" aria-label="filters">${(['fits', 'uncensored', 'nodownload'] as const).map((k) => `<button type="button" class="hb-chip is-toggle" data-filter="${k}">${k === 'fits' ? 'fits this machine' : k === 'nodownload' ? 'no download' : 'uncensored'}</button>`).join('')}</div></div><div class="hb-msheet-list" role="listbox" aria-label="${esc(title)}"></div><div class="hb-msheet-opts"></div>${(o.own ?? !!o.onCustom) ? '<details class="hb-msheet-own"><summary>your own</summary><form></form></details>' : ''}<div class="hb-msheet-foot"></div>`
  const search = host.querySelector<HTMLInputElement>('input[type="search"]')!
  const list = host.querySelector<HTMLElement>('.hb-msheet-list')!
  const opts = host.querySelector<HTMLElement>('.hb-msheet-opts')!
  const foot = host.querySelector<HTMLElement>('.hb-msheet-foot')!
  const ownForm = host.querySelector<HTMLFormElement>('.hb-msheet-own form')
  let ownKind: OwnKind = 'gguf'
  const ownValues: Record<string, string> = {}
  function drawOwn() {
    if (!ownForm) return
    const form = OWN_FORMS.find((x) => x.kind === ownKind)!
    ownForm.innerHTML = `<div class="hb-seg" role="group" aria-label="kind">${OWN_FORMS.map((k) => `<button type="button" data-own-kind="${k.kind}" class="${k.kind === ownKind ? 'is-on' : ''}" aria-pressed="${k.kind === ownKind}">${esc(k.label)}</button>`).join('')}</div>` +
      form.fields.map((fd) => `<label class="hb-field"><span class="hb-label">${esc(fd.label)}</span><input class="hb-input" data-own="${fd.key}" type="${fd.secret ? 'password' : 'text'}" placeholder="${esc(fd.placeholder)}" autocomplete="off" spellcheck="false" value="${esc(ownValues[fd.key] ?? '')}"></label>`).join('') +
      `<button type="submit" class="hb-btn"${ownReady(ownKind, ownValues) ? '' : ' hidden'}>add</button>`
  }
  drawOwn()

  function draw() {
    for (const b of host.querySelectorAll<HTMLElement>('[data-filter]')) {
      const on = f[b.dataset.filter as 'fits' | 'uncensored' | 'nodownload']
      b.classList.toggle('is-on', on)
      b.setAttribute('aria-pressed', String(on))
    }
    const shown = filterModelRows(rows, f)
    const hidden = rows.length - shown.length
    list.innerHTML = sheetListHtml(shown, chosen, openDetail) + (shown.length && hidden > 0 && f.fits ? `<p class="hb-msheet-none">${hidden} more do not fit this machine or the filters.</p>` : '')
    const row = rows.find((r) => r.id === chosen)
    opts.innerHTML = row?.options?.length
      ? row.options.map((op) => `<label class="hb-field"><span class="hb-label">${esc(op.label)}</span><select class="hb-select" data-option="${esc(op.key)}">${op.choices.map((c) => `<option value="${esc(c.value)}"${c.value === op.value ? ' selected' : ''}>${esc(c.label)}</option>`).join('')}</select></label>`).join('')
      : ''
    opts.hidden = !row?.options?.length
    foot.innerHTML = row && canLoad(row)
      ? `<button type="button" class="hb-btn hb-btn-go" data-load>${esc(loadLabel(row))}</button>`
      : row?.state === 'loading'
        ? `<span class="hb-msel-state" role="status">${esc(loadLabel(row))}</span><button type="button" class="hb-btn" data-cancel>cancel</button>`
        : row?.state === 'loaded' ? `<span class="hb-msel-state is-loaded">${esc(row.name)}, ready</span>` : '<span class="hb-msel-state">pick a row</span>'
  }

  const onInput = (e: Event) => {
    const own = (e.target as HTMLElement).closest<HTMLInputElement>('[data-own]')
    if (own) {
      ownValues[own.dataset.own!] = own.value
      const add = ownForm?.querySelector<HTMLElement>('button[type="submit"]')
      if (add) add.hidden = !ownReady(ownKind, ownValues)
      return
    }
    f.query = search.value
    draw()
  }
  const onSubmit = (e: Event) => {
    if (!(e.target as Element).closest('.hb-msheet-own')) return
    e.preventDefault()
    if (!ownReady(ownKind, ownValues)) return
    o.onCustom?.(ownKind, { ...ownValues })
    for (const k of Object.keys(ownValues)) delete ownValues[k]
    drawOwn()
  }
  const onChange = (e: Event) => {
    const sel = (e.target as Element).closest<HTMLSelectElement>('select[data-option]')
    if (sel && chosen) o.onOption?.(chosen, sel.dataset.option!, sel.value)
  }
  const onClick = (e: Event) => {
    const t = e.target as Element
    const kind = t.closest<HTMLElement>('[data-own-kind]')
    if (kind) { ownKind = kind.dataset.ownKind as OwnKind; for (const k of Object.keys(ownValues)) delete ownValues[k]; drawOwn(); return }
    const filter = t.closest<HTMLElement>('[data-filter]')
    if (filter) { const k = filter.dataset.filter as 'fits' | 'uncensored' | 'nodownload'; f[k] = !f[k]; draw(); return }
    const pick = t.closest<HTMLElement>('[data-pick]')
    if (pick) {
      const r = rows.find((x) => x.id === pick.dataset.pick)
      if (!r || r.unfit) return
      chosen = r.id
      o.onChoose?.(r.id)
      draw()
      return
    }
    const more = t.closest<HTMLElement>('[data-more]')
    if (more) { openDetail = openDetail === more.dataset.more ? '' : more.dataset.more!; draw(); return }
    const rm = t.closest<HTMLElement>('[data-remove]')
    if (rm) { o.onRemove?.(rm.dataset.remove!); return }
    if (t.closest('[data-load]') && chosen) { o.onLoad?.(chosen); return }
    if (t.closest('[data-cancel]') && chosen) o.onCancel?.(chosen)
  }
  host.addEventListener('input', onInput)
  host.addEventListener('submit', onSubmit)
  host.addEventListener('click', onClick)
  host.addEventListener('change', onChange)
  draw()
  return {
    update(next, id) { rows = next; if (id !== undefined) chosen = id; draw() },
    get chosen() { return chosen },
    dispose() {
      host.removeEventListener('input', onInput)
      host.removeEventListener('submit', onSubmit)
      host.removeEventListener('click', onClick)
      host.removeEventListener('change', onChange)
    },
  }
}

export interface ModelSelectOptions {
  rows: ModelRow[]
  chosen?: string
  /** Draw the pink load button. Off on a gate whose own button is the pink action. */
  go?: boolean
  empty?: string
  /** The line was pressed: open the sheet (modelSheet in a drawer). */
  onOpen?: () => void
  onLoad?: (id: string) => void
}

export interface ModelSelectHandle {
  update(rows: ModelRow[], chosen?: string): void
  dispose(): void
}

/** The closed picker over a host: one line naming the choice and its state, and the pink "load, <size>". */
export function modelSelect(host: HTMLElement, o: ModelSelectOptions): ModelSelectHandle {
  let rows = o.rows
  let chosen = o.chosen ?? ''
  host.classList.add('hb-msel')
  function draw() {
    const row = rows.find((r) => r.id === chosen)
    const w = lineWords(row, o.empty)
    host.innerHTML = `<button type="button" class="hb-msel-line" aria-haspopup="dialog" aria-label="model: ${esc(w.name)}" data-open><span class="hb-msel-name">${esc(w.name)}</span>${w.meta ? `<span class="hb-msel-meta">${esc(w.meta)}</span>` : ''}${w.state ? `<span class="hb-msel-state${row?.state === 'loaded' ? ' is-loaded' : ''}">${esc(w.state)}</span>` : ''}</button>${(o.go ?? true) && canLoad(row) ? `<button type="button" class="hb-btn hb-btn-go" data-load>${esc(loadLabel(row))}</button>` : ''}`
  }
  const onClick = (e: Event) => {
    const t = e.target as Element
    if (t.closest('[data-open]')) o.onOpen?.()
    else if (t.closest('[data-load]') && chosen) o.onLoad?.(chosen)
  }
  host.addEventListener('click', onClick)
  draw()
  return {
    update(next, id) { rows = next; if (id !== undefined) chosen = id; draw() },
    dispose() { host.removeEventListener('click', onClick) },
  }
}
