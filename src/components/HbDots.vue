<script setup lang="ts">
interface Props {
  /** Filled pips. */
  value: number
  max?: number
  /** Accessible name, for example difficulty. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  max: 5,
  label: 'level',
})
</script>

<template>
  <!-- Square pips, filled pink up to the level. Difficulty, skill, signal
       bars for humans. -->
  <span
    class="hb-dots"
    role="meter"
    :aria-label="props.label"
    :aria-valuenow="props.value"
    aria-valuemin="0"
    :aria-valuemax="props.max"
  >
    <i v-for="n in props.max" :key="n" :class="{ on: n <= props.value }" />
  </span>
</template>
