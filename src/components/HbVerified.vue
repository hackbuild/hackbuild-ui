<script setup lang="ts">
import HbIcon from './HbIcon.vue'

interface Props {
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'verified',
})
</script>

<template>
  <!-- Next to a display name. Small enough that the pink reads as a mark,
       not a fill. -->
  <span class="hb-verified" role="img" :aria-label="props.label">
    <HbIcon name="check" :size="9" />
  </span>
</template>
