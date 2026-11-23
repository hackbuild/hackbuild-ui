<script setup lang="ts">
interface Props {
  /** Anchor point in px from the viewport's left and top. The bubble sits above it. */
  x: number
  y: number
  text?: string
  /** Ink plate for the second speaker. */
  ink?: boolean
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), { text: '', ink: false, show: true })
</script>

<template>
  <div
    class="hb-bubble"
    :class="{ 'is-ink': props.ink }"
    :hidden="!props.show"
    :style="{ left: props.x + 'px', top: props.y + 'px' }"
    role="status"
    aria-live="polite"
  ><slot>{{ props.text }}</slot></div>
</template>
