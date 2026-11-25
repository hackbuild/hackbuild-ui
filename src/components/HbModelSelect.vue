<script setup lang="ts">
import { computed, ref } from 'vue'
import HbModelSheet from './HbModelSheet.vue'
import { canLoad, loadAll, loadLabel, type ModelFilters, type ModelRow, type OwnKind } from '../vanilla/modelpick'

/** One job of a tool that needs several models (room, character). */
export interface ModelJob {
  job: string
  label: string
  rows: ModelRow[]
  /** The chosen row's id for this job. */
  chosen: string
  required?: boolean
}

/** A preset sets one row per job; total is its final text, "2.1 gb". */
export interface ModelPreset {
  id: string
  label: string
  picks: Record<string, string>
  total?: string
}

interface Props {
  /** Rows for a one job tool. */
  rows?: ModelRow[]
  /** line: the closed picker on a gate or in a rack. chip: the one model chip in the bar. */
  variant?: 'line' | 'chip'
  /** Draw the pink load button. Off when a gate's own button is the one pink action. */
  go?: boolean
  /** Several jobs: one line per job, one pink "load all, <total>". */
  jobs?: ModelJob[]
  presets?: ModelPreset[]
  /** Words when nothing is chosen. */
  empty?: string
  /** Sheet heading. */
  title?: string
  own?: boolean
  filters?: Partial<ModelFilters>
}

const props = withDefaults(defineProps<Props>(), {
  rows: () => [],
  variant: 'line',
  go: true,
  jobs: undefined,
  presets: undefined,
  empty: 'no model',
  title: 'pick a model',
  own: true,
  filters: () => ({}),
})

/** The chosen row's id, one job tools. */
const chosen = defineModel<string>({ default: '' })

const emit = defineEmits<{
  /** A row was chosen; job is set for several job tools. */
  choose: [id: string, job?: string]
  /** Load these ids (one, or every job's choice for load all). */
  load: [ids: string[]]
  cancel: [id: string]
  remove: [id: string]
  option: [id: string, key: string, value: string]
  custom: [kind: OwnKind, values: Record<string, string>]
  preset: [id: string]
}>()

const sheetOpen = ref(false)
const sheetJob = ref<string>('')

const sheetRows = computed(() => (props.jobs ? props.jobs.find((j) => j.job === sheetJob.value)?.rows ?? [] : props.rows))
const sheetChosen = computed({
  get: () => (props.jobs ? props.jobs.find((j) => j.job === sheetJob.value)?.chosen ?? '' : chosen.value),
  set: (id: string) => {
    if (props.jobs) emit('choose', id, sheetJob.value)
    else { chosen.value = id; emit('choose', id) }
  },
})

const row = computed(() => props.rows.find((r) => r.id === chosen.value))
const jobRow = (j: ModelJob) => j.rows.find((r) => r.id === j.chosen)
const all = computed(() => (props.jobs ? loadAll(props.jobs.map(jobRow)) : { ids: [], label: '' }))

function openSheet(job = '') {
  sheetJob.value = job
  sheetOpen.value = true
}
function line(r: ModelRow | undefined): { name: string; meta: string; state: string } {
  if (!r) return { name: props.empty, meta: '', state: '' }
  const state = r.state === 'loaded' ? 'ready' : r.state === 'loading' ? loadLabel(r).replace('loading, ', '') : r.state === 'stored' ? 'stored' : r.state === 'error' ? 'failed' : ''
  return { name: r.name, meta: r.state === 'loaded' || r.state === 'stored' ? '' : (r.size ?? ''), state }
}
function chipWords(r: ModelRow | undefined): string {
  const l = line(r)
  return l.state ? `${l.name}, ${l.state}` : l.name
}
function onLoad(id: string) {
  emit('load', [id])
}
</script>

<template>
  <div class="hb-msel-host">
  <button
    v-if="props.variant === 'chip'"
    type="button"
    class="hb-msel-chip"
    :class="row?.state ? `is-${row.state}` : ''"
    aria-haspopup="dialog"
    :aria-label="`model: ${chipWords(row)}`"
    @click="openSheet()"
  ><span>{{ chipWords(row) }}</span></button>

  <div v-else-if="props.jobs" class="hb-msel-jobs">
    <div v-if="props.presets?.length" class="hb-msel-presets" role="group" aria-label="presets">
      <button v-for="p in props.presets" :key="p.id" type="button" class="hb-chip" @click="emit('preset', p.id)">{{ p.label }}<template v-if="p.total">, {{ p.total }}</template></button>
    </div>
    <div v-for="j in props.jobs" :key="j.job" class="hb-msel-job">
      <span class="hb-msel-joblabel">{{ j.label }}<b v-if="j.required"> required</b></span>
      <button type="button" class="hb-msel-line" aria-haspopup="dialog" :aria-label="`${j.label}: ${line(jobRow(j)).name}`" @click="openSheet(j.job)">
        <span class="hb-msel-name">{{ line(jobRow(j)).name }}</span>
        <span v-if="line(jobRow(j)).meta" class="hb-msel-meta">{{ line(jobRow(j)).meta }}</span>
        <span v-if="line(jobRow(j)).state" class="hb-msel-state" :class="jobRow(j)?.state === 'loaded' ? 'is-loaded' : ''">{{ line(jobRow(j)).state }}</span>
      </button>
    </div>
    <div v-if="props.go && all.ids.length" class="hb-msel">
      <button type="button" class="hb-btn hb-btn-go" @click="emit('load', all.ids)">{{ all.label }}</button>
    </div>
  </div>

  <div v-else class="hb-msel">
    <button type="button" class="hb-msel-line" aria-haspopup="dialog" :aria-label="`model: ${line(row).name}`" @click="openSheet()">
      <span class="hb-msel-name">{{ line(row).name }}</span>
      <span v-if="line(row).meta" class="hb-msel-meta">{{ line(row).meta }}</span>
      <span v-if="line(row).state" class="hb-msel-state" :class="row?.state === 'loaded' ? 'is-loaded' : ''">{{ line(row).state }}</span>
    </button>
    <button v-if="props.go && canLoad(row)" type="button" class="hb-btn hb-btn-go" @click="onLoad(row!.id)">{{ loadLabel(row) }}</button>
  </div>

  <HbModelSheet
    v-model:open="sheetOpen"
    v-model:chosen="sheetChosen"
    :rows="sheetRows"
    :title="props.title"
    :own="props.own"
    :filters="props.filters"
    @load="onLoad"
    @cancel="(id) => emit('cancel', id)"
    @remove="(id) => emit('remove', id)"
    @option="(id, k, v) => emit('option', id, k, v)"
    @custom="(k, v) => emit('custom', k, v)"
  />
  </div>
</template>
