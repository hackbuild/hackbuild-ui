<script setup lang="ts">
interface Props {
  title: string
  /** Uppercase utility line under the title: the role, the version. */
  sub?: string
  /** VT323, pushed right: dates, duration. */
  period?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="hb-tl-item">
    <div class="hb-tl-head">
      <span class="hb-tl-title"><slot name="title">{{ props.title }}</slot></span>
      <span v-if="props.period" class="hb-tl-period">{{ props.period }}</span>
    </div>
    <div v-if="props.sub" class="hb-tl-sub">{{ props.sub }}</div>
    <p v-if="$slots.default"><slot /></p>
    <div v-if="$slots.tags" class="hb-tl-tags">
      <slot name="tags" />
    </div>
  </div>
</template>
