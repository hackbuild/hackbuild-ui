<script setup lang="ts">
import { HbTable, type HbTableColumn } from '@hackbuild/ui'

export interface PropRow {
  [key: string]: unknown
  prop: string
  type: string
  default?: string
  notes?: string
}

interface Props {
  rows: PropRow[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'props',
})

const columns: HbTableColumn[] = [
  { key: 'prop', label: 'prop' },
  { key: 'type', label: 'type' },
  { key: 'default', label: 'default' },
  { key: 'notes', label: 'notes' },
]
</script>

<template>
  <div>
    <div class="hb-label" style="margin-bottom: 6px">{{ props.title }}</div>
    <HbTable :columns="columns" :rows="props.rows" />
  </div>
</template>
