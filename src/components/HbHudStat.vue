<script setup lang="ts">
import { computed } from 'vue'
import { cx } from '../utils/cx'

interface Props {
  /** fps, frame, infer. */
  label: string
  value: string | number
  unit?: string
  /** warn when a frame budget is missed, err when the loop stalls. */
  state?: 'none' | 'warn' | 'err'
  digits?: number
}

const props = withDefaults(defineProps<Props>(), { unit: '', state: 'none', digits: 1 })

const shown = computed(() =>
  typeof props.value === 'number'
    ? Number.isFinite(props.value) ? props.value.toFixed(props.digits) : '--'
    : props.value,
)
const classes = computed(() => cx('hb-hudstat', { 'is-warn': props.state === 'warn', 'is-err': props.state === 'err' }))
</script>

<template>
  <span :class="classes"><span class="k">{{ props.label }}</span><b>{{ shown }}</b><span v-if="props.unit" class="u">{{ props.unit }}</span></span>
</template>
