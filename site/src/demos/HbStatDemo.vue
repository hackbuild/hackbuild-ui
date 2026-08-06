<script setup lang="ts">
import { HbPanel, HbStat } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbStat value="120" label="projects" />
<HbStat value="38k" label="samples lost" />`
</script>

<template>
  <DemoSection
    title="Stat blocks"
    note="The big VT323 figure with a label under it. About pages, profile headers, dashboards."
    :code="code"
  >
    <HbPanel>
      <div style="display: flex; gap: 40px; justify-content: center; flex-wrap: wrap">
        <HbStat value="120" label="projects" />
        <HbStat value="14" label="talks" />
        <HbStat value="9" label="boards spun" />
        <HbStat value="0" label="regrets" />
      </div>
    </HbPanel>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'value', type: 'string | number', notes: 'required' },
      { prop: 'label', type: 'string', notes: 'required' },
    ]"
  />
</template>
