<script setup lang="ts">
import { HbButton, HbHero } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbHero kicker="hardware · tools · tutorials">
  <template #title>
    if it doesn't exist,<br />
    <span class="hb-ink-block hb-tilt-r">build it.</span>
  </template>
  Open tools, hardware notes, and the occasional radio
  that should not exist.
  <template #actions>
    <HbButton size="lg" variant="danger">see the projects</HbButton>
    <HbButton size="lg" variant="secondary">read the zine</HbButton>
  </template>
  <template #decor>
    <span class="hb-tape" style="top: 24px; left: 8%" aria-hidden="true" />
  </template>
</HbHero>`
</script>

<template>
  <DemoSection
    title="Hero"
    note="Kicker on an ink plate, the big marker headline with a solid ink block behind one phrase, prose under 68ch, and a single pink action. Tilt one thing at most. Tape goes in the decor slot, zine pages only."
    :code="code"
  >
    <div style="margin: -16px">
      <HbHero kicker="hardware · tools · tutorials">
        <template #title>
          if it doesn't exist,<br />
          <span class="hb-ink-block hb-tilt-r">build it.</span>
        </template>
        Open tools, hardware notes, and the occasional radio that should not
        exist. Everything documented, everything repeatable.
        <template #actions>
          <HbButton size="lg" variant="danger">see the projects</HbButton>
          <HbButton size="lg" variant="secondary">read the zine</HbButton>
        </template>
        <template #decor>
          <span class="hb-tape" style="top: 24px; left: 8%" aria-hidden="true" />
        </template>
      </HbHero>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'kicker', type: 'string', notes: 'VT323 tag above the headline' },
      { prop: 'kickerPink', type: 'boolean', default: 'false' },
      { prop: 'shell', type: 'boolean', default: 'true', notes: 'wraps content in HbShell' },
      { prop: '#title / #default / #actions / #decor', type: 'slots' },
    ]"
  />
</template>
