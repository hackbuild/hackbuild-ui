<script setup lang="ts">
import { HbMark } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbMark :size="28" />
<HbMark :size="56" />
<HbMark reversed :size="56" />  <!-- on ink or void -->`
</script>

<template>
  <DemoSection
    title="Sizes"
    note="16 px floor on screen. Clear space all round: half the mark height."
    :code="code"
  >
    <div class="demo-row" style="align-items: flex-end; gap: 24px">
      <HbMark :size="16" />
      <HbMark :size="28" />
      <HbMark :size="56" />
      <HbMark :size="120" />
    </div>
  </DemoSection>

  <DemoSection title="Reversed" note="Arc flips to paper on ink and void backgrounds. The wrench stays pink always.">
    <div class="demo-row">
      <span style="background: var(--hb-ink); padding: 20px; display: inline-flex">
        <HbMark reversed :size="56" />
      </span>
      <span style="background: var(--hb-void); padding: 20px; display: inline-flex">
        <HbMark reversed :size="56" />
      </span>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'size', type: 'number | string', default: '28', notes: '16 px floor on screen' },
      { prop: 'reversed', type: 'boolean', default: 'false', notes: 'arc in paper for dark surfaces' },
      { prop: 'label', type: 'string', default: 'hack.build mark', notes: 'accessible name' },
    ]"
  />
</template>
