<script setup lang="ts">
import { ref } from 'vue'
import { HbHistoryStrip, HbButton, type HbHistoryItem } from '@hackbuild/ui'
import { historyPush, runMeta } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

// Fixture thumbs drawn as svg: no model runs here.
const tones = ['#1a1a1a', '#FE0386', '#6b6459', '#c77700', '#1f9d55', '#9a9184']
function thumb(i: number) {
  const a = tones[i % tones.length]
  const b = tones[(i + 2) % tones.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#f5f0e6"/><rect x="${8 + (i * 7) % 20}" y="10" width="30" height="30" fill="${a}"/><circle cx="${40 - (i * 5) % 16}" cy="42" r="14" fill="${b}"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
const prompts = ['a brass owl on a workbench', 'neon soldering iron, night', 'a paper robot in the rain', 'macro of a circuit board', 'a dog in a hard hat']
let n = 0
function run(): HbHistoryItem {
  n++
  return { id: n, thumb: thumb(n), label: prompts[n % prompts.length], meta: runMeta({ model: 'sd turbo', seed: 1000 + n * 37, steps: 1 + (n % 4), ms: 900 + n * 110 }) }
}
const items = ref<HbHistoryItem[]>([])
for (let i = 0; i < 5; i++) items.value = historyPush(items.value, run())
const current = ref<string | number | null>(items.value[0].id)
function add() { const r = run(); items.value = historyPush(items.value, r); current.value = r.id }
function remove(it: HbHistoryItem) { items.value = items.value.filter((x) => x.id !== it.id); if (current.value === it.id) current.value = items.value[0]?.id ?? null }
const code = `<HbHistoryStrip :items="runs" :current="shown" @restore="restore" @remove="forget" />
<HbHistoryStrip grid :items="runs" :current="shown" @restore="restore" @remove="forget" />
// runs = historyPush(runs, { id, thumb, label: prompt, meta: runMeta({ model, seed, steps, ms }) })`
</script>

<template>
  <DemoSection title="History strip" note="Up to eight runs, newest first. A press restores the image and its prompt and seed; the title carries model, seed, steps and prompt. Remove: the corner x on a fine pointer, the trash button for the run on screen on touch, Delete on a focused thumb." :code="code">
    <div class="demo-col" style="max-width: 640px">
      <HbHistoryStrip :items="items" :current="current" @restore="current = $event.id" @remove="remove" />
      <div class="hb-acts"><HbButton size="sm" @click="add">add a run</HbButton></div>
      <HbHistoryStrip :items="[]" />
    </div>
  </DemoSection>
  <DemoSection title="Grid" note="Tiles with the prompt and the run line, for a gallery or a mask list.">
    <HbHistoryStrip grid :items="items.slice(0, 4)" :current="current" @restore="current = $event.id" @remove="remove" />
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'items', type: '{id, thumb, label?, meta?}[]' },
      { prop: 'current', type: 'string | number | null' },
      { prop: 'grid / empty', type: 'boolean / string' },
      { prop: 'emits', type: 'restore, remove' },
    ]"
  />
</template>
