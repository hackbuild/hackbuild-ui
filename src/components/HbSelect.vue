<script setup lang="ts">
import { computed } from 'vue'

export interface HbSelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  /** Strings, or label and value pairs. Or skip it and slot in options. */
  options?: Array<HbSelectOption | string | number>
  invalid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  invalid: false,
})

const model = defineModel<string | number>({ default: '' })

const normalized = computed<HbSelectOption[]>(() =>
  props.options.map((option) =>
    typeof option === 'object' ? option : { label: String(option), value: option },
  ),
)
</script>

<template>
  <select v-model="model" class="hb-select" :class="{ 'is-invalid': props.invalid }">
    <option
      v-for="option in normalized"
      :key="option.value"
      :value="option.value"
      :disabled="option.disabled"
    >
      {{ option.label }}
    </option>
    <slot />
  </select>
</template>
