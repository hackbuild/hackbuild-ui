<script setup lang="ts">
import { computed } from 'vue'

export interface HbReadoutRow {
  /** Carry the source in the label: "fps p50 (measured)". */
  label: string
  value: string | number
  unit?: string
  /** The one live value of the view. Pink; one per view. */
  focal?: boolean
}

interface Props {
  /** Rows, or a label to value record the way the example pages write it. */
  rows: HbReadoutRow[] | Record<string, string | number>
  /** Digits for numbers under 100. Numbers at 100 and over show none. */
  digits?: number
}

const props = withDefaults(defineProps<Props>(), { digits: 2 })

function fmt(v: string | number): string {
  if (typeof v !== 'number') return v
  if (!Number.isFinite(v)) return String(v)
  if (Number.isInteger(v)) return String(v)
  return Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(props.digits)
}

const list = computed<HbReadoutRow[]>(() =>
  Array.isArray(props.rows)
    ? props.rows
    : Object.entries(props.rows).map(([label, value]) => ({ label, value })),
)
</script>

<template>
  <div class="hb-readouts">
    <div v-for="row in list" :key="row.label" class="hb-kv" :class="{ 'is-focal': row.focal }">
      <span>{{ row.label }}</span>
      <span class="hb-readout">{{ fmt(row.value) }}<template v-if="row.unit"> {{ row.unit }}</template></span>
    </div>
  </div>
</template>
