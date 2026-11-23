<script setup lang="ts">
import { computed } from 'vue'
import { cx } from '../utils/cx'

export type HbVerdictStatus = 'pass' | 'fail' | 'not run' | 'running' | 'warn'

interface Props {
  status: HbVerdictStatus
  /** The words on the tag. Defaults to the status. */
  text?: string
}

const props = withDefaults(defineProps<Props>(), { text: '' })

const classes = computed(() =>
  cx('hb-verdict', {
    'is-pass': props.status === 'pass',
    'is-fail': props.status === 'fail',
    'is-skip': props.status === 'not run',
    'is-run': props.status === 'running',
    'is-warn': props.status === 'warn',
  }),
)
</script>

<template>
  <span :class="classes">{{ props.text || props.status }}</span>
</template>
