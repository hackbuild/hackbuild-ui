import { onMounted, shallowRef, type Ref, type ShallowRef } from 'vue'
import { dropRoutes, type DropRoute, type DropRoutesHandle, type DropRoutesOptions, type DropState } from '../vanilla/drop'
import { onEnd } from './scope'

export interface UseFileDrop {
  state: Readonly<ShallowRef<DropState>>
}

/**
 * Route dropped files by type for the life of the component. `target` is
 * an element ref; leave it out for the whole window. `overlay` is a ref
 * to a `.hb-dropzone.is-cover` element. Over `dropRoutes` from the
 * vanilla entry.
 */
export function useFileDrop(
  routes: DropRoute[],
  options: Omit<DropRoutesOptions, 'overlay' | 'onState'> & {
    target?: Ref<HTMLElement | null | undefined>
    overlay?: Ref<HTMLElement | null | undefined>
  } = {},
): UseFileDrop {
  const state = shallowRef<DropState>({ over: false, route: null, rejected: false, count: 0 })
  let handle: DropRoutesHandle | null = null
  onMounted(() => {
    const target = options.target ? options.target.value : (globalThis as unknown as Window)
    if (!target) return
    handle = dropRoutes(target, routes, {
      ...options,
      overlay: options.overlay?.value ?? undefined,
      onState: (s) => { state.value = s },
    })
  })
  onEnd(() => handle?.dispose())
  return { state }
}
