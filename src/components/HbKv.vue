<script setup lang="ts">
interface Props {
  label: string
  /** The readout text. Or use the default slot. */
  value?: string | number
}

const props = defineProps<Props>()
</script>

<template>
  <!-- Label left, readout right. The workhorse row of every panel. -->
  <div class="hb-kv">
    <span class="hb-label">{{ props.label }}</span>
    <span class="hb-readout"><slot>{{ props.value }}</slot></span>
  </div>
</template>
