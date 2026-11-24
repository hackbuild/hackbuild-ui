// Stage chrome words: the caption tail and the name hud state.

/** The caption shows the tail of a long line, cut at a word, so the
    newest words stay on the stage. `maxChars` 0 keeps it whole. */
export function captionText(line: string, maxChars = 320): string {
  const t = String(line ?? '').replace(/\s+/g, ' ').trim()
  if (!maxChars || t.length <= maxChars) return t
  let tail = t.slice(-maxChars)
  const sp = tail.indexOf(' ')
  if (sp > 0 && sp < 24) tail = tail.slice(sp + 1)
  return '… ' + tail
}

export type HudState = 'idle' | 'thinking' | 'talking' | 'listening'

/** The word shown beside the name for each state. */
export const HUD_WORDS: Record<HudState, string> = {
  idle: 'idle',
  thinking: 'thinking',
  talking: 'talking',
  listening: 'listening',
}

/** The state word, or idle for anything unknown. */
export function hudWord(state: string | null | undefined): string {
  return HUD_WORDS[state as HudState] ?? HUD_WORDS.idle
}
