import { copier, type CopierOptions } from './copy'

export interface CodeBlockOptions extends CopierOptions {
  /** Start wrapped. Default false: long lines scroll sideways. */
  wrap?: boolean
  onWrap?: (on: boolean) => void
}

export interface CodeBlockHandle {
  readonly wrapped: boolean
  wrap(on: boolean): void
  copy(): Promise<boolean>
  dispose(): void
}

/**
 * A `.hb-codeblock`: a `pre > code`, a `[data-copy]` button and a
 * `[data-wrap]` toggle. Copy takes the code's text and says copied or copy
 * failed on the button for a moment. Wrap flips `.is-wrap` and the toggle's
 * aria-pressed. The `pre` is in the tab order so arrow keys scroll it.
 */
export function codeBlock(el: HTMLElement, options: CodeBlockOptions = {}): CodeBlockHandle {
  const pre = el.querySelector('pre')
  const copyBtn = el.querySelector<HTMLElement>('[data-copy]')
  const wrapBtn = el.querySelector<HTMLElement>('[data-wrap]')
  const label = copyBtn?.querySelector<HTMLElement>('[data-label]') ?? copyBtn
  const idle = label?.textContent ?? 'copy'
  const c = copier(options)
  let wrapped = !!options.wrap
  if (pre && !pre.hasAttribute('tabindex')) pre.tabIndex = 0

  function drawWrap() {
    el.classList.toggle('is-wrap', wrapped)
    wrapBtn?.setAttribute('aria-pressed', String(wrapped))
  }
  drawWrap()

  const off = c.subscribe((s) => {
    if (label) label.textContent = s === 'copied' ? 'copied' : s === 'failed' ? 'copy failed' : idle
    copyBtn?.classList.toggle('is-done', s === 'copied')
  })

  const text = () => (el.querySelector('code') ?? pre)?.textContent ?? ''
  const onCopy = () => { void c.copy(text()) }
  const onWrap = () => {
    wrapped = !wrapped
    drawWrap()
    options.onWrap?.(wrapped)
  }
  copyBtn?.addEventListener('click', onCopy)
  wrapBtn?.addEventListener('click', onWrap)

  return {
    get wrapped() {
      return wrapped
    },
    wrap(on) {
      wrapped = on
      drawWrap()
    },
    copy: () => c.copy(text()),
    dispose() {
      copyBtn?.removeEventListener('click', onCopy)
      wrapBtn?.removeEventListener('click', onWrap)
      off()
      c.dispose()
    },
  }
}

export interface CodeSpan {
  code: boolean
  text: string
}

/**
 * Splits prose on backticks: `a span` comes back with code true. An
 * unclosed backtick stays in the text as written. Empty spans are dropped.
 */
export function codeSpans(text: string): CodeSpan[] {
  const out: CodeSpan[] = []
  const re = /`([^`]+)`/g
  let at = 0
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > at) out.push({ code: false, text: text.slice(at, m.index) })
    out.push({ code: true, text: m[1] })
    at = m.index + m[0].length
  }
  if (at < text.length) out.push({ code: false, text: text.slice(at) })
  return out
}
