<script setup lang="ts">
import { computed } from 'vue'
import { cx } from '../utils/cx'
import { loadText, sumFiles, type LoadFile, type LoadPhase } from '../vanilla/models'

export type HbProgressState = 'idle' | 'running' | 'paused' | 'done' | 'failed'
export type HbLoadPhase = LoadPhase
export type HbProgressFile = LoadFile

interface Props {
  /** Bytes so far. */
  loaded?: number
  /** Bytes in all, or null when the server did not say. */
  total?: number | null
  state?: HbProgressState
  /** The error, named, when state is failed. */
  error?: string
  /** Replaces the built text. */
  text?: string
  /** A second download running at the same time: paper fill, not pink. */
  quiet?: boolean
  /** Show cancel while running and resume when paused or failed. */
  actions?: boolean
  label?: string
  /** Speak the words as they change. Off when a parent announces at its own pace. */
  live?: boolean
  /** Named phase: download shows bytes, compile and warm show the word with a moving bar. */
  phase?: LoadPhase | null
  /** One row per file; the bar sums them, and the total is known only when every file states one. */
  files?: LoadFile[]
}

const props = withDefaults(defineProps<Props>(), {
  loaded: 0,
  total: null,
  state: 'running',
  error: '',
  text: '',
  quiet: false,
  actions: true,
  label: 'download',
  live: true,
  phase: null,
  files: () => [],
})

const emit = defineEmits<{ cancel: []; resume: [] }>()

const mb = (b: number) => (b / (1024 * 1024)).toFixed(b < 10 * 1024 * 1024 ? 1 : 0)
const sum = computed(() => (props.files.length ? sumFiles(props.files) : { loaded: props.loaded, total: props.total, done: 0 }))
const bytesPhase = computed(() => props.phase === null || props.phase === 'download' || props.phase === 'cache')
const known = computed(() => bytesPhase.value && sum.value.total !== null && sum.value.total > 0)
const fraction = computed(() => (known.value ? Math.min(1, sum.value.loaded / (sum.value.total as number)) : null))
const pct = computed(() => (fraction.value === null ? null : Math.floor(fraction.value * 100)))

const words = computed(() => {
  if (props.text) return props.text
  if (props.state === 'running' && (props.phase !== null || props.files.length)) {
    return loadText({ phase: props.phase ?? 'download', loaded: props.loaded, total: props.total, files: props.files })
  }
  const amount = known.value
    ? `${pct.value} percent, ${mb(props.loaded)} of ${mb(props.total as number)} MB`
    : `${mb(props.loaded)} MB, total unknown`
  switch (props.state) {
    case 'idle': return 'waiting to start'
    case 'paused': return `paused. ${amount}`
    case 'done': return 'downloaded.'
    case 'failed': return `download failed. ${props.error}`.trim()
    default: return amount
  }
})

const busy = computed(() => props.state === 'running' && fraction.value === null && props.phase !== 'ready')
const width = computed(() => (props.state === 'done' ? 100 : fraction.value === null ? 30 : fraction.value * 100))
const classes = computed(() =>
  cx('hb-progress', {
    'is-busy': busy.value,
    'is-paused': props.state === 'paused',
    'is-done': props.state === 'done',
    'is-failed': props.state === 'failed',
    'is-quiet': props.quiet,
  }),
)
</script>

<template>
  <div :class="classes">
    <div class="hb-progress-hd">
      <span class="hb-progress-text" :role="props.state === 'failed' ? 'alert' : props.live ? 'status' : undefined">{{ words }}</span>
      <span v-if="pct !== null && props.state !== 'done'" class="hb-progress-pct">{{ pct }}%</span>
      <template v-if="props.actions">
        <button v-if="props.state === 'running'" type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('cancel')">cancel</button>
        <button v-else-if="props.state === 'paused' || props.state === 'failed'" type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('resume')">resume</button>
      </template>
    </div>
    <div
      class="hb-meter"
      role="progressbar"
      :aria-label="props.label"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="pct ?? undefined"
      :aria-valuetext="words"
    >
      <i :style="{ width: width + '%' }" />
    </div>
    <details v-if="props.files.length > 1" class="hb-progress-files">
      <summary>{{ props.files.length }} files</summary>
      <ul>
        <li v-for="f in props.files" :key="f.name" :class="{ 'is-done': f.total !== null && f.total > 0 && f.loaded >= f.total }">
          <span class="hb-progress-file">{{ f.name }}</span>
          <span class="hb-progress-fileamt">{{ f.total ? `${Math.floor(Math.min(1, f.loaded / f.total) * 100)}%` : `${mb(f.loaded)} MB` }}</span>
        </li>
      </ul>
    </details>
  </div>
</template>
