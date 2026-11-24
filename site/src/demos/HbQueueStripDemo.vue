<script setup lang="ts">
import { ref } from 'vue'
import { HbQueueStrip, type HbQueueItem } from '@hackbuild/ui'
import { stripMeta } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { duration, env, noiseDb, open, thrDb, segments } from '../fixtures/transcript'

// Made up jobs in every state. The first carries the fixture rail; the
// figures are fixture values, not a measurement.
const items = ref<HbQueueItem[]>([
  { id: 'a', name: 'pixel-fetch-take2.wav', status: 'done', wave: { env, vad: open, noiseDb, thrDb }, meta: stripMeta({ duration, size: 4.6e6, snrDb: 22.4, gainDb: 3, density: 0.62, rtf: 14.2, lines: segments.length }) },
  { id: 'b', name: 'porch interview, long name that runs past the strip.m4a', status: 'running', phase: 'working', pct: 46, wave: { env: env.slice(0, 1200), vad: open.slice(0, 1200) }, meta: stripMeta({ duration: 812, size: 61e6, snrDb: 6.1, gainDb: 12 }) },
  { id: 'c', name: 'take3.mov', status: 'failed', error: 'could not decode take3.mov. convert it to wav or mp3 and drop it again.', meta: stripMeta({ size: 1.9e9 }) },
  { id: 'd', name: 'room tone.wav', status: 'empty', meta: stripMeta({ duration: 30, size: 2.6e6, density: 0 }) },
  { id: 'e', name: 'notes-0412.mp3', status: 'queued', meta: stripMeta({ size: 3.1e6 }) },
])
const selected = ref<string | number | null>('a')
const remove = (id: string | number) => { items.value = items.value.filter((x) => x.id !== id) }
const code = `<HbQueueStrip v-model:selected="current" :items="jobs.map(toStrip)" @remove="queue.remove($event)" />`
</script>

<template>
  <DemoSection title="Queue strip" note="One file per strip: channel number, name, status word, waveform, the measured line and the error, a bar while it works. Press a strip to select it; Up and Down move between strips. Remove is its own target." :code="code">
    <div class="demo-col">
      <HbQueueStrip v-model:selected="selected" :items="items" @remove="remove" />
      <HbQueueStrip :items="[]" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'items', type: '{id, n?, name, status, phase?, pct?, wave?, meta?, error?}[]' },
      { prop: 'status', type: 'queued | decoding | working | running | done | empty | failed | stopped' },
      { prop: 'wave', type: 'number[] | {env, vad?, noiseDb?, thrDb?}', notes: 'levels 0 to 1, or a rail' },
      { prop: 'meta', type: '{label?, value, tone?}[]', notes: 'stripMeta builds it' },
      { prop: 'v-model:selected', type: 'string | number | null', default: 'null' },
      { prop: 'locked', type: 'boolean', default: 'false', notes: 'hides remove' },
      { prop: 'label / empty', type: 'string' },
      { prop: '@remove', type: '(id)' },
    ]"
  />
</template>
