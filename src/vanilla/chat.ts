// Chat behaviour shared by HbChat, HbMessage and any page with no
// framework: split replies, the stats line, the composer keys, autosize,
// pinned scroll, tool call words, the context budget and list times.

/** A reply split on blank lines into at most `cap` boxes. Text past the
    cap joins the last box, so nothing is dropped. */
export function splitParts(text: string, cap = 5): string[] {
  const parts = text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
  if (parts.length <= cap) return parts
  return [...parts.slice(0, cap - 1), parts.slice(cap - 1).join('\n\n')]
}

export interface MessageStats {
  /** Decode speed of the reply. */
  tokPerSec?: number | null
  /** Time to the first token, in ms. */
  firstMs?: number | null
  tokens?: number | null
  /** Where the numbers come from. Default measured. */
  source?: 'measured' | 'vendor' | 'inferred' | 'unknown'
}

/** '41.3 tok/s, first word 0.42 s, 212 tok (measured)'. */
export function statsText(s: MessageStats | null | undefined): string {
  if (!s) return ''
  const bits: string[] = []
  if (s.tokPerSec !== null && s.tokPerSec !== undefined) bits.push(`${s.tokPerSec.toFixed(1)} tok/s`)
  if (s.firstMs !== null && s.firstMs !== undefined) bits.push(`first word ${(s.firstMs / 1000).toFixed(2)} s`)
  if (s.tokens !== null && s.tokens !== undefined) bits.push(`${s.tokens} tok`)
  return bits.length ? `${bits.join(', ')} (${s.source ?? 'measured'})` : ''
}

/** Cut at n characters with '...' when longer. */
export function clip(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, Math.max(0, n - 3))}...` : s
}

/** Tool arguments on one line, cut at 80. */
export function argsLine(args: unknown, n = 80): string {
  try { return clip(typeof args === 'string' ? args : JSON.stringify(args) ?? '', n) } catch { return '{}' }
}

/** Tool arguments or result as a block, cut at 1200. */
export function argsBlock(v: unknown, n = 1200): string {
  try { return clip(typeof v === 'string' ? v : JSON.stringify(v, null, 2) ?? '', n) } catch { return String(v) }
}

export type ToolState = 'running' | 'ok' | 'error'
export const TOOL_WORDS: Record<ToolState, string> = { running: 'calling', ok: 'ok', error: 'error' }

export type ComposerAction = 'send' | 'stop' | 'edit-last' | null

export interface ComposerKeyState {
  /** A reply streams. */
  busy?: boolean
  /** The composer holds text. */
  empty?: boolean
  /** Coarse pointer: Enter adds a line and the button sends. */
  coarse?: boolean
}

/** What a key in the composer does. Enter sends on a fine pointer unless
    Shift is held or an IME is composing; on a coarse pointer it adds a
    line. Escape stops a reply. Up in an empty composer edits the last turn. */
export function composerKey(e: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'isComposing' | 'altKey' | 'ctrlKey' | 'metaKey'>, s: ComposerKeyState): ComposerAction {
  if (e.isComposing) return null
  if (e.key === 'Escape' && s.busy) return 'stop'
  if (e.key === 'ArrowUp' && s.empty && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) return 'edit-last'
  if (e.key !== 'Enter' || e.shiftKey || e.altKey) return null
  if ((e.ctrlKey || e.metaKey) && !s.busy) return 'send'
  if (s.coarse) return null
  return s.busy ? null : 'send'
}

/** True when the pointer is coarse (a finger). */
export function coarsePointer(win: Pick<Window, 'matchMedia'> | undefined = typeof window === 'undefined' ? undefined : window): boolean {
  return !!win?.matchMedia?.('(pointer: coarse)').matches
}

/** Grow a textarea with its text between min and max px. */
export function autosize(el: HTMLTextAreaElement, min = 44, max = 200): void {
  el.style.height = 'auto'
  el.style.height = `${Math.max(min, Math.min(max, el.scrollHeight + 2))}px`
  el.style.overflowY = el.scrollHeight + 2 > max ? 'auto' : 'hidden'
}

/** Within px of the bottom: new text may scroll the log. */
export function pinned(el: Pick<HTMLElement, 'scrollHeight' | 'scrollTop' | 'clientHeight'>, px = 80): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight < px
}

export interface ContextSegment {
  key: string
  label: string
  tokens: number
}

export interface ContextUse {
  used: number
  budget: number
  /** 0 to 1, capped at 1. */
  fraction: number
  tone: 'ok' | 'warn' | 'full'
  rows: Array<ContextSegment & { fraction: number }>
  words: string
}

/** What fills the context this turn, by source, against the budget. */
export function contextUse(segments: readonly ContextSegment[], budget: number, warnAt = 0.75, fullAt = 0.95): ContextUse {
  const used = segments.reduce((a, s) => a + Math.max(0, s.tokens), 0)
  const b = Math.max(1, budget)
  const fraction = Math.min(1, used / b)
  const tone = used / b >= fullAt ? 'full' : used / b >= warnAt ? 'warn' : 'ok'
  return {
    used,
    budget: b,
    fraction,
    tone,
    rows: segments.map((s) => ({ ...s, fraction: Math.max(0, s.tokens) / b })),
    words: `${used.toLocaleString('en-US')} of ${b.toLocaleString('en-US')} tok, ${Math.round((used / b) * 100)}%`,
  }
}

/** The meta line of a chat or document row: kind, when, how many messages. Parts it lacks are left out. */
export function listMeta(item: { updated: number | string; count?: number; kind?: string }, now = Date.now()): string {
  const parts = [item.kind, relTime(item.updated, now)]
  if (item.count != null) parts.push(`${item.count} msg`)
  return parts.filter(Boolean).join(', ')
}

/** 'just now', '12 min ago', '3 h ago', '2 d ago', or the date. */
export function relTime(t: number | string | Date, now = Date.now()): string {
  const ms = typeof t === 'number' ? t : new Date(t).getTime()
  if (!Number.isFinite(ms)) return String(t)
  const s = Math.max(0, (now - ms) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  if (s < 86400 * 14) return `${Math.floor(s / 86400)} d ago`
  return new Date(ms).toISOString().slice(0, 10)
}

export type ListRowAction = 'next' | 'prev' | 'rename' | 'remove' | null

/** A key on a saved list row: Up and Down move, F2 renames, Delete (or
    Backspace with no text field) arms delete; a second press deletes. The
    row buttons stay in the tab order beside these. */
export function listRowKey(e: Pick<KeyboardEvent, 'key' | 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>): ListRowAction {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return null
  if (e.key === 'ArrowDown') return 'next'
  if (e.key === 'ArrowUp') return 'prev'
  if (e.key === 'F2') return 'rename'
  if (e.key === 'Delete' || e.key === 'Backspace') return 'remove'
  return null
}
