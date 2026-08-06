<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** YouTube id or url. Embeds through youtube-nocookie with modest branding. */
  youtube?: string
  /** Vimeo id or url. */
  vimeo?: string
  /** Direct file url, rendered in a native video element. */
  src?: string
  /** Accessible title for the embed. */
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'video',
})

function youtubeId(input: string): string {
  const match = input.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{6,})/)
  return match ? match[1] : input
}

function vimeoId(input: string): string {
  const match = input.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match ? match[1] : input
}

const embedUrl = computed(() => {
  if (props.youtube) {
    return `https://www.youtube-nocookie.com/embed/${youtubeId(props.youtube)}?rel=0&modestbranding=1`
  }
  if (props.vimeo) {
    return `https://player.vimeo.com/video/${vimeoId(props.vimeo)}`
  }
  return ''
})
</script>

<template>
  <!-- The one pink border in a video section. Void backing, 16 by 9 well. -->
  <div class="hb-vframe">
    <div class="hb-vframe-media">
      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        :title="props.title"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
      <video v-else-if="props.src" :src="props.src" controls :title="props.title" />
      <slot v-else />
    </div>
  </div>
</template>
