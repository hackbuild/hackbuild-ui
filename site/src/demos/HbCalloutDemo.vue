<script setup lang="ts">
import { HbButton, HbCallout } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbCallout>Direct sampling below 24 MHz needs the bias tee off.</HbCallout>
<HbCallout variant="err">The dongle dropped 41 samples.</HbCallout>
<HbCallout variant="warn" title="context full">
  the context is full. start a new chat, or drop the oldest turns.
  <template #actions><HbButton size="sm" @click="newChat">new chat</HbButton> ...</template>
</HbCallout>`
</script>

<template>
  <DemoSection
    title="Variants"
    note="Pink is emphasis, one or two per page. The signal variants are for data commentary only, never decoration."
    :code="code"
  >
    <div class="demo-col" style="gap: 0">
      <HbCallout>Direct sampling below 24 MHz needs the bias tee off.</HbCallout>
      <HbCallout variant="ok">Capture complete. 214 packets, zero loss.</HbCallout>
      <HbCallout variant="warn">Bias tee feeds 4.5 V up the coax.</HbCallout>
      <HbCallout variant="err">The dongle dropped 41 samples in the last second.</HbCallout>
      <HbCallout variant="info" style="margin-bottom: 0">Frequencies below are for region 2.</HbCallout>
    </div>
  </DemoSection>

  <DemoSection title="Title and fixes" note="A banner that names the cause carries the fixes inline. The err variant is announced as an alert.">
    <div class="demo-col" style="gap: 0; max-width: 560px">
      <HbCallout variant="warn" title="context full">
        the context is full. start a new chat, or drop the oldest turns.
        <template #actions>
          <HbButton size="sm">new chat</HbButton>
          <HbButton size="sm" variant="secondary">drop oldest turns</HbButton>
        </template>
      </HbCallout>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'variant', type: `'pink' | 'ok' | 'warn' | 'err' | 'info'`, default: `'pink'` },
      { prop: 'title', type: 'string' },
      { prop: 'slots', type: 'default, actions' },
    ]"
  />
</template>
