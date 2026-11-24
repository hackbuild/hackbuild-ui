<script setup lang="ts">
import { HbButton, HbHudStat, HbProgress, HbTag, HbViewport } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbViewport label="scene" aspect="16/9">
  <canvas />
  <template #tl><HbTag>orbit</HbTag></template>
  <template #b><HbButton>throw the ball</HbButton></template>
</HbViewport>`
</script>

<template>
  <DemoSection title="Viewport" note="The scene a tool draws in, with corner overlays and a bottom band of verbs. Under 640 px it goes square." :code="code">
    <HbViewport label="scene">
      <template #tl><HbTag>orbit</HbTag></template>
      <template #tr><HbHudStat label="fps" :value="59.9" /></template>
      <template #b><HbButton>throw the ball</HbButton></template>
    </HbViewport>
  </DemoSection>
  <DemoSection title="Cover" note="While the scene cannot show, the cover says what is happening. coverError lights the note as a failure.">
    <div class="demo-grid">
      <HbViewport label="loading" quiet cover-title="loading the gait wasm" cover-note="1.2 of 3.4 mb">
        <template #cover><HbProgress :loaded="1200000" :total="3400000" /></template>
      </HbViewport>
      <HbViewport label="failed" quiet cover-title="no webgl" cover-note="this browser has webgl turned off. turn it on in settings, then reload." cover-error />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'aspect', type: 'string', default: '16/9', notes: `'fill' takes the parent height` },
      { prop: 'quiet', type: 'boolean', default: 'false' },
      { prop: 'label', type: 'string' },
      { prop: 'coverTitle / coverNote', type: 'string' },
      { prop: 'coverError', type: 'boolean', default: 'false' },
      { prop: 'slots', type: 'default, tl, tr, bl, br, b, center, cover' },
    ]"
  />
</template>
