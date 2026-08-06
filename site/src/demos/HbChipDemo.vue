<script setup lang="ts">
import { ref } from 'vue'
import { HbChip } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const webusb = ref(true)
const serial = ref(false)
const webgpu = ref(false)

const code = `<HbChip v-model="webusb">webusb</HbChip>
<HbChip v-model="serial">web serial</HbChip>`
</script>

<template>
  <DemoSection title="Filter chips" note="Multi select toggles. On state fills pink." :code="code">
    <div class="demo-row">
      <HbChip v-model="webusb">webusb</HbChip>
      <HbChip v-model="serial">web serial</HbChip>
      <HbChip v-model="webgpu">webgpu</HbChip>
      <HbChip disabled>bluetooth</HbChip>
    </div>
    <p style="margin: 12px 0 0">
      on: <span class="hb-readout" style="font-size: 16px">{{ [webusb && 'webusb', serial && 'serial', webgpu && 'webgpu'].filter(Boolean).join(' ') || 'none' }}</span>
    </p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'boolean', notes: 'on state, optional' },
      { prop: 'disabled', type: 'boolean', default: 'false' },
    ]"
  />
</template>
