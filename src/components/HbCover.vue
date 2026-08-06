<script setup lang="ts">
import { computed } from 'vue'
import { hashSeed } from '../utils/critter'
import { plateFromSeed, plates, type PlateName } from '../utils/plates'
import type { IconName } from '../icons'
import HbIcon from './HbIcon.vue'

/** The bench-flavored icons a seeded cover picks from. */
const POOL: IconName[] = [
  'cube', 'microchip', 'bolt', 'wrench', 'wave', 'code', 'terminal',
  'flame', 'rocket', 'gear', 'signal', 'plug', 'robot', 'lightbulb',
]

interface Props {
  /** Picks the icon and the plate color deterministically, usually the
   * project title. */
  seed?: string
  /** Explicit icon, beats the seed. */
  icon?: IconName
  /** Explicit plate: a palette name or any css color. Beats the seed. */
  color?: PlateName | string
  /** The quiet app style: faded paper icon on ink instead of a color. */
  ghost?: boolean
  /** Faint graticule over the plate. */
  graph?: boolean
  /** Icon size in px. */
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  ghost: false,
  graph: false,
  size: 64,
})

const picked = computed<IconName>(() => {
  if (props.icon) return props.icon
  if (props.seed) return POOL[hashSeed(props.seed) % POOL.length]
  return 'cube'
})

const style = computed(() => {
  if (props.ghost) return undefined
  if (props.color) {
    const named = (plates as Record<string, { bg: string; fg: string }>)[props.color]
    if (named) return { background: named.bg, color: named.fg }
    return { background: props.color, color: 'var(--hb-paper)' }
  }
  if (props.seed) {
    const plate = plates[plateFromSeed(props.seed)]
    return { background: plate.bg, color: plate.fg }
  }
  return undefined
})
</script>

<template>
  <!-- Identity plate: a solid palette color with a big paper icon, the way
       the magazine and resume cards do it. Same seed, same face. -->
  <div class="hb-cover" :class="{ 'is-ghost': props.ghost, 'is-graph': props.graph }" :style="style" aria-hidden="true">
    <HbIcon :name="picked" :size="props.ghost ? Math.min(props.size, 52) : props.size" />
  </div>
</template>
