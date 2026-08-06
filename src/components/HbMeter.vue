<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Current value. */
  value: number
  max?: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
})

const percent = computed(() => {
  const ratio = props.max === 0 ? 0 : props.value / props.max
  return Math.min(100, Math.max(0, ratio * 100))
})
</script>

<template>
  <div
    class="hb-meter"
    role="meter"
    :aria-label="props.label"
    :aria-valuenow="props.value"
    aria-valuemin="0"
    :aria-valuemax="props.max"
  >
    <i :style="{ width: percent + '%' }" />
  </div>
</template>
