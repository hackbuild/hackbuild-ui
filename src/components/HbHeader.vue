<script setup lang="ts">
import HbMark from './HbMark.vue'

interface Props {
  /** The tool name, not hack.build. The mark carries the brand. */
  title?: string
  /** Trailing part of the title rendered pink, usually a dot or a suffix. */
  accent?: string
  /** The tagline, shown at reduced opacity, dropped below 900 px. */
  tagline?: string
  /** Hide the built in mark when slotting a custom logo. */
  mark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accent: '',
  tagline: '',
  mark: true,
})
</script>

<template>
  <!-- Identity and state. No verbs in here: those live in the toolbar. -->
  <header class="hb-header hb-on-ink">
    <slot name="logo">
      <HbMark v-if="props.mark" class="hb-logo" reversed :size="28" />
    </slot>
    <h1 v-if="props.title">{{ props.title }}<span v-if="props.accent">{{ props.accent }}</span></h1>
    <slot />
    <span v-if="props.tagline" class="hb-tagline">{{ props.tagline }}</span>
  </header>
</template>
