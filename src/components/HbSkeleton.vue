<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** CSS width, defaults to full. */
  width?: string
  /** CSS height, defaults to one line. */
  height?: string
}

const props = defineProps<Props>()

const style = computed(() => ({
  width: props.width,
  height: props.height,
}))
</script>

<template>
  <span class="hb-skeleton" :style="style" aria-hidden="true" />
</template>
