<script setup lang="ts">
import { HbTag } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbTag>hardware</HbTag>
<HbTag variant="pink">featured</HbTag>
<HbTag variant="outline">2026</HbTag>`
</script>

<template>
  <DemoSection
    title="Tags"
    note="Static VT323 tags on a plate: category, badge, year. Not a control; the interactive cousin is HbChip. One pink tag per card at most."
    :code="code"
  >
    <div class="demo-row">
      <HbTag>hardware</HbTag>
      <HbTag>sdr</HbTag>
      <HbTag variant="pink">featured</HbTag>
      <HbTag variant="outline">2026</HbTag>
      <HbTag variant="outline">rev b</HbTag>
    </div>
  </DemoSection>

  <PropsTable :rows="[{ prop: 'variant', type: `'ink' | 'pink' | 'outline'`, default: `'ink'` }]" />
</template>
