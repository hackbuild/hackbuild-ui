<script setup lang="ts">
import { HbKv, HbPanel } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbKv label="center" value="101.100" />
<HbKv label="peak" value="-55 dBm" />
<HbKv label="state"><span class="hb-ok">locked</span></HbKv>
<HbKv label="path" value="/lumen/muse/alpha" copy />`
</script>

<template>
  <DemoSection
    title="Key and value rows"
    note="Label left, readout right, dashed divider. The workhorse row of every panel. copy adds a mark that reads check once copied, so a subscriber takes the path from where the value is shown."
    :code="code"
  >
    <HbPanel heading="Instrument" style="max-width: 360px">
      <HbKv label="center" value="101.100" />
      <HbKv label="peak" value="-55 dBm" />
      <HbKv label="floor" value="-97 dBm" />
      <HbKv label="path" value="/lumen/muse/alpha" copy />
      <HbKv label="state"><span class="hb-ok" style="font-family: var(--hb-readout); font-size: 18px">locked</span></HbKv>
    </HbPanel>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'label', type: 'string', notes: 'required' },
      { prop: 'value', type: 'string | number', notes: 'or use the default slot' },
      { prop: 'copy', type: 'boolean | string', default: 'false', notes: 'true copies value; a string copies that' },
    ]"
  />
</template>
