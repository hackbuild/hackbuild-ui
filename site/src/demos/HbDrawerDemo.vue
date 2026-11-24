<script setup lang="ts">
import { ref } from 'vue'
import { HbButton, HbDrawer, HbKv, HbPanel } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const right = ref(false)
const left = ref(false)
const sheet = ref(false)
const sheet2 = ref(false)
const auto = ref(false)

const code = `<HbDrawer v-model="open">
  <HbPanel heading="Instrument" sunk>...</HbPanel>
</HbDrawer>

<HbDrawer v-model="open" side="left">...</HbDrawer>

<!-- the phone home of a rack: 74 percent tall, one sheet at a time -->
<HbDrawer v-model="rack" side="bottom" title="rack">...</HbDrawer>

<!-- a sheet under 761 px, the right drawer from it, no matchMedia here -->
<HbDrawer v-model="log" side="auto" title="event log">...</HbDrawer>`
</script>

<template>
  <DemoSection
    title="Drawer"
    note="A full height panel sliding from an edge over a scrim. The mobile home of the rail, and of any nav that will not fit a bar. Focus moves in and Tab stays inside; escape and the backdrop close it, and focus goes back to the button."
    :code="code"
  >
    <div class="demo-row">
      <HbButton @click="right = true">from the right</HbButton>
      <HbButton variant="secondary" @click="left = true">from the left</HbButton>
    </div>
    <HbDrawer v-model="right">
      <HbPanel heading="Instrument" sunk>
        <HbKv label="center" value="101.100" />
        <HbKv label="floor" value="-97 dBm" />
      </HbPanel>
    </HbDrawer>
    <HbDrawer v-model="left" side="left">
      <HbPanel heading="Navigation" sunk>
        <p style="margin: 0">Anything goes in here.</p>
      </HbPanel>
    </HbDrawer>
  </DemoSection>

  <DemoSection
    title="Bottom sheet"
    note="side bottom: the phone home of a rack, a model manager or settings. 74 percent tall so the stage shows above it, padded past the home bar. One sheet is open at a time: opening one closes the other. Tab stays inside, escape and the scrim close, focus goes back to the button."
  >
    <div class="demo-row">
      <HbButton @click="sheet = true">open the rack</HbButton>
      <HbButton variant="secondary" @click="sheet2 = true">open settings</HbButton>
    </div>
    <HbDrawer v-model="sheet" side="bottom" title="rack">
      <HbPanel heading="Instrument" sunk>
        <HbKv label="center" value="101.100" />
        <HbKv label="floor" value="-97 dBm" />
      </HbPanel>
      <div class="demo-row" style="margin-top: 12px">
        <HbButton variant="secondary" @click="sheet2 = true">open settings instead</HbButton>
      </div>
    </HbDrawer>
    <HbDrawer v-model="sheet2" side="bottom" title="settings">
      <p style="margin: 0">Opening this sheet closed the rack.</p>
    </HbDrawer>
  </DemoSection>

  <DemoSection
    title="Side by width"
    note="side auto: the bottom sheet under the breakpoint (761 px by default) and the right drawer from it, switching live as the width changes. As a sheet it closes any other open sheet."
  >
    <div class="demo-row">
      <HbButton @click="auto = true">open the event log</HbButton>
    </div>
    <HbDrawer v-model="auto" side="auto" title="event log">
      <p style="margin: 0">A sheet on a phone, a right drawer on a wide screen.</p>
    </HbDrawer>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'boolean' },
      { prop: 'side', type: `'left' | 'right' | 'bottom' | 'auto'`, default: `'right'`, notes: 'bottom is the sheet; auto is the sheet under breakpoint, right from it' },
      { prop: 'breakpoint', type: 'number', default: '761', notes: 'px where side auto switches' },
      { prop: 'title', type: 'string', notes: 'head with a close button; the accessible name' },
      { prop: 'label', type: 'string', notes: 'accessible name when there is no title' },
      { prop: 'closeOnBackdrop', type: 'boolean', default: 'true' },
      { prop: 'closeOnEscape', type: 'boolean', default: 'true' },
      { prop: '@close', type: 'emit', notes: `'escape' | 'scrim' | 'button' | 'api'` },
    ]"
  />
</template>
