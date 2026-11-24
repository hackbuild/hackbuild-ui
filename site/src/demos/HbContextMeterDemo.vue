<script setup lang="ts">
import { ref } from 'vue'
import { HbContextMeter, HbSlider } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const turns = ref(1800)
const segs = () => [
  { key: 'sys', label: 'instructions', tokens: 412 },
  { key: 'core', label: 'core memory', tokens: 180 },
  { key: 'rec', label: 'retrieved memory', tokens: 520 },
  { key: 'sum', label: 'rolling summary', tokens: 240 },
  { key: 'turns', label: 'recent turns', tokens: turns.value },
]
const code = `<HbContextMeter :segments="[{ key: 'sys', label: 'instructions', tokens: 412 }, ...]" :budget="4096" @new="newChat" @trim="dropOldest" />
<HbContextMeter pill :segments="segs" :budget="4096" />`
</script>

<template>
  <DemoSection
    title="Context meter"
    note="What fills the context this turn, by source, against the model's window. Amber from 75 percent; at 95 percent the banner names the cause and carries both fixes. The pill fits a header."
    :code="code"
  >
    <div class="demo-col" style="max-width: 640px">
      <HbSlider v-model="turns" label="recent turns" :min="0" :max="3000" :step="50" unit="tok" />
      <HbContextMeter :segments="segs()" :budget="4096" />
      <div class="demo-row"><HbContextMeter pill :segments="segs()" :budget="4096" /><HbContextMeter pill :segments="segs()" :budget="16384" /></div>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'segments', type: '{key, label, tokens}[]' },
      { prop: 'budget', type: 'number', notes: 'the context window in tokens' },
      { prop: 'pill', type: 'boolean' },
      { prop: 'warnAt / fullAt', type: 'number', default: '0.75 / 0.95' },
      { prop: 'banner', type: 'boolean', notes: 'slot full replaces the words' },
      { prop: 'emits', type: 'new, trim' },
    ]"
  />
</template>
