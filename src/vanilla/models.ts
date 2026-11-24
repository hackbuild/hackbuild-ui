// Model catalogue words and the picker behaviour. The kit never imports
// the model library: the records here are structural, shaped like a
// ModelRecord, so a page passes its catalogue rows straight in.
import { matchesQuery } from './search'

export type SizeSource = 'measured' | 'vendor' | 'inferred' | 'unknown'
export type Censorship = 'stock' | 'uncensored' | 'abliterated' | 'unknown'

/** The catalogue facts a picker reads from a model record. */
export interface ModelRecordLike {
  id: string
  label?: string
  /** The owner's label for the row, verbatim: 'default', 'fast, capable'. */
  badge?: string
  group?: string
  /** One honest line. */
  note?: string
  sizeMB: number | null
  sizeSource: SizeSource
  params?: string
  quant?: string
  vramMB?: number | null
  vramSource?: SizeSource
  censorship?: Censorship
  tags?: string[]
  tier?: string
  /** As recorded; empty hides the licence line. */
  licence?: string
  commercial?: boolean | 'unknown' | null
  notes?: string[]
  provider?: string
  ctx?: number
}

/** What fitOf returns: the fit word, whether it can run, the reason. */
export interface ModelFit {
  fit: string
  ok: boolean
  reason: string
}

export type ModelRowState = 'none' | 'downloading' | 'stored' | 'loaded' | 'fault'

export interface ModelRowStatus {
  state: ModelRowState
  loaded?: number
  total?: number | null
  error?: string
}

/** 174 mb, 9.5 mb, 1.7 gb. Decimal units, as sizeWord and the
    catalogue: 1 gb is 1000 mb, 1 mb is 1e6 bytes. */
export function mbText(mb: number): string {
  if (mb >= 1000) return `${(mb / 1000).toFixed(1).replace(/\.0$/, "")} gb`
  return mb < 10 ? `${mb.toFixed(1)} mb` : `${Math.round(mb)} mb`
}

/** The size with its source word, or 'size unknown'. */
export function sizeText(mb: number | null | undefined, source: SizeSource = 'unknown'): string {
  if (mb === null || mb === undefined) return 'size unknown'
  return source === 'unknown' ? `${mbText(mb)}, source unknown` : `${mbText(mb)} (${source})`
}

/** The second figure: 'vram 2.2 gb (vendor)', or '' when the record has none. */
export function vramText(r: Pick<ModelRecordLike, 'vramMB' | 'vramSource'>): string {
  return r.vramMB ? `vram ${sizeText(r.vramMB, r.vramSource ?? 'unknown')}` : ''
}

/** The fact line: '3B, q4f16_1, vram 2.2 gb (vendor), context up to 4k'. */
export function factLine(r: ModelRecordLike): string {
  return [r.params, r.quant, vramText(r), r.ctx ? `context up to ${Math.round(r.ctx / 1024)}k` : '']
    .filter(Boolean)
    .join(', ')
}

export const CENSORSHIP: Record<Censorship, { word: string; legend: string }> = {
  stock: { word: 'stock', legend: 'as the vendor tuned it.' },
  uncensored: { word: 'uncensored', legend: 'tuned to refuse less.' },
  abliterated: { word: 'abliterated', legend: 'refusal removed from the weights.' },
  unknown: { word: 'censorship unknown', legend: 'the record does not say.' },
}

/** Shown under the legend when the list holds an uncensored or abliterated row. */
export const RESPONSIBILITY = 'uncensored and abliterated models follow instructions with few refusals. you are responsible for how you use them.'

/** 'licence as recorded: Apache-2.0', with the commercial terms only when they say no. '' when empty. */
export function licenceText(licence: string | undefined, commercial?: boolean | 'unknown' | null): string {
  if (!licence) return ''
  return `licence as recorded: ${licence}${commercial === false ? ', no commercial use' : ''}`
}

export interface ModelGroup<R extends ModelRecordLike = ModelRecordLike> {
  group: string
  rows: R[]
}

/**
 * Rows in groups: the groups in `order` first, then in the order they
 * first appear; rows by download size inside a group, unknown sizes last.
 */
export function groupRecords<R extends ModelRecordLike>(records: readonly R[], order: readonly string[] = [], fallback = 'other'): ModelGroup<R>[] {
  const map = new Map<string, R[]>()
  for (const g of order) map.set(g, [])
  for (const r of records) {
    const g = r.group || fallback
    if (!map.has(g)) map.set(g, [])
    map.get(g)!.push(r)
  }
  const size = (r: R) => (r.sizeMB === null ? Infinity : r.sizeMB)
  return [...map]
    .filter(([, rows]) => rows.length)
    .map(([group, rows]) => ({ group, rows: [...rows].sort((a, b) => size(a) - size(b)) }))
}

export interface ModelFilter {
  query?: string
  /** Censorship values to keep; empty keeps all. */
  censorship?: readonly string[]
  /** Keep only rows whose fit is ok. */
  fitsOnly?: boolean
}

/** The words a search matches against: label, id, badge, group, note, tags, params, quant, censorship. */
export function searchText(r: ModelRecordLike): string {
  return [r.label, r.id, r.badge, r.group, r.note, ...(r.tags ?? []), r.params, r.quant, r.censorship, r.provider].filter(Boolean).join(' ')
}

export function filterRecords<R extends ModelRecordLike>(records: readonly R[], f: ModelFilter, fits: Record<string, ModelFit | undefined> = {}): R[] {
  const keep = (f.censorship ?? []).filter(Boolean)
  return records.filter(
    (r) =>
      (!f.query || matchesQuery(f.query, searchText(r))) &&
      (!keep.length || keep.includes(r.censorship ?? 'unknown')) &&
      (!f.fitsOnly || fits[r.id]?.ok !== false),
  )
}

export const CTX_SIZES = [2048, 4096, 8192, 16384, 32768] as const

/** Context sizes for a build: sizes over its limit stay listed and disabled. */
export function ctxOptions(maxCtx: number | undefined, sizes: readonly number[] = CTX_SIZES): { value: number; label: string; disabled: boolean }[] {
  return sizes.map((v) => ({ value: v, label: `${v / 1024}k`, disabled: maxCtx !== undefined && v > maxCtx }))
}

export type LoadPhase = 'fetch' | 'download' | 'cache' | 'compile' | 'warm' | 'ready' | 'error'

export const PHASE_WORDS: Record<LoadPhase, string> = {
  fetch: 'asking for the files',
  download: 'downloading',
  cache: 'loading from the cache',
  compile: 'compiling',
  warm: 'warming up',
  ready: 'ready',
  error: 'failed',
}

export interface LoadFile {
  name: string
  loaded: number
  total: number | null
}

/** Sums file rows; the total is known only when every file states one. */
export function sumFiles(files: readonly LoadFile[]): { loaded: number; total: number | null; done: number } {
  let loaded = 0
  let total: number | null = 0
  let done = 0
  for (const f of files) {
    loaded += f.loaded
    if (f.total === null || f.total <= 0) total = null
    else {
      if (total !== null) total += f.total
      if (f.loaded >= f.total) done++
    }
  }
  return { loaded, total, done }
}

const mbOf = (b: number) => b / 1e6
const mbNum = (b: number) => {
  const v = mbOf(b)
  return v < 10 ? v.toFixed(1) : String(Math.round(v))
}

/**
 * One line for a load: 'downloading 3 of 24 files, 412 of 2200 mb',
 * 'downloading 0.2 mb, total unknown', 'compiling'. No percent: the
 * caller shows one only when the total is known.
 */
export function loadText(p: { phase?: LoadPhase; loaded?: number; total?: number | null; files?: readonly LoadFile[]; error?: string }): string {
  const phase = p.phase ?? 'download'
  if (phase === 'error') return `failed. ${p.error ?? ''}`.trim()
  if (phase !== 'download' && phase !== 'cache') return PHASE_WORDS[phase]
  const sum = p.files?.length ? sumFiles(p.files) : null
  const loaded = sum ? sum.loaded : p.loaded ?? 0
  const total = sum ? sum.total : p.total ?? null
  const files = p.files && p.files.length > 1 ? ` ${sum!.done} of ${p.files.length} files,` : ''
  const amount = total ? `${mbNum(loaded)} of ${mbNum(total)} mb` : `${mbNum(loaded)} mb, total unknown`
  return `${PHASE_WORDS[phase]}${files} ${amount}`
}

export interface ModelListOptions {
  /** The id checked at the start. Default: the row with aria-checked true. */
  value?: string | null
  onChange?: (id: string) => void
  /** A search field: typing filters rows by `data-search`, else their text. */
  search?: HTMLInputElement | null
  /** Shown while no row matches. */
  empty?: HTMLElement | null
}

export interface ModelListHandle {
  readonly value: string | null
  /** Check `id` without calling onChange. */
  set(id: string | null): void
  /** Filter by `query`, or by the search field's value. */
  filter(query?: string): void
  /** Run the roving tab order again after the rows changed. */
  refresh(): void
  dispose(): void
}

/**
 * A model picker over `el`: a radiogroup of `[data-model]` radios, each
 * inside a `[data-row]` row with its own `[data-act]` buttons. One radio
 * is in the tab order (the checked one, else the first that shows), and
 * only that row's actions are, so Tab goes radio, its action, out.
 * Arrows move and check with wrap, Home and End jump; rows marked
 * aria-disabled are skipped and cannot be checked. A `[data-group]` with
 * no row showing is hidden. ArrowDown in the search field enters the list.
 */
export function modelList(el: HTMLElement, options: ModelListOptions = {}): ModelListHandle {
  el.setAttribute('role', 'radiogroup')
  const radios = () => [...el.querySelectorAll<HTMLElement>('[data-model]')]
  const rowOf = (r: HTMLElement) => r.closest<HTMLElement>('[data-row]') ?? r
  const usable = (r: HTMLElement) => r.getAttribute('aria-disabled') !== 'true' && !rowOf(r).hidden
  const shown = () => radios().filter((r) => !rowOf(r).hidden)
  let value: string | null =
    options.value !== undefined ? options.value : radios().find((r) => r.getAttribute('aria-checked') === 'true')?.dataset.model ?? null
  const search = options.search ?? null

  function draw() {
    const now = shown()
    const stop = now.find((r) => r.dataset.model === value && usable(r)) ?? now.find(usable) ?? null
    for (const r of radios()) {
      r.setAttribute('role', 'radio')
      r.setAttribute('aria-checked', String(r.dataset.model === value))
      r.tabIndex = r === stop ? 0 : -1
      for (const a of rowOf(r).querySelectorAll<HTMLElement>('[data-act]')) a.tabIndex = r === stop ? 0 : -1
    }
  }

  function choose(r: HTMLElement) {
    if (!usable(r)) return
    const id = r.dataset.model!
    if (id === value) return
    value = id
    draw()
    options.onChange?.(id)
  }

  function onClick(e: Event) {
    const r = (e.target as Element).closest<HTMLElement>('[data-model]')
    if (r && el.contains(r)) choose(r)
  }

  function onKey(e: KeyboardEvent) {
    const r = (e.target as Element).closest<HTMLElement>('[data-model]')
    if (!r || e.target !== r) return
    const list = shown().filter(usable)
    const at = list.indexOf(r)
    let next = -1
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (at + 1) % list.length
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (at - 1 + list.length) % list.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = list.length - 1
    else return
    e.preventDefault()
    const to = list[next]
    if (!to) return
    choose(to)
    to.focus()
  }

  function filter(q = search?.value ?? '') {
    for (const r of radios()) rowOf(r).hidden = !matchesQuery(q, r.dataset.search ?? rowOf(r).textContent ?? '')
    for (const g of el.querySelectorAll<HTMLElement>('[data-group]')) {
      g.hidden = ![...g.querySelectorAll<HTMLElement>('[data-model]')].some((r) => !rowOf(r).hidden)
    }
    if (options.empty) options.empty.hidden = shown().length > 0
    draw()
  }

  function onSearchKey(e: KeyboardEvent) {
    if (e.key !== 'ArrowDown') return
    const stop = radios().find((r) => r.tabIndex === 0)
    if (!stop) return
    e.preventDefault()
    stop.focus()
  }
  const onInput = () => filter()

  el.addEventListener('click', onClick)
  el.addEventListener('keydown', onKey)
  search?.addEventListener('input', onInput)
  search?.addEventListener('keydown', onSearchKey)
  if (search) filter()
  else draw()

  return {
    get value() {
      return value
    },
    set(id) {
      value = id
      draw()
    },
    filter,
    refresh: draw,
    dispose() {
      el.removeEventListener('click', onClick)
      el.removeEventListener('keydown', onKey)
      search?.removeEventListener('input', onInput)
      search?.removeEventListener('keydown', onSearchKey)
    },
  }
}
