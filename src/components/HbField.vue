<script setup lang="ts">
interface Props {
  label?: string
  /** Ties the label to a control id inside the slot. */
  for?: string
  hint?: string
  /** Rendered in place of the hint when present. */
  error?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="hb-field">
    <label v-if="props.label" class="hb-label" :for="props.for">{{ props.label }}</label>
    <slot />
    <span v-if="props.error" class="hb-error">{{ props.error }}</span>
    <span v-else-if="props.hint" class="hb-hint">{{ props.hint }}</span>
  </div>
</template>
