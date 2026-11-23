<script setup lang="ts">
export interface HbGaugeRow {
  label: string
  /** Zero to max. */
  value: number
  /** The figure shown; defaults to the value at two digits. */
  display?: string
  /** The row the step is about. Pink; one per view. */
  current?: boolean
}

interface Props {
  rows: HbGaugeRow[]
  max?: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), { max: 1 })

const pct = (v: number) => Math.min(100, Math.max(0, props.max === 0 ? 0 : (v / props.max) * 100))
</script>

<template>
  <div class="hb-gauges" role="list" :aria-label="props.label">
    <div v-for="row in props.rows" :key="row.label" class="hb-gauge" :class="{ 'is-cur': row.current }" role="listitem">
      <span class="hb-gauge-label" :title="row.label">{{ row.label }}</span>
      <div class="hb-meter" role="meter" :aria-label="row.label" :aria-valuenow="row.value" aria-valuemin="0" :aria-valuemax="props.max">
        <i :style="{ width: pct(row.value) + '%' }" />
      </div>
      <span class="hb-gauge-value">{{ row.display ?? row.value.toFixed(2) }}</span>
    </div>
  </div>
</template>
