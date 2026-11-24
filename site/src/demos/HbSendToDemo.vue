<script setup lang="ts">
import { HbSendTo, useToast, type HbSendTarget } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const { toast } = useToast()

// Fixture targets: tool names and reasons are sample data.
const targets: HbSendTarget[] = [
  { id: 'room', label: 'room', icon: 'cube' },
  { id: 'image', label: 'image', icon: 'image', reason: 'no image model loaded' },
  { id: 'notes', label: 'notes', icon: 'book' },
  { id: 'voice', label: 'voice', icon: 'microphone', reason: 'mic is off' },
]

const code = `<HbSendTo :targets="[
  { id: 'room', label: 'room', icon: 'cube' },
  { id: 'image', label: 'image', icon: 'image', reason: 'no image model loaded' },
]" @send="sendTo" />`
</script>

<template>
  <DemoSection
    title="Send to"
    note="An HbDropdown of tools that can take this result. Each row names the tool and shows an icon for what it takes; a target with a reason is disabled and says why beside its name. Keys, focus and outside press are the dropdown's. For actions on a pressed thing in the scene use HbContextMenu instead."
    :code="code"
  >
    <div class="demo-row" style="gap: 24px">
      <HbSendTo :targets="targets" @send="toast('sent to ' + $event)" />
      <HbSendTo label="send reply" align="right" :targets="targets" @send="toast('sent to ' + $event)" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'targets', type: 'Array<{id, label, icon?, reason?}>', notes: 'a reason disables the row and shows beside it' },
      { prop: 'label', type: 'string', default: `'send to'` },
      { prop: 'align', type: `'left' | 'right'`, default: `'left'` },
      { prop: '@send', type: 'emit', notes: 'target id' },
    ]"
  />
</template>
