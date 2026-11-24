<script setup lang="ts">
import { HbGauges, type HbGaugeRow } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const rows: HbGaugeRow[] = [
  { label: 'hunger', value: 0.42 },
  { label: 'play', value: 0.81, current: true },
  { label: 'fatigue', value: 0.18 },
  { label: 'fear', value: 0.05 },
]
const code = `<HbGauges :rows="rows" label="drives" />`
</script>

<template>
  <DemoSection title="Gauges" note="A bar per row on a fixed scale. The row the step is about is the one pink bar." :code="code">
    <div style="max-width: 420px">
      <HbGauges :rows="rows" label="drives" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'rows', type: '{label, value, display?, current?}[]' },
      { prop: 'max', type: 'number', default: '1' },
      { prop: 'label', type: 'string' },
    ]"
  />
</template>
