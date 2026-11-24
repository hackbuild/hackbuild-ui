<script setup lang="ts">
import { ref } from 'vue'
import { HbModelList, type HbModelStatus, type HbModelVerb } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { catalogue, fits, fitsNoGpu, groupOrder } from '../fixtures/models'

const picked = ref<string | null>('hermes-3-llama-3.2-3b-mlc')
const ctx = ref<number | null>(null)
const states = ref<Record<string, HbModelStatus>>({
  'smollm2-360m-instruct': { state: 'stored' },
  'qwen2.5-1.5b-instruct-mlc': { state: 'downloading', loaded: 312 * 1024 * 1024, total: 828 * 1024 * 1024 },
  'qwen3-0.6b': { state: 'fault', error: 'the download stopped at 41 percent: the network dropped. press try again.' },
})
function onAct(id: string, verb: HbModelVerb) {
  const next = { ...states.value }
  if (verb === 'download' || verb === 'retry') next[id] = { state: 'downloading', loaded: 0, total: null }
  else if (verb === 'cancel' || verb === 'remove') delete next[id]
  else if (verb === 'load') next[id] = { state: 'loaded' }
  else if (verb === 'unload') next[id] = { state: 'stored' }
  states.value = next
}
const tierPick = ref<string | null>(null)
const tiers = catalogue.filter((r) => r.tier && r.group !== 'uncensored')
const code = `<HbModelList
  v-model="picked"
  v-model:ctx="ctx"
  :records="CATALOG"
  :fits="fits"          // fitOf(record, env, estimate) per id
  :states="states"      // none, downloading, stored, loaded, fault
  :group-order="['no download', 'start here', 'good', 'uncensored']"
  :ctx-sizes="[2048, 4096, 8192]"
  default-id="hermes-3-llama-3.2-3b-mlc"
  actions
  @act="(id, verb) => hub[verb](id)"
/>`
</script>

<template>
  <DemoSection
    title="The chat catalogue"
    note="Real rows from the models catalogue. Groups with sticky heads, rows by size. Each row: the owner's label, censorship tag, size with its source word, vram as a second figure, licence as recorded, and a fit chip for this machine. A row it cannot run stays listed with the reason. Arrows move between rows, Tab reaches the row's action. The chosen row opens its fact line and context sizes; sizes over the build's limit are off."
    :code="code"
  >
    <div style="max-width: 640px">
      <HbModelList
        v-model="picked"
        v-model:ctx="ctx"
        :records="catalogue"
        :fits="fits"
        :states="states"
        :group-order="groupOrder"
        :ctx-sizes="[2048, 4096, 8192]"
        default-id="hermes-3-llama-3.2-3b-mlc"
        default-why="largest start here row that fits 3.6 gb (8 gb memory or more, webgpu)."
        actions
        @act="onAct"
      >
        <template #guide>
          <p class="hb-model-legend">picking guide: <b>hermes 3 3b</b> best small pick, tool calls. <b>qwen2.5 1.5b</b> neat with structure, less memory. <b>llama 3.2 1b</b> the only row under 1 GB on a gpu; expect misfires.</p>
        </template>
      </HbModelList>
    </div>
  </DemoSection>

  <DemoSection
    title="No gpu"
    note="The same rows on a machine with no webgpu adapter: the gpu rows are off with the reason, two rows fit on cpu, slowly."
  >
    <div style="max-width: 640px">
      <HbModelList :records="catalogue" :fits="fitsNoGpu" :group-order="groupOrder" :search="false" :legend="false" />
    </div>
  </DemoSection>

  <DemoSection
    title="Tiers"
    note="For a character app: the icon slot and a capability bar from the record tier. The line under the list echoes the pick."
  >
    <div style="max-width: 520px">
      <HbModelList v-model="tierPick" :records="tiers" :fits="fits" variant="tiers" :search="false" :filters="false" :legend="false">
        <template #icon="{ record }">
          <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" /><rect x="8" y="10" width="4" height="4" fill="currentColor" /><rect x="20" y="10" width="4" height="4" fill="currentColor" /><rect x="8" :y="record.tier === 'tiny' ? 22 : 20" :width="record.tier === 'tiny' ? 16 : 16" :height="record.tier === 'tiny' ? 2 : 4" fill="currentColor" /></svg>
        </template>
      </HbModelList>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'records', type: 'HbModelRecord[]', notes: 'structural ModelRecord: label, badge, group, note, sizeMB, sizeSource, params, quant, vramMB, censorship, tags, tier, licence, commercial, notes, ctx' },
      { prop: 'fits', type: 'Record<id, {fit, ok, reason}>', notes: 'from fitOf; not ok disables the row' },
      { prop: 'states', type: 'Record<id, {state, loaded, total, error}>' },
      { prop: 'actions', type: 'boolean', default: 'false', notes: 'download with the size, cancel, load, remove with an in place confirm, unload, try again' },
      { prop: 'groupOrder', type: 'string[]' },
      { prop: 'defaultId / defaultWhy', type: 'string' },
      { prop: 'search / filters / legend', type: 'boolean', default: 'true' },
      { prop: 'variant', type: `'rows' | 'tiers'`, default: `'rows'` },
      { prop: 'ctxSizes', type: 'number[]', notes: 'with v-model:ctx' },
      { prop: 'v-model', type: 'string | null' },
      { prop: 'slots', type: 'guide, icon, custom' },
      { prop: 'emits', type: 'pick(id), act(id, verb)' },
    ]"
  />
</template>
