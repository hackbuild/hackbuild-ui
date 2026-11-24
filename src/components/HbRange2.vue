<script setup lang="ts">
import { computed } from 'vue'
import { clampPair, rangePct } from '../vanilla/vision'

interface Props {
  label: string
  min?: number
  max?: number
  step?: number
  /** Least distance between the thumbs. */
  gap?: number
  /** Names of the two thumbs for screen readers and the readout. */
  names?: [string, string]
  /** Readout formatter. */
  format?: (value: number) => string
  /** The line under the track: which end is which. */
  hint?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 1,
  step: 0.01,
  gap: 0,
  names: () => ['low', 'high'],
  hint: '',
  disabled: false,
})

const lo = defineModel<number>('lo', { default: 0 })
const hi = defineModel<number>('hi', { default: 1 })

const emit = defineEmits<{
  /** The pair settled: released, or set from the keyboard. */
  commit: [lo: number, hi: number]
}>()

const fmt = (v: number) => (props.format ? props.format(v) : String(v))
const opts = (moved: 'lo' | 'hi') => ({ min: props.min, max: props.max, step: props.step, gap: props.gap, moved })

function put(which: 'lo' | 'hi', e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  const [a, b] = which === 'lo' ? clampPair(v, hi.value, opts('lo')) : clampPair(lo.value, v, opts('hi'))
  lo.value = a
  hi.value = b
  ;(e.target as HTMLInputElement).value = String(which === 'lo' ? a : b)
}

const band = computed(() => ({ '--hb-r2-a': `${rangePct(lo.value, props.min, props.max)}%`, '--hb-r2-b': `${rangePct(hi.value, props.min, props.max)}%` }))
</script>

<template>
  <!-- Two thumbs on one track: a window such as keep near and keep far.
       Native range inputs under the hood, so arrows, page keys, home and
       end work; the moved thumb stops at the other. -->
  <div class="hb-r2" :class="{ 'is-disabled': props.disabled }" role="group" :aria-label="props.label">
    <span class="hb-label">{{ props.label }}</span>
    <span class="hb-readout">{{ fmt(lo) }} to {{ fmt(hi) }}</span>
    <div class="hb-r2-track" :style="band">
      <input
        class="hb-r2-in is-lo"
        :class="{ 'is-top': lo > (props.min + props.max) / 2 }"
        type="range"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        :value="lo"
        :aria-label="`${props.label}, ${props.names[0]}`"
        :aria-valuetext="fmt(lo)"
        :disabled="props.disabled"
        @input="put('lo', $event)"
        @change="emit('commit', lo, hi)"
      >
      <input
        class="hb-r2-in is-hi"
        type="range"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        :value="hi"
        :aria-label="`${props.label}, ${props.names[1]}`"
        :aria-valuetext="fmt(hi)"
        :disabled="props.disabled"
        @input="put('hi', $event)"
        @change="emit('commit', lo, hi)"
      >
    </div>
    <span class="hb-r2-names" aria-hidden="true"><span>{{ props.names[0] }}</span><span>{{ props.names[1] }}</span></span>
    <p v-if="props.hint" class="hb-r2-hint">{{ props.hint }}</p>
  </div>
</template>
