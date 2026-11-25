<script setup lang="ts">
import { ref } from 'vue'
import { HbGauges, HbKv, HbRack } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const tab = ref('mind')
const tabs = [{ id: 'mind', label: 'mind' }, { id: 'body', label: 'body' }, { id: 'log', label: 'log' }]
const code = `<HbRack :tabs="tabs" v-model:tab="tab">
  <template #mind>...</template>
  <template #detail>where the numbers came from</template>
</HbRack>`
</script>

<template>
  <DemoSection title="Rack" note="Three to five VT323 tabs on a light strip, the selected one ink, one pane each, and a detail fold at the foot. Every layout with a rack uses it; it carries data-ux rack." :code="code">
    <div style="width:380px;max-width:100%;height:320px;display:flex">
      <HbRack v-model:tab="tab" :tabs="tabs" style="flex:1">
        <template #mind><HbGauges :rows="[{ label: 'play', value: 0.8, current: true }, { label: 'rest', value: 0.2 }]" /></template>
        <template #body><HbKv label="speed" value="1.2 m/s" /></template>
        <template #log><HbKv label="last" value="sits" /></template>
        <template #detail>fixture numbers, made up</template>
      </HbRack>
    </div>
  </DemoSection>
  <PropsTable :rows="[{ prop: 'tabs', type: 'RackTab[]' }, { prop: 'v-model:tab', type: 'string' }, { prop: 'label', type: 'string', default: 'rack' }, { prop: 'detailLabel', type: 'string', default: 'detail' }]" />
</template>
