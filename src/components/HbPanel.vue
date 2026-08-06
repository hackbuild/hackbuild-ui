<script setup lang="ts">
interface Props {
  /** Panel heading. Or use the head slot. */
  heading?: string
  /** Editorial head is marker on a rule. Instrument head is VT323 on an ink
   * bar. Pick one style per artifact and keep it. */
  head?: 'editorial' | 'instrument'
  /** Sunk panels sit flush, no shadow. */
  sunk?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  head: 'editorial',
  sunk: false,
})
</script>

<template>
  <section class="hb-panel" :class="{ 'hb-panel-sunk': props.sunk }">
    <template v-if="props.heading || $slots.head">
      <div :class="props.head === 'instrument' ? 'hb-panel-hd-inst' : 'hb-panel-hd'">
        <slot name="head">{{ props.heading }}</slot>
      </div>
    </template>
    <slot />
  </section>
</template>
