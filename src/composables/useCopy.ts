import { ref, type Ref } from 'vue'
import { copier, type CopierOptions, type CopyState } from '../vanilla/copy'
import { onEnd } from './scope'

export interface UseCopy {
  state: Ref<CopyState>
  copy: (text: string) => Promise<boolean>
}

/** Copy text with a state for the button's mark: idle, copied, failed.
    Over `copier` from the vanilla entry. */
export function useCopy(options: CopierOptions = {}): UseCopy {
  const c = copier(options)
  const state = ref<CopyState>(c.state)
  const off = c.subscribe((s) => { state.value = s })
  onEnd(() => {
    off()
    c.dispose()
  })
  return { state, copy: (text) => c.copy(text) }
}
