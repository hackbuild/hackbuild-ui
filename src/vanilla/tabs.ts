export interface TabsOptions {
  /** Value of the tab to select first. Default: the tab marked
      aria-selected="true", else the first. */
  value?: string
  /** Called when the selection changes, not on the first selection. */
  onChange?: (value: string, index: number) => void
}

export interface TabsHandle {
  /** Select by value or index. `focus` moves focus to the tab. */
  select(which: string | number, focus?: boolean): void
  readonly value: string
  readonly index: number
  dispose(): void
}

/**
 * Tabs over `.hb-tabs` markup: a tablist of `role="tab"` buttons. One tab
 * sits in the tab order; arrow keys move and select with wrap, Home and End
 * jump to the ends. A tab with `aria-controls` shows its panel and hides the
 * others. A tab's value is its `data-value`, else its index.
 * Vertical strips (`aria-orientation="vertical"`) use the up and down keys.
 */
export function tabs(el: HTMLElement, options: TabsOptions = {}): TabsHandle {
  if (!el.getAttribute('role')) el.setAttribute('role', 'tablist')
  const doc = el.ownerDocument

  const all = () => [...el.querySelectorAll<HTMLElement>('[role="tab"]')]
  const usable = (t: HTMLElement) => t.getAttribute('aria-disabled') !== 'true' && !t.hasAttribute('disabled')
  const valueOf = (t: HTMLElement, i: number) => t.dataset.value ?? String(i)

  let index = -1

  function indexOf(which: string | number): number {
    const list = all()
    if (typeof which === 'number') return which >= 0 && which < list.length ? which : -1
    return list.findIndex((t, i) => valueOf(t, i) === which)
  }

  function apply(next: number, focus: boolean, notify: boolean) {
    const list = all()
    if (!list[next]) return
    const changed = next !== index
    index = next
    list.forEach((t, i) => {
      const on = i === next
      t.setAttribute('aria-selected', String(on))
      t.tabIndex = on ? 0 : -1
      const panelId = t.getAttribute('aria-controls')
      const panel = panelId ? doc.getElementById(panelId) : null
      if (panel) panel.hidden = !on
    })
    if (focus) list[next]!.focus()
    if (changed && notify) options.onChange?.(valueOf(list[next]!, next), next)
  }

  function onClick(e: Event) {
    const tab = (e.target as Element).closest<HTMLElement>('[role="tab"]')
    if (!tab || !el.contains(tab) || !usable(tab)) return
    apply(all().indexOf(tab), false, true)
  }

  function onKey(e: KeyboardEvent) {
    const tab = (e.target as Element).closest<HTMLElement>('[role="tab"]')
    if (!tab || !el.contains(tab)) return
    const list = all()
    const from = list.indexOf(tab)
    const vertical = el.getAttribute('aria-orientation') === 'vertical'
    const prev = vertical ? 'ArrowUp' : 'ArrowLeft'
    const next = vertical ? 'ArrowDown' : 'ArrowRight'
    let step = 0
    let start = from
    if (e.key === next) step = 1
    else if (e.key === prev) step = -1
    else if (e.key === 'Home') { step = 1; start = -1 }
    else if (e.key === 'End') { step = -1; start = list.length }
    else return
    e.preventDefault()
    const n = list.length
    for (let k = 1; k <= n; k++) {
      const i = (((start + step * k) % n) + n) % n
      if (usable(list[i]!)) { apply(i, true, true); return }
    }
  }

  const first = options.value !== undefined ? indexOf(options.value) : all().findIndex((t) => t.getAttribute('aria-selected') === 'true')
  apply(first < 0 ? 0 : first, false, false)

  el.addEventListener('click', onClick)
  el.addEventListener('keydown', onKey)

  return {
    select(which, focus = false) {
      const i = indexOf(which)
      if (i >= 0) apply(i, focus, true)
    },
    get value() {
      const t = all()[index]
      return t ? valueOf(t, index) : ''
    },
    get index() {
      return index
    },
    dispose() {
      el.removeEventListener('click', onClick)
      el.removeEventListener('keydown', onKey)
    },
  }
}
