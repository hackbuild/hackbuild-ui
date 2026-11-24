/** One step of an agent loop, as a step card shows it. */
export type StepState = 'thinking' | 'ok' | 'fail' | 'done'

/** 'step 01', 'step 12'. */
export function stepLabel(n: number): string {
  return `step ${String(Math.max(0, Math.floor(n))).padStart(2, '0')}`
}

/** A text cut to `max` characters at a word, with '...' when cut. */
export function clipText(text: string, max: number): string {
  const s = (text ?? '').trim()
  if (max <= 0 || s.length <= max) return s
  const cut = s.slice(0, max)
  const sp = cut.lastIndexOf(' ')
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:]+$/, '')}...`
}

/** A duration for a readout: '840 ms', '2.4 s'. */
export function msText(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return ''
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`
}

/** One message of the context sent to the model. */
export interface PromptMessage {
  role: string
  content: string
}

/** The full context as one text: each message under its role. */
export function promptText(prompt: string | PromptMessage[]): string {
  if (typeof prompt === 'string') return prompt
  return prompt.map((m) => `[${m.role}]\n${m.content}`).join('\n\n')
}

/** The plan as one line of JSON, or the text as given. */
export function planText(plan: unknown): string {
  if (plan === undefined || plan === null || plan === '') return ''
  if (typeof plan === 'string') return plan
  try {
    return JSON.stringify(plan)
  } catch {
    return String(plan)
  }
}

/** What one model call cost. Counts are tokens; `ms` is the reply time. */
export interface PromptCost {
  in?: number
  out?: number
  ms?: number
}

/** The cost rows: label and readout, with the unit in the readout. */
export function costRows(cost: PromptCost, counters: Array<[string, number | string]> = []): Array<[string, string]> {
  const rows: Array<[string, string]> = []
  if (cost.in !== undefined) rows.push(['last prompt', `${cost.in} tokens`])
  if (cost.out !== undefined) rows.push(['last reply', `${cost.out} tokens`])
  if (cost.ms !== undefined) rows.push(['reply time', msText(cost.ms)])
  for (const [k, v] of counters) rows.push([k, String(v)])
  return rows
}
