<script setup lang="ts">
import { computed } from 'vue'

export interface HbConsoleLine {
  text: string
  /** Timestamp or prefix, dimmed. */
  t?: string
  level?: 'ok' | 'warn' | 'err' | 'info' | 'hit'
}

export interface Props {
  lines: HbConsoleLine[]
  /** Newest line at the top. Pass lines oldest first and leave this on. */
  newestFirst?: boolean
  /** CSS height. */
  height?: string
  /** Keep only the newest this many lines. 0 keeps all. */
  max?: number
  /** Shown before the first line: what will land here. */
  empty?: string
}

const props = withDefaults(defineProps<Props>(), {
  newestFirst: true,
  height: '180px',
  max: 0,
  empty: 'nothing logged yet.',
})

const ordered = computed(() => {
  const kept = props.max > 0 ? props.lines.slice(-props.max) : props.lines
  return props.newestFirst ? [...kept].reverse() : kept
})
</script>

<template>
  <!-- Plain log lines on the void. Tagged and live rows go in HbEventLog. -->
  <div class="hb-console" :style="{ '--hb-console-h': props.height }" role="log">
    <div v-if="!ordered.length" class="hb-console-empty">{{ props.empty }}</div>
    <div v-for="(line, index) in ordered" :key="index">
      <span v-if="line.t" class="t">{{ line.t }}</span>
      <span :class="line.level">{{ line.text }}</span>
    </div>
  </div>
</template>
