<script setup lang="ts">
import { ref } from 'vue'
import { HbMeter, HbSlider } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const value = ref(64)

const code = `<HbMeter :value="64" label="buffer" />
<HbMeter :value="3.2" :max="4" label="voltage" />`
</script>

<template>
  <DemoSection title="Meter" note="Pink fill on an ink track, hard edges. A plain quantity, no threshold semantics; use the segmented meter for signals." :code="code">
    <div class="demo-col" style="max-width: 420px">
      <HbMeter :value="value" label="buffer" />
      <HbMeter :value="3.2" :max="4" label="voltage" />
      <HbSlider v-model="value" label="drive it" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'value', type: 'number', notes: 'required' },
      { prop: 'max', type: 'number', default: '100' },
      { prop: 'label', type: 'string', notes: 'accessible name' },
    ]"
  />
</template>
