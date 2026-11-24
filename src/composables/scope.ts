import { getCurrentScope, onScopeDispose } from 'vue'

/** Run `fn` when the calling component or effect scope ends. Outside a
    scope the caller disposes by hand. */
export function onEnd(fn: () => void): void {
  if (getCurrentScope()) onScopeDispose(fn)
}
