<script setup lang="ts">
import { HbCard, HbSectionHead } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbSectionHead
  kicker="the bench"
  title="latest projects"
  link-label="all projects"
  link-href="/projects"
/>`
</script>

<template>
  <DemoSection
    title="Section head"
    note="Opens every section of a page: optional kicker, marker title, and one quiet link pushed right. The pattern every mockup arrived at for its content rows."
    :code="code"
  >
    <HbSectionHead kicker="the bench" title="latest projects" link-label="all projects" link-href="#" />
    <div class="demo-grid">
      <HbCard><div class="hb-label">kerf</div><p style="margin: 6px 0 0">web sdr in the browser</p></HbCard>
      <HbCard><div class="hb-label">detent</div><p style="margin: 6px 0 0">laser rotary tool</p></HbCard>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'title', type: 'string', notes: 'required, or use the default slot' },
      { prop: 'kicker', type: 'string' },
      { prop: 'linkLabel / linkHref', type: 'string', notes: 'the quiet link right' },
    ]"
  />
</template>
