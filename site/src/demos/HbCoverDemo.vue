<script setup lang="ts">
import { HbCover } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbCover seed="kerf" />                <!-- seeded icon and plate color -->
<HbCover icon="microchip" color="teal" /> <!-- explicit -->
<HbCover seed="kerf" ghost />             <!-- the quiet app style -->`
</script>

<template>
  <DemoSection
    title="Seeded identity plates"
    note="For projects with no image yet: a solid plate from the palette with a big paper icon at full strength, the way the magazine and resume cards do it. Same seed, same icon, same color, so a project keeps its face until it gets a real one. HbMediaCard uses this automatically when nothing is slotted into the plate."
    :code="code"
  >
    <div class="demo-grid">
      <div v-for="seed in ['kerf', 'detent', 'burr', 'clasp', 'slab', 'latch']" :key="seed">
        <HbCover :seed="seed" />
        <div class="hb-label" style="margin-top: 6px">seed: {{ seed }}</div>
      </div>
    </div>
  </DemoSection>

  <DemoSection title="Explicit and ghost" note="Name a palette plate or pass any css color. The ghost variant is the quieter app style: faded icon on ink, for dense grids where six colors would shout.">
    <div class="demo-grid">
      <div>
        <HbCover icon="microchip" color="teal" />
        <div class="hb-label" style="margin-top: 6px">color: teal</div>
      </div>
      <div>
        <HbCover icon="display" color="purple" graph />
        <div class="hb-label" style="margin-top: 6px">purple, graph</div>
      </div>
      <div>
        <HbCover seed="kerf" ghost />
        <div class="hb-label" style="margin-top: 6px">ghost</div>
      </div>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'seed', type: 'string', notes: 'picks the icon and plate color deterministically' },
      { prop: 'icon', type: 'IconName', notes: 'explicit icon, beats the seed' },
      { prop: 'color', type: 'PlateName | string', notes: 'ink, pink, teal, purple, blue, amber, green, or any css color' },
      { prop: 'ghost', type: 'boolean', default: 'false', notes: 'faded icon on ink' },
      { prop: 'graph', type: 'boolean', default: 'false', notes: 'faint graticule' },
      { prop: 'size', type: 'number', default: '64', notes: 'icon size' },
    ]"
  />
</template>
