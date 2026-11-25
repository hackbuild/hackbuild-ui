<script setup lang="ts">
import { ref } from 'vue'
import { HbModelSelect, type ModelJob } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { useFakeLoad } from '../pages/layouts/useFakeLoad'
import { chatRows, speechRows } from '../fixtures/picker'

const { rows, load } = useFakeLoad(chatRows)
const chosen = ref('steady')
const jobs = ref<ModelJob[]>([
  { job: 'think', label: 'thinking', rows: chatRows, chosen: 'steady', required: true },
  { job: 'ears', label: 'ears', rows: speechRows, chosen: 'ears-s' },
])
function pick(id: string, job?: string) {
  jobs.value = jobs.value.map((j) => (j.job === job ? { ...j, chosen: id } : j))
}
const code = `<HbModelSelect v-model="chosen" :rows="rows" @load="load" />
<HbModelSelect v-model="chosen" :rows="rows" variant="chip" />
<HbModelSelect :jobs="jobs" :presets="presets" @choose="pick" @load="loadAll" />`
</script>

<template>
  <DemoSection title="Closed picker" note="One line naming the choice and its state, and one pink load with the size on it. It goes when the model is ready. Pressing the line opens HbModelSheet. Fixture rows; the load is fake." :code="code">
    <div style="max-width:520px;display:flex;flex-direction:column;gap:16px">
      <HbModelSelect v-model="chosen" :rows="rows" @load="load" />
      <div><HbModelSelect v-model="chosen" :rows="rows" variant="chip" /></div>
    </div>
  </DemoSection>
  <DemoSection title="Several jobs" note="One line per job and one pink load all with the total. Job lines never carry their own pink button.">
    <div style="max-width:520px">
      <HbModelSelect :jobs="jobs" :presets="[{ id: 'light', label: 'light', picks: {}, total: '470 mb' }, { id: 'best', label: 'best', picks: {}, total: '2.2 gb' }]" @choose="pick" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'rows', type: 'ModelRow[]', default: '[]' },
      { prop: 'v-model', type: 'string (chosen id)' },
      { prop: 'variant', type: `'line' | 'chip'`, default: 'line' },
      { prop: 'go', type: 'boolean', default: 'true' },
      { prop: 'jobs', type: 'ModelJob[]' },
      { prop: 'presets', type: 'ModelPreset[]' },
      { prop: 'empty', type: 'string', default: 'no model' },
      { prop: '@choose @load @cancel @remove @option @custom @preset', type: 'events' },
    ]"
  />
</template>
