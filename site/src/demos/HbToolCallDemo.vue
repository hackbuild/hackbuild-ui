<script setup lang="ts">
import { HbToolCall } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbToolCall name="search_memory" :args="{ query: 'crimp' }" state="running" />
<HbToolCall name="read_pin" :args="{ pin: 26 }" :result="{ value: 2048 }" state="ok" :ms="14" />`
</script>

<template>
  <DemoSection
    title="Tool call card"
    note="A running call is open with its arguments. A finished one costs one line: name, arguments cut at 80, the state and the time. Press to see the arguments and the result, cut at 1200."
    :code="code"
  >
    <div class="demo-col" style="max-width: 640px">
      <HbToolCall name="search_memory" :args="{ query: 'crimping 22 awg', k: 4 }" state="running" />
      <HbToolCall name="read_pin" :args="{ pin: 26, mode: 'analog' }" :result="{ value: 2048, volts: 1.65 }" state="ok" :ms="14" />
      <HbToolCall name="get_location" :args="{}" error="permission denied: location is blocked for this site." state="error" :ms="12" />
      <HbToolCall name="set_servo" :args="{ ch: 2, deg: 90 }" state="ok" restored />
      <div class="demo-row">
        <HbToolCall chip name="read_pin" :args="{ pin: 26 }" :result="2048" :ms="9" />
        <HbToolCall chip name="search_memory" state="running" />
      </div>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'name / args / result', type: 'string / unknown / unknown' },
      { prop: 'state', type: `'running' | 'ok' | 'error'` },
      { prop: 'error / ms', type: 'string / number | null' },
      { prop: 'chip / restored', type: 'boolean' },
    ]"
  />
</template>
