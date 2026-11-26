<script setup lang="ts">
import { computed } from 'vue'
import HbIcon from './HbIcon.vue'
import { useCopy } from '../composables/useCopy'

export interface Props {
  label: string
  /** The readout text. Or use the default slot. */
  value?: string | number
  /** A copy mark after the readout. true copies `value`; a string copies that. */
  copy?: boolean | string
  /** The one live value of the view: pink, one per view (was HbReadouts focal). */
  focal?: boolean
}

const props = withDefaults(defineProps<Props>(), { value: undefined, copy: false, focal: false })
const { state, copy } = useCopy()
const text = computed(() => (typeof props.copy === 'string' ? props.copy : String(props.value ?? '')))
const words = computed(() => (state.value === 'copied' ? 'copied' : state.value === 'failed' ? 'copy failed' : `copy ${props.label}`))
</script>

<template>
  <!-- Label left, readout right. The workhorse row of every panel. -->
  <div class="hb-kv" :class="{ 'is-focal': props.focal }">
    <span class="hb-label">{{ props.label }}</span>
    <span class="hb-readout"><slot>{{ props.value }}</slot></span>
    <button
      v-if="props.copy !== false"
      type="button"
      class="hb-copymark"
      :class="`is-${state}`"
      :aria-label="words"
      :title="words"
      @click="copy(text)"
    ><HbIcon :name="state === 'copied' ? 'check' : state === 'failed' ? 'x' : 'copy'" :size="14" /></button>
  </div>
</template>
