import { onMounted, ref, type Ref } from 'vue'
import { confirmInline, type ConfirmInlineHandle, type ConfirmInlineOptions } from '../vanilla/confirm'
import { onEnd } from './scope'

export interface UseConfirmInline {
  armed: Ref<boolean>
  arm: () => void
  disarm: () => void
}

/**
 * The in place confirm on a button ref. Pass `keep` as a ref to a keep
 * button in the template, so the component owns every node. Over
 * `confirmInline` from the vanilla entry.
 */
export function useConfirmInline(
  button: Ref<HTMLElement | null | undefined>,
  options: Omit<ConfirmInlineOptions, 'keep' | 'onArm'> & { keep?: Ref<HTMLElement | null | undefined> },
): UseConfirmInline {
  const armed = ref(false)
  let handle: ConfirmInlineHandle | null = null
  onMounted(() => {
    if (!button.value) return
    handle = confirmInline(button.value, {
      ...options,
      keep: options.keep?.value ?? undefined,
      onArm: (on) => { armed.value = on },
    })
  })
  onEnd(() => handle?.dispose())
  return {
    armed,
    arm: () => handle?.arm(),
    disarm: () => handle?.disarm(),
  }
}
