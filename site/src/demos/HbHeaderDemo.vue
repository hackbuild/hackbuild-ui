<script setup lang="ts">
import { ref } from 'vue'
import { HbHeader, HbPill, HbSeg } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const mode = ref<string | number>('easy')

const code = `<HbHeader title="kerf" accent="." tagline="make things. break things. repeat.">
  <HbPill status="live">streaming</HbPill>
  <span style="margin-left: auto" />
  <HbSeg v-model="mode" :options="['easy', 'advanced']" />
</HbHeader>`
</script>

<template>
  <DemoSection
    title="Tool header"
    note="Identity and state. The title is the tool name, not hack.build; the mark carries the brand. Verbs live in the toolbar, never here. The tagline drops below 900 px."
    :code="code"
  >
    <div style="margin: -16px">
      <HbHeader title="kerf" accent="." tagline="make things. break things. repeat.">
        <HbPill status="live">streaming</HbPill>
        <span style="margin-left: auto" />
        <HbSeg v-model="mode" :options="['easy', 'advanced']" />
      </HbHeader>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'title', type: 'string', default: '', notes: 'the tool name' },
      { prop: 'accent', type: 'string', default: '', notes: 'trailing part rendered pink' },
      { prop: 'tagline', type: 'string', default: '', notes: 'dropped below 900 px' },
      { prop: 'mark', type: 'boolean', default: 'true', notes: 'hide when slotting a custom logo' },
    ]"
  />
</template>
