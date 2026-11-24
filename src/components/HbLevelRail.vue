<script setup lang="ts">
import { computed } from 'vue'
import HbWave from './HbWave.vue'
import { dbText, nowIndex, railBars, railTicks } from '../vanilla/transcript'

interface Props {
  /** Speech band level per frame, dBFS: the transcribe rail's `db`. */
  env: ArrayLike<number>
  /** Per frame kept mask (the rail's `open`), or kept regions in seconds. */
  vad?: ArrayLike<number | boolean> | readonly (readonly [number, number])[] | null
  /** dBFS. Drawn as a dashed amber line and read out in the legend. */
  noiseDb?: number | null
  /** dBFS. Drawn as a dotted red line and read out in the legend. */
  thrDb?: number | null
  /** Kept segments, seconds: marked under the rail, the one playing lit. */
  segments?: readonly { start: number; end: number }[]
  /** Seconds, or null for no playhead. */
  playhead?: number | null
  /** Seconds. */
  duration: number
  /** Bars across the rail. */
  bins?: number
  /** Time labels along the foot. */
  ticks?: number
  label?: string
  /** Click, drag or arrow keys move the playhead; emits seek. */
  seekable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  vad: null, noiseDb: null, thrDb: null, segments: () => [], playhead: null, bins: 240, ticks: 10, label: 'level rail', seekable: true,
})

const emit = defineEmits<{ seek: [seconds: number] }>()

const bars = computed(() => railBars({ env: props.env, vad: props.vad, duration: props.duration, noiseDb: props.noiseDb, thrDb: props.thrDb }, props.bins))
const labels = computed(() => railTicks(props.duration, props.ticks))
const at = computed(() => (props.playhead === null || !props.duration ? null : Math.min(1, Math.max(0, props.playhead / props.duration))))
const current = computed(() => nowIndex(props.segments, props.playhead))
const pct = (s: number) => `${(Math.min(1, Math.max(0, s / (props.duration || 1))) * 100).toFixed(3)}%`
</script>

<template>
  <figure class="hb-lrail">
    <HbWave
      :label="props.label"
      :samples="bars.samples"
      :kept="bars.kept"
      :floor="bars.floor"
      :gate="bars.gate"
      :ticks="props.ticks"
      :at="at"
      bars
      :seekable="props.seekable"
      @seek="emit('seek', $event * props.duration)"
    />
    <div v-if="props.segments.length" class="hb-lrail-segs" aria-hidden="true">
      <i v-for="(s, k) in props.segments" :key="k" :class="{ 'is-now': k === current }" :style="{ '--hb-x': pct(s.start), '--hb-w': pct(s.end - s.start) }" />
    </div>
    <div class="hb-lrail-ticks" aria-hidden="true">
      <span v-for="(t, k) in labels" :key="k">{{ t }}</span>
    </div>
    <figcaption class="hb-lrail-legend">
      <span><i class="is-kept" />speech kept</span>
      <span><i class="is-cut" />silence cut</span>
      <span v-if="props.noiseDb !== null"><i class="is-floor" />noise floor <b>{{ dbText(props.noiseDb) }}</b></span>
      <span v-if="props.thrDb !== null"><i class="is-gate" />gate <b>{{ dbText(props.thrDb) }}</b></span>
      <slot />
    </figcaption>
  </figure>
</template>
