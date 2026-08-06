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
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'name', type: 'string', notes: 'required, the marker face' },
      { prop: 'sub', type: 'string', notes: 'the Plex sub line' },
      { prop: 'active', type: 'boolean', default: 'false' },
    ]"
  />
</template>
