const said = new Set<string>()

/**
 * A console note shown once per key, for parts and props on their way out.
 * Deprecated parts stay one minor with this note naming the replacement.
 */
export function noteOnce(key: string, text: string): void {
  if (said.has(key)) return
  said.add(key)
  console.info(`hackbuild-ui: ${text}`)
}
