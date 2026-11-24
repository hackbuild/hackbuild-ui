<script setup lang="ts">
import { ref } from 'vue'
import { HbParamRow, HbPresetChips, type SettingValues } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { presets } from '../fixtures/settings'

const values = ref<SettingValues>({ temp: 0.7, topP: 0.9, repeat: 1 })
const code = `<HbPresetChips v-model="values" :presets="[
  { label: 'precise', values: { temp: 0.2, topP: 0.8 }, hint: 'the same answer each time' },
]" />`
</script>

<template>
  <DemoSection
    title="Presets over the dials"
    note="One press sets every dial the preset names. The chip whose values all hold is on; move a dial and the row reads custom."
    :code="code"
  >
    <div style="max-width: 480px">
      <HbPresetChips v-model="values" :presets="presets" label="sampling presets" />
      <HbParamRow v-model="values.temp" label="temperature" :min="0" :max="1.5" :step="0.05" :default-value="0.7" />
      <HbParamRow v-model="values.topP" label="top p" :min="0.1" :max="1" :step="0.05" :default-value="0.9" />
      <HbParamRow v-model="values.repeat" label="repeat" :min="1" :max="1.5" :step="0.01" :default-value="1" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'presets', type: '{label, values, hint}[]' },
      { prop: 'v-model', type: 'Record<string, value>', notes: 'the values the presets write into' },
      { prop: 'label', type: 'string', default: `'presets'` },
      { prop: '@apply', type: 'label' },
    ]"
  />
</template>
