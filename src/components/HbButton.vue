<script setup lang="ts">
import { computed } from 'vue'
import { cx } from '../utils/cx'
import HbSpinner from './HbSpinner.vue'

interface Props {
  /** primary is the ink fill. danger is the pink fill: one per view at most. */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  /** Full width. */
  block?: boolean
  disabled?: boolean
  /** Shows the spinner and blocks clicks. */
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  /** Render as another tag, usually 'a' with an href attribute. */
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  disabled: false,
  loading: false,
  type: 'button',
  as: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const classes = computed(() =>
  cx('hb-btn', {
    'hb-btn-2': props.variant === 'secondary',
    'hb-btn-danger': props.variant === 'danger',
    'hb-btn-ghost': props.variant === 'ghost',
    'hb-btn-sm': props.size === 'sm',
    'hb-btn-lg': props.size === 'lg',
    'hb-btn-block': props.block,
    'is-disabled': props.as !== 'button' && props.disabled,
  }),
)

function onClick(event: MouseEvent) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="props.as"
    :class="classes"
    :type="props.as === 'button' ? props.type : undefined"
    :disabled="props.as === 'button' ? props.disabled || props.loading : undefined"
    :aria-busy="props.loading || undefined"
    @click="onClick"
  >
    <HbSpinner v-if="props.loading" />
    <slot v-else name="icon" />
    <slot />
  </component>
</template>
