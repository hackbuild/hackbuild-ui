<script setup lang="ts">
import { computed } from 'vue'
import { clipText, msText, stepLabel, type StepState } from '../vanilla/trace'

interface Props {
  /** Step number, shown as 'step 01'. */
  n?: number
  /** What the model chose: the action chip, such as 'walk(bench)'. */
  title?: string
  /** The exact frame the model saw, as a URL. Or use the thumb slot. */
  thumb?: string
  /** The streamed reply text. */
  text?: string
  thought?: string
  /** What the action did. */
  result?: string
  /** The model call's time. */
  ms?: number
  state?: StepState
  /** Clip for thought and result, in characters. 0 keeps all. */
  clip?: number
}

const props = withDefaults(defineProps<Props>(), {
  n: 1,
  title: '',
  thumb: '',
  text: '',
  thought: '',
  result: '',
  ms: undefined,
  state: 'ok',
  clip: 240,
})

defineSlots<{
  /** A custom thumb, such as an HbInset with view modes. */
  thumb?: () => unknown
}>()

const chip = computed(() => props.title || (props.state === 'thinking' ? 'thinking' : props.state))
const time = computed(() => (props.ms === undefined ? '' : msText(props.ms)))
</script>

<template>
  <!-- One decision tied to its input: the frame the model saw beside what
       it said, thought and what came of it. -->
  <article class="hb-step" :class="`is-${props.state}`" :aria-busy="props.state === 'thinking'">
    <div class="hb-step-head">
      <span class="hb-step-n">{{ stepLabel(props.n) }}</span>
      <span class="hb-step-act">{{ chip }}</span>
      <span v-if="time" class="hb-step-ms">{{ time }}</span>
    </div>
    <div class="hb-step-body">
      <slot name="thumb">
        <img v-if="props.thumb" class="hb-step-thumb" :src="props.thumb" alt="the frame the model saw" />
        <span v-else class="hb-step-thumb is-none" aria-hidden="true">no frame</span>
      </slot>
      <div class="hb-step-text">
        <p v-if="props.text || props.state === 'thinking'" class="hb-step-stream">{{ props.text || '...' }}</p>
        <p v-if="props.thought" class="hb-step-thought"><b>thought</b> {{ clipText(props.thought, props.clip) }}</p>
        <p v-if="props.result" class="hb-step-result"><b>result</b> {{ clipText(props.result, props.clip) }}</p>
      </div>
    </div>
  </article>
</template>
