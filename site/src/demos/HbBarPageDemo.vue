<script setup lang="ts">
import DemoSection from '../components/DemoSection.vue'

const code = `<HbBarPage>
  <template #bar><HbHeader title="yard" accent="." :tools="tools" /></template>
  <HbStageRack :tabs="tabs">...</HbStageRack>
</HbBarPage>`
const kinds = ['stage-rack', 'canvas-rail', 'drop-first', 'conversation', 'gate', 'form-frame']
</script>

<template>
  <DemoSection title="A layout under an app bar" note="HbHeader in the bar slot, any of the six layouts under it, filling the rest of the viewport. The header is the one bar (data-ux bar); the layout keeps its own markers. A header followed straight by a .hb-lay works the same with no wrapper. Every layout demo is built this way." :code="code">
    <div class="demo-row">
      <a v-for="k in kinds" :key="k" class="hb-btn" :href="`#/layouts/${k}`">{{ k.replace('-', ' and ').replace('drop and first', 'drop first') }}</a>
    </div>
  </DemoSection>
</template>
