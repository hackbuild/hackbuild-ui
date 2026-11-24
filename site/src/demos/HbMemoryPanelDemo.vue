<script setup lang="ts">
import { computed, ref } from 'vue'
import { HbMemoryPanel, type HbMemoryEntry } from '@hackbuild/ui'
import { memoryMatch } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const kinds = ['episode', 'fact', 'rule', 'note']
const store = ref<HbMemoryEntry[]>([
  { id: 'm1', kind: 'fact', text: 'prints in petg on the creator 5 pro.', entity: 'user', when: 'nov 3 added' },
  { id: 'm2', kind: 'rule', text: 'answer in two sentences unless asked for more.', when: 'nov 2 added', pinned: true },
  { id: 'm3', kind: 'episode', text: 'we tried a 0.2 mm layer on the bail relief and the lines showed.', entity: ['bail', 'relief'], when: 'chat' },
  { id: 'm4', kind: 'note', title: 'dog', text: 'the dog is called pixel and likes the red ball.', entity: 'pixel', when: 'nov 4 added' },
])
const query = ref('')
const kind = ref('')
const shown = computed(() => memoryMatch(store.value, { query: query.value }))
const used = computed(() => store.value.slice(0, 2).map((m, i) => ({ ...m, score: [0.82, 0.61][i] })))
const storage = ref({ used: 13_421_000, quota: 10_700_000_000, persisted: false })
let n = 5
const add = (e: { text: string; kind: string }) => store.value.push({ id: `m${n++}`, ...e, when: 'just now' })
const edit = (id: string, text: string) => { const m = store.value.find((x) => x.id === id); if (m) m.text = text }
const pin = (id: string, on: boolean) => { const m = store.value.find((x) => x.id === id); if (m) m.pinned = on }
const forget = (id: string) => { store.value = store.value.filter((m) => m.id !== id) }

const code = `<HbMemoryPanel
  v-model:query="query" :items="ranked" :all="store" :kinds="['episode', 'fact', 'rule', 'note']"
  :storage="estimate" :last-used="lastUsed" search-mode="hybrid keyword and vector"
  @search="rank" @add="add" @edit="edit" @forget="forget" @pin="pin"
  @export="save" @import="load" @wipe="wipe" @persist="persist" />`
</script>

<template>
  <DemoSection
    title="Memory panel"
    note="Add, inspect, test, move and erase in one place. The search runs the same ranker the chat uses (here a keyword stub); the count line doubles as a legend; forget and erase each ask once in place. Storage line with keep asks the browser not to clear it."
    :code="code"
  >
    <div style="max-width: 560px">
      <HbMemoryPanel
        v-model:query="query"
        v-model:kind="kind"
        :items="shown"
        :all="store"
        :kinds="kinds"
        :storage="storage"
        :last-used="used"
        search-mode="keyword stub, no model"
        @add="add"
        @edit="edit"
        @forget="forget"
        @pin="pin"
        @wipe="store = []"
        @persist="storage = { ...storage, persisted: true }"
      />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'items', type: 'HbMemoryEntry[]', notes: 'what to list: all, or ranked hits with score; pinned passes to each row' },
      { prop: 'all', type: 'HbMemoryEntry[]', notes: 'store totals for the count line' },
      { prop: 'kinds', type: 'string[]' },
      { prop: 'storage', type: '{used, quota, persisted}' },
      { prop: 'lastUsed', type: 'HbMemoryEntry[]' },
      { prop: 'searchMode', type: 'string' },
      { prop: 'readonly', type: 'boolean' },
      { prop: 'v-model:query / v-model:kind', type: 'string' },
      { prop: 'emits', type: 'search (250 ms), add, edit, forget, pin(id, next), export, import, wipe, persist' },
    ]"
  />
</template>
