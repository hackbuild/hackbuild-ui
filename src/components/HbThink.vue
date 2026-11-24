<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  /** The think text, fed by a stream tag splitter. */
  text: string
  /** Open while true; closes once when the reply moves on. */
  streaming?: boolean
  /** Summary while streaming. */
  label?: string
  /** Summary after. */
  doneLabel?: string
  /** think: dashed ink. plan: amber. memory: slime. For agent tags. */
  tone?: 'think' | 'plan' | 'memory'
}

const props = withDefaults(defineProps<Props>(), {
  streaming: false,
  label: 'thinking',
  doneLabel: 'reasoning',
  tone: 'think',
})

const open = ref(props.streaming)
watch(() => props.streaming, (s) => { open.value = s })
const summary = computed(() => (props.streaming ? `${props.label}...` : `${props.doneLabel} (${props.text.length} chars)`))
</script>

<template>
  <details v-if="props.text || props.streaming" class="hb-think" :class="[`is-${props.tone}`, { 'is-live': props.streaming }]" :open="open" @toggle="open = ($event.target as HTMLDetailsElement).open">
    <summary>{{ summary }}</summary>
    <pre aria-live="off">{{ props.text }}</pre>
  </details>
</template>
