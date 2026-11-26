<script setup lang="ts">
import { ref } from 'vue'
import { HbButton, HbRackLog, type HbLogLine } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const lines = ref<HbLogLine[]>([
  { t: '10:02:11', line: 'microphone on', level: 'ok' },
  { t: '10:02:12', line: 'heard "sit", 0.91 sure', level: 'info' },
  { t: '10:02:14', line: 'the voice took 2.4 s, slower than the budget', level: 'warn' },
  { t: '10:02:19', line: 'camera denied: allow it in the address bar', level: 'error' },
])
const add = () => lines.value.push({ t: Date.now(), line: 'a new line at the foot', level: 'info' })
const code = `<HbRackLog :lines="[{ t: '10:02:11', line: 'microphone on', level: 'ok' }]" />`
</script>

<template>
  <DemoSection title="Rack log" note="For a log tab in the rack: the time in VT323, the line, the level at the right edge. An error carries a red rule. New lines go to the foot and stay in view while you have not scrolled up." :code="code">
    <div style="max-width: 380px">
      <HbRackLog :lines="lines" />
      <div class="demo-row" style="margin-top: 10px"><HbButton @click="add">add a line</HbButton></div>
    </div>
    <p class="hb-fixture"><b>fixture</b> the lines are sample text.</p>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'lines', type: '{ t, line, level? }[]', notes: `level: 'info' | 'ok' | 'warn' | 'error'; t a clock string or ms` },
      { prop: 'max', type: 'number', default: '500' },
      { prop: 'follow', type: 'boolean', default: 'true' },
      { prop: 'empty', type: 'string', default: `'nothing logged yet.'` },
    ]"
  />
</template>
