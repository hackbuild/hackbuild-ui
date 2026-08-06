<script setup lang="ts">
interface Props {
  title: string
  /** Colorless caution stripes along the top and bottom edges. */
  stripes?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  stripes: true,
})
</script>

<template>
  <!-- The closing band. Ink, centered, one pink action. The pink stays on
       the button, never the band. -->
  <section class="hb-cta hb-on-ink">
    <div v-if="props.stripes" class="hb-stripes is-top" aria-hidden="true" />
    <h2><slot name="title">{{ props.title }}</slot></h2>
    <p v-if="$slots.default" class="hb-cta-sub"><slot /></p>
    <div v-if="$slots.actions" class="hb-cta-actions"><slot name="actions" /></div>
    <div v-if="props.stripes" class="hb-stripes is-bottom" aria-hidden="true" />
  </section>
</template>
