<script setup lang="ts">
// stage and rack, after hackle: the yard fills, the eye view sits on it,
// throw is the one pink verb, the rack opens on the mind.
import { ref } from 'vue'
import { HbButton, HbEventLog, HbGauges, HbKv, HbPanel, HbStageRack, type HbEventRow } from '@hackbuild/ui'
import DemoBar from './DemoBar.vue'
import { useFakeLoad } from './useFakeLoad'
import { chatRows } from '../../fixtures/picker'

const { rows, load } = useFakeLoad(chatRows)
const chosen = ref('tiny')
const tabs = [{ id: 'mind', label: 'mind' }, { id: 'body', label: 'body' }, { id: 'sense', label: 'sense' }, { id: 'log', label: 'log' }]
const drives = ref([
  { label: 'play', value: 0.81, current: true },
  { label: 'hunger', value: 0.42 },
  { label: 'rest', value: 0.18 },
  { label: 'fear', value: 0.05 },
])
const log = ref<HbEventRow[]>([{ id: 1, kind: 'act', text: 'sniffs the fence', t: '0:04' }, { id: 2, kind: 'sense', text: 'hears a ball', t: '0:09' }])
const ball = ref(false)
function throwBall() {
  ball.value = !ball.value
  log.value = [...log.value, { id: log.value.length + 1, kind: 'act', text: ball.value ? 'runs for the ball' : 'drops the ball', t: `0:${10 + log.value.length}` }]
}
</script>

<template>
  <HbStageRack :tabs="tabs" rack-label="the dog">
    <template #bar><DemoBar v-model="chosen" title="yard" :rows="rows" @load="load" /></template>
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" role="img" aria-label="the yard: a dog on the grass by a kennel">
      <rect width="1000" height="600" fill="#eef2ef" />
      <rect y="360" width="1000" height="240" fill="#dfe8d8" />
      <path d="M0 360 H1000" stroke="#1a1a1a" stroke-width="2" />
      <g stroke="#1a1a1a" stroke-width="3" fill="#fffdf7"><path d="M720 360 V250 L790 200 L860 250 V360 Z" /><path d="M765 360 V300 H815 V360" fill="#1a1a1a" /></g>
      <g stroke="#1a1a1a" stroke-width="3" fill="#f5f0e6"><rect x="420" y="380" width="120" height="50" /><rect x="525" y="350" width="45" height="40" /><path d="M430 430 v40 M450 430 v40 M510 430 v40 M530 430 v40 M420 390 l-25 -20" /></g>
      <circle v-if="ball" cx="300" cy="455" r="14" fill="#FE0386" stroke="#1a1a1a" stroke-width="3" />
    </svg>
    <template #inset>
      <div class="hb-panel-hd-inst" style="margin:0;padding:3px 9px">eye view</div>
      <svg viewBox="0 0 320 160" width="100%" role="img" aria-label="what the dog sees"><rect width="320" height="160" fill="#efe9db" /><path d="M0 100 H320" stroke="#1a1a1a" /><rect x="200" y="50" width="50" height="50" fill="none" stroke="#1a1a1a" stroke-width="2" /></svg>
    </template>
    <template #verbs>
      <HbButton variant="go" @click="throwBall">throw</HbButton>
      <HbButton>treat</HbButton>
      <HbButton>good dog</HbButton>
      <HbButton>talk</HbButton>
    </template>
    <template #tab-mind>
      <HbPanel heading="what it wants" head="instrument"><HbGauges :rows="drives" label="drives" /></HbPanel>
    </template>
    <template #tab-body>
      <HbPanel heading="gait" head="instrument"><HbKv label="speed" value="1.2 m/s" /><HbKv label="feet down" value="3 of 4" /></HbPanel>
    </template>
    <template #tab-sense>
      <HbPanel heading="heard" head="instrument"><HbKv label="last word" value="ball" /></HbPanel>
    </template>
    <template #tab-log><HbEventLog :rows="log" :filters="false" label="what it did" /></template>
    <template #detail><p class="hb-fixture">fixture: the yard is a drawing, the numbers are made up, and no model loads here.</p></template>
  </HbStageRack>
</template>
