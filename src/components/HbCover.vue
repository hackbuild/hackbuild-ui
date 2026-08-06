<script setup lang="ts">
import { computed } from 'vue'
import { hashSeed } from '../utils/critter'
import type { IconName } from '../icons'
import HbIcon from './HbIcon.vue'

/** The bench-flavored icons a seeded cover picks from. */
const POOL: IconName[] = [
  'cube', 'microchip', 'bolt', 'wrench', 'wave', 'code', 'terminal',
  'flame', 'rocket', 'gear', 'signal', 'plug', 'globe', 'lightbulb',
]

interface Props {
  /** Picks the icon deterministically, usually the project title. */
  seed?: string
  /** Explicit icon, beats the seed. */
  icon?: IconName
  /** Faint pink graticule behind the icon. */
  graph?: boolean
  /** Icon size in px. */
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  graph: false,
  size: 56,
})

const picked = computed<IconName>(() => {
  if (props.icon) return props.icon
  if (props.seed) return POOL[hashSeed(props.seed) % POOL.length]
  return 'cube'
})
</script>

<template>
  <!-- Placeholder cover: a seeded icon ghosted on the ink plate, for
       projects that have no image yet. -->
  <div class="hb-cover" :class="{ 'is-graph': props.graph }" aria-hidden="true">
    <HbIcon :name="picked" :size="props.size" />
  </div>
</template>
