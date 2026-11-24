<script setup lang="ts">
import { HbEngineBar } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbEngineBar :model="label" :state="state" device="webgpu" :rate="31" :shared-with="['chat', 'room']" :size-m-b="1733" @change="manager.open()" />`
</script>

<template>
  <DemoSection
    title="The picker, shrunk"
    note="Once a model is picked the catalogue gives the space back: one line with the state, device, rate and who shares it. Stored weights read stored. press load, and the load button names the size."
    :code="code"
  >
    <div style="max-width: 640px; display: flex; flex-direction: column; gap: 8px">
      <HbEngineBar state="none" />
      <HbEngineBar model="hermes 3 llama 3.2 3b" state="stored" :size-m-b="1733" />
      <HbEngineBar model="hermes 3 llama 3.2 3b" state="downloading" :pct="0.37" />
      <HbEngineBar model="hermes 3 llama 3.2 3b" state="loading" :pct="null" />
      <HbEngineBar model="hermes 3 llama 3.2 3b" state="loaded" device="webgpu" :rate="31" :shared-with="['chat', 'room']" />
      <HbEngineBar model="qwen3 0.6b" state="fault" error="the model ran out of gpu memory. unload the image model, or pick the next row down." />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'model', type: 'string' },
      { prop: 'state', type: `'none' | 'stored' | 'downloading' | 'loading' | 'loaded' | 'fault'` },
      { prop: 'device / rate', type: 'string / number | null', notes: 'rate in tok/s, measured on the last reply' },
      { prop: 'sharedWith', type: 'string[]' },
      { prop: 'sizeMB / pct / error', type: 'number | null / number | null / string' },
      { prop: 'emits', type: 'change, load, cancel, unload' },
    ]"
  />
</template>
