<script setup lang="ts">
import { ref } from 'vue'
import { HbRadio } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const polarity = ref<string | number>('pos')

const code = `<HbRadio v-model="polarity" value="pos" name="pol">positive</HbRadio>
<HbRadio v-model="polarity" value="neg" name="pol">negative</HbRadio>`
</script>

<template>
  <DemoSection title="Radio group" :code="code">
    <div class="demo-row" style="gap: 24px">
      <HbRadio v-model="polarity" value="pos" name="demo-pol">positive</HbRadio>
      <HbRadio v-model="polarity" value="neg" name="demo-pol">negative</HbRadio>
      <HbRadio v-model="polarity" value="alt" name="demo-pol" disabled>alternating</HbRadio>
    </div>
    <p style="margin: 12px 0 0">
      value: <span class="hb-readout" style="font-size: 16px">{{ polarity }}</span>
    </p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'value', type: 'string | number', notes: 'required, the value this radio selects' },
      { prop: 'v-model', type: 'string | number' },
      { prop: 'name', type: 'string' },
      { prop: 'disabled', type: 'boolean', default: 'false' },
    ]"
  />
</template>
