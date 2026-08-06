<script setup lang="ts">
import { HbTag, HbTimeline, HbTimelineItem } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbTimeline>
  <HbTimelineItem title="kerf 1.4" sub="release" period="jul 2026">
    Waterfall palettes, band stickers, and the ghost tab.
    <template #tags>
      <HbTag variant="outline">sdr</HbTag>
      <HbTag variant="outline">webusb</HbTag>
    </template>
  </HbTimelineItem>
</HbTimeline>`
</script>

<template>
  <DemoSection
    title="Timeline"
    note="Left pink rule entries. Jobs on the resume, releases in a changelog, sessions in a logbook. Marker title, uppercase sub, VT323 period pushed right."
    :code="code"
  >
    <HbTimeline style="max-width: 620px">
      <HbTimelineItem title="kerf 1.4" sub="release" period="jul 2026">
        Waterfall palettes, band stickers, and the ghost tab.
        <template #tags>
          <HbTag variant="outline">sdr</HbTag>
          <HbTag variant="outline">webusb</HbTag>
        </template>
      </HbTimelineItem>
      <HbTimelineItem title="detent 0.9" sub="beta" period="mar 2026">
        Rotary calculator lands. Angles finally land on the mark.
      </HbTimelineItem>
      <HbTimelineItem title="burr" sub="prototype" period="dec 2025">
        First board spins in the browser.
      </HbTimelineItem>
    </HbTimeline>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'title', type: 'string', notes: 'required, or use the title slot' },
      { prop: 'sub', type: 'string', notes: 'uppercase line under the title' },
      { prop: 'period', type: 'string', notes: 'VT323, pushed right' },
      { prop: '#default / #tags', type: 'slots' },
    ]"
  />
</template>
