<script setup lang="ts">
interface Props {
  /** narrow is for docs and articles. */
  width?: 'wide' | 'narrow'
}

const props = withDefaults(defineProps<Props>(), {
  width: 'wide',
})
</script>

<template>
  <div class="hb-shell" :class="{ 'hb-shell-narrow': props.width === 'narrow' }">
    <slot />
  </div>
</template>
