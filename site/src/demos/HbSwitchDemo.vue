<script setup lang="ts">
import { ref } from 'vue'
import { HbKv, HbSwitch } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const agc = ref(true)
const bias = ref(false)

const code = `<label class="hb-check">
  <HbSwitch v-model="agc" label="agc" /> agc
</label>`
</script>

<template>
  <DemoSection
    title="Switch"
    note="A rectangular toggle. The knob slides and goes pink when on. No radius, no glow."
    :code="code"
  >
    <div class="demo-row" style="gap: 28px">
      <label class="hb-check"><HbSwitch v-model="agc" label="agc" /> agc</label>
      <label class="hb-check"><HbSwitch v-model="bias" label="bias tee" /> bias tee</label>
      <label class="hb-check is-disabled"><HbSwitch disabled label="locked" /> locked</label>
    </div>
    <div style="max-width: 320px; margin-top: 16px">
      <HbKv label="agc" :value="agc ? 'on' : 'off'" />
      <HbKv label="bias tee" :value="bias ? 'on' : 'off'" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'boolean' },
      { prop: 'label', type: 'string', notes: 'accessible name' },
      { prop: 'disabled', type: 'boolean', default: 'false' },
    ]"
  />
</template>
