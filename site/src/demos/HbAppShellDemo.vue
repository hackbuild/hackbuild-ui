<script setup lang="ts">
import { HbButton, HbCallout } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbAppShell>
  <template #header><HbHeader title="kerf" accent="." /></template>
  <template #tabs><HbTabs v-model="tab" :tabs="tabs" /></template>
  <template #toolbar><HbToolbar>...</HbToolbar></template>

  <!-- default slot: the scrolling work column -->
  <HbStage>...</HbStage>
  <HbConsole :lines="lines" />

  <template #rail>
    <HbPanel heading="Instrument">...</HbPanel>
  </template>
  <template #statusbar><HbStatusBar>...</HbStatusBar></template>
</HbAppShell>`
</script>

<template>
  <DemoSection
    title="The full height tool layout"
    note="Header, tabs, toolbar and status strip pinned; one scrolling work column beside one scrolling rail of panels. Below 900 px the shell unpins and the rail stacks under the work column."
    :code="code"
  >
    <HbCallout style="margin: 0">
      The shell needs the whole viewport, so it will not fit in this box. The
      bench demo runs it for real.
    </HbCallout>
    <div style="margin-top: 14px">
      <HbButton as="a" href="#/demos/bench">open the bench demo</HbButton>
    </div>
  </DemoSection>

  <PropsTable
    title="slots"
    :rows="[
      { prop: 'header', type: 'slot', notes: 'HbHeader' },
      { prop: 'tabs', type: 'slot', notes: 'HbTabs' },
      { prop: 'toolbar', type: 'slot', notes: 'HbToolbar' },
      { prop: 'default', type: 'slot', notes: 'the scrolling work column' },
      { prop: 'rail', type: 'slot', notes: 'panels beside the work column' },
      { prop: 'statusbar', type: 'slot', notes: 'HbStatusBar' },
    ]"
  />
</template>
