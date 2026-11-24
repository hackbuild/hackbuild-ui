<script setup lang="ts">
import { ref } from 'vue'
import { HbTile, HbTiles } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const active = ref(0)

const tiles = [
  { name: 'fm radio', sub: '101.1 wfm' },
  { name: 'weather', sub: '162.55 nfm' },
  { name: 'airplanes', sub: '124.4 am' },
  { name: 'doorbells', sub: '433.92 spec' },
]

const code = `<HbTiles>
  <HbTile v-for="(t, i) in tiles" :key="t.name"
    :name="t.name" :sub="t.sub"
    :active="i === active" @click="active = i" />
</HbTiles>`
</script>

<template>
  <DemoSection
    title="Preset tiles"
    note="Big tap targets for the easy path. Marker for the name, Plex for the sub, 96 px minimum so a finger can hit them. The active tile fills pink."
    :code="code"
  >
    <HbTiles>
      <HbTile
        v-for="(tile, index) in tiles"
        :key="tile.name"
        :name="tile.name"
        :sub="tile.sub"
        :active="index === active"
        @click="active = index"
      />
    </HbTiles>
    <p class="hb-label" style="margin: 24px 0 8px">small, with media, one disabled</p>
    <HbTiles small style="max-width: 520px">
      <HbTile v-for="(tile, index) in tiles" :key="tile.name" small :name="tile.name" :sub="tile.sub" :disabled="index === 3">
        <template #media><svg viewBox="0 0 40 30" preserveAspectRatio="none"><polyline :points="`0,${20 - index * 3} 10,${12 + index} 20,${22 - index * 2} 30,${8 + index * 3} 40,15`" fill="none" stroke="var(--hb-slime)" stroke-width="1.5" /></svg></template>
      </HbTile>
    </HbTiles>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'name', type: 'string', notes: 'required, the marker face' },
      { prop: 'sub', type: 'string', notes: 'the Plex sub line' },
      { prop: 'active', type: 'boolean', default: 'false' },
      { prop: 'small', type: 'boolean', default: 'false', notes: '64 px; HbTiles small narrows the grid' },
      { prop: 'disabled', type: 'boolean', default: 'false' },
      { prop: 'slot media', type: 'thumb drawn from state, above the name' },
    ]"
  />
</template>
