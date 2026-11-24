<script setup lang="ts">
import { ref } from 'vue'
import { HbButton, HbSuiteNav } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { suiteGroups } from '../fixtures/suite'

const route = ref('vision')
const phone = ref('gait')

const code = `<HbSuiteNav v-model:route="route" :groups="groups" keys>
  <template #toolbar><HbButton size="sm">run</HbButton></template>
</HbSuiteNav>`
</script>

<template>
  <DemoSection
    title="Groups and tools"
    note="Seven groups as tabs on ink and the group's tools as chips in the toolbar from 761 px of the nav's own width. Narrower, one 44 px button reads group / tool and opens the grouped list in a sheet with a search field: type, up and down, enter. A group tab returns to the last tool used in it."
    :code="code"
  >
    <div style="margin: -16px">
      <HbSuiteNav v-model:route="route" :groups="suiteGroups">
        <template #toolbar><HbButton size="sm">run</HbButton></template>
      </HbSuiteNav>
    </div>
    <p style="margin-top: 24px">route: <code>{{ route }}</code></p>
  </DemoSection>

  <DemoSection title="Forced sheet" note="layout sheet keeps the button at every width, for a nav in a narrow column.">
    <div style="margin: -16px">
      <HbSuiteNav v-model:route="phone" :groups="suiteGroups" layout="sheet" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'groups', type: 'HbSuiteGroup[]', notes: '{ key, label, tools[] { key, label, needs } }' },
      { prop: 'v-model:route', type: 'string', notes: 'the current tool key' },
      { prop: 'layout', type: `'auto' | 'sheet' | 'strip'`, default: `'auto'`, notes: 'auto switches at 761 px of container width' },
      { prop: 'keys', type: 'boolean', default: 'false', notes: 'alt+1 to alt+9 for groups, [ and ] for tools' },
      { prop: 'item', type: 'slot', notes: 'one tool: { tool, group, on }' },
      { prop: 'toolbar', type: 'slot', notes: 'the tool verbs after the chips' },
    ]"
  />
</template>
