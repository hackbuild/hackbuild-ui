<script setup lang="ts">
import { HbCard } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbCard>static</HbCard>
<HbCard interactive>lifts on hover</HbCard>
<HbCard interactive as="a" href="/somewhere">a link</HbCard>`
</script>

<template>
  <DemoSection
    title="Cards"
    note="Panels move nothing; cards lift 2 px on hover when they are click targets."
    :code="code"
  >
    <div class="demo-grid">
      <HbCard>
        <div class="hb-label">static</div>
        <p style="margin: 6px 0 0">Sits still. Content only.</p>
      </HbCard>
      <HbCard interactive>
        <div class="hb-label">interactive</div>
        <p style="margin: 6px 0 0">Lifts to the 7 px shadow on hover.</p>
      </HbCard>
      <HbCard interactive as="a" href="#/components/HbCard">
        <div class="hb-label">link card</div>
        <p style="margin: 6px 0 0">Rendered as an anchor.</p>
      </HbCard>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'interactive', type: 'boolean', default: 'false', notes: 'set when the card is a click target' },
      { prop: 'as', type: 'string', default: `'div'`, notes: `'a' with href for links` },
    ]"
  />
</template>
