<script setup lang="ts">
import { computed } from 'vue'
import { cx } from '../utils/cx'

interface Props {
  /** live pulses pink. The pill shows the connection, not the task. */
  status?: 'none' | 'live' | 'ok' | 'warn' | 'err'
}

const props = withDefaults(defineProps<Props>(), {
  status: 'none',
})

const classes = computed(() =>
  cx('hb-pill', {
    'is-live': props.status === 'live',
    'is-ok': props.status === 'ok',
    'is-warn': props.status === 'warn',
    'is-err': props.status === 'err',
  }),
)
</script>

<template>
  <span :class="classes"><slot /></span>
</template>
