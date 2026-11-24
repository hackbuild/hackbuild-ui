<script setup lang="ts">
import { ref } from 'vue'
import { HbMonitorDock, type HbMonitorView } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { sceneUrl, depthUrl, maskUrl } from '../fixtures/vision'

// Drawn fixture frames stand in for the camera and the model output.
const views: HbMonitorView[] = [
  { key: 'camera', title: 'camera', aux: '640 x 420' },
  { key: 'model', title: 'model view', aux: 'relative', modes: ['depth', 'mask'] },
]
const open = ref(['camera', 'model'])
const modes = ref<Record<string, string>>({ model: 'depth' })
const code = `<HbMonitorDock :views="[{ key: 'camera', title: 'camera' }, { key: 'model', title: 'model view', modes: ['depth', 'mask'] }]"
  v-model="open" v-model:modes="modes">
  <template #camera><video ref="feed" /></template>
  <template #model="{ mode }"><canvas :data-mode="mode" /></template>
</HbMonitorDock>`
</script>

<template>
  <DemoSection title="Monitor dock" note="The raw feed beside what the model made of it. Each head folds its tile; modes switch the view inside one tile. Inline the tiles share the row and stack on a phone; overlay docks fixed width tiles on a viewport corner." :code="code">
    <div class="demo-col" style="max-width: 640px">
      <HbMonitorDock v-model="open" v-model:modes="modes" :views="views">
        <template #camera><img :src="sceneUrl" alt="camera frame"></template>
        <template #model="{ mode }"><img :src="mode === 'mask' ? maskUrl('box') : depthUrl" :alt="`model ${mode}`" style="background: var(--hb-void)"></template>
      </HbMonitorDock>
      <p class="hb-hint">open: {{ open.join(', ') || 'none' }}</p>
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'views', type: '{key, title, aux?, ratio?, modes?}[]' },
      { prop: 'v-model', type: 'string[]', notes: 'keys of the open tiles' },
      { prop: 'v-model:modes', type: 'Record<string, string>' },
      { prop: 'overlay', type: 'boolean', default: 'false', notes: 'inside .hb-ov-bl on a viewport' },
      { prop: 'slots', type: 'one per view key, scoped { view, mode }' },
    ]"
  />
</template>
