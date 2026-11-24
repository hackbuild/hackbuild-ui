<script setup lang="ts">
import { ref } from 'vue'
import { HbChip } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const webusb = ref(true)
const serial = ref(false)
const webgpu = ref(false)
const held = ref(false)
const marker = ref(false)

const code = `<HbChip v-model="webusb">webusb</HbChip>
<HbChip v-model="serial">web serial</HbChip>
<HbChip v-model="held" hotkey="1" hotkey-label="hold label rest">rest</HbChip>`
</script>

<template>
  <DemoSection title="Filter chips" note="Multi select toggles. On state fills pink." :code="code">
    <div class="demo-row">
      <HbChip v-model="webusb">webusb</HbChip>
      <HbChip v-model="serial">web serial</HbChip>
      <HbChip v-model="webgpu">webgpu</HbChip>
      <HbChip disabled>bluetooth</HbChip>
    </div>
    <div class="demo-row" style="margin-top: 12px">
      <HbChip v-model="held" toggle hotkey="1" hotkey-label="hold label rest">rest</HbChip>
      <HbChip v-model="marker" toggle hotkey="m" hotkey-label="drop a marker">marker</HbChip>
    </div>
    <p style="margin: 12px 0 0">
      on: <span class="hb-readout" style="font-size: 16px">{{ [webusb && 'webusb', serial && 'serial', webgpu && 'webgpu'].filter(Boolean).join(' ') || 'none' }}</span>
    </p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'boolean', notes: 'on state, optional' },
      { prop: 'disabled', type: 'boolean', default: 'false' },
      { prop: 'toggle', type: 'boolean', default: 'false', notes: 'ink when on' },
      { prop: 'hotkey', type: 'string', notes: 'shown on the chip, bound in the shared registry; the key hides on a coarse pointer' },
      { prop: 'hotkeyLabel / hotkeyGroup', type: 'string', default: `'' / 'labels'` },
    ]"
  />
</template>
