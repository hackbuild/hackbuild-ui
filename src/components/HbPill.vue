<script setup lang="ts">
import { computed } from 'vue'
import { cx } from '../utils/cx'

interface Props {
  /** live pulses pink. The pill shows the connection, not the task.
      busy blinks an ink dot: a task running, never pink. */
  status?: 'none' | 'live' | 'ok' | 'warn' | 'err' | 'busy'
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
    'is-busy': props.status === 'busy',
  }),
)
</script>

<template>
  <span :class="classes"><slot /></span>
</template>
