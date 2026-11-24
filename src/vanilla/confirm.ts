import { emitter } from './emit'
import { modal, type OverlayHandle } from './overlay'

export interface ConfirmInlineOptions {
  /** Runs on the second press. */
  onConfirm: () => void
  /** Words on the button while it waits for the second press. Default:
      the button keeps its words and turns to the danger style. */
  label?: string
  /** Words on the button that backs out. Default 'keep'. */
  keepLabel?: string
  /** An existing button to use as keep, shown only while armed. Default:
      one is made and placed after the button. */
  keep?: HTMLElement
  onArm?: (armed: boolean) => void
}

export interface ConfirmInlineHandle {
  arm(): void
  disarm(): void
  readonly armed: boolean
  dispose(): void
}

/**
 * The in place confirm: the first press turns the button into a danger
 * button and shows keep beside it; the second press runs the action. Keep,
 * Escape and a press anywhere else back out. Focus moves to keep when the
 * button had it, so a double Enter does not confirm.
 */
export function confirmInline(btn: HTMLElement, options: ConfirmInlineOptions): ConfirmInlineHandle {
  const doc = btn.ownerDocument
  let armed = false
  let saved: Node[] = []
  const made = !options.keep
  const keep =
    options.keep ??
    (() => {
      const b = doc.createElement('button')
      b.type = 'button'
      b.className = btn.classList.contains('hb-btn-sm') ? 'hb-btn hb-btn-2 hb-btn-sm' : 'hb-btn hb-btn-2'
      b.textContent = options.keepLabel ?? 'keep'
      btn.after(b)
      return b
    })()
  keep.hidden = true

  function arm() {
    if (armed) return
    armed = true
    const hadFocus = doc.activeElement === btn
    if (options.label !== undefined) {
      saved = [...btn.childNodes]
      btn.textContent = options.label
    }
    btn.classList.add('hb-btn-danger')
    keep.hidden = false
    doc.addEventListener('pointerdown', onOutside)
    if (hadFocus) keep.focus()
    options.onArm?.(true)
  }

  function disarm() {
    if (!armed) return
    armed = false
    const keepHadFocus = doc.activeElement === keep
    if (options.label !== undefined) btn.replaceChildren(...saved)
    btn.classList.remove('hb-btn-danger')
    keep.hidden = true
    doc.removeEventListener('pointerdown', onOutside)
    if (keepHadFocus) btn.focus()
    options.onArm?.(false)
  }

  function onBtn() {
    if (!armed) { arm(); return }
    disarm()
    options.onConfirm()
  }
  function onKeep() {
    disarm()
  }
  function onKey(e: KeyboardEvent) {
    if (armed && e.key === 'Escape') { e.preventDefault(); disarm() }
  }
  function onOutside(e: Event) {
    const t = e.target as Node
    if (!btn.contains(t) && !keep.contains(t)) disarm()
  }

  btn.addEventListener('click', onBtn)
  keep.addEventListener('click', onKeep)
  btn.addEventListener('keydown', onKey)
  keep.addEventListener('keydown', onKey)

  return {
    arm,
    disarm,
    get armed() {
      return armed
    },
    dispose() {
      disarm()
      btn.removeEventListener('click', onBtn)
      keep.removeEventListener('click', onKeep)
      btn.removeEventListener('keydown', onKey)
      keep.removeEventListener('keydown', onKey)
      if (made) keep.remove()
    },
  }
}

export interface ConfirmRequest {
  title: string
  message?: string
  /** Default 'confirm'. */
  confirmLabel?: string
  /** Default 'cancel'. */
  cancelLabel?: string
  /** A destructive action: the confirm button takes the danger style and
      focus starts on cancel. */
  danger?: boolean
}

export interface ConfirmDialogOptions {
  /** A `.hb-modal` root to show requests in. Inside it, elements marked
      `data-hb-confirm="title"`, `"message"`, `"ok"` and `"cancel"` take
      the words and the presses. Without it, render `current` yourself and
      call `answer`. */
  el?: HTMLElement
}

export interface ConfirmDialog {
  /** Resolves true on confirm, false on cancel, Escape or a click outside. */
  ask(request: ConfirmRequest): Promise<boolean>
  answer(ok: boolean): void
  /** The request on screen, or null. Later asks wait their turn. */
  readonly current: ConfirmRequest | null
  subscribe(fn: (current: ConfirmRequest | null) => void): () => void
  dispose(): void
}

/** The promise dialog for large destructive actions, one at a time. */
export function confirmDialog(options: ConfirmDialogOptions = {}): ConfirmDialog {
  const changed = emitter<ConfirmRequest | null>()
  const queue: { req: ConfirmRequest; done: (ok: boolean) => void }[] = []
  const el = options.el
  const part = (name: string) => el?.querySelector<HTMLElement>(`[data-hb-confirm="${name}"]`) ?? null
  let view: OverlayHandle | null = null
  let answering = false

  if (el) {
    view = modal(el, {
      initialFocus: () => (queue[0]?.req.danger ? part('cancel') : part('ok')),
      onClose: () => {
        if (!answering) answer(false)
      },
    })
    part('ok')?.addEventListener('click', onOk)
    part('cancel')?.addEventListener('click', onCancel)
  }
  function onOk() {
    answer(true)
  }
  function onCancel() {
    answer(false)
  }

  function show() {
    const head = queue[0]
    changed.emit(head?.req ?? null)
    if (!el || !view) return
    if (!head) return
    const set = (name: string, text: string) => {
      const p = part(name)
      if (p) p.textContent = text
    }
    set('title', head.req.title)
    set('message', head.req.message ?? '')
    set('ok', head.req.confirmLabel ?? 'confirm')
    set('cancel', head.req.cancelLabel ?? 'cancel')
    part('ok')?.classList.toggle('hb-btn-danger', !!head.req.danger)
    view.open()
  }

  function answer(ok: boolean) {
    const head = queue.shift()
    if (!head) return
    if (view?.isOpen) {
      answering = true
      view.close('button')
      answering = false
    }
    head.done(ok)
    show()
  }

  return {
    ask(req) {
      return new Promise<boolean>((done) => {
        queue.push({ req, done })
        if (queue.length === 1) show()
      })
    },
    answer,
    get current() {
      return queue[0]?.req ?? null
    },
    subscribe: changed.on,
    dispose() {
      while (queue.length) queue.shift()!.done(false)
      part('ok')?.removeEventListener('click', onOk)
      part('cancel')?.removeEventListener('click', onCancel)
      view?.dispose()
      changed.clear()
    },
  }
}
