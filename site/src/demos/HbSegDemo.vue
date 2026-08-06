<script setup lang="ts">
import { ref } from 'vue'
import { HbSeg } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const mode = ref<string | number>('easy')
const band = ref<string | number>('wfm')

const code = `<HbSeg v-model="mode" :options="['easy', 'advanced']" />
<HbSeg v-model="band" :options="[
  { label: 'WFM', value: 'wfm' },
  { label: 'NFM', value: 'nfm' },
  { label: 'AM', value: 'am' },
]" />`
</script>

<template>
  <DemoSection
    title="Segmented control"
    note="Mode switches, polarity, easy versus advanced. Two or three options only; past that it is a select."
    :code="code"
  >
    <div class="demo-row" style="gap: 24px">
      <HbSeg v-model="mode" :options="['easy', 'advanced']" />
      <HbSeg v-model="band" :options="[
        { label: 'WFM', value: 'wfm' },
        { label: 'NFM', value: 'nfm' },
        { label: 'AM', value: 'am' },
      ]" />
    </div>
    <p style="margin: 12px 0 0">
      mode <span class="hb-readout" style="font-size: 16px">{{ mode }}</span>
      · band <span class="hb-readout" style="font-size: 16px">{{ band }}</span>
    </p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'options', type: 'Array<{label, value} | string>', notes: 'required, two or three' },
      { prop: 'v-model', type: 'string | number' },
    ]"
  />
</template>
