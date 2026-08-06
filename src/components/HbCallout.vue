<script setup lang="ts">
import { computed } from 'vue'
import { cx } from '../utils/cx'

interface Props {
  /** pink is emphasis. The signal variants are for data commentary only. */
  variant?: 'pink' | 'ok' | 'warn' | 'err' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'pink',
})

const classes = computed(() =>
  cx('hb-callout', {
    'is-ok': props.variant === 'ok',
    'is-warn': props.variant === 'warn',
    'is-err': props.variant === 'err',
    'is-info': props.variant === 'info',
  }),
)
</script>

<template>
  <!-- One or two per page. -->
  <div :class="classes"><slot /></div>
</template>
