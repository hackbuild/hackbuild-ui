<script setup lang="ts">
import { ref } from 'vue'
import { HbField, HbInput, HbSelect } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const call = ref('')
const rate = ref<string | number>('2.048')

const code = `<HbField label="callsign" for="callsign" hint="optional">
  <HbInput id="callsign" v-model="call" />
</HbField>

<HbField label="callsign" for="callsign" error="letters and digits only">
  <HbInput id="callsign" v-model="call" invalid />
</HbField>`
</script>

<template>
  <DemoSection
    title="Field wrapper"
    note="Label, control, then a hint, or an error that replaces it. The for prop ties the label to the control id."
    :code="code"
  >
    <div class="demo-grid">
      <HbField label="callsign" for="fd-a" hint="optional, stamped into captures">
        <HbInput id="fd-a" v-model="call" placeholder="N0CALL" />
      </HbField>
      <HbField label="callsign" for="fd-b" error="letters and digits only">
        <HbInput id="fd-b" model-value="n0!call" invalid />
      </HbField>
      <HbField label="sample rate" for="fd-c">
        <HbSelect id="fd-c" v-model="rate" :options="['0.960', '1.024', '2.048']" />
      </HbField>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'label', type: 'string' },
      { prop: 'for', type: 'string', notes: 'id of the control in the slot' },
      { prop: 'hint', type: 'string' },
      { prop: 'error', type: 'string', notes: 'replaces the hint when present' },
    ]"
  />
</template>
