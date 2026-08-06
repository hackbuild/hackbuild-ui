<script setup lang="ts">
import { HbKv, HbPanel } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbKv label="center" value="101.100" />
<HbKv label="peak" value="-55 dBm" />
<HbKv label="state"><span class="hb-ok">locked</span></HbKv>`
</script>

<template>
  <DemoSection
    title="Key and value rows"
    note="Label left, readout right, dashed divider. The workhorse row of every panel."
    :code="code"
  >
    <HbPanel heading="Instrument" style="max-width: 360px">
      <HbKv label="center" value="101.100" />
      <HbKv label="peak" value="-55 dBm" />
      <HbKv label="floor" value="-97 dBm" />
      <HbKv label="state"><span class="hb-ok" style="font-family: var(--hb-readout); font-size: 18px">locked</span></HbKv>
    </HbPanel>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'label', type: 'string', notes: 'required' },
      { prop: 'value', type: 'string | number', notes: 'or use the default slot' },
    ]"
  />
</template>
