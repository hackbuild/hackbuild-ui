// Phone insets for a docked shell. The on-screen keyboard covers the
// bottom of the layout viewport without resizing it on iOS Safari and on
// Android Chrome by default; visualViewport says how much. The shell
// writes that and the dock's height as custom properties, so the foot
// lifts over the keyboard and a sheet stops at the dock's top edge.

export interface ViewLike {
  innerHeight: number
  visualViewport?: { height: number; offsetTop: number; scale?: number } | null
}

/** Pixels of the layout viewport under the on-screen keyboard, 0 when
    it is closed, the page is pinch zoomed, or visualViewport is missing. */
export function keyboardInset(view: ViewLike): number {
  const vv = view.visualViewport
  if (!vv) return 0
  if ((vv.scale ?? 1) > 1.01) return 0
  const kb = view.innerHeight - vv.height - vv.offsetTop
  return kb > 1 ? Math.round(kb) : 0
}

export interface DockInsetsHandle {
  /** The values written last. */
  read(): { kb: number; foot: number }
  dispose(): void
}

/** Write `--hb-kb` (keyboard inset) and `--hb-foot-h` (the foot's
    height) in px on `target`, the root element by default, and keep them
    current. dispose removes both and every listener. */
export function dockInsets(foot: HTMLElement | null, target?: HTMLElement): DockInsetsHandle {
  const doc = (foot ?? target)?.ownerDocument ?? (typeof document === 'undefined' ? null : document)
  const view = doc?.defaultView as (Window & typeof globalThis) | null | undefined
  const el = target ?? doc?.documentElement ?? null
  let kb = 0
  let h = 0
  const write = () => {
    if (!el || !view) return
    kb = keyboardInset(view)
    h = foot ? Math.round(foot.getBoundingClientRect().height) : 0
    el.style.setProperty('--hb-kb', `${kb}px`)
    el.style.setProperty('--hb-foot-h', `${h}px`)
  }
  write()
  const vv = view?.visualViewport
  vv?.addEventListener('resize', write)
  vv?.addEventListener('scroll', write)
  view?.addEventListener('resize', write)
  const ro = foot && view && typeof view.ResizeObserver === 'function' ? new view.ResizeObserver(write) : null
  if (ro && foot) ro.observe(foot)
  return {
    read: () => ({ kb, foot: h }),
    dispose() {
      vv?.removeEventListener('resize', write)
      vv?.removeEventListener('scroll', write)
      view?.removeEventListener('resize', write)
      ro?.disconnect()
      el?.style.removeProperty('--hb-kb')
      el?.style.removeProperty('--hb-foot-h')
    },
  }
}
