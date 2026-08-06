<script setup lang="ts">
import { ARC_D, ARC_TRANSFORM, MARK_VIEWBOX, WRENCH_D, WRENCH_FILL, WRENCH_TRANSFORM } from '../brand/mark'

interface Props {
  /** Rendered size in px. Floor is 16 on screen. */
  size?: number | string
  /** Arc in paper instead of ink, for ink and void backgrounds. */
  reversed?: boolean
  /** Accessible name. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 28,
  reversed: false,
  label: 'hack.build mark',
})
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    :viewBox="MARK_VIEWBOX"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    :aria-label="props.label"
  >
    <path :transform="ARC_TRANSFORM" :fill="props.reversed ? '#f5f0e6' : '#1a1a1a'" :d="ARC_D" />
    <path :transform="WRENCH_TRANSFORM" :fill="WRENCH_FILL" :d="WRENCH_D" />
  </svg>
</template>
