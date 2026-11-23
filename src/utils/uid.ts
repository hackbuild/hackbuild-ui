let n = 0

/** A page-unique id for aria wiring: 'hb-spark-3'. */
export function uid(prefix: string) {
  return `${prefix}-${++n}`
}
