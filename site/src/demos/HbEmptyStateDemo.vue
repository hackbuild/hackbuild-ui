<script setup lang="ts">
import { HbButton, HbEmptyState } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbEmptyState title="no captures yet">
  Connect a dongle and hit record. Sessions land here.
  <template #action>
    <HbButton size="sm">record</HbButton>
  </template>
</HbEmptyState>`
</script>

<template>
  <DemoSection
    title="Empty state"
    note="A dashed well that says what is missing and what to do about it. Name the failure mode instead of hiding it."
    :code="code"
  >
    <HbEmptyState title="no captures yet">
      Connect a dongle and hit record. Sessions land here.
      <template #action>
        <HbButton size="sm">record</HbButton>
      </template>
    </HbEmptyState>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'title', type: 'string', notes: 'required' },
      { prop: '#default', type: 'slot', notes: 'body text' },
      { prop: '#action', type: 'slot', notes: 'usually one small button' },
    ]"
  />
</template>
