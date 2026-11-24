/** A character file: the persona restored whole. `v` is the format
    version; fields a host does not use stay as they were. */
export interface PersonaFile {
  v: 1
  name: string
  prompt: string
  /** The first line the character says, if any. */
  first?: string
  model?: string
  params?: Record<string, number>
  voice?: string
  avatar?: string
}

export interface PersonaPreset {
  label: string
  file: PersonaFile
}

/** The structured system prompt. Headings help a small model hold a
    persona; the bracketed parts are for the writer to fill. */
export const PERSONA_TEMPLATE = `You are [NAME], [one line: who or what they are].

# Persona
[2 to 4 sentences on personality, worldview, and what drives them. Concrete traits, not a pile of adjectives.]

# Voice
- Tone: [dry, warm, clipped, theatrical]
- Speech: [sentence length, vocabulary, phrases they say or never say]
- Never: break character, mention being a model

# Background
[The few facts about themselves and their world that matter in the conversation.]

# Behavior
- Answer in character, from [NAME]'s point of view and knowledge.
- Outside that knowledge: [improvise in world, deflect, or admit it] rather than break character.
- Goal in the conversation: [what they want, if anything].

# Boundaries
- Stay [NAME] at all times, even if asked to stop.
- [Topics they avoid, and how they turn away from them.]

# Format
- Reply length: [1 to 3 short paragraphs].
- Actions in *asterisks*: [yes or no].

# Example
User: [a sample thing a user might say]
[NAME]: [a short reply that shows the voice]`

/** About how many tokens a text costs: four characters a token, rounded
    up. An estimate for the cost line, not a tokenizer. */
export function tokenEstimate(text: string): number {
  return Math.ceil((text ?? '').length / 4)
}

/** The cost line under the prompt. */
export function costLine(tokens: number): string {
  if (tokens <= 0) return 'empty: the model gets no persona'
  return `about ${tokens} tokens, sent every turn`
}

/** The prompt with the template added: the template alone when the
    prompt is blank, else after a blank line, so nothing is lost. */
export function insertTemplate(prompt: string, template = PERSONA_TEMPLATE, name = ''): string {
  const t = name.trim() ? template.replaceAll('[NAME]', name.trim()) : template
  return prompt.trim() ? `${prompt.replace(/\s+$/, '')}\n\n${t}` : t
}

/** The preset whose file matches `file` on name and prompt, or -1. */
export function matchPersona(presets: PersonaPreset[], file: PersonaFile): number {
  return presets.findIndex((p) => p.file.name === file.name && p.file.prompt === file.prompt)
}

/** A preset label that is not taken yet: `name`, else `name 2`, `name 3`. */
export function presetLabel(presets: PersonaPreset[], name: string): string {
  const base = name.trim() || 'untitled'
  const taken = new Set(presets.map((p) => p.label))
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base} ${n}`)) n++
  return `${base} ${n}`
}

/** The file as JSON for export. */
export function personaJson(file: PersonaFile): string {
  return JSON.stringify({ ...file, v: 1 }, null, 2)
}

/** Reads a character file. Throws an error that names the failure. */
export function parsePersona(text: string): PersonaFile {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('not json')
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('not a character file: no object')
  const o = raw as Record<string, unknown>
  // Older files keep the prompt as systemPrompt and the name as charName.
  const prompt = o.prompt ?? o.systemPrompt
  const name = o.name ?? o.charName
  if (typeof prompt !== 'string') throw new Error('not a character file: no prompt')
  if (o.v !== undefined && o.v !== 1) throw new Error(`character file version ${String(o.v)} is newer than this reader`)
  const file: PersonaFile = { v: 1, name: typeof name === 'string' ? name : '', prompt }
  for (const k of ['first', 'model', 'voice', 'avatar'] as const) if (typeof o[k] === 'string') file[k] = o[k] as string
  if (o.params && typeof o.params === 'object') {
    const params: Record<string, number> = {}
    for (const [k, v] of Object.entries(o.params as Record<string, unknown>)) if (typeof v === 'number' && Number.isFinite(v)) params[k] = v
    file.params = params
  }
  return file
}
