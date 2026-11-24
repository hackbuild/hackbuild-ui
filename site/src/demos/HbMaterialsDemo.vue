<script setup lang="ts">
import { HbMaterials, HbStage, type HbMaterialSlot } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const slots: HbMaterialSlot[] = [
  { slot: 1, color: 'var(--hb-paper)', material: 'pla white', parts: 'case, lid', role: 'body' },
  { slot: 2, color: 'var(--hb-ink)', material: 'conductive pla, 0.6 ohm cm (vendor)', parts: 'traces', role: 'traces' },
  { slot: 3, color: 'var(--hb-plate-teal)', material: 'tpu 95a', parts: 'keys', role: 'keys' },
]
const code = `<HbMaterials :slots="slots" variant="rail" />`
</script>

<template>
  <DemoSection title="Materials" note="The slots of a multi material print: swatch, material as the slicer names it, and the parts that print in it." :code="code">
    <div style="max-width: 360px">
      <HbMaterials :slots="slots" />
    </div>
  </DemoSection>
  <DemoSection title="Legend and chips" note="legend sits on the stage, chips collapses it for the status strip.">
    <div class="demo-col">
      <HbStage label="legend"><HbMaterials :slots="slots" variant="legend" /></HbStage>
      <HbMaterials :slots="slots" variant="chips" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'slots', type: '{slot, color, material, parts?, role?}[]' },
      { prop: 'variant', type: `'rail' | 'legend' | 'chips'`, default: 'rail' },
      { prop: 'label', type: 'string', default: 'materials' },
    ]"
  />
</template>
