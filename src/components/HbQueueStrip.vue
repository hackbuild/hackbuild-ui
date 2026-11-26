<script setup lang="ts">
import { computed } from 'vue'
import HbIcon from './HbIcon.vue'
import HbWave from './HbWave.vue'
import { railBars, stripStatus, type RailBarsInput, type StripFigure, type StripStatus } from '../vanilla/transcript'

export interface HbQueueItem {
  /** Stable key; also what select and remove carry. */
  id: string | number
  /** Channel number; the position from 1 when left out. */
  n?: number
  name: string
  status: StripStatus
  /** A queue job's running phase: decoding, then working. */
  phase?: 'decoding' | 'working' | null
  /** 0 to 100 while working. */
  pct?: number
  /** Levels 0 to 1, or a rail (env, vad, floor, gate) folded to the strip. */
  wave?: number[] | Float32Array | RailBarsInput | null
  /** The measured line: `stripMeta` builds it. */
  meta?: StripFigure[]
  /** A lowercase line naming the failure. */
  error?: string | null
}

interface Props {
  items: HbQueueItem[]
  label?: string
  empty?: string
  /** Hides remove, for a queue that is running. */
  locked?: boolean
}

const props = withDefaults(defineProps<Props>(), { label: 'files', empty: 'no files yet. drop audio or video here.', locked: false })
const selected = defineModel<string | number | null>('selected', { default: null })
const emit = defineEmits<{ remove: [id: string | number] }>()

const waves = computed(() => props.items.map((it) => {
  const w = it.wave
  if (!w) return null
  if ('env' in w) return railBars(w, 120)
  return { samples: Array.from(w), kept: null, floor: null, gate: null }
}))
const busy = (it: HbQueueItem) => it.status === 'working' || (it.status === 'running' && it.phase === 'working')

function move(i: number, e: KeyboardEvent) {
  const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : e.key === 'Home' ? -i : e.key === 'End' ? props.items.length - 1 - i : 0
  const next = props.items[i + d]
  if (!d || !next) return
  e.preventDefault()
  selected.value = next.id
  const list = (e.currentTarget as HTMLElement).closest('.hb-qstrips')
  list?.querySelectorAll<HTMLElement>('.hb-qstrip-main')[i + d]?.focus()
}
</script>

<template>
  <ol class="hb-qstrips" :aria-label="props.label">
    <li
      v-for="(it, i) in props.items"
      :key="it.id"
      class="hb-qstrip"
      :class="[`is-${stripStatus(it.status, it.phase).tone || 'idle'}`, { 'is-sel': selected === it.id, 'is-done': it.status === 'done' }]"
    >
      <button type="button" class="hb-qstrip-main" :aria-pressed="selected === it.id" @click="selected = it.id" @keydown="move(i, $event)">
        <span class="hb-qstrip-n">{{ String(it.n ?? i + 1).padStart(2, '0') }}</span>
        <span class="hb-qstrip-body">
          <span class="hb-qstrip-hd">
            <span class="hb-qstrip-name">{{ it.name }}</span>
            <span class="hb-qstrip-stat">{{ stripStatus(it.status, it.phase).word }}</span>
          </span>
          <HbWave
            v-if="waves[i]"
            class="hb-qstrip-wave"
            :samples="waves[i]!.samples"
            :kept="waves[i]!.kept"
            :floor="waves[i]!.floor"
            :gate="waves[i]!.gate"
            bars
          />
          <span v-if="it.meta?.length || it.error" class="hb-qstrip-meta">
            <span v-for="(m, k) in it.meta" :key="k">{{ m.label ? `${m.label} ` : '' }}<b :class="m.tone ? `is-${m.tone}` : undefined">{{ m.value }}</b></span>
            <span v-if="it.error" class="is-lo">{{ it.error }}</span>
          </span>
          <span v-if="busy(it)" class="hb-qstrip-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.round(it.pct ?? 0)" :aria-label="`${it.name} progress`"><i :style="{ '--hb-v': (it.pct ?? 0) / 100 }" /></span>
        </span>
      </button>
      <button v-if="!props.locked" type="button" class="hb-qstrip-x" :aria-label="`remove ${it.name}`" title="remove" @click="emit('remove', it.id)"><HbIcon name="x" :size="14" /></button>
    </li>
    <li v-if="!props.items.length" class="hb-qstrip-empty">{{ props.empty }}</li>
  </ol>
</template>
