// Agent fixtures: a character, presets, a step log and one model call.
// No model runs; the frames are drawn shapes, not camera images.
import type { HbContextItem, PersonaFile, PersonaPreset } from '@hackbuild/ui'

export const ROOK: PersonaFile = {
  v: 1,
  name: 'rook',
  prompt:
    'You are rook, a small shop robot who keeps the bench tidy.\n\n# Persona\nPatient, literal, a little dry. Likes things put back where they came from.\n\n# Voice\n- Tone: dry, clipped\n- Speech: short sentences, names objects exactly\n\n# Format\n- Reply length: 1 to 2 sentences.',
  model: 'qwen2.5-1.5b-instruct-q4f16_1',
  params: { temperature: 0.7, top_p: 0.9 },
  voice: 'af_heart',
}

export const PRESETS: PersonaPreset[] = [
  { label: 'rook', file: ROOK },
  { label: 'narrator', file: { v: 1, name: 'narrator', prompt: 'You are the narrator. Describe what happens in the room in the third person, present tense.' } },
  { label: 'quiet helper', file: { v: 1, name: 'helper', prompt: 'You are a quiet helper. Answer in one sentence.' } },
]

const frame = (bg: string, a: string, b: string) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 74 74"><rect width="74" height="74" fill="${bg}"/><rect y="48" width="74" height="26" fill="#2b2b2b"/><rect x="8" y="30" width="34" height="20" fill="${a}"/><rect x="48" y="22" width="12" height="12" fill="${b}"/></svg>`,
  )

export const STEPS = [
  { n: 1, title: 'look(left)', thumb: frame('#3a4250', '#6b5a44', '#c4c4c4'), text: 'I do not see the mug yet.', thought: 'the shelf is to the left, the mug was there last', result: 'head turned 30 deg left', ms: 1840, state: 'ok' as const },
  { n: 2, title: 'walk(shelf)', thumb: frame('#3a4250', '#6b5a44', '#ff2d78'), text: 'There it is, on the shelf.', thought: 'mug on the shelf, 1.2 m ahead; walk there first, then reach', result: 'reached the shelf in 3.1 s', ms: 2210, state: 'ok' as const },
  { n: 3, title: 'grab(mug)', thumb: frame('#2a3040', '#6b5a44', '#ff2d78'), text: '', thought: 'mug is out of reach of the right hand', result: 'grab failed: out of reach (0.64 m, limit 0.55 m)', ms: 1930, state: 'fail' as const },
  { n: 4, title: '', thumb: frame('#2a3040', '#6b5a44', '#ff2d78'), text: 'Stepping closer', thought: '', result: '', state: 'thinking' as const },
]

export const PROMPT = [
  { role: 'system', content: 'You are rook, a small shop robot. Reply with JSON: {"think": string, "say": string, "do": [[tool, ...args]], "done": boolean}. Tools: walk(target), look(dir), grab(thing), drop(), say(text).' },
  { role: 'user', content: 'In view: shelf (36 deg right, 0.3 m), mug on shelf (0.64 m), chair (2.1 m behind).\nHolding: nothing.\nLast result: grab failed: out of reach (0.64 m, limit 0.55 m).\nUser said: bring me the mug.' },
]
export const REPLY = '{"think": "one step closer, then grab", "say": "stepping closer.", "do": [["walk", "mug"], ["grab", "mug"]], "done": false}'
export const PLAN = { say: 'stepping closer.', do: [['walk', 'mug'], ['grab', 'mug']] }
export const TOOLS = [
  { name: 'walk', args: ['target'], desc: 'walk to a thing or a place in view' },
  { name: 'look', args: ['dir'], desc: 'turn the head: left, right, up, down' },
  { name: 'grab', args: ['thing'], desc: 'pick up a thing within 0.55 m of the hand' },
  { name: 'drop', args: [], desc: 'put down what the hand holds' },
  { name: 'say', args: ['text'], desc: 'speak one line out loud' },
]
export const COST = { in: 812, out: 41, ms: 1930 }
export const COUNTERS: Array<[string, number]> = [
  ['model calls', 4],
  ['handled by reflex', 7],
  ['plan cache hits', 2],
]

/** What a press on each thing offers: most entries send a sentence. */
export function thingItems(thing: string, holding: string): HbContextItem[] {
  if (thing === 'floor') return [{ label: 'go there', say: 'go over there' }]
  if (thing === 'shelf') {
    const items: HbContextItem[] = [{ label: 'go there', say: 'go to the shelf' }]
    if (holding) items.push({ label: `put the ${holding} here`, say: `put the ${holding} on the shelf` })
    items.push({ label: 'put everything here', say: 'put everything on the shelf', disabled: !holding })
    return items
  }
  if (thing === 'chair') return [{ label: 'go there', say: 'go to the chair' }, { label: 'sit here', say: 'sit down' }]
  return [
    { label: 'pick it up', say: `pick up the ${thing}` },
    { label: 'bring it to me', say: `bring me the ${thing}` },
    { label: 'look at it', say: `look at the ${thing}` },
    { label: 'where is it?', say: `where is the ${thing}` },
  ]
}
