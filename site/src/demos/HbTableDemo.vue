<script setup lang="ts">
import { HbPill, HbTable, type HbTableColumn } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const columns: HbTableColumn[] = [
  { key: 'addr', label: 'address' },
  { key: 'type', label: 'type' },
  { key: 'state', label: 'state' },
  { key: 'rssi', label: 'rssi', numeric: true },
  { key: 'seen', label: 'seen', numeric: true },
]

const rows = [
  { addr: 'a4:c1:38:0b:11:02', type: 'ble beacon', state: 'ok', rssi: -61, seen: 214 },
  { addr: '5c:02:14:9f:33:d8', type: 'thermometer', state: 'ok', rssi: -74, seen: 96 },
  { addr: 'ec:81:0a:44:7c:1f', type: 'tire sensor', state: 'err', rssi: -88, seen: 12 },
]

const code = `<HbTable :columns="columns" :rows="rows">
  <template #cell-state="{ value }">
    <HbPill :status="value === 'ok' ? 'ok' : 'err'">{{ value }}</HbPill>
  </template>
</HbTable>`
</script>

<template>
  <DemoSection
    title="Declarative table"
    note="Ink header, dashed cell rules, sunk stripes, pink wash on hover. Numeric columns right align with tabular figures. Wide tables scroll inside their own wrapper instead of pushing the page sideways. Cell slots override rendering."
    :code="code"
  >
    <HbTable :columns="columns" :rows="rows">
      <template #cell-state="{ value }">
        <HbPill :status="value === 'ok' ? 'ok' : 'err'">{{ String(value) }}</HbPill>
      </template>
    </HbTable>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'columns', type: 'Array<{key, label, numeric?}>' },
      { prop: 'rows', type: 'Array<Record<string, unknown>>' },
      { prop: '#cell-<key>', type: 'scoped slot', notes: 'receives row and value' },
      { prop: '#default / #head', type: 'slots', notes: 'or bring your own tbody and thead' },
    ]"
  />
</template>
