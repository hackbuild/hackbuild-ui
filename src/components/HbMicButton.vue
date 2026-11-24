<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import HbIcon from './HbIcon.vue'
import { micInput, micLive, MIC_WORDS, type MicInput, type MicState } from '../vanilla/mic'

interface Props {
  /** 0 to 1, the input level drawn along the foot of the button. */
  level?: number
  /** Push to talk: hold the pointer, Space or Enter to listen. */
  hold?: boolean
  /** Run the browser's speech recognition here and emit its words.
      Off: the page owns recognition and sets `state`. */
  listen?: boolean
  /** While true, results are dropped: the voice is speaking. */
  speaking?: boolean
  /** Drop results for this long after `speaking` ends. Default 400 ms. */
  tailMs?: number
  /** Show the state line beside the button. */
  note?: boolean
  lang?: string
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  hold: false,
  listen: false,
  speaking: false,
  tailMs: 400,
  note: true,
  lang: undefined,
})

const state = defineModel<MicState>('state', { default: 'off' })

const emit = defineEmits<{
  start: []
  stop: []
  interim: [text: string]
  final: [text: string]
}>()

let input: MicInput | null = null
if (props.listen && typeof window !== 'undefined') {
  input = micInput({
    lang: props.lang,
    gate: () => props.speaking,
    onInterim: (t) => emit('interim', t),
    onFinal: (t) => emit('final', t),
  })
  state.value = input.state
  input.subscribe((s) => { state.value = s })
}
watch(() => props.speaking, (now, was) => { if (was && !now) input?.muteFor(props.tailMs) })
onBeforeUnmount(() => input?.dispose())

const live = computed(() => micLive(state.value))
const words = computed(() => MIC_WORDS[state.value])
const label = computed(() => (props.hold && !live.value && state.value !== 'unsupported' ? 'hold to talk' : words.value.label))
const level = computed(() => Math.max(0, Math.min(1, props.level || 0)))

function start() {
  if (state.value === 'unsupported' || live.value) return
  emit('start')
  input?.start()
}
function stop() {
  if (!live.value) return
  emit('stop')
  input?.stop()
}
function click() {
  if (props.hold) return
  if (live.value) stop()
  else start()
}
function down(e: PointerEvent) {
  if (!props.hold || e.button !== 0) return
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  start()
}
function up() {
  if (props.hold) stop()
}
function keydown(e: KeyboardEvent) {
  if (!props.hold || (e.key !== ' ' && e.key !== 'Enter')) return
  e.preventDefault()
  if (!e.repeat) start()
}
function keyup(e: KeyboardEvent) {
  if (!props.hold || (e.key !== ' ' && e.key !== 'Enter')) return
  e.preventDefault()
  stop()
}
</script>

<template>
  <!-- One 44 px button. Pink while it takes input, the level along its
       foot; blocked and unsupported say what to do instead. -->
  <span class="hb-mic" :class="[`is-${state}`, { 'is-hold': props.hold }]" :style="{ '--hb-level': level }">
    <button
      type="button"
      class="hb-mic-btn"
      :aria-pressed="live"
      :aria-label="label"
      :title="label"
      :aria-disabled="state === 'unsupported' || undefined"
      @click="click"
      @pointerdown="down"
      @pointerup="up"
      @pointercancel="up"
      @keydown="keydown"
      @keyup="keyup"
    >
      <HbIcon :name="state === 'blocked' || state === 'unsupported' ? 'microphone-slash' : 'microphone'" :size="16" />
      <span class="hb-mic-level" aria-hidden="true" />
    </button>
    <span v-if="props.note && words.note" class="hb-mic-note" role="status">{{ words.note }}</span>
  </span>
</template>
