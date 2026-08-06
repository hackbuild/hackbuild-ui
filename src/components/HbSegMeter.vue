<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Zero to one. */
  value: number
  segments?: number
  /** Above this ratio the whole lit run flips pink. */
  threshold?: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  segments: 24,
  threshold: 0.8,
})

const clamped = computed(() => Math.min(1, Math.max(0, props.value)))
const litCount = computed(() => Math.round(clamped.value * props.segments))
const over = computed(() => clamped.value > props.threshold)
</script>

<template>
  <!-- Reads as an instrument, not a progress bar. A meter that only ever
       grows in one color tells you nothing at a glance. -->
  <div
    class="hb-segmeter"
    :class="{ 'is-over': over }"
    role="meter"
    :aria-label="props.label"
    :aria-valuenow="Math.round(clamped * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <i v-for="n in props.segments" :key="n" :class="{ on: n <= litCount }" />
  </div>
</template>
