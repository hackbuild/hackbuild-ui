<script setup lang="ts">
import { computed } from 'vue'

export interface HbSegOption {
  label: string
  value: string | number
}

interface Props {
  /** Two or three options only. Past that, use a select. */
  options: Array<HbSegOption | string>
}

const props = defineProps<Props>()

const model = defineModel<string | number>()

const normalized = computed<HbSegOption[]>(() =>
  props.options.map((option) =>
    typeof option === 'object' ? option : { label: option, value: option },
  ),
)
</script>

<template>
  <div class="hb-seg" role="group">
    <button
      v-for="option in normalized"
      :key="option.value"
      type="button"
      :class="{ 'is-on': model === option.value }"
      :aria-pressed="model === option.value"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
