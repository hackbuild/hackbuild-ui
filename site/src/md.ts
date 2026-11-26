/**
 * A small markdown to html pass for GUIDELINES.md on the docs site: headings with
 * GitHub style ids, paragraphs, lists, task boxes, tables, fenced code, inline
 * code, bold, italic and links. The source is this repository's own file.
 */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function slug(text: string): string {
  return text.trim().toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-')
}

function inline(s: string): string {
  const codes: string[] = []
  let out = s.replace(/`([^`]+)`/g, (_, c: string) => `\u0000${codes.push(esc(c)) - 1}\u0000`)
  out = esc(out)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t: string, h: string) => `<a href="${/^(https?:|#)/.test(h) ? h : `https://github.com/hackbuild/hackbuild-ui/blob/main/${h}`}">${t}</a>`)
  return out.replace(/\u0000(\d+)\u0000/g, (_, i: string) => `<code>${codes[Number(i)]}</code>`)
}

export function markdown(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []
  const seen = new Map<string, number>()
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^```/.test(line)) {
      const body: string[] = []
      for (i++; i < lines.length && !/^```/.test(lines[i]); i++) body.push(lines[i])
      i++
      out.push(`<pre class="hb-code"><code>${esc(body.join('\n'))}</code></pre>`)
      continue
    }
    const h = /^(#{1,6})\s+(.+)$/.exec(line)
    if (h) {
      const base = slug(h[2])
      const n = seen.get(base) ?? 0
      seen.set(base, n + 1)
      out.push(`<h${h[1].length} id="${n ? `${base}-${n}` : base}">${inline(h[2])}</h${h[1].length}>`)
      i++
      continue
    }
    if (/^---\s*$/.test(line)) { out.push('<hr />'); i++; continue }
    if (/^\s*\|/.test(line)) {
      const rows: string[][] = []
      for (; i < lines.length && /^\s*\|/.test(lines[i]); i++) {
        if (/^\s*\|[\s:|-]+\|\s*$/.test(lines[i])) continue
        rows.push(lines[i].trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => inline(c.trim().replace(/\\\|/g, '|'))))
      }
      const [head, ...body] = rows
      out.push(`<div class="hb-scroll-x"><table class="hb-table"><thead><tr>${head.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`)
      continue
    }
    if (/^\s*([-*]|\d+\.)\s/.test(line)) {
      const ordered = /^\s*\d+\./.test(line)
      const items: string[] = []
      for (; i < lines.length && lines[i].trim() && !/^#/.test(lines[i]); i++) {
        const m = /^\s*(?:[-*]|\d+\.)\s+(?:\[( |x)\]\s+)?(.*)$/.exec(lines[i])
        if (m) items.push((m[1] ? `<span aria-hidden="true">[${m[1]}]</span> ` : '') + m[2])
        else if (items.length) items[items.length - 1] += ' ' + lines[i].trim()
      }
      const tag = ordered ? 'ol' : 'ul'
      out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`)
      continue
    }
    if (!line.trim()) { i++; continue }
    const para: string[] = []
    for (; i < lines.length && lines[i].trim() && !/^(#|```|\s*\||\s*([-*]|\d+\.)\s|---\s*$)/.test(lines[i]); i++) para.push(lines[i].trim())
    out.push(`<p>${inline(para.join(' '))}</p>`)
  }
  return out.join('\n')
}
