<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Current value. */
  value: number
  max?: number
  label?: string
  /** Draw lit segments instead of a bar (was HbSegMeter). */
  segments?: number
  /** With segments: above this share of max the lit run flips pink. */
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  segments: 0,
  threshold: 0.8,
})
const lit = computed(() => Math.round((percent.value / 100) * props.segments))

const percent = computed(() => {
  const ratio = props.max === 0 ? 0 : props.value / props.max
  return Math.min(100, Math.max(0, ratio * 100))
})
</script>

<template>
  <div
    v-if="props.segments > 0"
    class="hb-segmeter"
    :class="{ 'is-over': percent / 100 > props.threshold }"
    role="meter"
    :aria-label="props.label"
    :aria-valuenow="props.value"
    aria-valuemin="0"
    :aria-valuemax="props.max"
  >
    <i v-for="n in props.segments" :key="n" :class="{ on: n <= lit }" />
  </div>
  <div
    v-else
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
