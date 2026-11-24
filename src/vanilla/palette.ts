import type { HotkeyRegistry, KeyMapGroup } from './hotkeys'
import { modal, type OverlayHandle } from './overlay'
import { searchList, type SearchListHandle } from './search'

export interface PaletteOptions {
  /** An item was run: its `data-key`. The palette closes first. */
  onRun?: (key: string, item: HTMLElement) => void
  onOpen?: () => void
  onClose?: () => void
  /** Bind `openKeys` in this registry to open the palette. */
  registry?: HotkeyRegistry
  /** Default ['/', 'ctrl+k']. ctrl reads cmd on a Mac. */
  openKeys?: string[]
}

export interface PaletteHandle extends OverlayHandle {
  readonly search: SearchListHandle | null
}

/**
 * A command palette over `.hb-modal.hb-palette > .hb-panel` markup holding
 * an `input` and a `.hb-palette-list` of `role="option"` items with
 * `data-key`, in `role="group"` sections. Opens on `/` and ctrl+k through
 * `registry`; focus goes to the field, which is cleared. Typing filters,
 * up and down move, Enter runs, Escape clears the query and then closes.
 * Focus goes back to where it was.
 */
export function palette(el: HTMLElement, options: PaletteOptions = {}): PaletteHandle {
  const input = el.querySelector<HTMLInputElement>('input')
  const list = el.querySelector<HTMLElement>('.hb-palette-list')
  if (!input || !list) throw new Error('palette: needs an input and a .hb-palette-list')
  const empty = el.querySelector<HTMLElement>('.hb-palette-empty')
  let search: SearchListHandle | null = null

  const overlay = modal(el, {
    label: el.getAttribute('aria-label') ?? 'commands',
    initialFocus: () => input,
    onOpen() {
      input.value = ''
      search?.dispose()
      search = searchList(input, list, {
        empty,
        onPick(item) {
          const key = item.dataset.key ?? ''
          overlay.close('api')
          options.onRun?.(key, item)
        },
      })
      options.onOpen?.()
    },
    onClose() {
      search?.dispose()
      search = null
      options.onClose?.()
    },
  })

  let unbind: (() => void) | null = null
  if (options.registry) {
    unbind = options.registry.add({
      keys: options.openKeys ?? ['/', 'ctrl+k'],
      label: 'commands',
      group: 'general',
      run: () => { if (!overlay.isOpen) overlay.open() },
    })
  }

  return {
    open: overlay.open,
    close: overlay.close,
    toggle: overlay.toggle,
    get isOpen() {
      return overlay.isOpen
    },
    get search() {
      return search
    },
    dispose() {
      unbind?.()
      search?.dispose()
      overlay.dispose()
    },
  }
}

/** Render a registry's key map into `el` as `.hb-keymap` markup and keep
    it current: one section per group, one row per key, each combo in
    `.hb-kbd`. */
export function keyMap(el: HTMLElement, registry: Pick<HotkeyRegistry, 'list' | 'subscribe'>): { dispose(): void } {
  const doc = el.ownerDocument
  el.classList.add('hb-keymap')
  function draw(groups: KeyMapGroup[]) {
    el.textContent = ''
    for (const g of groups) {
      const sec = doc.createElement('section')
      sec.className = 'hb-keymap-group'
      const h = doc.createElement('h3')
      h.className = 'hb-keymap-head'
      h.textContent = g.group
      const dl = doc.createElement('dl')
      for (const it of g.items) {
        const dt = doc.createElement('dt')
        it.keys.forEach((combo, i) => {
          if (i) dt.append(doc.createTextNode(' or '))
          combo.forEach((k, j) => {
            if (j) dt.append(doc.createTextNode('+'))
            const kbd = doc.createElement('kbd')
            kbd.className = 'hb-kbd'
            kbd.textContent = k
            dt.append(kbd)
          })
        })
        const dd = doc.createElement('dd')
        dd.textContent = it.label
        dl.append(dt, dd)
      }
      sec.append(h, dl)
      el.append(sec)
    }
  }
  draw(registry.list())
  const off = registry.subscribe(() => draw(registry.list()))
  return { dispose: off }
}
