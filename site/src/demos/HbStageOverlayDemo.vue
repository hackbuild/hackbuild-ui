<script setup lang="ts">
import { HbHudStat, HbMaterials, HbStageOverlay, HbStatusLine, HbTag } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const slots = [
  { slot: 1, color: 'var(--hb-paper)', material: 'pla white', role: 'body' },
  { slot: 2, color: 'var(--hb-ink)', material: 'conductive pla', role: 'traces' },
]
const code = `<HbStageOverlay graph>
  <canvas />
  <template #tl><HbTag>top</HbTag></template>
  <template #tr><HbMaterials :slots="slots" variant="legend" /></template>
  <template #bl><HbHudStat label="fps" :value="59.9" /></template>
  <template #br>building</template>
</HbStageOverlay>`
</script>

<template>
  <DemoSection title="Stage overlay" note="The stage with four corners and a centre for overlays. Nothing else sits on it." :code="code">
    <HbStageOverlay graph>
      <div style="height: 240px" aria-hidden="true" />
      <template #tl><HbTag>top</HbTag></template>
      <template #tr><HbMaterials :slots="slots" variant="legend" /></template>
      <template #bl><HbHudStat label="fps" :value="59.9" /></template>
      <template #br><HbStatusLine kind="busy" text="building" /></template>
    </HbStageOverlay>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'graph', type: 'boolean', default: 'false' },
      { prop: 'quiet', type: 'boolean', default: 'false', notes: 'drops the pink shadow' },
      { prop: 'slots', type: 'default, tl, tr, bl, br, center; b, telemetry, hint, caption, pad' },
    ]"
  />
</template>
