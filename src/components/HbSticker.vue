<script setup lang="ts">
interface Props {
  /** primary is the pink fill. secondary is paper with an ink border. */
  variant?: 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
})
</script>

<template>
  <!-- One per view, never more. -->
  <span class="hb-sticker" :class="{ 'hb-sticker-2': props.variant === 'secondary' }"><slot /></span>
</template>
