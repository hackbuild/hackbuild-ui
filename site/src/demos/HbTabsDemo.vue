<script setup lang="ts">
import { computed, ref } from 'vue'
import { HbButton, HbTabs } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const tab = ref<string | number>('radio')
const step = ref<string | number>('separate')
const separated = ref(false)
const pipeline = computed(() => [
  { label: 'separate', value: 'separate', done: separated.value },
  { label: 'transcribe', value: 'transcribe', emptyHint: separated.value ? undefined : 'separate a file first, or skip and use the mix.' },
  { label: 'export', value: 'export', emptyHint: 'transcribe a stem first.' },
])

const code = `<HbTabs v-model="tab" :tabs="['radio', 'sky', 'ghost', 'scanner', 'bench']" />`
const codeNum = `<HbTabs v-model="step" num persist-key="scribe" :tabs="[
  { label: 'separate', value: 'separate', done: separated },
  { label: 'transcribe', value: 'transcribe',
    emptyHint: separated ? undefined : 'separate a file first, or skip and use the mix.' },
  { label: 'export', value: 'export', emptyHint: 'transcribe a stem first.' },
]">
  <template #default="{ value }">...the panel for {{ value }}</template>
</HbTabs>`
</script>

<template>
  <DemoSection
    title="Tab strip"
    note="Three to eight destinations, nothing else in the strip. Arrow keys move and select with wrap, home and end jump. Before a tab would clip, the strip becomes a select, with the same measure as the steps strip; overflow scroll keeps the sideways scroll instead."
    :code="code"
  >
    <div style="margin: -16px">
      <HbTabs v-model="tab" :tabs="['radio', 'sky', 'ghost', 'scanner', 'bench']" />
    </div>
    <p style="margin: 16px 0 0">
      active: <span class="hb-readout" style="font-size: 16px">{{ tab }}</span>
    </p>
  </DemoSection>

  <DemoSection
    title="Numbered tabs with empty hints"
    note="num numbers the tabs in the order of work; a done tab fills its number green. With a default slot the component renders the tab panel, and a tab left empty names the next action instead of a blank. persist-key keeps the chosen tab across reloads."
    :code="codeNum"
  >
    <div style="margin: -16px -16px 0">
      <HbTabs v-model="step" num persist-key="site-demo-pipeline" label="pipeline" :tabs="pipeline">
        <template #default="{ value }">
          <div style="padding: 16px 16px 0">
            <template v-if="value === 'separate'">
              <HbButton size="sm" @click="separated = !separated">{{ separated ? 'undo the split' : 'split into stems' }}</HbButton>
            </template>
            <p v-else style="margin: 0">four stems ready to transcribe.</p>
          </div>
        </template>
      </HbTabs>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'tabs', type: 'Array<{label, value, done?, emptyHint?} | string>', default: '', notes: 'required' },
      { prop: 'v-model', type: 'string | number', default: '', notes: 'active tab value' },
      { prop: 'label', type: 'string', notes: 'accessible name of the strip' },
      { prop: 'idPrefix', type: 'string', notes: 'ties tabs to panels you render' },
      { prop: 'num', type: 'boolean', default: 'false', notes: 'numbered tabs' },
      { prop: 'persistKey', type: 'string', notes: 'remember the tab under hb.tabs.<key>' },
      { prop: 'overflow', type: `'collapse' | 'scroll'`, default: `'collapse'` },
      { prop: 'default', type: 'slot', notes: 'the panel; props tab, value' },
    ]"
  />
</template>
