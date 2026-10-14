<script setup lang="ts">
interface Props {
  disabled?: boolean
  /** A toggle inside a bench: fills ink when on, so pink stays free for
      the one primary selection of a step. */
  toggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  toggle: false,
})

/** On state. Optional: without it the chip is a plain click target. */
const on = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function toggle(event: MouseEvent) {
  if (props.disabled) return
  on.value = !on.value
  emit('click', event)
}
</script>

<template>
  <button
    type="button"
    class="hb-chip"
    :class="{ 'is-on': on, 'is-toggle': props.toggle }"
    :aria-pressed="on"
    :disabled="props.disabled"
    @click="toggle"
  >
    <slot />
  </button>
</template>
