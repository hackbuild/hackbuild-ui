<script setup lang="ts">
import { ref } from 'vue'
import { HbModelManager, HbModelRack, type HbModelStatus, type HbRackSlotState, type HbResident, type HbStoredWeight } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { catalogue, fits, groupOrder, machine, rackPresets, rackSlots, reasons } from '../fixtures/models'

const GB = 1024 * 1024 * 1024
const picked = ref<string | null>(null)
const states = ref<Record<string, HbModelStatus>>({ 'smollm2-360m-instruct': { state: 'loaded' }, 'qwen3-0.6b': { state: 'stored' } })
const stored = ref<HbStoredWeight[]>([
  { key: 'smollm2-360m-instruct', bytes: 370 * 1024 * 1024, lastUsed: 'today' },
  { key: 'qwen3-0.6b', bytes: 552 * 1024 * 1024, lastUsed: '3 days ago' },
  { key: 'llama-3.2-1b-instruct-mlc', bytes: null, keeper: 'webllm' },
])
const resident = ref<HbResident[]>([{ id: 'smollm2-360m-instruct', mb: 370, sharedWith: ['chat', 'room'] }])
const estimate = ref({ used: 1.9 * GB, quota: 12 * GB, persisted: false })
const picks = ref<Record<string, string>>({ brain: 'smollm2-360m-instruct' })
const rackStates = ref<Record<string, HbRackSlotState>>({ brain: { state: 'ready' } })
function evict(key: string) {
  stored.value = stored.value.filter((s) => s.key !== key)
  const next = { ...states.value }
  delete next[key]
  states.value = next
}
function unload(id: string) {
  resident.value = resident.value.filter((r) => r.id !== id)
  states.value = { ...states.value, [id]: { state: 'stored' } }
}
function load(id: string) { states.value = { ...states.value, [id]: { state: 'downloading', loaded: 0, total: null } } }
function cancel(id: string) {
  const next = { ...states.value }
  delete next[id]
  states.value = next
}
const code = `<HbDrawer v-model:open="open" side="bottom" label="models">
  <HbModelManager :records="CATALOG" :fits="fits" :states="states" :stored="stored" :resident="hub.status()"
    :estimate="await store.estimate()" :reasons="suggestDefaults(env).reasons"
    @load="hub.load" @cancel="store.cancel" @unload="hub.unload" @evict="store.evict" @persist="store.persist">
    <template #rack><HbModelRack ... /></template>
  </HbModelManager>
</HbDrawer>`
</script>

<template>
  <DemoSection
    title="The model manager"
    note="The drawer contents, top to bottom: this machine with the reasons for each default, the slot rack, the catalogue, and what is stored and loaded with the storage line and keep. Remove asks for a second press in place. Unload frees memory and keeps the weights."
    :code="code"
  >
    <div style="max-width: 720px">
      <HbModelManager
        v-model="picked"
        :records="catalogue"
        :fits="fits"
        :states="states"
        :stored="stored"
        :resident="resident"
        :estimate="estimate"
        :machine="machine"
        :reasons="reasons"
        :group-order="groupOrder"
        default-id="hermes-3-llama-3.2-3b-mlc"
        default-why="largest start here row that fits 3.6 gb (8 gb memory or more, webgpu)."
        policy="nothing unloads until 3.6 gb (proposed) is in use; then the least recently used goes, and the log says so."
        @load="load"
        @cancel="cancel"
        @unload="unload"
        @evict="evict"
        @persist="estimate = { ...estimate, persisted: true }"
      >
        <template #rack>
          <HbModelRack v-model="picks" :slots="rackSlots.slice(0, 3)" :states="rackStates" :presets="rackPresets.slice(0, 2)" />
        </template>
      </HbModelManager>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'records / fits / states', type: 'as HbModelList' },
      { prop: 'stored', type: '{key, label, bytes, lastUsed, keeper}[]', notes: 'keeper store or webllm' },
      { prop: 'resident', type: '{id, label, mb, sharedWith}[]' },
      { prop: 'estimate', type: '{used, quota, persisted}' },
      { prop: 'machine / reasons', type: 'string / HbReasonRow[]' },
      { prop: 'policy', type: 'string', notes: 'the unload rule in one line' },
      { prop: 'slots', type: 'machine, rack, guide, custom' },
      { prop: 'emits', type: 'pick, load, cancel, unload, evict, persist, edit' },
    ]"
  />
</template>
