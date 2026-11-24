<script setup lang="ts">
import { HbTimeline, HbTimelineItem } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbTimelineItem title="0.6.0" sub="minor" period="nov 2026">
  demos for every component.
</HbTimelineItem>`
</script>

<template>
  <DemoSection title="Timeline item" note="One entry on the left rule: title, an uppercase sub line, the period pushed right, then the body." :code="code">
    <HbTimeline>
      <HbTimelineItem title="0.6.0" sub="minor" period="nov 2026">demos for every component.</HbTimelineItem>
      <HbTimelineItem title="0.5.0" sub="minor" period="nov 2026">suite shell and model manager.</HbTimelineItem>
    </HbTimeline>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'title', type: 'string' },
      { prop: 'sub', type: 'string' },
      { prop: 'period', type: 'string' },
    ]"
  />
</template>
