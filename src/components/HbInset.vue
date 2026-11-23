<script setup lang="ts">
interface Props {
  /** VT323 head: 'dog eye', 'depth'. */
  title: string
  /** Quieter value at the right end of the head. */
  aux?: string
  /** CSS aspect ratio of the media well. */
  ratio?: string
}

const props = withDefaults(defineProps<Props>(), { aux: '', ratio: '4/3' })
</script>

<template>
  <figure class="hb-inset">
    <div class="hb-inset-hd">
      <span>{{ props.title }}</span>
      <span v-if="props.aux || $slots.head" class="hb-hd-aux"><slot name="head">{{ props.aux }}</slot></span>
    </div>
    <div class="hb-inset-media" :style="{ '--hb-inset-ratio': props.ratio }"><slot /></div>
  </figure>
</template>
