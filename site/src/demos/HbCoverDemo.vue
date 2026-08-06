<script setup lang="ts">
import { HbCover } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbCover seed="kerf" />          <!-- deterministic icon from the seed -->
<HbCover icon="microchip" graph /> <!-- explicit icon, pink graticule -->`
</script>

<template>
  <DemoSection
    title="Placeholder covers"
    note="For projects with no image yet: a seeded icon ghosted on the ink plate, the way every mockup faded a big icon to 15 percent. Same seed, same icon, so a project keeps its face until it gets a real one. HbMediaCard uses this automatically when nothing is slotted into the plate."
    :code="code"
  >
    <div class="demo-grid">
      <div v-for="seed in ['kerf', 'detent', 'burr', 'clasp']" :key="seed">
        <HbCover :seed="seed" />
        <div class="hb-label" style="margin-top: 6px">seed: {{ seed }}</div>
      </div>
    </div>
    <div style="max-width: 300px; margin-top: 16px">
      <HbCover icon="microchip" graph />
      <div class="hb-label" style="margin-top: 6px">explicit icon, graph texture</div>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'seed', type: 'string', notes: 'picks the icon deterministically' },
      { prop: 'icon', type: 'IconName', notes: 'explicit icon, beats the seed' },
      { prop: 'graph', type: 'boolean', default: 'false', notes: 'faint pink graticule' },
      { prop: 'size', type: 'number', default: '56', notes: 'icon size' },
    ]"
  />
</template>
