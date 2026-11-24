<script setup lang="ts">
import { HbChecks, type HbCheckRow } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const rows: HbCheckRow[] = [
  { id: 'wall thickness', status: 'pass', value: '1.6 mm computed' },
  { id: 'overhang', status: 'fail', reason: 'lid lip at 62 degrees, over the 45 limit', value: '62 deg computed' },
  { id: 'bed fit', status: 'pass', value: '182 x 140 mm computed' },
  { id: 'trace resistance', status: 'not run', reason: 'no conductive slot chosen' },
  { id: 'slice', status: 'running' },
]
const code = `<HbChecks :rows="rows" caption="export checks" />`
</script>

<template>
  <DemoSection title="Checks" note="One row per check with its verdict, the measured figure and, when it failed or did not run, the reason in words. The head counts each status." :code="code">
    <div style="max-width: 640px">
      <HbChecks :rows="rows" caption="export checks" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'rows', type: `{id, status: 'pass' | 'fail' | 'not run' | 'running', reason?, value?}[]` },
      { prop: 'caption', type: 'string' },
    ]"
  />
</template>
