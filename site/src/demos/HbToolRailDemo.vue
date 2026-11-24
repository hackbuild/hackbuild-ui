<script setup lang="ts">
import { ref } from 'vue'
import { HbStage, HbToolRail, type HbRailTool } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const tool = ref('wand')
const strip = ref('move')
const tools: HbRailTool[] = [
  { id: 'segment', label: 'segment', icon: 'crosshairs', key: 'a', hint: 'click to add a point, shift click to subtract' },
  { id: 'wand', label: 'magic wand', icon: 'wand', key: 'w', hint: 'click a colour, drag to widen the tolerance' },
  { id: 'brush', label: 'brush', icon: 'pen', key: 'b', hint: 'drag to paint, [ and ] change the size' },
  { id: 'erase', label: 'eraser', icon: 'minus', key: 'e', hint: 'drag to erase the mask' },
  { id: 'pan', label: 'pan', icon: 'grip', key: 'h', hint: 'drag to pan, or hold space with any tool' },
]
const phone: HbRailTool[] = [
  { id: 'move', label: 'move', icon: 'grip', hint: 'drag a layer to move it' },
  { id: 'erase', label: 'erase', icon: 'minus', hint: 'drag to erase' },
  { id: 'restore', label: 'restore', icon: 'undo', hint: 'drag to bring back what was erased' },
]

const code = `<HbToolRail v-model="tool" :tools="[{ id: 'brush', label: 'brush', icon: 'pen', key: 'b', hint: '...' }]" />`
</script>

<template>
  <DemoSection
    title="Tools with their letters"
    note="The letters printed on the buttons, the keydown map and the key map come from one table. Up and down move along the rail. The hint pill states the gesture for the tool that is on. Letters hide on a touch screen."
    :code="code"
  >
    <div class="demo-row" style="align-items: flex-start">
      <HbToolRail v-model="tool" :tools="tools" />
      <span>tool: <code>{{ tool }}</code>; press w, b, e</span>
    </div>
  </DemoSection>

  <DemoSection title="Across a stage" note="horizontal, no letters, over the stage on a phone.">
    <HbStage style="min-height: 120px; padding: 12px">
      <HbToolRail v-model="strip" :tools="phone" orientation="horizontal" :keys="false" label="artboard tools" />
    </HbStage>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'tools', type: 'HbRailTool[]', notes: '{ id, label, icon, key, hint }' },
      { prop: 'v-model', type: 'string', notes: 'the tool that is on' },
      { prop: 'orientation', type: `'vertical' | 'horizontal'`, default: `'vertical'` },
      { prop: 'keys', type: 'boolean', default: 'true', notes: 'bind the letters in the shared registry' },
      { prop: 'showHint', type: 'boolean', default: 'true' },
    ]"
  />
</template>
