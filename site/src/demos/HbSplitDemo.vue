<script setup lang="ts">
import { ref } from 'vue'
import { HbSplit } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { sceneUrl, depthUrl } from '../fixtures/vision'

const pos = ref(0.5)
const code = `<HbSplit v-model="pos" :labels="['source', 'depth']" ratio="640/420">
  <template #left><img :src="photo"></template>
  <template #right><canvas ref="depth" /></template>
</HbSplit>`
</script>

<template>
  <DemoSection title="Split" note="A compare wipe: source on the left, the model's view cut at the divider. Press or drag anywhere on the frame. The bar is a slider: arrows move 5 percent, shift 1, page keys 25, home and end the edges. For page columns use .hb-toolpage.is-split." :code="code">
    <div class="demo-col" style="max-width: 640px">
      <HbSplit v-model="pos" :labels="['source', 'depth']" ratio="640/420">
        <template #left><img :src="sceneUrl" alt="source photo"></template>
        <template #right><img :src="depthUrl" alt="depth map"></template>
      </HbSplit>
      <p class="hb-hint">divider at {{ Math.round(pos * 100) }} percent</p>
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'number', default: '0.5', notes: '0 left edge to 1 right edge' },
      { prop: 'labels', type: '[string, string]', default: `['before', 'after']` },
      { prop: 'ratio', type: 'string', default: `'4/3'` },
      { prop: 'slots', type: 'left, right' },
    ]"
  />
</template>
