<script setup lang="ts">
interface Props {
  /** The 32 px pink graticule. For plots, never for chrome. */
  graph?: boolean
  /** Small label pinned at the top of the stage. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  graph: false,
})
</script>

<template>
  <!-- The void. Where the machine draws. Never put chrome on it. -->
  <div class="hb-stage" :class="{ 'hb-graph': props.graph }">
    <div v-if="props.label" class="hb-label" style="color: var(--hb-paper); opacity: 0.6">{{ props.label }}</div>
    <slot />
  </div>
</template>
