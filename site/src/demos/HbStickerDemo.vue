<script setup lang="ts">
import { HbSticker } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbSticker>fm broadcast</HbSticker>
<HbSticker variant="secondary">rev b</HbSticker>`
</script>

<template>
  <DemoSection
    title="Band sticker"
    note="A rotated hand-lettered tag, the one place Permanent Marker is allowed at small size. One per view, never more."
    :code="code"
  >
    <div class="demo-row" style="gap: 24px">
      <HbSticker>fm broadcast</HbSticker>
      <HbSticker variant="secondary">rev b</HbSticker>
    </div>
  </DemoSection>

  <PropsTable :rows="[{ prop: 'variant', type: `'primary' | 'secondary'`, default: `'primary'` }]" />
</template>
