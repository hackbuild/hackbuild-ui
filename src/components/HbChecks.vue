<script setup lang="ts">
import { computed } from 'vue'
import HbVerdict from './HbVerdict.vue'

export interface HbCheckRow {
  /** The check's id, as the docs table names it. */
  id: string
  status: 'pass' | 'fail' | 'not run' | 'running'
  /** Why it failed or did not run, in words. */
  reason?: string
  /** The measured figure, with its unit and source word. */
  value?: string | number
}

interface Props {
  rows: HbCheckRow[]
  caption?: string
}

const props = withDefaults(defineProps<Props>(), { caption: '' })

const counts = computed(() => {
  const c = { pass: 0, fail: 0, 'not run': 0, running: 0 }
  for (const r of props.rows) c[r.status]++
  return c
})
const hasValue = computed(() => props.rows.some((r) => r.value !== undefined && r.value !== ''))
</script>

<template>
  <div>
    <div class="hb-checks-sum" role="status">
      <span>{{ counts.pass }} pass</span>
      <span>{{ counts.fail }} fail</span>
      <span>{{ counts['not run'] }} not run</span>
      <span v-if="counts.running">{{ counts.running }} running</span>
    </div>
    <div class="hb-scroll-x">
      <table class="hb-table hb-checks">
        <caption v-if="props.caption" class="hb-sr">{{ props.caption }}</caption>
        <thead>
          <tr><th scope="col">check</th><th scope="col">result</th><th scope="col">reason</th><th v-if="hasValue" scope="col" class="num">figure</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in props.rows" :key="r.id" :class="{ 'is-fail': r.status === 'fail' }">
            <td class="id">{{ r.id }}</td>
            <td><HbVerdict :status="r.status" /></td>
            <td class="why">{{ r.reason || '' }}</td>
            <td v-if="hasValue" class="num">{{ r.value ?? '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
