<script setup lang="ts">
import { ref } from 'vue'
import { HbField, HbInput } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const freq = ref('433.920')

const code = `<HbInput v-model="freq" placeholder="433.920" inputmode="decimal" />
<HbInput v-model="freq" invalid />`
</script>

<template>
  <DemoSection
    title="Text input"
    note="Raised paper, ink border, pink focus ring. Native attributes fall through: placeholder, type, inputmode, disabled."
    :code="code"
  >
    <div class="demo-grid">
      <HbField label="center frequency" for="in-a" hint="mhz, 24 to 1766">
        <HbInput id="in-a" v-model="freq" inputmode="decimal" />
      </HbField>
      <HbField label="invalid" for="in-b" error="out of tuner range">
        <HbInput id="in-b" model-value="9000.000" invalid />
      </HbField>
      <HbField label="disabled" for="in-c">
        <HbInput id="in-c" model-value="locked by profile" disabled />
      </HbField>
    </div>
    <p style="margin: 4px 0 0">
      value: <span class="hb-readout" style="font-size: 16px">{{ freq }}</span>
    </p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'string | number' },
      { prop: 'invalid', type: 'boolean', default: 'false', notes: 'red border' },
    ]"
  />
</template>
