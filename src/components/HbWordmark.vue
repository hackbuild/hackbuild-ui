<script setup lang="ts">
interface Props {
  /** Font size in px. */
  size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  size: 18,
})
</script>

<template>
  <!-- hack in ink, then the dot AND build both pink. Never dot only. -->
  <span class="hb-wordmark" :style="{ fontSize: typeof props.size === 'number' ? props.size + 'px' : props.size }">hack<b>.build</b></span>
</template>
