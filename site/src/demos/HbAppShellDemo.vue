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
  <template #dock><HbButton>throw the ball</HbButton></template>
  <template #statusbar><HbStatusBar>...</HbStatusBar></template>
</HbAppShell>

<!-- a recipe, a view mode, and the rack as a sheet under 901 px -->
<HbAppShell recipe="rack" v-model:mode="mode" v-model:rail-open="rack">
  <HbViewport />
  <template #rail><HbTabs num :tabs="tabs">...</HbTabs></template>
  <template #dock="{ sheet, openRail }">
    <HbButton>throw the ball</HbButton>
    <HbButton v-if="sheet" @click="openRail">rack</HbButton>
  </template>
</HbAppShell>`
</script>

<template>
  <DemoSection
    title="The full height tool layout"
    note="Header, tabs, toolbar and status strip pinned; one scrolling work column beside one scrolling rail of panels. Below 900 px the shell unpins and the rail stacks under the work column. The dock holds the composer or the primary action and stays pinned above the status strip at every width, so the input never scrolls away on a phone."
    :code="code"
  >
    <HbCallout style="margin: 0">
      The shell needs the whole viewport, so it will not fit in this box. The
      bench demo runs it for real.
    </HbCallout>
    <div class="demo-row" style="margin-top: 14px">
      <HbButton as="a" href="#/demos/bench">open the bench demo</HbButton>
      <HbButton variant="secondary" as="a" href="#/demos/shell-rack">stage and rack</HbButton>
      <HbButton variant="secondary" as="a" href="#/demos/shell-bench">stepped bench</HbButton>
      <HbButton variant="secondary" as="a" href="#/demos/shell-transcript">transcript</HbButton>
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
      { prop: 'dock', type: 'slot', notes: 'composer or primary action, pinned above the status strip; props sheet, openRail' },
      { prop: 'statusbar', type: 'slot', notes: 'HbStatusBar' },
    ]"
  />
  <PropsTable
    :rows="[
      { prop: 'recipe', type: `'rack' | 'bench' | 'transcript'`, notes: 'the three shell recipes' },
      { prop: 'v-model:mode', type: `'stage' | 'split' | 'chat'`, notes: 'stage hides the rail, chat hides the work column' },
      { prop: 'v-model:railOpen', type: 'boolean', notes: 'the rack sheet, rack recipe under 901 px' },
      { prop: 'railLabel', type: 'string', default: `'rack'`, notes: 'sheet heading' },
      { prop: 'fit', type: 'boolean', default: 'false', notes: 'pin to the dynamic viewport; a fill viewport takes the height left over the foot' },
    ]"
  />
</template>
