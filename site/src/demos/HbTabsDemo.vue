<script setup lang="ts">
import { ref } from 'vue'
import { HbTabs } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const tab = ref<string | number>('radio')

const code = `<HbTabs v-model="tab" :tabs="['radio', 'sky', 'ghost', 'scanner', 'bench']" />`
</script>

<template>
  <DemoSection
    title="Tab strip"
    note="Three to eight destinations, nothing else in the strip. Scrolls sideways on narrow screens rather than wrapping to two lines."
    :code="code"
  >
    <div style="margin: -16px">
      <HbTabs v-model="tab" :tabs="['radio', 'sky', 'ghost', 'scanner', 'bench']" />
    </div>
    <p style="margin: 16px 0 0">
      active: <span class="hb-readout" style="font-size: 16px">{{ tab }}</span>
    </p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'tabs', type: 'Array<{label, value} | string>', default: '', notes: 'required' },
      { prop: 'v-model', type: 'string | number', default: '', notes: 'active tab value' },
    ]"
  />
</template>
