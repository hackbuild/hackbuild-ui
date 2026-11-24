<script setup lang="ts">
import { ref } from 'vue'
import { HbStatusBar } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const presses = ref(0)
const cells = [
  { key: 'job', label: 'job', value: 'idle' },
  { key: 'device', label: 'device', value: 'webgpu' },
  { key: 'model', label: 'model', value: 'none', priority: 2 as const },
  { key: 'stored', label: 'stored', value: '1.2 gb', priority: 3 as const },
]

const code = `<HbStatusBar>
  <span>fps <b>60</b></span>
  <span>fft <b>4096</b></span>
  <span>dropped <b>0</b></span>
</HbStatusBar>`

const code2 = `<HbStatusBar
  :cells="[
    { key: 'job', label: 'job', value: 'idle' },
    { key: 'device', label: 'device', value: 'webgpu' },
    { key: 'model', label: 'model', value: 'none', priority: 2 },
    { key: 'stored', label: 'stored', value: '1.2 gb', priority: 3 },
  ]"
  action="open the event log"
  @press="log = true"
/>`
</script>

<template>
  <DemoSection
    title="Status strip"
    note="Counts and rates only, VT323, pinned at the bottom of a tool. Wrap key figures in b for the pink."
    :code="code"
  >
    <div style="margin: -16px">
      <HbStatusBar>
        <span>fps <b>60</b></span>
        <span>fft <b>4096</b></span>
        <span>audio <b>48k</b></span>
        <span>dropped <b>0</b></span>
      </HbStatusBar>
    </div>
  </DemoSection>

  <DemoSection
    title="Priority and the button form"
    note="Priority 2 cells show from 481 px of strip width, priority 3 from 761 px, so a phone keeps two cells. With action the whole strip is one button that opens the log behind it, 44 px tall on a coarse pointer."
    :code="code2"
  >
    <div style="margin: -16px">
      <HbStatusBar :cells="cells" action="open the event log" @press="presses++" />
    </div>
    <p style="margin: 24px 0 0">pressed {{ presses }} times</p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'cells', type: 'HbStatusCell[]', notes: '{ key, label, value, priority? 1 | 2 | 3 }; the default slot replaces them, a slotted cell takes data-priority' },
      { prop: 'action', type: 'string', notes: 'the strip becomes one button with this name' },
      { prop: '@press', type: 'emit', notes: 'the button form was pressed' },
    ]"
  />
</template>
