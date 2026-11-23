<script setup lang="ts">
import { computed } from 'vue'
import { cx } from '../utils/cx'

interface Props {
  /** One lowercase sentence. Name the failure when there is one. */
  text?: string
  kind?: 'none' | 'ok' | 'warn' | 'err' | 'info' | 'busy'
}

const props = withDefaults(defineProps<Props>(), { text: '', kind: 'none' })

const classes = computed(() =>
  cx('hb-status', {
    'is-ok': props.kind === 'ok',
    'is-warn': props.kind === 'warn',
    'is-err': props.kind === 'err',
    'is-info': props.kind === 'info',
    'is-busy': props.kind === 'busy',
  }),
)
</script>

<template>
  <div :class="classes" role="status" aria-live="polite"><slot>{{ props.text }}</slot></div>
</template>
