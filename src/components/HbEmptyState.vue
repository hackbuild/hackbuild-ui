<script setup lang="ts">
interface Props {
  title: string
}

const props = defineProps<Props>()
</script>

<template>
  <!-- Say what is missing and what to do about it. Name the failure mode
       instead of hiding it. -->
  <div class="hb-empty">
    <div class="hb-empty-title">{{ props.title }}</div>
    <p v-if="$slots.default"><slot /></p>
    <slot name="action" />
  </div>
</template>
