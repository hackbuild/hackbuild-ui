<script setup lang="ts">
import { HbAvatar, HbIcon, HbMediaCard, HbTag } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbMediaCard title="kerf" interactive>
  <!-- no media slot: the plate gets a placeholder cover seeded by the title -->
  <template #badges>
    <HbTag variant="pink">featured</HbTag>
  </template>
  <template #tags>
    <HbTag>sdr</HbTag>
  </template>
  A software radio that runs on webusb.
  <template #links>
    <a class="hb-link" href="/kerf">open the tool <HbIcon name="arrow-right" :size="12" /></a>
  </template>
  <template #footer>
    <HbAvatar size="sm" seed="virgilvox" />
    <span class="hb-label">@virgilvox</span>
    <span class="hb-stats" style="margin-left: auto">
      <span><HbIcon name="heart" :size="12" />342</span>
      <span><HbIcon name="eye" :size="12" />2.1k</span>
    </span>
  </template>
</HbMediaCard>`
</script>

<template>
  <DemoSection
    title="Media cards"
    note="The project card the resume, the mockups and the app all rebuilt: media plate on top, overlay badges, tag row, marker title, copy, quiet links, and an author footer with stats. With no media slotted, the plate carries a placeholder cover seeded by the title, so a project keeps the same face until it gets a real image."
    :code="code"
  >
    <div class="demo-grid">
      <HbMediaCard title="kerf" interactive>
        <template #badges>
          <HbTag variant="pink">featured</HbTag>
        </template>
        <template #tags>
          <HbTag>sdr</HbTag>
          <HbTag variant="outline">webusb</HbTag>
        </template>
        A software radio that runs on webusb. Plug a dongle in, tap a preset, listen.
        <template #links>
          <a class="hb-link" href="#">open the tool <HbIcon name="arrow-right" :size="12" /></a>
        </template>
        <template #footer>
          <HbAvatar size="sm" seed="virgilvox" />
          <span class="hb-label">@virgilvox</span>
          <span class="hb-stats" style="margin-left: auto">
            <span><HbIcon name="heart" :size="12" />342</span>
            <span><HbIcon name="eye" :size="12" />2.1k</span>
          </span>
        </template>
      </HbMediaCard>
      <HbMediaCard title="detent" interactive>
        <template #badges>
          <HbTag>official</HbTag>
        </template>
        <template #tags>
          <HbTag>laser</HbTag>
        </template>
        Rotary attachment calculator and job runner for the shop laser.
        <template #footer>
          <HbAvatar size="sm" seed="jonahkaye" />
          <span class="hb-label">@jonahkaye</span>
          <span class="hb-stats" style="margin-left: auto">
            <span><HbIcon name="heart" :size="12" />189</span>
            <span><HbIcon name="eye" :size="12" />1.4k</span>
          </span>
        </template>
      </HbMediaCard>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'title', type: 'string', notes: 'required, or use the title slot' },
      { prop: 'interactive', type: 'boolean', default: 'false', notes: 'pink shadow lift on hover' },
      { prop: 'as', type: 'string', default: `'div'`, notes: `'a' with href for links` },
      { prop: 'cover', type: 'boolean', default: 'true', notes: 'seeded placeholder when no media is slotted' },
      { prop: '#media / #badges / #tags / #default / #links / #footer', type: 'slots' },
    ]"
  />
</template>
