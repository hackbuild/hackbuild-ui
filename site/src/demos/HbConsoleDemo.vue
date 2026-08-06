<script setup lang="ts">
import { ref } from 'vue'
import { HbButton, HbConsole, type HbConsoleLine } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const lines = ref<HbConsoleLine[]>([
  { t: '14:02:11', text: 'dongle connected, rtl2832u', level: 'ok' },
  { t: '14:02:12', text: 'sample rate 2.048 msps' },
  { t: '14:02:19', text: 'tuned 101.100 mhz', level: 'hit' },
  { t: '14:03:41', text: 'buffer underrun, 12 samples', level: 'warn' },
  { t: '14:04:02', text: 'usb stall, resetting endpoint', level: 'err' },
])

let n = 0
function append() {
  n += 1
  lines.value.push({ t: '14:05:0' + (n % 10), text: 'marker ' + n, level: 'info' })
}

const code = `<HbConsole :lines="[
  { t: '14:02:11', text: 'dongle connected', level: 'ok' },
  { t: '14:04:02', text: 'usb stall', level: 'err' },
]" />`
</script>

<template>
  <DemoSection
    title="Console"
    note="Void background, VT323, newest line at the top, one color per severity from the lit set. Pass lines oldest first; the component flips them."
    :code="code"
  >
    <HbConsole :lines="lines" height="150px" />
    <div style="margin-top: 12px">
      <HbButton size="sm" variant="secondary" @click="append">append a line</HbButton>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'lines', type: 'Array<{text, t?, level?}>', notes: 'level: ok, warn, err, info, hit' },
      { prop: 'newestFirst', type: 'boolean', default: 'true' },
      { prop: 'height', type: 'string', default: `'180px'` },
    ]"
  />
</template>
