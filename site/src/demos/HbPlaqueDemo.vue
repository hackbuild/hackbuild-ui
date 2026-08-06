<script setup lang="ts">
import { HbPlaque } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbPlaque title="Top Intel Software Innovator" meta="2015" icon="trophy">
  Recognized for tools and contributions to the developer community.
</HbPlaque>
<HbPlaque title="Young Maker Competition" meta="2017 · beijing" icon="medal" pin="right">
  Finalist. One of ten US teams competing against sixty in Beijing.
</HbPlaque>`
</script>

<template>
  <DemoSection
    title="Award plaques"
    note="Recognition, achievements, badges earned. The pinned diamond and the solid icon carry the pink, the way the live site does; the border stays ink. Alternate the pin side across a grid."
    :code="code"
  >
    <div class="demo-grid" style="gap: 24px">
      <HbPlaque title="Top Intel Software Innovator" meta="2015" icon="trophy">
        Recognized for tools and contributions to the developer community.
      </HbPlaque>
      <HbPlaque title="Young Maker Competition" meta="2017 · beijing" icon="medal" pin="right">
        Finalist. One of ten US teams competing against sixty in Beijing.
      </HbPlaque>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'title', type: 'string', notes: 'required' },
      { prop: 'meta', type: 'string', notes: 'VT323 line: year, place, event' },
      { prop: 'icon', type: 'IconName', default: `'trophy'` },
      { prop: 'pin', type: `'left' | 'right'`, default: `'left'` },
      { prop: '#default', type: 'slot', notes: 'body text' },
    ]"
  />
</template>
