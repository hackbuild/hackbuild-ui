<script setup lang="ts">
import { computed } from 'vue'
import { icons, type IconName } from '../icons'

interface Props {
  name: IconName
  /** Rendered size in px. */
  size?: number | string
  /** 1.5 to 2.4 per the system. */
  strokeWidth?: number
  /** Accessible name. Without it the icon is decorative and hidden. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  strokeWidth: 2,
})

const paths = computed<readonly string[]>(() => icons[props.name] ?? [])
</script>

<template>
  <svg
    class="hb-icon"
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="props.strokeWidth"
    stroke-linecap="square"
    stroke-linejoin="miter"
    :role="props.label ? 'img' : undefined"
    :aria-label="props.label"
    :aria-hidden="props.label ? undefined : 'true'"
  >
    <path v-for="(d, index) in paths" :key="index" :d="d" />
  </svg>
</template>
