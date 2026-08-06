<script setup lang="ts">
import { HbIcon, HbMark, HbMediaCard, HbTag } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbMediaCard title="kerf" interactive>
  <template #media><img src="/kerf-cover.png" alt="kerf spectrum view" /></template>
  <template #tags>
    <HbTag>sdr</HbTag>
    <HbTag variant="pink">featured</HbTag>
  </template>
  A software radio that runs on webusb. Plug a dongle in, tap a preset.
  <template #links>
    <a class="hb-link" href="/kerf">open the tool <HbIcon name="arrow-right" :size="12" /></a>
    <a class="hb-link" href="/kerf-notes">build notes <HbIcon name="arrow-right" :size="12" /></a>
  </template>
</HbMediaCard>`
</script>

<template>
  <DemoSection
    title="Media cards"
    note="The project card the resume and the mockups kept rebuilding: media plate on top, tag row, marker title, copy, quiet links along the bottom. The plate takes an image, an icon, or anything slotted."
    :code="code"
  >
    <div class="demo-grid">
      <HbMediaCard title="kerf" interactive>
        <template #media><HbMark reversed :size="72" /></template>
        <template #tags>
          <HbTag>sdr</HbTag>
          <HbTag variant="pink">featured</HbTag>
        </template>
        A software radio that runs on webusb. Plug a dongle in, tap a preset, listen.
        <template #links>
          <a class="hb-link" href="#">open the tool <HbIcon name="arrow-right" :size="12" /></a>
          <a class="hb-link" href="#">build notes <HbIcon name="arrow-right" :size="12" /></a>
        </template>
      </HbMediaCard>
      <HbMediaCard title="detent" interactive>
        <template #media><HbIcon name="bolt" :size="56" /></template>
        <template #tags>
          <HbTag>laser</HbTag>
          <HbTag variant="outline">2026</HbTag>
        </template>
        Rotary attachment calculator and job runner for the shop laser.
        <template #links>
          <a class="hb-link" href="#">open the tool <HbIcon name="arrow-right" :size="12" /></a>
        </template>
      </HbMediaCard>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'title', type: 'string', notes: 'required, or use the title slot' },
      { prop: 'interactive', type: 'boolean', default: 'false', notes: 'pink shadow lift on hover' },
      { prop: 'as', type: 'string', default: `'div'`, notes: `'a' with href for links` },
      { prop: '#media / #tags / #default / #links', type: 'slots' },
    ]"
  />
</template>
