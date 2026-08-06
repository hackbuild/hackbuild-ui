<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { cx } from '../utils/cx'
import { critterFromSeed } from '../utils/critter'

interface Props {
  src?: string
  alt?: string
  /** Fallback when there is no image. Two characters at most. */
  initials?: string
  /** Draw a deterministic little character instead of initials. Same seed,
   * same face. Usually the username. */
  seed?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const failed = ref(false)
watch(() => props.src, () => {
  failed.value = false
})

const showImage = computed(() => Boolean(props.src) && !failed.value)
const critter = computed(() => (props.seed ? critterFromSeed(props.seed) : null))

const classes = computed(() =>
  cx('hb-avatar', {
    'hb-avatar-sm': props.size === 'sm',
    'hb-avatar-lg': props.size === 'lg',
  }),
)
</script>

<template>
  <!-- A square. This system does not crop people into circles. -->
  <span :class="classes">
    <img v-if="showImage" :src="props.src" :alt="props.alt ?? ''" @error="failed = true" />
    <svg
      v-else-if="critter"
      viewBox="0 0 24 24"
      style="width: 78%; height: 78%"
      role="img"
      :aria-label="props.alt ?? props.seed"
    >
      <rect
        :x="critter.head[0]"
        :y="critter.head[1]"
        :width="critter.head[2]"
        :height="critter.head[3]"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
      <rect
        v-for="(r, index) in critter.rects"
        :key="index"
        :x="r[0]"
        :y="r[1]"
        :width="r[2]"
        :height="r[3]"
        fill="currentColor"
      />
    </svg>
    <template v-else>{{ (props.initials ?? '').slice(0, 2) }}</template>
  </span>
</template>
