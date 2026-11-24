<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HbIcon from './HbIcon.vue'
import {
  RATES, chapterAt, chapterSpans, chapterStep, idleChrome, nextRate, rateText, timeLine, transportKeys,
  type Chapter,
} from '../vanilla/transport'

interface Props {
  playing?: boolean
  /** Current time in seconds. */
  time?: number
  /** Clip length in seconds; NaN or 0 while unknown. */
  duration?: number
  rate?: number
  rates?: number[]
  chapters?: Chapter[]
  /** Space, Escape and the arrows on the window, ignored while typing. */
  keys?: boolean
  /** Fade after this many ms of a resting pointer while playing; 0 never. */
  idle?: number
  /** Accessible name of the bar. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  playing: false, time: 0, duration: 0, rate: 1, rates: () => RATES, chapters: () => [], keys: false, idle: 0, label: 'transport',
})
const loop = defineModel<boolean>('loop', { default: false })
const emit = defineEmits<{
  play: []
  pause: []
  /** Previous or next with no chapters: a frame or a beat, the host decides. */
  step: [dir: 1 | -1]
  seek: [t: number]
  rate: [r: number]
}>()

const root = ref<HTMLElement | null>(null)
const known = computed(() => Number.isFinite(props.duration) && props.duration > 0)
const cur = computed(() => chapterAt(props.chapters, props.time))
const spans = computed(() => chapterSpans(props.chapters, props.duration))
const time = computed(() => timeLine(props.time, props.duration))

function toggle() { props.playing ? emit('pause') : emit('play') }
function go(dir: 1 | -1) {
  const t = chapterStep(props.chapters, props.time, dir, known.value ? props.duration : Infinity)
  if (t === null) emit('step', dir)
  else emit('seek', t)
}
function onScrub(e: Event) { emit('seek', Number((e.target as HTMLInputElement).value)) }

let keys: { dispose(): void } | null = null
let idle: { dispose(): void } | null = null
function wire() {
  keys?.dispose(); keys = null
  idle?.dispose(); idle = null
  if (props.keys) keys = transportKeys(window, { toggle, stop: () => { if (props.playing) emit('pause') }, step: go })
  if (props.idle > 0 && root.value) {
    idle = idleChrome(root.value, { ms: props.idle, watch: root.value.parentElement ?? root.value, when: () => props.playing })
  }
}
onMounted(wire)
watch(() => [props.keys, props.idle], wire)
onBeforeUnmount(() => { keys?.dispose(); idle?.dispose() })
</script>

<template>
  <div ref="root" class="hb-transport" role="group" :aria-label="props.label">
    <div class="hb-tp-row">
      <button type="button" class="hb-tp-btn is-play" :aria-label="props.playing ? 'pause' : 'play'" @click="toggle">
        <HbIcon :name="props.playing ? 'pause' : 'play'" />
      </button>
      <button type="button" class="hb-tp-btn" :aria-label="props.chapters.length ? 'previous chapter' : 'step back'" @click="go(-1)">
        <HbIcon name="backward" />
      </button>
      <button type="button" class="hb-tp-btn" :aria-label="props.chapters.length ? 'next chapter' : 'step on'" @click="go(1)">
        <HbIcon name="forward" />
      </button>
      <div class="hb-tp-track">
        <div v-if="props.chapters.length" class="hb-tp-chaps">
          <button
            v-for="s in spans"
            :key="s.i"
            type="button"
            class="hb-tp-chap"
            :class="{ 'is-on': s.i === cur, 'is-done': s.to <= props.time && s.i !== cur }"
            :style="{ '--hb-share': s.share }"
            :aria-label="`chapter ${props.chapters[s.i].label}`"
            :aria-current="s.i === cur ? 'step' : undefined"
            :title="props.chapters[s.i].label"
            @click="emit('seek', s.from)"
          >{{ props.chapters[s.i].label }}</button>
        </div>
        <input
          class="hb-tp-scrub"
          type="range"
          min="0"
          :max="known ? props.duration : 0"
          step="any"
          :value="props.time"
          :disabled="!known"
          aria-label="position"
          :aria-valuetext="time"
          @input="onScrub"
        >
      </div>
      <span class="hb-tp-time">{{ time }}</span>
      <span class="hb-tp-sp" />
      <button type="button" class="hb-tp-btn" :aria-label="`speed ${rateText(props.rate)}`" @click="emit('rate', nextRate(props.rate, 1, props.rates))">
        {{ rateText(props.rate) }}
      </button>
      <button type="button" class="hb-tp-btn" aria-label="loop" :aria-pressed="loop" @click="loop = !loop">
        <HbIcon name="repeat" />
      </button>
    </div>
  </div>
</template>
