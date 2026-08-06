<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { cx } from '../utils/cx'
import { critterFromSeed } from '../utils/critter'
import { plateFromSeed, plates, type PlateName } from '../utils/plates'

interface Props {
  src?: string
  alt?: string
  /** Fallback when there is no image. Two characters at most. */
  initials?: string
  /** Deterministic generated avatar, usually the username. Same seed, same
   * face, same plate color. */
  seed?: string
  /** person is the DiceBear avataaars little human the app uses. critter
   * is the local pixel robot: offline, no third party. */
  variant?: 'person' | 'critter'
  /** Explicit plate color, beats the seeded pick. */
  plate?: PlateName
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'person',
  size: 'md',
})

const srcFailed = ref(false)
const personFailed = ref(false)
watch(() => props.src, () => {
  srcFailed.value = false
})
watch(() => props.seed, () => {
  personFailed.value = false
})

const showSrc = computed(() => Boolean(props.src) && !srcFailed.value)

const personUrl = computed(() => {
  if (props.variant !== 'person' || !props.seed) return null
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(props.seed)}`
})
const showPerson = computed(() => !showSrc.value && Boolean(personUrl.value) && !personFailed.value)

const critter = computed(() =>
  !showSrc.value && !showPerson.value && props.seed ? critterFromSeed(props.seed) : null,
)

const style = computed(() => {
  if (showSrc.value) return undefined
  const key = props.plate ?? plateFromSeed(props.seed ?? props.initials ?? props.alt ?? 'hb')
  const plate = plates[key]
  return { background: plate.bg, color: plate.fg }
})

const classes = computed(() =>
  cx('hb-avatar', {
    'hb-avatar-sm': props.size === 'sm',
    'hb-avatar-lg': props.size === 'lg',
  }),
)
</script>

<template>
  <!-- A square on a seeded identity plate. This system does not crop
       people into circles. Fallback order: image, little person, critter,
       marker initials. -->
  <span :class="classes" :style="style">
    <img v-if="showSrc" :src="props.src" :alt="props.alt ?? ''" @error="srcFailed = true" />
    <img
      v-else-if="showPerson"
      :src="personUrl ?? undefined"
      :alt="props.alt ?? props.seed"
      @error="personFailed = true"
    />
    <svg
      v-else-if="critter"
      viewBox="0 0 24 24"
      style="width: 82%; height: 82%"
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
