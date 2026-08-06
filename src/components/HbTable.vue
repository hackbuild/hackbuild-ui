<script setup lang="ts">
export interface HbTableColumn {
  key: string
  label: string
  /** Right aligned tabular numerals. */
  numeric?: boolean
}

interface Props {
  /** Declarative mode. Or skip both props and slot in your own rows. */
  columns?: HbTableColumn[]
  rows?: Array<Record<string, unknown>>
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  rows: () => [],
})
</script>

<template>
  <!-- Wide tables scroll inside their own wrapper rather than pushing the
       page sideways. -->
  <div class="hb-scroll-x">
    <table class="hb-table">
      <thead v-if="props.columns.length">
        <tr>
          <th v-for="column in props.columns" :key="column.key" :class="{ num: column.numeric }">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <slot name="head" />
      <tbody v-if="props.rows.length">
        <tr v-for="(row, index) in props.rows" :key="index">
          <td v-for="column in props.columns" :key="column.key" :class="{ num: column.numeric }">
            <slot :name="'cell-' + column.key" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
      <slot />
    </table>
  </div>
</template>
