<script setup lang="ts">
interface Props {
  title: string
  /** Lifts with the pink shadow on hover. */
  interactive?: boolean
  /** Render as another tag, usually 'a' with an href attribute. */
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  interactive: false,
  as: 'div',
})
</script>

<template>
  <!-- The project card: media plate on top, tags, marker title, copy, quiet
       links along the bottom. -->
  <component :is="props.as" class="hb-media-card" :class="{ 'is-interactive': props.interactive }">
    <div v-if="$slots.media" class="hb-media">
      <slot name="media" />
    </div>
    <div class="hb-media-body">
      <div v-if="$slots.tags" class="hb-media-tags">
        <slot name="tags" />
      </div>
      <h3 style="margin: 0"><slot name="title">{{ props.title }}</slot></h3>
      <p v-if="$slots.default"><slot /></p>
      <div v-if="$slots.links" class="hb-media-links">
        <slot name="links" />
      </div>
    </div>
  </component>
</template>
