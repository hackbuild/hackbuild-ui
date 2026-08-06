<script setup lang="ts">
import { HbAvatar } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbAvatar initials="mz" />
<HbAvatar size="lg" src="/portrait.jpg" alt="workshop portrait" />`
</script>

<template>
  <DemoSection
    title="Avatar"
    note="A square with an ink border. This system does not crop people into circles. Initials fall back when there is no image or it fails to load."
    :code="code"
  >
    <div class="demo-row" style="align-items: flex-end; gap: 18px">
      <HbAvatar size="sm" initials="hb" />
      <HbAvatar initials="mz" />
      <HbAvatar size="lg" initials="kf" />
      <HbAvatar size="lg" src="/favicon.svg" alt="the mark as a stand in" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'src', type: 'string' },
      { prop: 'alt', type: 'string' },
      { prop: 'initials', type: 'string', notes: 'two characters at most' },
      { prop: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'` },
    ]"
  />
</template>
