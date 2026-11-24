// Room fixtures for the phone stage plus rack demo: the seven ARBOR rack
// tabs with a little in each. No model runs.
import type { HbChatLine, HbGaugeRow, HbMemoryEntry } from '@hackbuild/ui'

export const RACK_TABS = ['talk', 'mind', 'eyes', 'memory', 'body', 'brain', 'voice']

export const TALK: HbChatLine[] = [
  { role: 'user', text: 'walk to the bench' },
  { role: 'assistant', text: 'walking. the bench is three steps ahead.' },
  { role: 'user', text: 'pick up the red block' },
  { role: 'assistant', text: 'on it. the red block is on the near corner, next to the clamp.' },
]

export const ORDERS = ['come here', 'sit', 'fetch the block', 'stop']

export const DRIVES: HbGaugeRow[] = [
  { label: 'curiosity', value: 0.62, current: true },
  { label: 'tired', value: 0.21 },
  { label: 'social', value: 0.48 },
  { label: 'hunger', value: 0.12 },
]

export const MEMORY: HbMemoryEntry[] = [
  { id: 'm1', kind: 'fact', text: 'the red block lives on the bench, next to the clamp.', when: 'nov 3 added' },
  { id: 'm2', kind: 'rule', text: 'stop short of the bench edge.', when: 'chat', pinned: true },
  { id: 'm3', kind: 'episode', text: 'carried the block to the door and back.', when: 'nov 2 added' },
]

export const REPLIES = [
  'heard you. this is a fixture reply; no model runs here.',
  'walking over. the stage is a still picture in this demo.',
  'done. open the rack to read the mind tab.',
]
