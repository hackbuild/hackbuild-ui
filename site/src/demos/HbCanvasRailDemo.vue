<script setup lang="ts">
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = "<HbCanvasRail :tabs=\"tabs\">\n  <template #tools><button class=\"hb-iconbtn\" aria-pressed=\"true\">...</button></template>\n  <canvas />\n</HbCanvasRail>"
</script>

<template>
  <DemoSection title="Canvas and rail" note="After mask-studio-sam: the icon tool rail at the left, the canvas fills, the rack at the right. The empty state lives in the canvas." :code="code">
    <p><a href="#/layouts/canvas-rail">open the live demo</a>, or look at it below at 900 by 560.</p>
    <iframe src="#/layouts/canvas-rail" title="canvas and rail demo" width="900" height="560" style="max-width:100%;border:var(--hb-border) solid var(--hb-ink)" loading="lazy" />
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'tabs', type: 'RackTab[]' },
      { prop: 'toolsLabel', type: 'string', default: 'tools' },
      { prop: 'slots', type: 'bar, tools, default, inset, verbs, tab-<id>, detail' },
    ]"
  />
</template>
