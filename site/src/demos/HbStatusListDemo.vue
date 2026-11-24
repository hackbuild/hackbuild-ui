<script setup lang="ts">
import { ref } from 'vue'
import { HbStatusList } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { suiteStatus } from '../fixtures/suite'

const went = ref('none yet')
const code = `<HbStatusList :items="items" @goto="(target) => open(target)" />`
</script>

<template>
  <DemoSection
    title="One line per subsystem"
    note="The state in words and what it means now, with the fallback named. A row with goto is a 44 px button. HbPills opens this list in a sheet on a phone."
    :code="code"
  >
    <HbStatusList :items="suiteStatus" @goto="(t) => (went = t)" />
    <p style="margin-top: 12px">goto: <code>{{ went }}</code></p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'items', type: 'HbStatusItem[]', notes: `state 'off' | 'load' | 'ok' | 'warn' | 'err'` },
      { prop: 'goto', type: 'emit', notes: '(target, key)' },
    ]"
  />
</template>
