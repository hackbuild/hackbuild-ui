<script setup lang="ts">
import { ref } from 'vue'
import { HbButton, HbDrawer, HbKv, HbPanel } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const right = ref(false)
const left = ref(false)

const code = `<HbDrawer v-model="open">
  <HbPanel heading="Instrument" sunk>...</HbPanel>
</HbDrawer>

<HbDrawer v-model="open" side="left">...</HbDrawer>`
</script>

<template>
  <DemoSection
    title="Drawer"
    note="A full height panel sliding from an edge over a scrim. The mobile home of the rail, and of any nav that will not fit a bar. Escape and the backdrop close it."
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

  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'boolean' },
      { prop: 'side', type: `'left' | 'right'`, default: `'right'` },
      { prop: 'closeOnBackdrop', type: 'boolean', default: 'true' },
    ]"
  />
</template>
