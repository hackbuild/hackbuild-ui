<script setup lang="ts">
interface Props {
  disabled?: boolean
  /** Accessible name for the switch. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const model = defineModel<boolean>({ default: false })

function toggle() {
  if (props.disabled) return
  model.value = !model.value
}
</script>

<template>
  <button
    type="button"
    class="hb-switch"
    role="switch"
    :aria-checked="model"
    :aria-label="props.label"
    :disabled="props.disabled"
    @click="toggle"
  />
</template>
