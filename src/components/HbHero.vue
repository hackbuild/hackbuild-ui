<script setup lang="ts">
import HbShell from './HbShell.vue'

interface Props {
  /** The VT323 tag on an ink plate above the headline. */
  kicker?: string
  kickerPink?: boolean
  /** Skip the built in shell when composing your own layout. */
  shell?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  kickerPink: false,
  shell: true,
})
</script>

<template>
  <!-- The big marker headline. Put an ink plate behind one phrase with
       .hb-ink-block, tilt at most one thing, and keep a single pink action. -->
  <section class="hb-hero">
    <slot name="decor" />
    <component :is="props.shell ? HbShell : 'div'">
      <span v-if="props.kicker" class="hb-kicker hb-tilt-l" :class="{ 'is-pink': props.kickerPink }">
        {{ props.kicker }}
      </span>
      <h1 v-if="$slots.title" style="margin-top: 14px" class="hb-hero-title"><slot name="title" /></h1>
      <div v-if="$slots.default" class="hb-prose"><slot /></div>
      <div v-if="$slots.actions" class="hb-hero-actions"><slot name="actions" /></div>
    </component>
  </section>
</template>
