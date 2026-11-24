<script setup lang="ts">
import { HbLicence } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbLicence licence="Apache-2.0" :commercial="true" />
<HbLicence :licence="record.licence" :commercial="record.commercial" quiet />`
</script>

<template>
  <DemoSection
    title="Licence as recorded"
    note="Optional: an empty licence renders nothing, and nothing is gated on it. The full line for a load panel; quiet is one line for a model row."
    :code="code"
  >
    <div style="max-width: 520px; display: flex; flex-direction: column; gap: 12px">
      <HbLicence licence="Apache-2.0" :commercial="true" />
      <HbLicence licence="CC-BY-NC-4.0" :commercial="false" />
      <HbLicence licence="Llama 3.2 Community License (inferred, unverified)" commercial="unknown" quiet />
      <HbLicence licence="" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'licence', type: 'string', notes: 'as recorded; empty hides it' },
      { prop: 'commercial', type: `boolean | 'unknown' | null` },
      { prop: 'what', type: 'string', default: `'weights'` },
      { prop: 'href', type: 'string' },
      { prop: 'quiet', type: 'boolean', default: 'false' },
    ]"
  />
</template>
