<script setup lang="ts">
import { HbEngineBar, HbQueueStrip, type HbQueueItem } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbEngineBar :model="label" :state="state" device="webgpu" :rate="31" :shared-with="['chat', 'room']" :size-m-b="1733" @change="manager.open()" />`
const queue: HbQueueItem[] = [
  { id: 1, name: 'standup.wav', status: 'done' },
  { id: 2, name: 'interview part 2.m4a', status: 'running', phase: 'working', pct: 42 },
  { id: 3, name: 'voice memo.ogg', status: 'queued' },
]
const page = `<div class="hb-toolpage is-split">
  <HbEngineBar class="is-full" ... />
  <div class="hb-bar is-full">...</div>
  <section class="is-side"><HbQueueStrip :items="queue" /><p class="hb-hint">...</p></section>
  <section>main part</section>
</div>`
</script>

<template>
  <DemoSection
    title="The picker, shrunk"
    note="Once a model is picked the catalogue gives the space back: one line with the state, device, rate and who shares it. Stored weights read stored. press load, and the load button names the size."
    :code="code"
  >
    <div style="max-width: 640px; display: flex; flex-direction: column; gap: 8px">
      <HbEngineBar state="none" />
      <HbEngineBar model="sample model" state="stored" :size-m-b="1733" />
      <HbEngineBar model="sample model" state="downloading" :pct="0.37" />
      <HbEngineBar model="sample model" state="loading" :pct="null" />
      <HbEngineBar model="sample model" state="loaded" device="webgpu" :rate="31" :shared-with="['chat', 'room']" />
      <HbEngineBar model="sample model b" state="fault" error="the model ran out of gpu memory. unload the image model, or pick the next row down." />
    </div>
  </DemoSection>

  <DemoSection
    title="On a tool page"
    note="Class .hb-toolpage stacks the parts of a tool with one gap; every part holds its height and only .is-grow takes the rest. .is-split puts the .is-side column beside the main part from 1024 px; .is-full spans both. .hb-hint is the muted line under a part."
    :code="page"
  >
    <div class="hb-toolpage is-split" style="border: 1.5px dashed var(--hb-ink-4); padding: 8px">
      <HbEngineBar class="is-full" model="sample ears" state="loaded" device="webgpu" />
      <div class="hb-bar is-full"><span class="hb-ctl">queue <b class="hb-readout">3</b></span></div>
      <section class="is-side" style="display: flex; flex-direction: column; gap: 6px">
        <HbQueueStrip :items="queue" />
        <p class="hb-hint">drop audio files on the page to add them.</p>
      </section>
      <section class="hb-panel" style="padding: 12px; min-height: 160px">
        <p class="hb-hint">the main part: transcript of the selected file.</p>
      </section>
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
