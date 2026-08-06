<script setup lang="ts">
import { HbDropdown, useToast } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const { toast } = useToast()

const items = [
  { label: 'wav capture', value: 'wav' },
  { label: 'iq samples', value: 'iq' },
  { label: 'csv log', value: 'csv', disabled: true },
]

const code = `<HbDropdown label="export" :items="[
  { label: 'wav capture', value: 'wav' },
  { label: 'iq samples', value: 'iq' },
  { label: 'csv log', value: 'csv', disabled: true },
]" @select="onExport" />`
</script>

<template>
  <DemoSection
    title="Action menu"
    note="A raised panel of actions under a trigger. Closes on outside click and escape."
    :code="code"
  >
    <div class="demo-row" style="gap: 24px">
      <HbDropdown label="export" :items="items" @select="toast('export ' + $event)" />
      <HbDropdown label="right aligned" align="right" :items="items" @select="toast('export ' + $event)" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'label', type: 'string', notes: 'trigger text, or use the trigger slot' },
      { prop: 'items', type: 'Array<{label, value, disabled?}>' },
      { prop: 'align', type: `'left' | 'right'`, default: `'left'` },
      { prop: '@select', type: 'emit', notes: 'item value' },
    ]"
  />
</template>
