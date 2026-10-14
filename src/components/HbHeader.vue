<script setup lang="ts">
import HbMark from './HbMark.vue'

interface Props {
  /** The tool name, not hack.build. The mark carries the brand. */
  title?: string
  /** Trailing part of the title rendered pink, usually a dot or a suffix. */
  accent?: string
  /** Rendered after the accent in paper, so only the accent is pink:
      title PIP, accent '.', suffix 'bench'. */
  suffix?: string
  /** The tagline, shown at reduced opacity, dropped below 900 px. */
  tagline?: string
  /** brand: the brand line in Libre Baskerville italic. tool: a tool
      tagline in Special Elite. */
  taglineKind?: 'brand' | 'tool'
  /** Hide the built in mark when slotting a custom logo. */
  mark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accent: '',
  suffix: '',
  tagline: '',
  taglineKind: 'brand',
  mark: true,
})
</script>

<template>
  <!-- Identity and state. No verbs in here: those live in the toolbar. -->
  <header class="hb-header hb-on-ink">
    <slot name="logo">
      <HbMark v-if="props.mark" class="hb-logo" reversed :size="28" />
    </slot>
    <h1 v-if="props.title">{{ props.title }}<span v-if="props.accent">{{ props.accent }}</span><span v-if="props.suffix" class="hb-suffix">{{ props.suffix }}</span></h1>
    <slot />
    <span v-if="props.tagline" class="hb-tagline" :class="{ 'is-tool': props.taglineKind === 'tool' }">{{ props.tagline }}</span>
  </header>
</template>
