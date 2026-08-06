<script setup lang="ts">
import { HbKv, HbPanel } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbPanel heading="Tuning">
  <HbKv label="center" value="433.920" />
</HbPanel>

<HbPanel heading="tuning" head="instrument">...</HbPanel>`
</script>

<template>
  <DemoSection
    title="Two panel heads"
    note="Marker on a rule is the editorial head. VT323 on a full-bleed ink bar is the instrument head. Pick one per artifact and use it for every panel in that artifact."
    :code="code"
  >
    <div class="demo-grid">
      <HbPanel heading="Editorial head">
        <HbKv label="center" value="433.920" />
        <HbKv label="floor" value="-97 dBm" />
      </HbPanel>
      <HbPanel heading="instrument head" head="instrument">
        <HbKv label="center" value="433.920" />
        <HbKv label="floor" value="-97 dBm" />
      </HbPanel>
    </div>
  </DemoSection>

  <DemoSection title="Sunk" note="A well that sits flush, no shadow. For panels inside panels.">
    <HbPanel heading="Sunk panel" sunk>
      <p style="margin: 0">Toolbars, table stripes and wells use the sunk surface.</p>
    </HbPanel>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'heading', type: 'string', notes: 'or use the head slot' },
      { prop: 'head', type: `'editorial' | 'instrument'`, default: `'editorial'`, notes: 'one style per artifact' },
      { prop: 'sunk', type: 'boolean', default: 'false' },
    ]"
  />
</template>
