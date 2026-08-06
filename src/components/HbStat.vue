<script setup lang="ts">
interface Props {
  value: string | number
  label: string
}

const props = defineProps<Props>()
</script>

<template>
  <!-- The big figure: projects shipped, boards spun, samples lost. -->
  <div class="hb-stat-block">
    <span class="hb-stat-value">{{ props.value }}</span>
    <span class="hb-label">{{ props.label }}</span>
  </div>
</template>
