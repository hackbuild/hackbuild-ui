<script setup lang="ts">
interface Props {
  label?: string
  /** Ties the label to a control id inside the slot. */
  for?: string
  hint?: string
  /** Rendered in place of the hint when present. */
  error?: string
  /** Characters used, with max: shows '12 / 200', warn past max. */
  count?: number
  max?: number
  /** A word beside the label: 'optional', 'experimental'. */
  tag?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="hb-field">
    <span v-if="props.label || props.tag" class="hb-field-head">
      <label v-if="props.label" class="hb-label" :for="props.for">{{ props.label }}</label>
      <span v-if="props.tag" class="hb-prow-tag">{{ props.tag }}</span>
    </span>
    <slot />
    <span v-if="props.error || props.hint || props.count !== undefined" class="hb-field-foot">
      <span v-if="props.error" class="hb-error">{{ props.error }}</span>
      <span v-else-if="props.hint" class="hb-hint">{{ props.hint }}</span>
      <span
        v-if="props.count !== undefined"
        class="hb-field-count"
        :class="{ 'is-over': props.max !== undefined && props.count > props.max }"
        aria-live="polite"
      >{{ props.count }}{{ props.max !== undefined ? ` / ${props.max}` : '' }}</span>
    </span>
  </div>
</template>
