<script setup lang="ts">
interface Props {
  /** Lifts on hover. Set when the card is a click target. */
  interactive?: boolean
  /** Render as another tag, usually 'a' with an href attribute. */
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  interactive: false,
  as: 'div',
})
</script>

<template>
  <component :is="props.as" class="hb-card" :class="{ 'is-interactive': props.interactive }">
    <slot />
  </component>
</template>
