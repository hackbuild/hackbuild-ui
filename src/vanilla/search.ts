export interface SearchListOptions {
  /** Items inside the list. Default '[role="option"]'. */
  items?: string
  /** An item was chosen with Enter or a press. */
  onPick?: (item: HTMLElement) => void
  /** Shown while nothing matches, hidden otherwise. */
  empty?: HTMLElement | null
  /** After each filter: how many items show, and the query. */
  onFilter?: (shown: number, query: string) => void
}

export interface SearchListHandle {
  readonly query: string
  /** The item Enter would pick. */
  readonly active: HTMLElement | null
  /** Filter by `query`, or by the field's current value. */
  filter(query?: string): void
  /** Move the active item by `step` over the items that show, with wrap. */
  move(step: number): void
  /** Make `item` the active one. */
  setActive(item: HTMLElement | null): void
  /** Run the filter again after the items changed. */
  refresh(): void
  dispose(): void
}

/** True when every word of `query` is in `text`, ignoring case. */
export function matchesQuery(query: string, text: string): boolean {
  const hay = text.toLowerCase()
  return query.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w))
}

let seq = 0

/**
 * A search field over a list, the combobox pattern: focus stays in the
 * field, typing hides the items that do not match (by `data-search`, else
 * their text), up and down move the active item with wrap, Enter picks it,
 * Escape clears a query before it reaches an overlay. A `[role="group"]`
 * with no item showing is hidden, and so is its heading inside it. The
 * active item is the first that shows after each filter.
 */
export function searchList(input: HTMLInputElement, list: HTMLElement, options: SearchListOptions = {}): SearchListHandle {
  const sel = options.items ?? '[role="option"]'
  if (!list.id) list.id = `hb-search-${++seq}`
  if (!list.getAttribute('role')) list.setAttribute('role', 'listbox')
  input.setAttribute('role', 'combobox')
  input.setAttribute('aria-controls', list.id)
  input.setAttribute('aria-expanded', 'true')
  input.setAttribute('aria-autocomplete', 'list')
  input.setAttribute('autocomplete', 'off')

  let query = ''
  let active: HTMLElement | null = null

  const all = () => [...list.querySelectorAll<HTMLElement>(sel)]
  const shown = () => all().filter((i) => !i.hidden && !i.hasAttribute('disabled'))

  function setActive(item: HTMLElement | null) {
    active = item
    for (const i of all()) {
      if (!i.id) i.id = `hb-search-item-${++seq}`
      if (!i.getAttribute('role')) i.setAttribute('role', 'option')
      i.tabIndex = -1
      const on = i === item
      i.classList.toggle('is-active', on)
      i.setAttribute('aria-selected', String(on))
    }
    if (item) {
      input.setAttribute('aria-activedescendant', item.id)
      ;(item as HTMLElement & { scrollIntoView?: (o: object) => void }).scrollIntoView?.({ block: 'nearest' })
    } else input.removeAttribute('aria-activedescendant')
  }

  function filter(q = input.value) {
    query = q
    for (const i of all()) i.hidden = !matchesQuery(q, i.dataset.search ?? i.textContent ?? '')
    for (const g of list.querySelectorAll<HTMLElement>('[role="group"]')) {
      g.hidden = ![...g.querySelectorAll<HTMLElement>(sel)].some((i) => !i.hidden)
    }
    const now = shown()
    if (options.empty) options.empty.hidden = now.length > 0
    setActive(active && now.includes(active) && q === '' ? active : now[0] ?? null)
    options.onFilter?.(now.length, q)
  }

  function move(step: number) {
    const now = shown()
    if (!now.length) return
    const at = active ? now.indexOf(active) : -1
    const n = now.length
    setActive(now[at < 0 ? (step > 0 ? 0 : n - 1) : (((at + step) % n) + n) % n]!)
  }

  function onInput() {
    filter()
  }

  function onKey(e: KeyboardEvent) {
    if (e.isComposing) return
    if (e.key === 'ArrowDown') move(1)
    else if (e.key === 'ArrowUp') move(-1)
    else if (e.key === 'Enter') { if (active) options.onPick?.(active) }
    else if (e.key === 'Escape' && input.value) { input.value = ''; filter('') }
    else return
    e.preventDefault()
  }

  function onClick(e: Event) {
    const item = (e.target as Element).closest<HTMLElement>(sel)
    if (!item || !list.contains(item) || item.hasAttribute('disabled')) return
    setActive(item)
    options.onPick?.(item)
  }

  input.addEventListener('input', onInput)
  input.addEventListener('keydown', onKey)
  list.addEventListener('click', onClick)
  filter()

  return {
    get query() {
      return query
    },
    get active() {
      return active
    },
    filter,
    move,
    setActive,
    refresh() {
      filter(query)
    },
    dispose() {
      input.removeEventListener('input', onInput)
      input.removeEventListener('keydown', onKey)
      list.removeEventListener('click', onClick)
    },
  }
}
