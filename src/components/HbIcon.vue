<script setup lang="ts">
import { computed } from 'vue'
import { iconDef, type IconName } from '../icons'
import { faClassName, strokeIconDef, type StrokeIconName } from '../icons/stroke'

interface Props {
  /**
   * A stroke set name, a baked Font Awesome name, or a Font Awesome class
   * string such as `fa-solid fa-gear`.
   */
  name: StrokeIconName | IconName | (string & {})
  /** Rendered height in px. Width follows the glyph's aspect. */
  size?: number | string
  /** Accessible name. Without it the icon is decorative and hidden. */
  label?: string
  /**
   * 'auto' draws the stroke set when it carries the name and falls back
   * to the solid glyph. 'solid' keeps Font Awesome, for marketing and
   * prose surfaces. 'stroke' draws nothing for a name the set lacks.
   */
  set?: 'auto' | 'stroke' | 'solid'
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  set: 'auto',
})

const isClass = computed(() => /(^|\s)fa-/.test(props.name))
const faName = computed(() => (isClass.value ? faClassName(props.name) : props.name))
const stroke = computed(() => {
  if (props.set === 'solid' || isClass.value || !faName.value) return undefined
  return strokeIconDef(faName.value)
})
const solid = computed(() => {
  if (stroke.value || props.set === 'stroke' || !faName.value) return undefined
  return iconDef(faName.value as IconName)
})

const height = computed(() => Number(props.size))
const width = computed(() => {
  if (!solid.value) return height.value
  return Math.round((height.value * solid.value.w / solid.value.h) * 100) / 100
})
</script>

<template>
  <!-- Stroke set: lines on a 24 grid, square caps, width from the border token. -->
  <svg
    v-if="stroke"
    class="hb-icon is-stroke"
    :width="height"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="square"
    stroke-linejoin="miter"
    :role="props.label ? 'img' : undefined"
    :aria-label="props.label"
    :aria-hidden="props.label ? undefined : 'true'"
  >
    <path :d="stroke.d" />
  </svg>
  <!-- Font Awesome solid, baked in. Filled glyphs, currentColor. -->
  <svg
    v-else-if="solid"
    class="hb-icon"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${solid.w} ${solid.h}`"
    fill="currentColor"
    :role="props.label ? 'img' : undefined"
    :aria-label="props.label"
    :aria-hidden="props.label ? undefined : 'true'"
  >
    <path v-for="(d, index) in solid.p" :key="index" :d="d" />
  </svg>
  <!-- A Font Awesome class the baked set lacks: the page's own Font Awesome draws it. -->
  <i
    v-else-if="isClass && props.set !== 'stroke'"
    :class="['hb-icon', props.name]"
    :role="props.label ? 'img' : undefined"
    :aria-label="props.label"
    :aria-hidden="props.label ? undefined : 'true'"
  />
</template>
