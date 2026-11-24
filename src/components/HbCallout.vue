<script setup lang="ts">
import { computed } from 'vue'
import { cx } from '../utils/cx'

interface Props {
  /** pink is emphasis. The signal variants are for data commentary only. */
  variant?: 'pink' | 'ok' | 'warn' | 'err' | 'info'
  /** A short head in the utility face: 'context full', 'reality check'. */
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'pink',
  title: '',
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
  <!-- One or two per page. The actions slot holds the fixes, inline: a
       context full banner carries "new chat" and "drop oldest turns". -->
  <div :class="classes" :role="props.variant === 'err' ? 'alert' : undefined">
    <span v-if="props.title" class="hb-callout-title">{{ props.title }}</span>
    <slot />
    <div v-if="$slots.actions" class="hb-callout-acts"><slot name="actions" /></div>
  </div>
</template>
