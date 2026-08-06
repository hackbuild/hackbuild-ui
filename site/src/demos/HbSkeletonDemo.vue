<script setup lang="ts">
import { HbCard, HbSkeleton } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbSkeleton width="40%" height="18px" />
<HbSkeleton />
<HbSkeleton width="80%" />`
</script>

<template>
  <DemoSection
    title="Skeleton"
    note="A paper-edge block that breathes while the real thing loads. Compose a few to sketch the layout that is coming."
    :code="code"
  >
    <HbCard style="max-width: 380px">
      <div class="demo-col" style="gap: 10px">
        <HbSkeleton width="40%" height="18px" />
        <HbSkeleton />
        <HbSkeleton />
        <HbSkeleton width="80%" />
      </div>
    </HbCard>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'width', type: 'string', default: '100%' },
      { prop: 'height', type: 'string', default: '1em' },
    ]"
  />
</template>
