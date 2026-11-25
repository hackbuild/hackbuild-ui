<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { HbCausalLog, type HbCausalEvent } from '@hackbuild/ui'
import { replaceRow } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const pinned = ref<(string | number)[]>([])
const events: HbCausalEvent[] = [
  { id: 1, t: 61.2, agent: 'dog', kind: 'sense', text: 'saw squirrel at 6.1 m' },
  { id: 2, t: 61.4, agent: 'dog', kind: 'choice', text: 'chase, prey drive 0.81, react in 230 ms', cause: 1 },
  { id: 3, t: 61.7, agent: 'dog', kind: 'act', text: 'run to the fence', cause: 2 },
  { id: 4, t: 62.0, agent: 'owner', kind: 'cue', text: 'said "leave it"', icon: 'ear-listen' },
  { id: 5, t: 62.3, agent: 'dog', kind: 'model', text: 'recall weight up to 0.64', cause: 4 },
  { id: 6, t: 63.1, agent: 'dog', kind: 'reward', text: 'treat, +0.4', cause: 5 },
  { id: 7, t: 64.0, agent: 'dog', kind: 'sense', text: 'smelled grass to the east', icon: 'wind' },
]
const code = `<HbCausalLog :events="events" v-model:pinned="pinned" :depth="3" />`

// The room's line log kinds (ARBOR): you, me, act, fail, eye, note, think,
// and a live row replaced in place while the depth model loads (stub).
const room = ref<HbCausalEvent[]>([
  { id: 'r1', t: 3.0, agent: 'room', kind: 'note', text: 'woke on reflexes, no brain model loaded' },
  { id: 'r2', t: 4.2, agent: 'robot', kind: 'eye', text: 'new things in view: mug, shelf, ball' },
  { id: 'r3', t: 6.8, agent: 'you', kind: 'you', text: 'bring me the mug' },
  { id: 'r4', t: 7.1, agent: 'robot', kind: 'think', text: 'the mug is on the shelf, 1.4 m ahead', cause: 'r3' },
  { id: 'r5', t: 7.3, agent: 'robot', kind: 'me', text: 'on my way.', cause: 'r4' },
  { id: 'r6', t: 9.0, agent: 'robot', kind: 'act', text: 'walk to shelf', cause: 'r4' },
  { id: 'r7', t: 11.4, agent: 'robot', kind: 'fail', text: 'grab mug: out of reach by 0.2 m', cause: 'r6' },
])
let f = 0
let timer = 0
function tick() {
  f = Math.min(1, f + 0.1)
  room.value = replaceRow(room.value, 'dl', f < 1
    ? { id: 'dl', t: 12, agent: 'room', kind: 'load', text: `depth model, ${Math.round(f * 100)} percent of 99 mb (vendor)`, live: true, fraction: f }
    : { id: 'dl', t: 12, agent: 'room', kind: 'load', text: 'depth model ready, 99 mb (vendor)' })
  if (f >= 1) { f = 0; window.setTimeout(() => (room.value = replaceRow(room.value, 'dl', null)), 1500) }
}
onMounted(() => { timer = window.setInterval(tick, 600) })
onBeforeUnmount(() => clearInterval(timer))
const roomCode = `rows = replaceRow(rows, 'dl', { id: 'dl', t, agent: 'room', kind: 'load', text, live: true, fraction })`
</script>

<template>
  <DemoSection title="Cause timeline" note="Newest first, filter chips for agent and kind, and the chain of causes under each event. Pin an event to keep it at the top." :code="code">
    <div style="max-width: 640px">
      <HbCausalLog v-model:pinned="pinned" :events="events" :announce="false" />
    </div>
  </DemoSection>
  <DemoSection title="Grouped" note="group gives one section per agent.">
    <div style="max-width: 640px">
      <HbCausalLog :events="events" group :announce="false" />
    </div>
  </DemoSection>
  <DemoSection title="Line log kinds and a live row" note="you, me, act, fail, eye, note, think and load carry the tones of the line log. The live row sits on top, is replaced in place under its id while it runs, has no pin and is not announced. Stub loader, fixture data." :code="roomCode">
    <div style="max-width: 640px">
      <HbCausalLog :events="room" :announce="false" :depth="1" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'events', type: '{id, t, agent, kind, text, cause?, icon?, live?, fraction?}[]', notes: 'live: replaced in place, kept on top' },
      { prop: 'tones', type: 'Record<kind, {tag, tone}>', notes: 'over the defaults; tones pink, info, ok, warn, err, dim, load' },
      { prop: 'v-model:pinned', type: '(string | number)[]' },
      { prop: 'agents / kinds', type: 'string[]', notes: 'filter chips; default from the events' },
      { prop: 'group', type: 'boolean', default: 'false' },
      { prop: 'depth', type: 'number', default: '3' },
      { prop: 'limit', type: 'number', default: '60' },
      { prop: 'formatTime', type: '(t: number) => string', notes: 'default m:ss.s' },
      { prop: 'announce / announceGap', type: 'boolean / number', default: 'true / 8000' },
      { prop: 'label', type: 'string', default: 'cause timeline' },
    ]"
  />
</template>
