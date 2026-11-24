<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  HbAppShell, HbButton, HbFold, HbGuide, HbHeader, HbKv, HbPanel, HbSlider,
  HbStatusBar, HbSteps, HbViewport,
} from '@hackbuild/ui'

// Stepped bench (P-SHELL-1): the order of work is visible, a finished step
// turns green, and one guide sentence per step replaces hint cards.
const steps = ref([
  { label: 'art', value: 'art', done: true, guide: 'drop a picture or pick one. the face is found for you.' },
  { label: 'depth', value: 'depth', done: false, guide: 'check the depth map. lighter is nearer.' },
  { label: 'relief', value: 'relief', done: false, guide: 'set how far the relief stands off the plate.' },
  { label: 'print', value: 'print', done: false, guide: 'export the 3mf and slice it.' },
])
const step = ref<string | number>('depth')
const index = computed(() => steps.value.findIndex((s) => s.value === step.value))
const current = computed(() => steps.value[index.value] ?? steps.value[0]!)
const height = ref(2.4)
const base = ref(1.2)

function next() {
  const s = steps.value[index.value]
  if (s) s.done = true
  const n = steps.value[index.value + 1]
  if (n) step.value = n.value
}
</script>

<template>
  <HbAppShell recipe="bench">
    <template #header>
      <HbHeader title="relief" accent="." suffix="bench" tagline="a picture in, a printable relief out" tagline-kind="tool">
        <a class="hb-link" href="#/demos">exit demo</a>
      </HbHeader>
    </template>
    <template #tabs>
      <HbSteps v-model="step" :steps="steps" label="steps" />
    </template>
    <template #toolbar>
      <HbGuide :step="index + 1" :name="current.label" :goal="current.guide" />
    </template>

    <HbViewport label="the relief" cover-title="fixture stage" cover-note="no model runs in this demo; the stage keeps its size and place." />

    <template #rail>
      <HbPanel heading="relief">
        <HbSlider v-model="height" label="height" :min="0.4" :max="6" :step="0.1" unit="mm" />
        <HbSlider v-model="base" label="base" :min="0.4" :max="3" :step="0.1" unit="mm" />
      </HbPanel>
      <HbFold :num="1" summary="model" persist-key="site-demo-bench-model">
        <HbKv label="depth" value="stub, 0 MB" />
        <HbKv label="device" value="wasm" />
      </HbFold>
    </template>

    <template #dock>
      <span class="hb-label">{{ index + 1 }} of {{ steps.length }}</span>
      <span class="hb-spacer" />
      <HbButton :disabled="index === steps.length - 1" @click="next">next</HbButton>
    </template>

    <template #statusbar>
      <HbStatusBar>
        <span>job <b>idle</b></span>
        <span>device <b>wasm</b></span>
        <span>faces <b>48k</b></span>
      </HbStatusBar>
    </template>
  </HbAppShell>
</template>
