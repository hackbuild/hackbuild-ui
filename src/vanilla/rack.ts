// The slot rack: one model per organ, presets that state their summed
// download, loads one after another (concurrent session builds spike
// memory and abort), a ready gate over the required slots, and the
// stored weights line. Pure, so a page with no framework drives the same
// rack from its own markup.
import { mbText, type SizeSource } from './models'

export type SlotState = 'empty' | 'loading' | 'ready' | 'fault'

export interface RackSlot {
  slot: string
  label: string
  required?: boolean
}

export interface RackPreset {
  id: string
  /** Named by weight class: phone, laptop, desktop. */
  label: string
  picks: Record<string, string>
  /** Summed download of the picks (computed by presetTotal in the model library). */
  totalMB: number
  /** The weakest source word among the addends. */
  totalSource: SizeSource
  /** Picks with no size: the total leaves them out and says so. */
  unknown?: string[]
}

/** 'laptop, 0.8 GB (measured)', '+ 1 size unknown' when a pick has none. */
export function presetText(p: RackPreset): string {
  const n = p.unknown?.length ?? 0
  return `${p.label}, ${mbText(p.totalMB)} (${p.totalSource})${n ? `, ${n} size unknown` : ''}`
}

/** Slots a preset still has to load: picked and neither ready nor loading with the same pick. */
export function presetJobs(p: RackPreset, slots: readonly RackSlot[], picks: Record<string, string>, states: Record<string, SlotState | undefined>): string[] {
  return slots
    .map((s) => s.slot)
    .filter((s) => p.picks[s] && !((states[s] === 'ready' || states[s] === 'loading') && picks[s] === p.picks[s]))
}

export interface RackGate {
  ready: boolean
  /** Labels of required slots that are not ready. */
  missing: string[]
  note: string
}

/** Ready when every required slot is ready; the note names what is missing. */
export function rackGate(slots: readonly RackSlot[], states: Record<string, SlotState | undefined>): RackGate {
  const missing = slots.filter((s) => s.required && states[s.slot] !== 'ready').map((s) => s.label)
  if (missing.length) {
    const names = missing.length > 1 ? `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}` : missing[0]
    return { ready: false, missing, note: `load ${names} to enable. the rest can load later.` }
  }
  const loaded = slots.filter((s) => states[s.slot] === 'ready').length
  return { ready: true, missing, note: `ready with ${loaded} of ${slots.length} loaded. more can load later.` }
}

export interface RackQueue {
  /** Queue these slots after any already waiting, and start the first. */
  push(slots: readonly string[]): void
  /** Report a slot's new state; a settled current slot starts the next. */
  settle(slot: string, state: SlotState): void
  /** Drop every waiting slot; the one loading keeps going. */
  clear(): void
  readonly current: string | null
  readonly waiting: string[]
}

/**
 * Loads one slot at a time: `load(slot)` is called for the next only when
 * the current one settles as ready or fault. A fault marks its own row
 * and the queue moves on.
 */
export function rackQueue(load: (slot: string) => void): RackQueue {
  let waiting: string[] = []
  let current: string | null = null
  function next() {
    if (current) return
    current = waiting.shift() ?? null
    if (current) load(current)
  }
  return {
    push(slots) {
      for (const s of slots) if (s !== current && !waiting.includes(s)) waiting.push(s)
      next()
    },
    settle(slot, state) {
      if (slot !== current || state === 'loading') return
      current = null
      next()
    },
    clear() {
      waiting = []
    },
    get current() {
      return current
    },
    get waiting() {
      return [...waiting]
    },
  }
}

export interface StorageLine {
  used: number | null
  quota: number | null
  /** navigator.storage.persisted(). */
  persisted?: boolean | null
}

const B = 1024 * 1024

/** '1.9 GB of 12 GB used here. the browser may clear it. press keep to ask it not to.' */
export function storageText(s: StorageLine): string {
  const amount =
    s.used === null ? 'storage use unknown here.' : s.quota === null ? `${mbText(s.used / B)} used here.` : `${mbText(s.used / B)} of ${mbText(s.quota / B)} used here.`
  if (s.persisted) return `${amount} kept: the browser will not clear it without asking.`
  return `${amount} the browser may clear it. press keep to ask it not to.`
}
