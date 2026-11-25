<script setup lang="ts">
import { HbGateCheck } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbGate ...>
  <template #checks>
    <HbGateCheck label="thinking" state="load" :value="0.4" />
    <HbGateCheck label="voice" state="ok" />
  </template>
</HbGate>`
</script>

<template>
  <DemoSection title="Gate check" note="One part on a gate card, after ferrule: a VT323 label, a thin bar that fills pink while loading and green when ready, and the words at the right." :code="code">
    <div style="max-width:480px;display:flex;flex-direction:column;gap:8px">
      <HbGateCheck label="thinking" state="load" :value="0.4" />
      <HbGateCheck label="voice" state="ok" />
      <HbGateCheck label="memory" />
      <HbGateCheck label="body" state="err" :value="0.3" note="no gpu memory left" />
    </div>
  </DemoSection>
  <PropsTable :rows="[{ prop: 'label', type: 'string' }, { prop: 'value', type: 'number, 0 to 1', default: '0' }, { prop: 'state', type: 'wait | load | ok | err', default: 'wait' }, { prop: 'note', type: 'string' }]" />
</template>
