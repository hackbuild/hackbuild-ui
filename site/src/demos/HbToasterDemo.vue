<script setup lang="ts">
import { HbButton, useToast } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const { toast } = useToast()

const code = `// render <HbToaster /> once near the app root
const { toast, dismiss } = useToast()

toast('bookmark saved')                       // 1400 ms
toast('chat exported', { kind: 'ok' })
toast('reply stopped: the engine closed.', { kind: 'err', action: { label: 'redo', run: redo } })
// errors stay until ok is pressed`
</script>

<template>
  <DemoSection
    title="Toast"
    note="One transient toast at a time, bottom center, ink plate, the rule coloured by kind, gone in about a second. Errors are held above it until ok is pressed, so a failure is never gone before it is read. One action per toast. This site renders the toaster already, so these fire for real."
    :code="code"
  >
    <div class="demo-row">
      <HbButton variant="secondary" @click="toast('bookmark saved')">short toast</HbButton>
      <HbButton variant="secondary" @click="toast('chat exported, 14 turns', { kind: 'ok' })">ok toast</HbButton>
      <HbButton variant="secondary" @click="toast('310 mb free. this model needs 290 mb.', { kind: 'warn', duration: 3000 })">warn toast</HbButton>
      <HbButton variant="secondary" @click="toast('reply stopped: the engine closed. press redo.', { kind: 'err', action: { label: 'redo', run: () => toast('redo pressed') } })">held error</HbButton>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'toast(message, options | ms)', type: '{kind, duration, action, hold}', notes: 'kind info, ok, warn, err' },
      { prop: 'dismiss(id) / clear()', type: 'function' },
      { prop: 'vanilla', type: 'toastStore(maxHeld)', notes: 'the same state for pages with no framework' },
    ]"
  />
</template>
