<script setup lang="ts">
// gate, after ferrule and arbor: the body shows behind one card with one
// select and one pink button. Waking runs a fake load, then the gate goes.
import { computed, ref } from 'vue'
import { HbBarPage, HbButton, HbGate, HbGateCheck, HbModelSelect, loadLabel } from '@hackbuild/ui'
import DemoBar from './DemoBar.vue'
import { useFakeLoad } from './useFakeLoad'
import { chatRows } from '../../fixtures/picker'

const { rows, load } = useFakeLoad(chatRows)
const chosen = ref('steady')
const row = computed(() => rows.value.find((r) => r.id === chosen.value))
const open = computed(() => row.value?.state !== 'loaded')
const busy = computed(() => row.value?.state === 'loading')
const thinking = computed(() => ({ state: (row.value?.state === 'loaded' ? 'ok' : row.value?.state === 'loading' ? 'load' : 'wait') as 'ok' | 'load' | 'wait', value: row.value?.progress ?? 0 }))
const goLabel = computed(() => (busy.value ? loadLabel(row.value) : row.value?.size && row.value.state !== 'stored' ? `wake, ${row.value.size}` : 'wake'))
</script>

<template>
  <HbBarPage>
    <template #bar>
      <DemoBar v-model="chosen" title="character" :rows="rows" :chip="!open" @load="load" />
    </template>
    <HbGate :open="open" head="character" head-end="v1" name="wake the body" note="it loads a model for the voice and the thinking, then the body moves and answers. everything runs on this machine." :go-label="goLabel" :busy="busy" @go="load([chosen])">
      <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" role="img" aria-label="the body, standing still">
        <rect width="1000" height="600" fill="#eef2ef" /><rect y="470" width="1000" height="130" fill="#e8e0d0" />
        <g stroke="#1a1a1a" stroke-width="4" fill="#fffdf7"><circle cx="500" cy="190" r="40" /><path d="M500 230 V360 M500 260 L440 320 M500 260 L560 320 M500 360 L460 470 M500 360 L540 470" fill="none" /></g>
      </svg>
      <template #checks>
        <HbGateCheck label="thinking" :state="thinking.state" :value="thinking.value" />
        <HbGateCheck label="voice" state="ok" note="system voice" />
        <HbGateCheck label="body" state="ok" note="ready" />
      </template>
      <template #card><HbModelSelect v-model="chosen" :rows="rows" :go="false" title="pick the thinking" /></template>
      <template #verbs><HbButton variant="go">talk</HbButton><HbButton>wave</HbButton></template>
    </HbGate>
  </HbBarPage>
</template>
