export type SettingValue = number | string | boolean
export type SettingLevel = 'guided' | 'standard' | 'expert'
export const LEVELS: SettingLevel[] = ['guided', 'standard', 'expert']

export interface SettingDef {
  key: string
  type: 'range' | 'select' | 'switch' | 'seg' | 'text'
  label: string
  /** One or two sentences: what it does and what it costs. */
  why: string
  /** 'experimental', 'recommended'. */
  tag?: string
  /** When a change takes effect: 'next load', 'next reply'. Live when absent. */
  applies?: string
  default: SettingValue
  /** The lowest disclosure level that shows the row. Default guided. */
  level?: SettingLevel
  /** Section key. */
  section?: string
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: Array<string | { label: string; value: string | number }>
}

export interface SettingPreset {
  label: string
  values: Record<string, SettingValue>
  /** One line on when to pick it. */
  hint?: string
}

export type SettingValues = Record<string, SettingValue>

/** The row shows at this level. */
export function shownAt(def: SettingDef, level: SettingLevel): boolean {
  return LEVELS.indexOf(def.level ?? 'guided') <= LEVELS.indexOf(level)
}

const inSection = (def: SettingDef, section?: string) => section === undefined || (def.section ?? '') === section

/** Defaults of the schema, or of one section. */
export function defaultsOf(schema: SettingDef[], section?: string): SettingValues {
  const out: SettingValues = {}
  for (const d of schema) if (inSection(d, section)) out[d.key] = d.default
  return out
}

/** Keys whose value is not the default, in schema order. */
export function changedKeys(values: SettingValues, schema: SettingDef[], section?: string): string[] {
  return schema.filter((d) => inSection(d, section) && d.key in values && values[d.key] !== d.default).map((d) => d.key)
}

/** A copy of `values` with one section, or all, back to the defaults. */
export function resetValues(values: SettingValues, schema: SettingDef[], section?: string): SettingValues {
  return { ...values, ...defaultsOf(schema, section) }
}

/** Sections in the given order, then any the schema names that the order
    leaves out. Rows keep schema order. */
export function sectionsOf(schema: SettingDef[], order: string[] = []): Array<{ key: string; rows: SettingDef[] }> {
  const keys = [...order]
  for (const d of schema) if (!keys.includes(d.section ?? '')) keys.push(d.section ?? '')
  return keys.map((key) => ({ key, rows: schema.filter((d) => (d.section ?? '') === key) })).filter((s) => s.rows.length)
}

/** Index of the preset every one of whose values the current values hold,
    or -1: the settings are custom. */
export function matchPreset(presets: SettingPreset[], values: SettingValues): number {
  return presets.findIndex((p) => Object.entries(p.values).every(([k, v]) => values[k] === v))
}

export interface RangeRowOptions {
  /** A drag or arrow key in progress: preview only. */
  onPreview?: (value: number) => void
  /** The value settled: release, Enter, or the number box changed. */
  onCommit?: (value: number) => void
}

export interface RangeRowHandle {
  readonly value: number
  set(value: number): void
  dispose(): void
}

function decimals(step: number): number {
  const t = String(step)
  const dot = t.indexOf('.')
  return dot < 0 ? 0 : t.length - dot - 1
}

/**
 * A range and its paired number box inside `el` (`.hb-prow`). Dragging
 * previews and keeps the number in step; releasing commits. A typed number
 * is clamped to the range and its step, then commits. A bad number goes
 * back to the last value.
 */
export function rangeRow(el: HTMLElement, options: RangeRowOptions = {}): RangeRowHandle {
  const range = el.querySelector<HTMLInputElement>('input[type=range]')
  const num = el.querySelector<HTMLInputElement>('input[type=number]')
  if (!range) throw new Error('rangeRow needs an input type range')
  const min = Number(range.min || 0)
  const max = Number(range.max || 100)
  const step = Number(range.step || 1)
  let value = Number(range.value)

  const clamp = (v: number) => Number(Math.min(max, Math.max(min, Math.round((v - min) / step) * step + min)).toFixed(decimals(step)))
  function draw() {
    range!.value = String(value)
    if (num) num.value = String(value)
  }

  const onInput = () => {
    value = Number(range.value)
    if (num) num.value = String(value)
    options.onPreview?.(value)
  }
  const onChange = () => {
    value = Number(range.value)
    options.onCommit?.(value)
  }
  const onNum = () => {
    const parsed = Number.parseFloat(num!.value)
    if (Number.isNaN(parsed)) {
      draw()
      return
    }
    value = clamp(parsed)
    draw()
    options.onCommit?.(value)
  }
  range.addEventListener('input', onInput)
  range.addEventListener('change', onChange)
  num?.addEventListener('change', onNum)

  return {
    get value() {
      return value
    },
    set(v) {
      value = clamp(v)
      draw()
    },
    dispose() {
      range.removeEventListener('input', onInput)
      range.removeEventListener('change', onChange)
      num?.removeEventListener('change', onNum)
    },
  }
}
