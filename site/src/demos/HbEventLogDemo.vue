<script setup lang="ts">
import { ref } from 'vue'
import { HbEventLog, type HbEventRow } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

let n = 0
const rows = ref<HbEventRow[]>([
  { id: ++n, kind: 'note', text: 'room built, body on reflexes', t: '14:02:01' },
  { id: ++n, kind: 'you', text: 'come to the window', t: '14:02:04' },
  { id: ++n, kind: 'me', text: 'on my way. the light is better there.', t: '14:02:05' },
  { id: ++n, kind: 'act', text: 'walk to window, 2.4 m', t: '14:02:05' },
  { id: ++n, kind: 'sense', text: 'new things in view: lamp, chair, cup', t: '14:02:07' },
  { id: ++n, kind: 'fail', text: 'path blocked by the chair. went around it.', t: '14:02:09' },
  { id: 'load-brain', kind: 'load', text: 'brain 180 of 400 mb (stub)', live: true, fraction: 0.45 },
])
const follow = ref(true)
const lines = ['sat down', 'looked at the lamp', 'turned to face you', 'picked up the cup']
function add() {
  rows.value = [...rows.value.filter((r) => !r.live), { id: ++n, kind: 'act', text: lines[n % lines.length], t: '14:02:1' + (n % 10) }, ...rows.value.filter((r) => r.live)]
}
function step() {
  rows.value = rows.value.flatMap((r) => {
    if (r.id !== 'load-brain') return [r]
    const f = Math.min(1, (r.fraction ?? 0) + 0.2)
    return f >= 1 ? [{ id: ++n, kind: 'note', text: 'brain ready, 400 mb stored for next time (stub)' }] : [{ ...r, fraction: f, text: `brain ${Math.round(f * 400)} of 400 mb (stub)` }]
  })
}
const code = `<HbEventLog :rows="rows" v-model:follow="follow" label="talk">
  <template #actions><button class="hb-chip">clear</button></template>
</HbEventLog>

// vanilla
const log = eventLog(el)
log.push('you', 'come to the window')
log.live('brain', 'brain 180 of 400 mb', 0.45)
log.live('brain', null)`
</script>

<template>
  <DemoSection
    title="Tagged line log"
    note="Speech, actions, failures, perception and loads on one timeline. The tag column names the kind; a live row is replaced in place. Scroll up and follow turns off; new rows wait behind a jump button."
    :code="code"
  >
    <div style="max-width: 560px">
      <HbEventLog v-model:follow="follow" :rows="rows" label="talk">
        <template #actions>
          <button type="button" class="hb-chip is-toggle" @click="add">add row</button>
          <button type="button" class="hb-chip is-toggle" @click="step">load step</button>
        </template>
      </HbEventLog>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'rows', type: 'HbEventRow[]', notes: '{id, kind, text, t, live, fraction}' },
      { prop: 'kinds', type: 'Record<string, {tag, tone}>', notes: 'over you, me, act, fail, warn, sense, note, think, load' },
      { prop: 'v-model:follow', type: 'boolean', default: 'true' },
      { prop: 'max', type: 'number', default: '160' },
      { prop: 'filters', type: 'boolean', default: 'true', notes: 'one chip per kind present' },
      { prop: 'label', type: 'string', default: `'log'` },
      { prop: '#actions', type: 'slot', notes: 'clear, export' },
    ]"
  />
</template>
