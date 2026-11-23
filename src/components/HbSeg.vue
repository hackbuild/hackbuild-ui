<script setup lang="ts">
import { computed } from 'vue'

export interface HbSegOption {
  label: string
  value: string | number
}

interface Props {
  /** Two or three options only. Past that, use a select. */
  options: Array<HbSegOption | string>
  /** Ink when on: a view switch that leaves the pink to the focal value. */
  toggle?: boolean
}

const props = withDefaults(defineProps<Props>(), { toggle: false })

const model = defineModel<string | number>()

const normalized = computed<HbSegOption[]>(() =>
  props.options.map((option) =>
    typeof option === 'object' ? option : { label: option, value: option },
  ),
)
</script>

<template>
  <div class="hb-seg" :class="{ 'is-toggle': props.toggle }" role="group">
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
