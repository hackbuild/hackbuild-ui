<script setup lang="ts">
import { HbButton, HbCta, HbIcon } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbCta title="let's build something">
  Got a weird hardware project? Want to collaborate on tools?
  <template #actions>
    <HbButton size="lg" variant="danger">
      <template #icon><HbIcon name="comment" /></template>
      get in touch
    </HbButton>
    <HbButton size="lg" variant="ghost">see the source</HbButton>
  </template>
</HbCta>`
</script>

<template>
  <DemoSection
    title="Call to action band"
    note="The closing band: ink, centered, colorless caution stripes on the edges. The resume closed on a solid pink band; the one-accent rule moves the pink onto the single primary button instead."
    :code="code"
  >
    <div style="margin: -16px">
      <HbCta title="let's build something">
        Got a weird hardware project? Want to collaborate on tools? Hit me up.
        <template #actions>
          <HbButton size="lg" variant="danger">
            <template #icon><HbIcon name="comment" /></template>
            get in touch
          </HbButton>
          <HbButton size="lg" variant="ghost">see the source</HbButton>
        </template>
      </HbCta>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'title', type: 'string', notes: 'required, or use the title slot' },
      { prop: 'stripes', type: 'boolean', default: 'true', notes: 'caution stripes top and bottom' },
      { prop: '#default / #actions', type: 'slots' },
    ]"
  />
</template>
