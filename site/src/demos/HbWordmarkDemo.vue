<script setup lang="ts">
import { HbWordmark } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbWordmark :size="22" />`
</script>

<template>
  <DemoSection
    title="Wordmark"
    note="IBM Plex Mono 700. hack in ink, then the dot and build both pink. Setting only the dot pink is the most common mistake."
    :code="code"
  >
    <div class="demo-col">
      <HbWordmark :size="16" />
      <HbWordmark :size="26" />
      <HbWordmark :size="40" />
    </div>
  </DemoSection>

  <DemoSection title="On ink" note="Wrap in .hb-on-ink so hack flips to paper.">
    <span class="hb-on-ink" style="padding: 16px 20px; display: inline-block">
      <HbWordmark :size="26" />
    </span>
  </DemoSection>

  <PropsTable :rows="[{ prop: 'size', type: 'number | string', default: '18', notes: 'font size' }]" />
</template>
