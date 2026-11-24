<script setup lang="ts">
import { ref } from 'vue'
import { HbCausalLog, type HbCausalEvent } from '@hackbuild/ui'
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
  <PropsTable
    :rows="[
      { prop: 'events', type: '{id, t, agent, kind, text, cause?, icon?}[]' },
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
