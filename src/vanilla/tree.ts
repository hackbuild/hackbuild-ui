export interface TreeOptions {
  /** Called when a row is picked with a click, Enter or Space. */
  onSelect?: (id: string) => void
  /** Called when a branch opens or closes. */
  onToggle?: (id: string, open: boolean) => void
}

export interface TreeHandle {
  /** Mark a row picked; `focus` moves focus to it. */
  select(id: string, focus?: boolean): void
  /** Open or close a branch. */
  expand(id: string, open: boolean): void
  /** Picks up rows added or removed since the last call. */
  refresh(): void
  readonly value: string
  dispose(): void
}

const ITEM = '[role="treeitem"]'

/**
 * A tree over `.hb-tree` markup: a `role="tree"` list of `role="treeitem"`
 * rows, each with a `data-id`. A branch carries `aria-expanded` and a
 * `role="group"` list of its children. One row sits in the tab order.
 * Up and Down move through the open rows, Right opens a branch or steps
 * into it, Left closes it or steps to the parent, Home and End jump to the
 * ends, Enter and Space pick. A click on the twist opens or closes; a click
 * on the row picks it.
 */
export function tree(el: HTMLElement, options: TreeOptions = {}): TreeHandle {
  if (!el.getAttribute('role')) el.setAttribute('role', 'tree')
  let value = el.querySelector<HTMLElement>(`${ITEM}[aria-selected="true"]`)?.dataset.id ?? ''
  let current: HTMLElement | null = null

  const items = () => [...el.querySelectorAll<HTMLElement>(ITEM)]
  const byId = (id: string) => items().find((i) => i.dataset.id === id) ?? null
  const isBranch = (i: HTMLElement) => i.hasAttribute('aria-expanded')
  const isOpen = (i: HTMLElement) => i.getAttribute('aria-expanded') === 'true'
  const parentOf = (i: HTMLElement) => i.parentElement?.closest<HTMLElement>(ITEM) ?? null
  function shown(i: HTMLElement): boolean {
    for (let p = parentOf(i); p; p = parentOf(p)) if (!isOpen(p)) return false
    return true
  }
  const visible = () => items().filter(shown)

  function rove(to: HTMLElement | null, focus: boolean) {
    const list = items()
    if (!to || !list.includes(to)) to = (value && byId(value)) || visible()[0] || null
    current = to
    for (const i of list) i.tabIndex = i === to ? 0 : -1
    if (focus) to?.focus()
  }

  function refresh() {
    for (const i of items()) {
      if (i.dataset.id === value) i.setAttribute('aria-selected', 'true')
      else i.removeAttribute('aria-selected')
    }
    rove(current && shown(current) ? current : null, false)
  }

  function select(id: string, focus = false) {
    const i = byId(id)
    if (!i) return
    for (let p = parentOf(i); p; p = parentOf(p)) if (!isOpen(p)) setOpen(p, true)
    const changed = id !== value
    value = id
    refresh()
    rove(i, focus)
    if (changed) options.onSelect?.(id)
  }

  function setOpen(i: HTMLElement, open: boolean) {
    if (!isBranch(i) || isOpen(i) === open) return
    i.setAttribute('aria-expanded', String(open))
    options.onToggle?.(i.dataset.id ?? '', open)
  }

  function expand(id: string, open: boolean) {
    const i = byId(id)
    if (!i) return
    setOpen(i, open)
    if (!open && current && !shown(current)) rove(i, false)
  }

  function onKey(e: KeyboardEvent) {
    const at = (e.target as Element).closest<HTMLElement>(ITEM)
    if (!at || !el.contains(at)) return
    const list = visible()
    const n = list.indexOf(at)
    let to: HTMLElement | null = null
    switch (e.key) {
      case 'ArrowDown': to = list[n + 1] ?? null; break
      case 'ArrowUp': to = list[n - 1] ?? null; break
      case 'Home': to = list[0] ?? null; break
      case 'End': to = list[list.length - 1] ?? null; break
      case 'ArrowRight':
        if (isBranch(at) && !isOpen(at)) setOpen(at, true)
        else if (isBranch(at)) to = at.querySelector<HTMLElement>(`[role="group"] > ${ITEM}`)
        break
      case 'ArrowLeft':
        if (isBranch(at) && isOpen(at)) setOpen(at, false)
        else to = parentOf(at)
        break
      case 'Enter':
      case ' ':
        select(at.dataset.id ?? '', true)
        break
      default:
        return
    }
    e.preventDefault()
    if (to) rove(to, true)
  }

  function onClick(e: Event) {
    const t = e.target as Element
    const at = t.closest<HTMLElement>(ITEM)
    if (!at || !el.contains(at)) return
    if (t.closest('.hb-tree-twist') && isBranch(at)) {
      setOpen(at, !isOpen(at))
      rove(at, true)
      return
    }
    select(at.dataset.id ?? '', true)
  }

  el.addEventListener('keydown', onKey)
  el.addEventListener('click', onClick)
  refresh()

  return {
    select,
    expand,
    refresh,
    get value() { return value },
    dispose() {
      el.removeEventListener('keydown', onKey)
      el.removeEventListener('click', onClick)
    },
  }
}
