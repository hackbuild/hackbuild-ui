<script setup lang="ts">
interface Props {
  /** ink is the default plate. pink marks the one highlighted tag. The lit
      variants are outlined status tags for ink bars and the void. */
  variant?: 'ink' | 'pink' | 'outline' | 'lit-ok' | 'lit-warn' | 'lit-err'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ink',
})
</script>

<template>
  <!-- Static tag: category, badge, year. The interactive cousin is HbChip. -->
  <span class="hb-tag" :class="props.variant === 'ink' ? undefined : `is-${props.variant}`">
    <slot />
  </span>
</template>
