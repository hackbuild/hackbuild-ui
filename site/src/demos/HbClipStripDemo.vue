<script setup lang="ts">
import { ref } from 'vue'
import { HbClipStrip, type HbClip } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const clips: HbClip[] = [
  { id: 'idle', name: 'idle', length: '4.0 s' },
  { id: 'walk', name: 'walk', length: '1.1 s' },
  { id: 'wave', name: 'wave', length: '2.4 s' },
  { id: 'sit', name: 'sit', length: '3.2 s' },
]
const picked = ref('wave')
const code = `<HbClipStrip v-model="picked" :clips="clips" playing="walk" />`
</script>

<template>
  <DemoSection title="Clip strip" note="Clips in a row. The playing one carries a pink mark and a play glyph; the picked one is ink. Left and right arrows move along the strip." :code="code">
    <HbClipStrip v-model="picked" :clips="clips" playing="walk" />
    <p class="hb-fixture"><b>fixture</b> clip names and lengths are sample data.</p>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'clips', type: '{ id, name, length? }[]' },
      { prop: 'v-model', type: 'string', notes: 'the picked clip' },
      { prop: 'playing', type: 'string', notes: 'the clip running now, .is-playing' },
    ]"
  />
</template>
