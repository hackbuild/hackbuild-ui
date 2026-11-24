<script setup lang="ts">
import { computed } from 'vue'
import { cx } from '../utils/cx'

interface Props {
  /** live pulses pink. The pill shows the connection, not the task.
      busy and load blink an amber dot in two steps: a task running, never
      pink. off is dimmed. The four state words are off, load, ok, err. */
  status?: 'none' | 'live' | 'off' | 'load' | 'ok' | 'warn' | 'err' | 'busy'
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
    'is-busy': props.status === 'busy' || props.status === 'load',
    'is-off': props.status === 'off',
  }),
)
</script>

<template>
  <span :class="classes"><slot /></span>
</template>
