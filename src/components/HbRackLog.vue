<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { LEVEL_WORDS, logLines, logTime, type RackLogLine } from '../vanilla/racklog'

export type HbLogLine = RackLogLine

interface Props {
  lines: RackLogLine[]
  /** Keep at most this many of the newest lines. */
  max?: number
  /** Keep the newest line in view while the reader is at the foot. */
  follow?: boolean
  /** Shown while there are no lines. */
  empty?: string
  /** Accessible name of the log. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), { max: 500, follow: true, empty: 'nothing logged yet.', label: 'log' })

const el = ref<HTMLElement | null>(null)
const shown = () => logLines(props.lines, { max: props.max })
let stick = true
watch(() => props.lines.length, () => {
  const o = el.value
  stick = !!o && o.scrollHeight - o.scrollTop - o.clientHeight < 8
  nextTick(() => { if (props.follow && stick && el.value) el.value.scrollTop = el.value.scrollHeight })
}, { flush: 'pre' })
onMounted(() => { if (props.follow && el.value) el.value.scrollTop = el.value.scrollHeight })
</script>

<template>
  <!-- A log for a rack tab: time, the line, the level at the right edge. -->
  <ol ref="el" class="hb-racklog" :class="{ 'is-empty': !props.lines.length }" role="log" aria-live="polite" :aria-label="props.label" :data-empty="props.empty" tabindex="0">
    <li v-for="(l, i) in shown()" :key="i" class="hb-racklog-row" :class="`is-${l.level ?? 'info'}`">
      <time class="hb-racklog-t">{{ logTime(l.t) }}</time>
      <span class="hb-racklog-line">{{ l.line }}</span>
      <span class="hb-racklog-level">{{ LEVEL_WORDS[l.level ?? 'info'] }}</span>
    </li>
  </ol>
</template>
