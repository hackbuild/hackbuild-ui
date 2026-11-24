const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]',
  '[contenteditable="true"]',
].join(',')

/** Elements Tab can reach inside `root`, in document order. Hidden and
    inert subtrees and tabindex -1 are left out. No layout is read, so it
    also works where nothing is laid out. */
export function focusables(root: Element): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el.getAttribute('tabindex') !== '-1' && !el.closest('[hidden],[inert]'),
  )
}

/** True when a key press in `target` is someone typing text. */
export function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el || typeof el.closest !== 'function') return false
  if (el.isContentEditable || el.closest('[contenteditable=""],[contenteditable="true"]')) return true
  const tag = el.tagName
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (tag !== 'INPUT') return false
  const type = (el.getAttribute('type') ?? 'text').toLowerCase()
  return !['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'color', 'range'].includes(type)
}
