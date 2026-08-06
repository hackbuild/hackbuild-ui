<script setup lang="ts">
import { HbPill } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbPill status="live">streaming</HbPill>
<HbPill status="ok">adopted</HbPill>
<HbPill status="err">no device</HbPill>`
</script>

<template>
  <DemoSection
    title="Status pills"
    note="One pill in the header, showing the connection, not the task. live pulses. Pills always declare their own color: an inheriting pill went unreadable once, so the class sets it explicitly."
    :code="code"
  >
    <div class="demo-row">
      <HbPill status="live">streaming</HbPill>
      <HbPill status="ok">adopted</HbPill>
      <HbPill status="warn">clipping</HbPill>
      <HbPill status="err">no device</HbPill>
      <HbPill>idle</HbPill>
    </div>
  </DemoSection>

  <PropsTable :rows="[{ prop: 'status', type: `'none' | 'live' | 'ok' | 'warn' | 'err'`, default: `'none'` }]" />
</template>
