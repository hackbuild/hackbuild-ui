<script setup lang="ts">
import { ref } from 'vue'
import { HbSegMeter, HbSlider } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const value = ref(0.55)

const code = `<HbSegMeter :value="signal" :segments="24" :threshold="0.8" />`
</script>

<template>
  <DemoSection
    title="Segmented meter"
    note="Reads as an instrument, not a progress bar. Fills slime until it crosses the threshold, then the whole lit run flips pink. A meter that only ever grows in one color tells you nothing at a glance."
    :code="code"
  >
    <div class="demo-col" style="max-width: 460px">
      <HbSegMeter :value="value" label="signal" />
      <HbSegMeter :value="0.93" label="over threshold" />
      <HbSlider v-model="value" label="drive it" :min="0" :max="1" :step="0.01" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'value', type: 'number', notes: 'required, zero to one' },
      { prop: 'segments', type: 'number', default: '24' },
      { prop: 'threshold', type: 'number', default: '0.8', notes: 'above it the lit run flips pink' },
      { prop: 'label', type: 'string' },
    ]"
  />
</template>
