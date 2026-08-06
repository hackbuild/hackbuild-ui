<script setup lang="ts">
import { HbShell } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbShell>wide, 1180 px, for apps and pages</HbShell>
<HbShell width="narrow">narrow, 860 px, for docs and articles</HbShell>`
</script>

<template>
  <DemoSection
    title="Content shells"
    note="Centered max width columns. This site runs inside one."
    :code="code"
  >
    <div class="demo-col">
      <HbShell style="background: var(--hb-pink-10); padding-top: 8px; padding-bottom: 8px">
        <span class="hb-label">hb-shell · 1180 px</span>
      </HbShell>
      <HbShell width="narrow" style="background: var(--hb-pink-10); padding-top: 8px; padding-bottom: 8px">
        <span class="hb-label">hb-shell-narrow · 860 px</span>
      </HbShell>
    </div>
  </DemoSection>

  <PropsTable :rows="[{ prop: 'width', type: `'wide' | 'narrow'`, default: `'wide'` }]" />
</template>
