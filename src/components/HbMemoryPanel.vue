<script lang="ts">
let seq = 0
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import HbMemoryItem from './HbMemoryItem.vue'
import HbChipGroup from './HbChipGroup.vue'
import { memoryCounts, type MemoryEntry } from '../vanilla/memory'
import { storageText, type StorageLine } from '../vanilla/rack'

export type HbMemoryEntry = MemoryEntry

export interface Props {
  /** What to list: everything, or the ranked hits for the query. */
  items: HbMemoryEntry[]
  /** Kinds in count order; also the filter chips and the add select. */
  kinds?: string[]
  /** Store totals for the count line. Default: `items`. */
  all?: HbMemoryEntry[]
  /** store.estimate() plus navigator.storage.persisted(). */
  storage?: StorageLine | null
  /** What the last reply was fed, best first. */
  lastUsed?: HbMemoryEntry[]
  /** How search ranks: 'hybrid keyword and vector'. */
  searchMode?: string
  /** Private chat or a shared character: read only. */
  readonly?: boolean
  /** Wait this long after typing before `search`. Default 250 ms. */
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  kinds: () => [],
  all: undefined,
  storage: null,
  lastUsed: () => [],
  searchMode: '',
  readonly: false,
  debounceMs: 250,
})

const query = defineModel<string>('query', { default: '' })
/** The kind filter; '' lists every kind. */
const kind = defineModel<string>('kind', { default: '' })

const emit = defineEmits<{
  search: [query: string]
  add: [entry: { text: string; kind: string }]
  edit: [id: string, text: string]
  forget: [id: string]
  /** Pin or unpin a row: the next state. */
  pin: [id: string, pinned: boolean]
  export: []
  import: [file: File]
  wipe: []
  persist: []
}>()

seq += 1
const uid = `hb-mem-${seq}`

const counts = computed(() => memoryCounts(props.all ?? props.items, props.kinds))
const shown = computed(() => (kind.value ? props.items.filter((m) => m.kind === kind.value) : props.items))
const usedIds = computed(() => new Set(props.lastUsed.map((m) => m.id)))

let timer: ReturnType<typeof setTimeout> | undefined
watch(query, (q) => {
  clearTimeout(timer)
  timer = setTimeout(() => emit('search', q.trim()), props.debounceMs)
})

const note = ref('')
const noteKind = ref(props.kinds.includes('note') ? 'note' : props.kinds[0] ?? 'note')
function add() {
  const text = note.value.trim()
  if (!text) return
  emit('add', { text, kind: noteKind.value })
  note.value = ''
}
function noteKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); add() }
}

const file = ref<HTMLInputElement | null>(null)
function picked() {
  const f = file.value?.files?.[0]
  if (f) emit('import', f)
  if (file.value) file.value.value = ''
}

const armed = ref(false)
let armTimer: ReturnType<typeof setTimeout> | undefined
function wipe() {
  if (!armed.value) {
    armed.value = true
    clearTimeout(armTimer)
    armTimer = setTimeout(() => { armed.value = false }, 4000)
    return
  }
  clearTimeout(armTimer)
  armed.value = false
  emit('wipe')
}
onBeforeUnmount(() => { clearTimeout(timer); clearTimeout(armTimer) })
</script>

<template>
  <!-- One surface: what is stored and where, a search that runs the live
       ranker, what the last reply used, add, the typed list with forget,
       and export, import, erase. -->
  <section class="hb-mempanel" aria-label="memory">
    <div class="hb-mempanel-sec">
      <p class="hb-mempanel-counts">{{ counts }}</p>
      <div v-if="props.storage" class="hb-mempanel-store">
        <p class="hb-mempanel-line">{{ storageText(props.storage) }}</p>
        <button v-if="!props.storage.persisted" type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('persist')">keep</button>
      </div>
    </div>

    <div class="hb-mempanel-sec">
      <h3 :id="`${uid}-s`" class="hb-mempanel-hd">search</h3>
      <input
        v-model="query"
        class="hb-input"
        type="search"
        placeholder="try a search"
        :aria-labelledby="`${uid}-s`"
        :aria-describedby="props.searchMode ? `${uid}-m` : undefined"
      />
      <p v-if="props.searchMode" :id="`${uid}-m`" class="hb-mempanel-line">search: {{ props.searchMode }}</p>
      <HbChipGroup v-if="props.kinds.length > 1" v-model="kind" :options="props.kinds" off="all" label="kind" toggle />
    </div>

    <div v-if="props.lastUsed.length" class="hb-mempanel-sec">
      <h3 class="hb-mempanel-hd">last reply used ({{ props.lastUsed.length }})</h3>
      <div class="hb-mempanel-list">
        <HbMemoryItem v-for="m in props.lastUsed" :key="m.id" :text="m.text" :kind="m.kind" :title="m.title" :entity="m.entity" :score="m.score" :when="m.when" readonly />
      </div>
    </div>

    <div v-if="!props.readonly" class="hb-mempanel-sec">
      <h3 :id="`${uid}-a`" class="hb-mempanel-hd">add a note</h3>
      <textarea v-model="note" class="hb-textarea" rows="2" placeholder="a fact to keep" :aria-labelledby="`${uid}-a`" @keydown="noteKey" />
      <div class="hb-mempanel-row">
        <select v-if="props.kinds.length > 1" v-model="noteKind" class="hb-select" aria-label="kind">
          <option v-for="k in props.kinds" :key="k" :value="k">{{ k }}</option>
        </select>
        <button type="button" class="hb-btn hb-btn-sm" :disabled="!note.trim()" @click="add">add</button>
      </div>
    </div>

    <div class="hb-mempanel-sec">
      <h3 class="hb-mempanel-hd">{{ query.trim() ? 'matches' : 'notes' }} ({{ shown.length }})</h3>
      <p v-if="!shown.length" class="hb-mempanel-empty">{{ query.trim() ? 'nothing matches. try other words.' : 'nothing stored yet. add a note, or talk and it fills.' }}</p>
      <div v-else class="hb-mempanel-list">
        <HbMemoryItem
          v-for="m in shown"
          :key="m.id"
          :text="m.text"
          :kind="m.kind"
          :title="m.title"
          :entity="m.entity"
          :score="m.score"
          :when="m.when"
          :used="usedIds.has(m.id)"
          :pinned="!!m.pinned"
          :readonly="props.readonly"
          @pin="emit('pin', m.id, $event)"
          @edit="emit('edit', m.id, $event)"
          @forget="emit('forget', m.id)"
        />
      </div>
    </div>

    <div class="hb-mempanel-foot">
      <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('export')">export</button>
      <template v-if="!props.readonly">
        <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="file?.click()">import</button>
        <input ref="file" type="file" accept=".json,application/json" class="hb-sr" tabindex="-1" aria-hidden="true" @change="picked" />
        <button
          type="button"
          class="hb-btn hb-btn-2 hb-btn-sm hb-mempanel-wipe"
          :class="{ 'is-armed': armed }"
          :aria-label="armed ? 'press again to erase all memory' : 'erase all memory'"
          @click="wipe"
        >{{ armed ? 'erase everything?' : 'erase all' }}</button>
      </template>
    </div>
  </section>
</template>
