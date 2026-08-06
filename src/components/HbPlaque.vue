<script setup lang="ts">
import type { IconName } from '../icons'
import HbIcon from './HbIcon.vue'

interface Props {
  title: string
  /** VT323 line under the title: year, place, event. */
  meta?: string
  icon?: IconName
  /** Which top corner the pink diamond pins. */
  pin?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'trophy',
  pin: 'left',
})
</script>

<template>
  <!-- Award plaque: recognition, achievements, badges earned. The diamond
       pin carries the accent; everything else stays ink. -->
  <div class="hb-plaque" :class="props.pin === 'right' ? 'is-right' : 'is-left'">
    <span class="hb-plaque-pin" aria-hidden="true" />
    <HbIcon :name="props.icon" :size="30" />
    <div>
      <h3 style="margin: 0">{{ props.title }}</h3>
      <div v-if="props.meta" class="hb-plaque-meta">{{ props.meta }}</div>
      <p v-if="$slots.default"><slot /></p>
    </div>
  </div>
</template>
