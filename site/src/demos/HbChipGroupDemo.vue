<script setup lang="ts">
import { ref } from 'vue'
import { HbChipGroup } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const filter = ref('')
const kinds = ref<string[]>(['webgpu'])
const code = `<HbChipGroup v-model="filter" :options="['thermal', 'night', 'sketch']" off="off" label="filter" />
<HbChipGroup v-model="kinds" multi toggle :options="['webgpu', 'wasm', 'under 100 mb']" />`
</script>

<template>
  <DemoSection
    title="One on, with a distinct off"
    note="A radiogroup: one chip in the tab order, arrows move and choose. The off choice is dashed and reads as a different kind of option; chosen, it turns warn. Letters choose with keys on."
    :code="code"
  >
    <HbChipGroup
      v-model="filter"
      :options="[{ label: 'thermal', value: 'thermal', key: 't' }, { label: 'night', value: 'night', key: 'n' }, { label: 'sketch', value: 'sketch', key: 's' }]"
      off="off"
      label="filter"
      keys
    />
    <p style="margin-top: 12px">filter: <code>{{ filter || 'off' }}</code></p>
  </DemoSection>

  <DemoSection title="Several on" note="multi: toggle buttons with aria-pressed. toggle fills ink so the pink stays with the focal value.">
    <HbChipGroup v-model="kinds" multi toggle :options="['webgpu', 'wasm', 'under 100 mb', 'english only']" label="filters" />
    <p style="margin-top: 12px">on: <code>{{ kinds.join(', ') || 'none' }}</code></p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'options', type: 'Array<HbChipOption | string>', notes: '{ label, value, key, disabled }' },
      { prop: 'v-model', type: 'string | string[]', notes: 'string single, array multi' },
      { prop: 'multi', type: 'boolean', default: 'false' },
      { prop: 'off', type: 'string', notes: 'label of the off chip, value empty' },
      { prop: 'keys', type: 'boolean', default: 'false', notes: 'bind each option key letter' },
      { prop: 'toggle', type: 'boolean', default: 'false', notes: 'ink when on' },
    ]"
  />
</template>
