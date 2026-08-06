<script setup lang="ts">
interface Props {
  /** ink is the default plate. pink marks the one highlighted tag. */
  variant?: 'ink' | 'pink' | 'outline'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ink',
})
</script>

<template>
  <!-- Static tag: category, badge, year. The interactive cousin is HbChip. -->
  <span class="hb-tag" :class="{ 'is-pink': props.variant === 'pink', 'is-outline': props.variant === 'outline' }">
    <slot />
  </span>
</template>
