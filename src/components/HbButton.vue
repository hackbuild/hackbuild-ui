<script setup lang="ts">
import { computed } from 'vue'
import { cx } from '../utils/cx'
import { noteOnce } from '../utils/note'
import HbSpinner from './HbSpinner.vue'

interface Props {
  /**
   * secondary is the light default. go is the one pink action per screen.
   * ink is a pressed or on state. danger is light with err text.
   * primary is light since 0.10.0 and logs a note for one minor; use go
   * for the next action.
   */
  variant?: 'secondary' | 'go' | 'ink' | 'danger' | 'ghost' | 'primary'
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
  variant: 'secondary',
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

if (props.variant === 'primary') noteOnce('btn-primary', 'HbButton variant primary is light since 0.10.0; use variant go for the one pink action')

const classes = computed(() =>
  cx('hb-btn', {
    'hb-btn-go': props.variant === 'go',
    'hb-btn-ink': props.variant === 'ink',
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
