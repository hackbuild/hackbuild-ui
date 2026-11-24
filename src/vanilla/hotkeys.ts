import { emitter } from './emit'
import { isTyping } from './focus'

export interface Hotkey {
  /** One combo or several: 'ctrl+k', 'shift+?', 'alt+1', 'esc', '/'.
      `ctrl` and `mod` read cmd on a Mac. */
  keys: string | string[]
  /** What it does, lowercase, for the key map. */
  label: string
  /** Heading in the key map. Default 'general'. */
  group?: string
  /** Default 'global', always on. Any other scope is on only while it is
      the newest pushed scope, and is tried before the global keys. */
  scope?: string
  /** Also fire while someone types in a field. Default false. */
  inFields?: boolean
  /** Fire on key repeat. Default false. */
  repeat?: boolean
  /** Leave out of the key map. */
  hidden?: boolean
  /** Return false to pass the key on. Otherwise the key is taken. */
  run: (event: KeyboardEvent) => void | boolean
}

export interface KeyMapItem {
  /** Each combo as words for `.hb-kbd`: [['ctrl', 'k'], ['/']]. */
  keys: string[][]
  label: string
  scope: string
}

export interface KeyMapGroup {
  group: string
  items: KeyMapItem[]
}

export interface HotkeysOptions {
  /** Default: the window, so overlays and widgets that take a key with
      preventDefault on the way up win over a hotkey. */
  target?: EventTarget
  /** Default: read from the platform. */
  mac?: boolean
}

export interface HotkeyRegistry {
  /** Add one or more; returns the function that removes them. Throws when
      a combo is already taken in the same scope. */
  add(keys: Hotkey | Hotkey[]): () => void
  /** Make a scope current; returns the function that ends it. */
  pushScope(name: string): () => void
  readonly scopes: readonly string[]
  /** Visible keys by group, in the order added, for a key map. */
  list(): KeyMapGroup[]
  /** Called after add, remove and scope changes. */
  subscribe(fn: () => void): () => void
  /** A combo as words: 'ctrl+shift+z' to ['ctrl', 'shift', 'z']. */
  format(combo: string): string[]
  dispose(): void
}

interface Combo {
  mod: boolean
  shift: boolean
  alt: boolean
  key: string
}

const NAMES: Record<string, string> = {
  esc: 'escape',
  space: ' ',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  return: 'enter',
  del: 'delete',
  plus: '+',
}

function parse(combo: string): Combo {
  const bits = combo.toLowerCase().split('+')
  // 'ctrl++' or 'plus' both mean the plus key
  if (bits[bits.length - 1] === '' && bits.length > 1) { bits.pop(); bits[bits.length - 1] = '+' }
  const key = bits.pop()!.trim()
  const mods = new Set(bits.map((b) => b.trim()))
  return {
    mod: mods.has('ctrl') || mods.has('mod') || mods.has('cmd') || mods.has('meta'),
    shift: mods.has('shift'),
    alt: mods.has('alt') || mods.has('option'),
    key: NAMES[key] ?? key,
  }
}

const idOf = (c: Combo) => `${c.mod ? 'mod+' : ''}${c.alt ? 'alt+' : ''}${c.shift ? 'shift+' : ''}${c.key}`

function matches(c: Combo, e: KeyboardEvent, mac: boolean): boolean {
  const mod = mac ? e.metaKey : e.ctrlKey
  const other = mac ? e.ctrlKey : e.metaKey
  if (c.mod !== mod || other || c.alt !== e.altKey) return false
  const letter = /^[a-z]$/.test(c.key)
  const digit = /^[0-9]$/.test(c.key)
  const printable = c.key.length === 1 && !letter && !digit
  // '?' and '/' need shift on many layouts, so shift only counts when named
  if (!printable && c.shift !== e.shiftKey) return false
  if (printable && c.shift && !e.shiftKey) return false
  const k = e.key.toLowerCase()
  if (k === c.key) return true
  // alt and shift change e.key on some layouts; the physical key still counts
  if (letter) return e.code === `Key${c.key.toUpperCase()}`
  if (digit) return e.code === `Digit${c.key}`
  return false
}

function isMac(): boolean {
  const nav = (globalThis as { navigator?: { platform?: string; userAgent?: string } }).navigator
  return /mac|iphone|ipad/i.test(nav?.platform ?? nav?.userAgent ?? '')
}

/**
 * A key registry with scopes. Keys typed into text fields are ignored
 * unless a binding says `inFields`. A key another handler already took
 * (preventDefault) is ignored. `list()` gives the table for a key map, so
 * the printed hints and the bindings come from one place.
 */
export function hotkeys(table: Hotkey[] = [], options: HotkeysOptions = {}): HotkeyRegistry {
  const target = options.target ?? (globalThis as unknown as EventTarget)
  const mac = options.mac ?? isMac()
  const changed = emitter<void>()
  const entries: { hk: Hotkey; combos: Combo[]; scope: string }[] = []
  const scopes: string[] = []

  function add(input: Hotkey | Hotkey[]): () => void {
    const list = Array.isArray(input) ? input : [input]
    const added: typeof entries = []
    for (const hk of list) {
      const combos = (Array.isArray(hk.keys) ? hk.keys : [hk.keys]).map(parse)
      const scope = hk.scope ?? 'global'
      for (const c of combos) {
        const taken = [...entries, ...added].find((x) => x.scope === scope && x.combos.some((y) => idOf(y) === idOf(c)))
        if (taken) throw new Error(`hotkeys: ${idOf(c)} in ${scope} is taken by "${taken.hk.label}"`)
      }
      added.push({ hk, combos, scope })
    }
    entries.push(...added)
    changed.emit()
    return () => {
      for (const a of added) {
        const i = entries.indexOf(a)
        if (i >= 0) entries.splice(i, 1)
      }
      changed.emit()
    }
  }

  function onKey(ev: Event) {
    const e = ev as KeyboardEvent
    if (e.defaultPrevented || e.isComposing) return
    const typing = isTyping(e.target)
    const top = scopes[scopes.length - 1]
    const order = [...entries.filter((x) => top !== undefined && x.scope === top), ...entries.filter((x) => x.scope === 'global')]
    for (const { hk, combos } of order) {
      if (typing && !hk.inFields) continue
      if (e.repeat && !hk.repeat) continue
      if (!combos.some((c) => matches(c, e, mac))) continue
      if (hk.run(e) === false) continue
      e.preventDefault()
      return
    }
  }

  function format(combo: string): string[] {
    const c = parse(combo)
    const out: string[] = []
    if (c.mod) out.push(mac ? 'cmd' : 'ctrl')
    if (c.alt) out.push(mac ? 'option' : 'alt')
    if (c.shift) out.push('shift')
    const named: Record<string, string> = { ' ': 'space', arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right', escape: 'esc' }
    out.push(named[c.key] ?? c.key)
    return out
  }

  target.addEventListener('keydown', onKey)
  add(table)

  return {
    add,
    pushScope(name) {
      scopes.push(name)
      changed.emit()
      let done = false
      return () => {
        if (done) return
        done = true
        const i = scopes.lastIndexOf(name)
        if (i >= 0) scopes.splice(i, 1)
        changed.emit()
      }
    },
    get scopes() {
      return scopes
    },
    list() {
      const groups = new Map<string, KeyMapItem[]>()
      for (const { hk, scope } of entries) {
        if (hk.hidden) continue
        const g = hk.group ?? 'general'
        const keys = (Array.isArray(hk.keys) ? hk.keys : [hk.keys]).map(format)
        groups.set(g, [...(groups.get(g) ?? []), { keys, label: hk.label, scope }])
      }
      return [...groups].map(([group, items]) => ({ group, items }))
    },
    subscribe: changed.on,
    format,
    dispose() {
      target.removeEventListener('keydown', onKey)
      entries.length = 0
      scopes.length = 0
      changed.clear()
    },
  }
}
