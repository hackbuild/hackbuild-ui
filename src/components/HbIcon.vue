<script setup lang="ts">
import { computed } from 'vue'
import { iconDef, type IconName } from '../icons'

interface Props {
  name: IconName
  /** Rendered height in px. Width follows the glyph's aspect. */
  size?: number | string
  /** Accessible name. Without it the icon is decorative and hidden. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
})

const def = computed(() => iconDef(props.name))

const height = computed(() => Number(props.size))
const width = computed(() => {
  if (!def.value) return height.value
  return Math.round((height.value * def.value.w / def.value.h) * 100) / 100
})
</script>

<template>
  <!-- Font Awesome solid, baked in. Filled glyphs, currentColor. -->
  <svg
    v-if="def"
    class="hb-icon"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${def.w} ${def.h}`"
    fill="currentColor"
    :role="props.label ? 'img' : undefined"
    :aria-label="props.label"
    :aria-hidden="props.label ? undefined : 'true'"
  >
    <path v-for="(d, index) in def.p" :key="index" :d="d" />
  </svg>
</template>
