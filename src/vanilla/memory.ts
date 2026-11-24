// Memory panel and recall trace: the words and numbers, no DOM. The
// panel's count line doubles as a legend; the trace shows why a memory
// won, including the ones that lost.

export interface MemoryEntry {
  id: string
  text: string
  /** episode, gist, fact, rule, note: whatever the store calls it. */
  kind: string
  title?: string
  /** Who or what it is about. */
  entity?: string | string[]
  /** Recall score for the current query, or null with no query. */
  score?: number | null
  /** When it was added, as words: 'nov 3 added', 'chat'. */
  when?: string
  /** Kept in every prompt, never pruned. */
  pinned?: boolean
}

/** 'fact' to 'facts', 'memory' to 'memories', 'gist' stays at one. */
export function kindWord(kind: string, n: number): string {
  if (n === 1 || !kind) return kind
  if (/[^aeiou]y$/.test(kind)) return kind.slice(0, -1) + 'ies'
  if (/(s|x|ch|sh)$/.test(kind)) return kind + 'es'
  return kind + 's'
}

/** '4 episodes, 0 gists, 1 fact'. Kinds listed first, in their order,
    then any other kind found in the items. */
export function memoryCounts(items: readonly MemoryEntry[], kinds: readonly string[] = []): string {
  const counts = new Map<string, number>(kinds.map((k) => [k, 0]))
  for (const m of items) counts.set(m.kind, (counts.get(m.kind) ?? 0) + 1)
  if (!counts.size) return 'nothing stored.'
  return [...counts].map(([k, n]) => `${n} ${kindWord(k, n)}`).join(', ')
}

/** Two places: 1.03, 0.40. Empty for no score. */
export function scoreText(score: number | null | undefined): string {
  return typeof score === 'number' && Number.isFinite(score) ? score.toFixed(2) : ''
}

function terms(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1)
}

/**
 * Keyword overlap ranking for demos, fixtures and stores with no ranker of
 * their own. Score is the share of query terms found in the title, text
 * and entities. With no query the kind filtered items come back in order
 * with no score.
 */
export function memoryMatch(items: readonly MemoryEntry[], opts: { query?: string; kind?: string; limit?: number } = {}): MemoryEntry[] {
  const pool = opts.kind ? items.filter((m) => m.kind === opts.kind) : [...items]
  const q = terms(opts.query ?? '')
  if (!q.length) return pool.map((m) => ({ ...m, score: null }))
  const scored: MemoryEntry[] = []
  for (const m of pool) {
    const ents = Array.isArray(m.entity) ? m.entity.join(' ') : m.entity ?? ''
    const hay = new Set(terms(`${m.title ?? ''} ${m.text} ${ents}`))
    const hit = q.filter((t) => hay.has(t)).length
    if (hit) scored.push({ ...m, score: hit / q.length })
  }
  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  return opts.limit ? scored.slice(0, opts.limit) : scored
}

export interface RecallPart {
  /** rel, rec, imp: relevance, recency, importance. */
  key: string
  /** 0 to 1. */
  value: number
}

export interface RecallHit {
  text: string
  kind?: string
  when?: string
  /** The store's own final score. Used when no weights are given. */
  score?: number | null
  parts: RecallPart[]
  /** Fed to the model. Without it the top `top` hits count as used. */
  used?: boolean
}

export type RecallWeights = Record<string, number>

export interface RankedHit extends RecallHit {
  final: number
  used: boolean
}

/** Weighted mean of the parts. A part with no weight counts once; a
    weight of 0 drops it. */
export function recallScore(parts: readonly RecallPart[], weights: RecallWeights = {}): number {
  let sum = 0
  let total = 0
  for (const p of parts) {
    const w = weights[p.key] ?? 1
    if (!(w > 0)) continue
    sum += w * Math.max(0, Math.min(1, p.value))
    total += w
  }
  return total ? sum / total : 0
}

/** Hits with their final score, best first. With weights the final is
    recomputed, so moving a weight redraws the order. */
export function recallRank(hits: readonly RecallHit[], weights?: RecallWeights | null, top?: number): RankedHit[] {
  const ranked = hits.map((h) => ({
    ...h,
    final: weights ? recallScore(h.parts, weights) : typeof h.score === 'number' ? h.score : recallScore(h.parts),
    used: h.used === true,
  }))
  ranked.sort((a, b) => b.final - a.final)
  if (typeof top === 'number') ranked.forEach((h, i) => { h.used = i < top })
  return ranked
}

/** '6 candidates scored, top 3 used.' */
export function recallLine(n: number, used: number): string {
  if (!n) return 'nothing recalled.'
  return `${n} ${n === 1 ? 'candidate' : 'candidates'} scored, top ${used} used.`
}
