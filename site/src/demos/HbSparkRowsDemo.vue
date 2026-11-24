<script setup lang="ts">
import { HbSparkRows, type HbSparkRow } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const wave = (n: number, base: number, amp: number, drift: number) =>
  Array.from({ length: n }, (_, i) => Math.min(1, Math.max(0, base + drift * i + amp * Math.sin(i / 6))))
const rows: HbSparkRow[] = [
  { label: 'play', values: wave(90, 0.4, 0.06, 0.0045), threshold: 0.7, ticks: [42, 77], current: true },
  { label: 'hunger', values: wave(90, 0.3, 0.02, 0.0015) },
  { label: 'fatigue', values: wave(90, 0.6, 0.03, -0.003) },
]
const code = `<HbSparkRows :rows="rows" label="dog drives" :window="120" />`
</script>

<template>
  <DemoSection title="Spark rows" note="Recent history per row with the figure and a trend word. The dashed rule is where something fires, ticks are where the agent switched. Press a row for the larger chart." :code="code">
    <div style="max-width: 560px">
      <HbSparkRows :rows="rows" label="dog drives" :window="120" :announce="false" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'rows', type: '{id?, label, values[], value?, display?, threshold?, ticks?, current?, state?}[]' },
      { prop: 'min / max', type: 'number', default: '0 / 1' },
      { prop: 'window', type: 'number', default: '120', notes: 'seconds, for the trend words' },
      { prop: 'trendSamples', type: 'number', default: '60' },
      { prop: 'expandable', type: 'boolean', default: 'true' },
      { prop: 'announce / announceGap', type: 'boolean / number' },
      { prop: '@open', type: '(id: string | null)' },
    ]"
  />
</template>
