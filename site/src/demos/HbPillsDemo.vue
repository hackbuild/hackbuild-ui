<script setup lang="ts">
import { ref } from 'vue'
import { HbHeader, HbPills } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { suiteStatus } from '../fixtures/suite'

const went = ref('none yet')
const code = `<HbPills :items="items" @goto="(target) => open(target)" />`
</script>

<template>
  <DemoSection
    title="Header status"
    note="One pill per subsystem: off, loading, ready, degraded, failed. A pill with goto is a button. Under 641 px the pills become one 44 px button of dots with a ready count from 360 px; it opens the status list in a sheet."
    :code="code"
  >
    <div style="margin: -16px">
      <HbHeader title="suite" accent=".">
        <HbPills :items="suiteStatus" @goto="(t) => (went = t)" />
      </HbHeader>
    </div>
    <p style="margin-top: 24px">goto: <code>{{ went }}</code></p>
  </DemoSection>

  <DemoSection title="On paper" note="compact off keeps the pills at every width.">
    <HbPills :items="suiteStatus.slice(0, 4)" :compact="false" />
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'items', type: 'HbStatusItem[]', notes: '{ key, label, state, title, goto }' },
      { prop: 'compact', type: 'boolean', default: 'true', notes: 'dots and count under 641 px' },
      { prop: 'label', type: 'string', default: `'status'`, notes: 'group name and sheet title' },
      { prop: 'goto', type: 'emit', notes: '(target, key)' },
    ]"
  />
</template>
