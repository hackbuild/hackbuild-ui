<script setup lang="ts">
import { computed, ref } from 'vue'
import HbModelList, { type HbModelFit, type HbModelRecord, type HbModelStatus, type HbModelVerb } from './HbModelList.vue'
import HbReasons, { type HbReasonRow } from './HbReasons.vue'
import { mbText } from '../vanilla/models'
import { storageText, type StorageLine } from '../vanilla/rack'
import { uid as makeUid } from '../utils/uid'

export interface HbStoredWeight {
  /** Store key, or the record id for a webllm entry. */
  key: string
  label?: string
  bytes: number | null
  /** 'today', '3 days ago'. */
  lastUsed?: string
  /** Who keeps it: the weight store, or webllm's own cache. */
  keeper?: 'store' | 'webllm'
}

export interface HbResident {
  id: string
  label?: string
  mb: number | null
  sharedWith?: string[]
}

export type HbStorage = StorageLine

interface Props {
  records: HbModelRecord[]
  fits?: Record<string, HbModelFit | undefined>
  states?: Record<string, HbModelStatus | undefined>
  stored?: HbStoredWeight[]
  resident?: HbResident[]
  /** store.estimate() plus navigator.storage.persisted(). */
  estimate?: StorageLine | null
  /** The probe in one line. */
  machine?: string
  /** suggestDefaults reasons. */
  reasons?: HbReasonRow[]
  groupOrder?: string[]
  defaultId?: string | null
  defaultWhy?: string
  /** Budget sentence: 'unloads least recently used past 3.6 gb (proposed).' */
  policy?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  fits: () => ({}),
  states: () => ({}),
  stored: () => [],
  resident: () => [],
  estimate: null,
  machine: '',
  reasons: () => [],
  groupOrder: () => [],
  defaultId: null,
  defaultWhy: '',
  policy: '',
  label: 'models',
})

const picked = defineModel<string | null>({ default: null })

const emit = defineEmits<{
  pick: [id: string]
  load: [id: string]
  cancel: [id: string]
  unload: [id: string]
  evict: [key: string]
  persist: []
  edit: [key: string]
}>()

const uid = makeUid('hb-mm')
function onAct(id: string, verb: HbModelVerb) {
  if (verb === 'download' || verb === 'load' || verb === 'retry') emit('load', id)
  else if (verb === 'cancel') emit('cancel', id)
  else if (verb === 'unload') emit('unload', id)
  else if (verb === 'remove') emit('evict', id)
}

const nameOf = (id: string) => {
  const r = props.records.find((x) => x.id === id)
  return r?.label || id
}
const keepers = computed(() =>
  (['store', 'webllm'] as const)
    .map((k) => ({ k, label: k === 'store' ? 'kept by the weight store' : 'kept by webllm', rows: props.stored.filter((s) => (s.keeper ?? 'store') === k) }))
    .filter((g) => g.rows.length),
)
const residentMB = computed(() => props.resident.reduce((a, r) => a + (r.mb ?? 0), 0))

const arming = ref<string | null>(null)
function evict(key: string) {
  if (arming.value !== key) {
    arming.value = key
    return
  }
  arming.value = null
  emit('evict', key)
}
function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && arming.value) {
    arming.value = null
    e.stopPropagation()
  }
}
</script>

<template>
  <div class="hb-mm" :aria-label="props.label" role="region" @keydown="onEsc">
    <section class="hb-mm-sec" :aria-labelledby="`${uid}-1`">
      <h3 :id="`${uid}-1`" class="hb-mm-hd"><span class="hb-mm-n">1</span>this machine</h3>
      <slot name="machine">
        <p v-if="props.machine" class="hb-caps-machine">{{ props.machine }}</p>
        <HbReasons v-if="props.reasons.length" :rows="props.reasons" @edit="emit('edit', $event)" />
      </slot>
    </section>

    <section v-if="$slots.rack" class="hb-mm-sec" :aria-labelledby="`${uid}-2`">
      <h3 :id="`${uid}-2`" class="hb-mm-hd"><span class="hb-mm-n">2</span>by job</h3>
      <slot name="rack" />
    </section>

    <section class="hb-mm-sec" :aria-labelledby="`${uid}-3`">
      <h3 :id="`${uid}-3`" class="hb-mm-hd"><span class="hb-mm-n">3</span>catalogue</h3>
      <HbModelList
        v-model="picked"
        :records="props.records"
        :fits="props.fits"
        :states="props.states"
        :group-order="props.groupOrder"
        :default-id="props.defaultId"
        :default-why="props.defaultWhy"
        actions
        @pick="emit('pick', $event)"
        @act="onAct"
      >
        <template #guide><slot name="guide" /></template>
        <template #custom><slot name="custom" /></template>
      </HbModelList>
    </section>

    <section class="hb-mm-sec" :aria-labelledby="`${uid}-4`">
      <h3 :id="`${uid}-4`" class="hb-mm-hd"><span class="hb-mm-n">4</span>stored and loaded</h3>
      <div v-if="props.estimate" class="hb-mm-storage">
        <p class="hb-mm-line">{{ storageText(props.estimate) }}</p>
        <button v-if="!props.estimate.persisted" type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('persist')">keep</button>
      </div>
      <h4 class="hb-mm-sub">in memory<template v-if="props.resident.length">, {{ mbText(residentMB) }}</template></h4>
      <p v-if="!props.resident.length" class="hb-mm-empty">nothing loaded.</p>
      <ul v-else class="hb-mm-list">
        <li v-for="r in props.resident" :key="r.id" class="hb-mm-item">
          <span class="hb-mm-name">{{ r.label || nameOf(r.id) }}</span>
          <span class="hb-mm-meta">{{ r.mb === null ? 'size unknown' : mbText(r.mb) }}<template v-if="r.sharedWith?.length">. shared with: {{ r.sharedWith.join(', ') }}</template></span>
          <span class="hb-mm-acts">
            <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('unload', r.id)">unload<span class="hb-sr"> {{ r.label || nameOf(r.id) }}. the weights stay stored</span></button>
          </span>
        </li>
      </ul>
      <p v-if="props.policy" class="hb-mm-policy">{{ props.policy }}</p>
      <template v-for="g in keepers" :key="g.k">
        <h4 class="hb-mm-sub">{{ g.label }}</h4>
        <ul class="hb-mm-list">
          <li v-for="s in g.rows" :key="s.key" class="hb-mm-item">
            <span class="hb-mm-name">{{ s.label || nameOf(s.key) }}</span>
            <span class="hb-mm-meta">{{ s.bytes === null ? 'size from the storage estimate' : mbText(s.bytes / (1024 * 1024)) }}<template v-if="s.lastUsed">. last used {{ s.lastUsed }}</template></span>
            <span class="hb-mm-acts">
              <button
                type="button"
                class="hb-btn hb-btn-2 hb-btn-sm"
                :class="{ 'hb-btn-danger': arming === s.key }"
                @click="evict(s.key)"
              >{{ arming === s.key ? 'remove, press again' : 'remove' }}<span class="hb-sr"> {{ s.label || nameOf(s.key) }}</span></button>
              <button v-if="arming === s.key" type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="arming = null">keep it</button>
            </span>
          </li>
        </ul>
      </template>
      <p v-if="!props.stored.length" class="hb-mm-empty">nothing stored. a download lands here.</p>
    </section>
  </div>
</template>
