<script setup lang="ts">
import { HbReadouts } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const rows = [
  { label: 'fps p50 (measured)', value: 59.94, focal: true },
  { label: 'frame p95 (measured)', value: 18.31, unit: 'ms' },
  { label: 'heap (measured)', value: 142.6, unit: 'mb' },
  { label: 'gpu (vendor)', value: 'apple m1' },
]
const code = `<HbReadouts :rows="rows" />
<HbReadouts :rows="{ 'tris (computed)': 18432, 'draws (measured)': 41 }" />`
</script>

<template>
  <DemoSection title="Readouts" note="Label to figure rows. The label carries the source word. One focal row per view takes pink." :code="code">
    <div class="demo-grid">
      <HbReadouts :rows="rows" />
      <HbReadouts :rows="{ 'tris (computed)': 18432, 'draws (measured)': 41 }" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'rows', type: '{label, value, unit?, focal?}[] | Record<string, string | number>' },
      { prop: 'digits', type: 'number', default: '2', notes: 'numbers at 100 and over show none' },
    ]"
  />
</template>
