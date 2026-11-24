// The api key field: checked by shape, shown as its first 4 and last 4,
// and never written anywhere. The words walk the person through it.

/** 'sk-a...9xQz'. Keys of 8 or fewer characters show as stars only. */
export function maskKey(key: string): string {
  const k = key.trim()
  if (!k) return ''
  if (k.length <= 8) return '*'.repeat(k.length)
  return `${k.slice(0, 4)}...${k.slice(-4)}`
}

export type KeyState = 'empty' | 'waiting' | 'valid'

export interface KeyCheck {
  state: KeyState
  valid: boolean
  masked: string
  words: string
}

/** Shape check only: a key that matches can still be refused by the endpoint. */
export function keyCheck(value: string, pattern?: RegExp | string | null): KeyCheck {
  const v = value.trim()
  if (!v) return { state: 'empty', valid: false, masked: '', words: 'enter your key to continue.' }
  const re = typeof pattern === 'string' ? new RegExp(pattern) : pattern
  const ok = re ? re.test(v) : v.length >= 8
  return ok
    ? { state: 'valid', valid: true, masked: maskKey(v), words: 'key looks valid.' }
    : { state: 'waiting', valid: false, masked: maskKey(v), words: 'waiting for a valid key.' }
}

export const KEY_NOTE = 'stays in this browser for this session. never saved, sent only to the endpoint you picked. shown as the first 4 and last 4.'
