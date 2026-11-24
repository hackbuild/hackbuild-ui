<script setup lang="ts">
import { ref } from 'vue'
import { HbReasons, type HbReasonRow } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { reasons } from '../fixtures/models'

const rows = ref<HbReasonRow[]>(reasons.map((r) => ({ ...r })))
function edit(key: string) {
  rows.value = rows.value.map((r) => (r.key === key ? { ...r, changed: !r.changed } : r))
}
const code = `<HbReasons :rows="suggestDefaults(env).reasons" @edit="openSetting" />`
</script>

<template>
  <DemoSection
    title="Defaults with reasons"
    note="One row per default: the value, why it was picked on this machine, and edit. A row the person changed reads your choice. Press edit to see it."
    :code="code"
  >
    <div style="max-width: 560px">
      <HbReasons :rows="rows" @edit="edit" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'rows', type: '{key, label, value, why, speed, changed, edit}[]', notes: 'the reasons from suggestDefaults' },
      { prop: 'editLabel', type: 'string', default: `'edit'` },
      { prop: 'slots', type: 'edit (row)' },
      { prop: 'emits', type: 'edit(key)' },
    ]"
  />
</template>
