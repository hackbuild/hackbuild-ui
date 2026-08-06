<script setup lang="ts">
interface Props {
  title: string
  /** VT323 tag rendered above the title. */
  kicker?: string
  /** Quiet link pushed right, for example all projects. */
  linkLabel?: string
  linkHref?: string
  /** Centered head for standalone bands, the resume idiom. */
  align?: 'left' | 'center'
  /** Underline the title with a 4 px rule. */
  underline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  underline: false,
})
</script>

<template>
  <div :style="props.align === 'center' ? 'text-align:center' : undefined">
    <span v-if="props.kicker" class="hb-kicker" style="margin-bottom: 8px">{{ props.kicker }}</span>
    <div class="hb-sechead" :class="{ 'is-center': props.align === 'center' }">
      <h2>
        <span :class="{ 'hb-title-underline': props.underline }"><slot>{{ props.title }}</slot></span>
      </h2>
      <a v-if="props.linkLabel && props.align !== 'center'" class="hb-sechead-link" :href="props.linkHref">{{ props.linkLabel }}</a>
      <slot name="link" />
    </div>
  </div>
</template>
