<script setup lang="ts">
import { ref, watch } from 'vue'
import { sharedHotkeys } from '../composables/useHotkeys'
import { onEnd } from '../composables/scope'

export interface Props {
  disabled?: boolean
  /** A toggle inside a bench: fills ink when on, so pink stays free for
      the one primary selection of a step. */
  toggle?: boolean
  /** A key that presses the chip, shown on it: '1', 'm'. Bound in the
      shared registry and rebound when it changes. */
  hotkey?: string
  /** What the key does, for the key map. Default: the chip's text. */
  hotkeyLabel?: string
  /** Key map heading. Default 'labels'. */
  hotkeyGroup?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  toggle: false,
  hotkey: '',
  hotkeyLabel: '',
  hotkeyGroup: 'labels',
})

/** On state. Optional: without it the chip is a plain click target. */
const on = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const el = ref<HTMLButtonElement | null>(null)

function toggle(event: MouseEvent) {
  if (props.disabled) return
  on.value = !on.value
  emit('click', event)
}

let unbind: (() => void) | null = null

watch(
  () => [props.hotkey, props.hotkeyLabel, props.hotkeyGroup] as const,
  ([key, label, group]) => {
    unbind?.()
    unbind = null
    if (!key) return
    unbind = sharedHotkeys().add([{
      keys: key,
      label: label || `chip ${key}`,
      group,
      run: () => {
        if (props.disabled || !el.value) return false
        el.value.click()
      },
    }])
  },
  { immediate: true },
)

onEnd(() => unbind?.())
</script>

<template>
  <button
    ref="el"
    type="button"
    class="hb-chip"
    :class="{ 'is-on': on, 'is-toggle': props.toggle }"
    :aria-pressed="on"
    :aria-keyshortcuts="props.hotkey || undefined"
    :disabled="props.disabled"
    @click="toggle"
  >
    <slot /><kbd v-if="props.hotkey" class="hb-chip-key" aria-hidden="true">{{ props.hotkey }}</kbd>
  </button>
</template>
