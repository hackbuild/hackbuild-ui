/**
 * One candidate of a memory recall as display text. A view layer builds
 * these from its store's trace; the kit only lays them out.
 */
export interface InspectRow {
  rank: number
  kind: string
  text: string
  /** Each scorer's part as display text: { bm25: '#1 0.812', cosine: '#3 0.402' }. */
  parts?: Record<string, string>
  /** The fused score as display text. */
  score: string
  /** Handed to the model. */
  used: boolean
}

export interface InspectRecall {
  query: string
  /** How it searched: 'hybrid', 'keyword'. */
  mode?: string
  rows: InspectRow[]
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The head line: what was asked, how, how many found and used. */
export function inspectLine(r: InspectRecall): string {
  const used = r.rows.filter((x) => x.used).length
  return `"${r.query}"${r.mode ? `, ${r.mode}` : ''}, ${r.rows.length} found, ${used} used.`
}

/**
 * The inspector's inner HTML: the head line, then one two line row per
 * candidate (rank, kind, score; the text under it) with the scorer parts
 * in a closed detail fold, so it fits a 380 px rack with no table.
 */
export function inspectorHtml(r: InspectRecall | null, empty = 'no recall yet. ask something to see what memory finds.'): string {
  if (!r) return `<p class="hb-meminspect-empty">${esc(empty)}</p>`
  const rows = r.rows
    .map((x) => {
      const parts = Object.entries(x.parts ?? {})
      return (
        `<li class="hb-meminspect-row${x.used ? ' is-used' : ''}" data-used="${x.used}">` +
        `<div class="hb-meminspect-top"><span class="hb-meminspect-rank">${x.rank}</span><span class="hb-meminspect-kind">${esc(x.kind)}</span>` +
        `<span class="hb-meminspect-score">${esc(x.score)}</span><span class="hb-meminspect-used">${x.used ? 'used' : 'left out'}</span></div>` +
        `<p class="hb-meminspect-text">${esc(x.text)}</p>` +
        (parts.length
          ? `<details class="hb-meminspect-parts" data-ux="detail"><summary>why</summary><dl>${parts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></details>`
          : '') +
        `</li>`
      )
    })
    .join('')
  return `<p class="hb-meminspect-line" role="status">${esc(inspectLine(r))}</p><ol class="hb-meminspect-list">${rows}</ol>`
}

export interface MemoryInspectorHandle {
  set(r: InspectRecall | null): void
  dispose(): void
}

/** A memory inspector in `host` (`.hb-meminspect`); `set` shows a new recall. */
export function memoryInspector(host: HTMLElement, r: InspectRecall | null = null, empty?: string): MemoryInspectorHandle {
  host.classList.add('hb-meminspect')
  const set = (x: InspectRecall | null) => { host.innerHTML = inspectorHtml(x, empty) }
  set(r)
  return { set, dispose() {} }
}
