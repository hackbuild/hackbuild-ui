<script setup lang="ts">
import HbCover from './HbCover.vue'

interface Props {
  title: string
  /** Lifts with the pink shadow on hover. */
  interactive?: boolean
  /** Render as another tag, usually 'a' with an href attribute. */
  as?: string
  /** Show the plate even with no media slot, seeded placeholder cover. */
  cover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  interactive: false,
  as: 'div',
  cover: true,
})
</script>

<template>
  <!-- The project card: media plate on top, tags, marker title, copy, quiet
       links along the bottom. With no media slotted, the plate carries a
       seeded placeholder cover. -->
  <component :is="props.as" class="hb-media-card" :class="{ 'is-interactive': props.interactive }">
    <div v-if="$slots.media || props.cover" class="hb-media">
      <slot name="media">
        <HbCover :seed="props.title" />
      </slot>
      <div v-if="$slots.badges" class="hb-media-badges">
        <slot name="badges" />
      </div>
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
      <div v-if="$slots.footer" class="hb-media-foot">
        <slot name="footer" />
      </div>
    </div>
  </component>
</template>
