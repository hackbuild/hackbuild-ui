export interface ExportNameOptions {
  /** Stamp time. Default now. */
  at?: Date
  /** Leave the stamp off. */
  stamp?: boolean
}

const slug = (s: string | number) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')

function stampOf(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

/** A file name that carries the run: `tool_model_seed_20261124-010344`.
    Empty parts drop out; each part is lowercased and made path safe. */
export function exportName(parts: Array<string | number | null | undefined>, options: ExportNameOptions = {}): string {
  const kept = parts.filter((p): p is string | number => p !== null && p !== undefined && p !== '').map(slug).filter(Boolean)
  if (options.stamp !== false) kept.push(stampOf(options.at ?? new Date()))
  return kept.join('_') || 'export'
}

/** The name with `ext` on the end exactly once. `ext` takes or leaves its dot. */
export function withExt(name: string, ext: string): string {
  const e = ext.startsWith('.') ? ext : `.${ext}`
  const base = name.trim().replace(/[\\/:*?"<>|]+/g, '-') || 'export'
  return base.toLowerCase().endsWith(e.toLowerCase()) ? base : base + e
}

/** Download `data` as a file through a blob link, revoked after a moment. */
export function saveFile(name: string, data: BlobPart | Blob, type = 'application/octet-stream', doc: Document = document): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const a = doc.createElement('a')
  a.href = url
  a.download = name
  a.rel = 'noopener'
  doc.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
