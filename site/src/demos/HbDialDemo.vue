<script setup lang="ts">
import { ref } from 'vue'
import { HbDial } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const freq = ref(101.1)

const code = `<HbDial v-model="freq" :digits="3" :decimals="3" unit="MHz" :max="1766" />`
</script>

<template>
  <DemoSection
    title="The dial"
    note="One giant primary readout per tool, and only one. Click the top half of a digit to raise it, the bottom half to lower it. The wheel works per digit too. VT323, tabular, so it never jitters."
    :code="code"
  >
    <HbDial v-model="freq" :digits="3" :decimals="3" unit="MHz" :max="1766" />
    <p style="margin: 12px 0 0">
      value: <span class="hb-readout" style="font-size: 16px">{{ freq.toFixed(3) }}</span>
    </p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'number' },
      { prop: 'digits', type: 'number', default: '3', notes: 'integer places' },
      { prop: 'decimals', type: 'number', default: '3' },
      { prop: 'unit', type: 'string' },
      { prop: 'min / max', type: 'number', default: '0 / unbounded' },
      { prop: 'readonly', type: 'boolean', default: 'false' },
    ]"
  />
</template>
