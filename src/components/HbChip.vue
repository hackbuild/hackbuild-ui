<script setup lang="ts">
import { ref } from 'vue'
import { useHotkeys } from '../composables/useHotkeys'

export interface Props {
  disabled?: boolean
  /** A toggle inside a bench: fills ink when on, so pink stays free for
      the one primary selection of a step. */
  toggle?: boolean
  /** A key that presses the chip, shown on it: '1', 'm'. Bound once, in
      the shared registry, for the life of the chip. */
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

if (props.hotkey) {
  useHotkeys([{
    keys: props.hotkey,
    label: props.hotkeyLabel || `chip ${props.hotkey}`,
    group: props.hotkeyGroup,
    run: () => {
      if (props.disabled || !el.value) return false
      el.value.click()
    },
  }])
}
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
