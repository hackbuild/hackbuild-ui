<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'
import HbChipGroup from './HbChipGroup.vue'
import HbToggleRow from './HbToggleRow.vue'
import HbProgress from './HbProgress.vue'
import HbLicence from './HbLicence.vue'
import {
  CENSORSHIP,
  RESPONSIBILITY,
  ctxOptions,
  factLine,
  filterRecords,
  groupRecords,
  mbText,
  modelList,
  searchText,
  sizeText,
  vramText,
  type Censorship,
  type ModelFit,
  type ModelListHandle,
  type ModelRecordLike,
  type ModelRowStatus,
} from '../vanilla/models'
import { uid as makeUid } from '../utils/uid'

export type HbModelRecord = ModelRecordLike
export type HbModelFit = ModelFit
export type HbModelStatus = ModelRowStatus
export type HbModelVerb = 'download' | 'cancel' | 'load' | 'unload' | 'remove' | 'retry'

interface Props {
  /** Catalogue rows, shaped like a ModelRecord. */
  records: HbModelRecord[]
  /** fitOf(record, env, estimate) per id. A fit that is not ok disables the row with its reason. */
  fits?: Record<string, HbModelFit | undefined>
  /** Row state per id: not stored, downloading, stored, loaded, fault. */
  states?: Record<string, HbModelStatus | undefined>
  /** Show the state action on each row: download with the size, cancel, load, remove, unload. */
  actions?: boolean
  /** Groups in this order first; the rest as they appear. */
  groupOrder?: string[]
  /** The id the probe picked, and why. */
  defaultId?: string | null
  defaultWhy?: string
  /** A search field above the list. */
  search?: boolean
  /** Censorship chips and the fits switch. */
  filters?: boolean
  /** One line explaining each censorship tag, and the responsibility line. */
  legend?: boolean
  /** 'tiers' draws each row with an icon slot and a capability bar from the record tier. */
  variant?: 'rows' | 'tiers'
  /** Context sizes offered under the chosen row; sizes over the record's ctx are disabled. */
  ctxSizes?: number[]
  label?: string
  empty?: string
}

const props = withDefaults(defineProps<Props>(), {
  fits: () => ({}),
  states: () => ({}),
  actions: false,
  groupOrder: () => [],
  defaultId: null,
  defaultWhy: '',
  search: true,
  filters: true,
  legend: true,
  variant: 'rows',
  ctxSizes: () => [],
  label: 'models',
  empty: 'no model matches. clear the search or the filters.',
})

const selected = defineModel<string | null>({ default: null })
/** Context size for the chosen row, when ctxSizes is set. */
const ctx = defineModel<number | null>('ctx', { default: null })

const emit = defineEmits<{ pick: [id: string]; act: [id: string, verb: HbModelVerb] }>()

const uid = makeUid('hb-models')
const query = ref('')
const kinds = ref<string[]>([''])
const fitsOnly = ref(false)

const present = computed(() => {
  const set = new Set(props.records.map((r) => r.censorship ?? 'unknown'))
  return (Object.keys(CENSORSHIP) as Censorship[]).filter((k) => set.has(k))
})
const kindOptions = computed(() => present.value.map((k) => ({ label: CENSORSHIP[k].word, value: k })))
const shown = computed(() =>
  filterRecords(props.records, { query: query.value, censorship: kinds.value, fitsOnly: fitsOnly.value }, props.fits),
)
const groups = computed(() => groupRecords(shown.value, props.groupOrder))
const steerable = computed(() => present.value.some((k) => k === 'uncensored' || k === 'abliterated'))
const chosen = computed(() => props.records.find((r) => r.id === selected.value) ?? null)

const nameOf = (r: HbModelRecord) => r.label || r.id
const fitOf = (r: HbModelRecord) => props.fits[r.id]
const off = (r: HbModelRecord) => fitOf(r)?.ok === false
const stateOf = (r: HbModelRecord): HbModelStatus => props.states[r.id] ?? { state: 'none' }
function fitClass(f: HbModelFit) {
  return !f.ok ? 'is-err' : f.fit === 'fits' ? 'is-ok' : 'is-warn'
}
const TIER_BAR: Record<string, number> = { tiny: 25, small: 50, medium: 75, large: 100 }

const echo = computed(() => {
  const r = chosen.value
  if (!r) return 'nothing picked yet.'
  return `picked: ${nameOf(r)}${r.badge ? `, ${r.badge}` : ''}, ${sizeText(r.sizeMB, r.sizeSource)}.`
})

/** The in place confirm for remove: the first press arms, the second removes. */
const arming = ref<string | null>(null)
function act(r: HbModelRecord, verb: HbModelVerb) {
  if (verb === 'remove' && arming.value !== r.id) {
    arming.value = r.id
    return
  }
  arming.value = null
  emit('act', r.id, verb)
}
function actions(r: HbModelRecord): { verb: HbModelVerb; text: string; disabled?: boolean }[] {
  const s = stateOf(r).state
  if (s === 'downloading') return [{ verb: 'cancel', text: 'cancel' }]
  if (s === 'stored') return [{ verb: 'load', text: 'load', disabled: off(r) }, { verb: 'remove', text: arming.value === r.id ? 'remove, press again' : 'remove' }]
  if (s === 'loaded') return [{ verb: 'unload', text: 'unload' }]
  if (s === 'fault') return [{ verb: 'retry', text: 'try again', disabled: off(r) }]
  if (r.provider === 'remote' || r.provider === 'prompt-api') return [{ verb: 'load', text: 'use', disabled: off(r) }]
  const size = r.sizeMB === null ? ', size unknown' : ` ${mbText(r.sizeMB)}`
  return [{ verb: 'download', text: `download${size}`, disabled: off(r) }]
}
const STATE_WORDS: Record<string, string> = { none: '', downloading: 'downloading', stored: 'stored', loaded: 'loaded', fault: 'fault' }

const el = ref<HTMLElement | null>(null)
let handle: ModelListHandle | null = null
onMounted(() => {
  if (!el.value) return
  handle = modelList(el.value, {
    value: selected.value,
    onChange(id) {
      selected.value = id
      emit('pick', id)
    },
  })
})
onUpdated(() => handle?.refresh())
watch(selected, (v) => { if (handle && handle.value !== v) handle.set(v) })
watch(chosen, (r) => {
  arming.value = null
  if (!r || !props.ctxSizes.length) return
  const opts = ctxOptions(r.ctx, props.ctxSizes)
  if (ctx.value === null || opts.find((o) => o.value === ctx.value)?.disabled) ctx.value = [...opts].reverse().find((o) => !o.disabled)?.value ?? null
})
function onKeyEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && arming.value) {
    arming.value = null
    e.stopPropagation()
  }
}
const ctxChips = computed(() => (chosen.value ? ctxOptions(chosen.value.ctx, props.ctxSizes).map((o) => ({ label: o.label, value: String(o.value), disabled: o.disabled })) : []))
const ctxValue = computed({
  get: () => (ctx.value === null ? '' : String(ctx.value)),
  set: (v: string | string[]) => { ctx.value = v ? Number(v) : null },
})
onBeforeUnmount(() => handle?.dispose())
defineExpose({ refresh: () => nextTick(() => handle?.refresh()) })
</script>

<template>
  <div class="hb-modellist" :class="`is-${props.variant}`" @keydown="onKeyEsc">
    <slot name="guide" />
    <div v-if="props.search || props.filters" class="hb-modellist-tools">
      <label v-if="props.search" class="hb-modellist-search">
        <span class="hb-sr">search {{ props.label }}</span>
        <input v-model="query" class="hb-input" type="search" placeholder="search by name, tag or size" spellcheck="false" :aria-controls="`${uid}-list`">
      </label>
      <HbChipGroup v-if="props.filters && kindOptions.length > 1" v-model="kinds" :options="kindOptions" multi off="any" toggle label="censorship" />
      <HbToggleRow v-if="props.filters && Object.keys(props.fits).length" v-model="fitsOnly" label="only what fits here" description="hides the rows this machine cannot run" />
    </div>
    <p v-if="props.legend && present.length" class="hb-model-legend">
      <span v-for="k in present" :key="k" class="hb-model-legend-item"><b>{{ CENSORSHIP[k].word }}</b> {{ CENSORSHIP[k].legend }}</span>
      <span v-if="steerable" class="hb-model-legend-item">{{ RESPONSIBILITY }}</span>
    </p>
    <div :id="`${uid}-list`" ref="el" class="hb-models" :aria-label="props.label">
      <section v-for="g in groups" :key="g.group" class="hb-model-group" data-group role="group" :aria-labelledby="`${uid}-g-${g.group}`">
        <h4 :id="`${uid}-g-${g.group}`" class="hb-model-gh">{{ g.group }}</h4>
        <ul class="hb-model-rows">
          <li
            v-for="r in g.rows"
            :key="r.id"
            class="hb-model"
            data-row
            :class="[`is-${stateOf(r).state}`, { 'is-off': off(r), 'is-chosen': r.id === selected }]"
          >
            <button
              type="button"
              class="hb-model-pick"
              :data-model="r.id"
              :data-search="searchText(r)"
              role="radio"
              :aria-checked="r.id === selected"
              :aria-disabled="off(r) ? 'true' : undefined"
              :aria-describedby="off(r) || stateOf(r).error ? `${uid}-${r.id}-why` : undefined"
            >
              <span v-if="props.variant === 'tiers'" class="hb-model-icon"><slot name="icon" :record="r" /></span>
              <span class="hb-model-head">
                <span class="hb-model-name">{{ nameOf(r) }}</span>
                <span v-if="r.badge" class="hb-model-badge">{{ r.badge }}</span>
                <span v-if="r.id === props.defaultId" class="hb-model-def">picked for this machine</span>
              </span>
              <span v-if="r.id === props.defaultId && props.defaultWhy" class="hb-model-defwhy">{{ props.defaultWhy }}</span>
              <span v-if="r.note" class="hb-model-note">{{ r.note }}</span>
              <span class="hb-model-meta">{{ sizeText(r.sizeMB, r.sizeSource) }}<template v-if="vramText(r)">. {{ vramText(r) }}</template></span>
              <span class="hb-model-tags">
                <span v-if="r.censorship" class="hb-model-cens" :class="`is-${r.censorship}`">{{ CENSORSHIP[r.censorship].word }}</span>
                <span v-if="fitOf(r)" class="hb-model-fit" :class="fitClass(fitOf(r)!)"><span class="hb-sr">fit here: </span>{{ fitOf(r)!.fit }}</span>
                <span v-for="t in r.tags ?? []" :key="t" class="hb-model-tag">{{ t }}</span>
                <span v-if="STATE_WORDS[stateOf(r).state]" class="hb-model-state">{{ STATE_WORDS[stateOf(r).state] }}</span>
              </span>
              <span v-if="props.variant === 'tiers' && r.tier" class="hb-model-bar" aria-hidden="true"><i :style="{ width: (TIER_BAR[r.tier] ?? 50) + '%' }" /></span>
            </button>
            <div v-if="props.actions" class="hb-model-acts">
              <template v-for="a in actions(r)" :key="a.verb">
                <button
                  type="button"
                  class="hb-btn hb-btn-2 hb-btn-sm"
                  :class="{ 'hb-btn-danger': a.verb === 'remove' && arming === r.id }"
                  data-act
                  :disabled="a.disabled"
                  @click="act(r, a.verb)"
                >{{ a.text }}<span class="hb-sr">, {{ nameOf(r) }}</span></button>
              </template>
              <button v-if="arming === r.id" type="button" class="hb-btn hb-btn-2 hb-btn-sm" data-act @click="arming = null">keep</button>
            </div>
            <HbProgress
              v-if="stateOf(r).state === 'downloading'"
              :loaded="stateOf(r).loaded ?? 0"
              :total="stateOf(r).total ?? null"
              state="running"
              phase="download"
              :actions="false"
              :live="false"
              :label="nameOf(r)"
            />
            <p v-if="off(r) || stateOf(r).error" :id="`${uid}-${r.id}-why`" class="hb-model-why" :class="{ 'is-fault': !!stateOf(r).error }">{{ stateOf(r).error || fitOf(r)!.reason }}</p>
            <HbLicence :licence="r.licence" :commercial="r.commercial" quiet />
            <div v-if="r.id === selected && (factLine(r) || r.notes?.length || ctxChips.length)" class="hb-model-detail">
              <p v-if="factLine(r)" class="hb-model-facts">{{ factLine(r) }}</p>
              <ul v-if="r.notes?.length" class="hb-model-notes"><li v-for="n in r.notes" :key="n">{{ n }}</li></ul>
              <div v-if="ctxChips.length" class="hb-model-ctx">
                <span class="hb-model-ctxlabel">context</span>
                <HbChipGroup v-model="ctxValue" :options="ctxChips" toggle label="context size" />
                <span v-if="ctxChips.some((c) => c.disabled)" class="hb-model-ctxnote">larger sizes are off: this build stops at {{ Math.round((r.ctx ?? 0) / 1024) }}k.</span>
              </div>
            </div>
          </li>
        </ul>
      </section>
      <p v-if="!groups.length" class="hb-model-empty">{{ props.records.length ? props.empty : 'no models registered.' }}</p>
    </div>
    <slot name="custom" />
    <p class="hb-model-echo" role="status" aria-live="polite">{{ echo }}</p>
  </div>
</template>
