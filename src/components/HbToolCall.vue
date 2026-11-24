<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { argsBlock, argsLine, TOOL_WORDS, type ToolState } from '../vanilla/chat'

interface Props {
  name: string
  args?: unknown
  result?: unknown
  /** The failure, named. */
  error?: string
  state?: ToolState
  /** How long the call took. */
  ms?: number | null
  /** One chip in a row of chips instead of a card. */
  chip?: boolean
  /** Replayed from history: the result was not kept. */
  restored?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  args: () => ({}),
  result: undefined,
  error: '',
  state: 'ok',
  ms: null,
  chip: false,
  restored: false,
})

// A running call is open with its arguments; a finished one costs one line.
const open = ref(props.state === 'running' && !props.chip)
watch(() => props.state, (s) => { open.value = s === 'running' && !props.chip })

const line = computed(() => argsLine(props.args))
const word = computed(() => TOOL_WORDS[props.state] + (props.ms !== null && props.state !== 'running' ? ` ${props.ms < 1000 ? `${Math.round(props.ms)} ms` : `${(props.ms / 1000).toFixed(1)} s`}` : ''))
const hasResult = computed(() => props.result !== undefined && props.result !== null && props.result !== '')
</script>

<template>
  <div class="hb-tool" :class="[`is-${props.state}`, { 'is-chip': props.chip, 'is-open': open }]">
    <button type="button" class="hb-tool-row" :aria-expanded="open" @click="open = !open">
      <span class="hb-tool-caret" aria-hidden="true">{{ open ? '-' : '+' }}</span>
      <span class="hb-tool-name">{{ props.name }}</span>
      <span v-if="!props.chip" class="hb-tool-args">{{ line }}</span>
      <span class="hb-tool-state">{{ word }}</span>
    </button>
    <div v-if="open" class="hb-tool-body">
      <span class="hb-tool-label">arguments</span>
      <pre class="hb-tool-pre">{{ argsBlock(props.args) }}</pre>
      <template v-if="props.error">
        <span class="hb-tool-label">error</span>
        <pre class="hb-tool-pre is-err" role="alert">{{ props.error }}</pre>
      </template>
      <template v-else-if="hasResult">
        <span class="hb-tool-label">result</span>
        <pre class="hb-tool-pre">{{ argsBlock(props.result) }}</pre>
      </template>
      <span v-else-if="props.restored" class="hb-tool-label">restored. the result was in the history.</span>
      <slot />
    </div>
  </div>
</template>
