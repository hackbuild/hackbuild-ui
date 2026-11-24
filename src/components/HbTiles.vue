<script setup lang="ts">
export interface Props {
  /** Narrower columns for a preset grid inside a panel. */
  small?: boolean
}
const props = withDefaults(defineProps<Props>(), { small: false })
</script>

<template>
  <div class="hb-tiles" :class="{ 'is-small': props.small }"><slot /></div>
</template>
