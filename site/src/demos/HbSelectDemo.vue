<script setup lang="ts">
import { ref } from 'vue'
import { HbField, HbSelect } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const modulation = ref<string | number>('nfm')

const code = `<HbSelect v-model="modulation" :options="[
  { label: 'NFM', value: 'nfm' },
  { label: 'WFM', value: 'wfm' },
  { label: 'USB', value: 'usb', disabled: true },
]" />`
</script>

<template>
  <DemoSection
    title="Select"
    note="Native select, system dressed. Options as strings or label value pairs, or slot option elements."
    :code="code"
  >
    <div style="max-width: 280px">
      <HbField label="modulation" for="se-a">
        <HbSelect
          id="se-a"
          v-model="modulation"
          :options="[
            { label: 'NFM', value: 'nfm' },
            { label: 'WFM', value: 'wfm' },
            { label: 'AM', value: 'am' },
            { label: 'USB', value: 'usb', disabled: true },
          ]"
        />
      </HbField>
    </div>
    <p style="margin: 4px 0 0">
      value: <span class="hb-readout" style="font-size: 16px">{{ modulation }}</span>
    </p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'options', type: 'Array<{label, value, disabled?} | string | number>' },
      { prop: 'v-model', type: 'string | number' },
      { prop: 'invalid', type: 'boolean', default: 'false' },
    ]"
  />
</template>
