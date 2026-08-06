/**
 * Class name joiner. Accepts strings, arrays and record maps, drops anything
 * falsy. Dependency free on purpose: the components emit hb- classes from
 * hackbuild.css, not utility soup, so there is nothing to merge or dedupe.
 */
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>

export function cx(...inputs: ClassValue[]): string {
  const out: string[] = []
  for (const input of inputs) {
    if (!input && input !== 0) continue
    if (typeof input === 'string' || typeof input === 'number') {
      out.push(String(input))
    } else if (Array.isArray(input)) {
      const nested = cx(...input)
      if (nested) out.push(nested)
    } else if (typeof input === 'object') {
      for (const key of Object.keys(input)) {
        if (input[key]) out.push(key)
      }
    }
  }
  return out.join(' ')
}
