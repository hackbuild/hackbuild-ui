<script setup lang="ts">
import { computed } from 'vue'
import HbButton from './HbButton.vue'
import HbChip from './HbChip.vue'
import HbIcon from './HbIcon.vue'
import HbVideoFrame from './HbVideoFrame.vue'

export interface HbPlaylistItem {
  title: string
  /** One source: youtube id or url, vimeo id or url, or a file url. */
  youtube?: string
  vimeo?: string
  src?: string
  duration?: string
  date?: string
}

interface Props {
  items: HbPlaylistItem[]
  /** Track list heading. */
  heading?: string
}

const props = withDefaults(defineProps<Props>(), {
  heading: 'playlist',
})

/** Index of the playing track. */
const current = defineModel<number>({ default: 0 })
/** Advance when a track ends or next wraps past the last. */
const autoplay = defineModel<boolean>('autoplay', { default: false })

const emit = defineEmits<{
  change: [index: number]
}>()

const item = computed(() => props.items[current.value])

function go(index: number) {
  const max = props.items.length - 1
  const next = index > max ? (autoplay.value ? 0 : max) : Math.max(0, index)
  if (next !== current.value) {
    current.value = next
    emit('change', next)
  }
}

function pad(value: number): string {
  return String(value + 1).padStart(2, '0')
}
</script>

<template>
  <!-- The resume video section: pink framed player beside a numbered track
       list. Tracks flip pink when playing. -->
  <div class="hb-playlist">
    <div>
      <HbVideoFrame
        v-if="item"
        :key="current"
        :youtube="item.youtube"
        :vimeo="item.vimeo"
        :src="item.src"
        :title="item.title"
      >
        <slot name="empty" />
      </HbVideoFrame>
      <div v-if="item" class="hb-kv" style="border-bottom: 0; padding-top: 10px">
        <span style="font-family: var(--hb-display); font-size: 17px">{{ item.title }}</span>
        <span class="hb-stats">
          <span v-if="item.duration"><HbIcon name="clock" :size="12" />{{ item.duration }}</span>
          <span v-if="item.date"><HbIcon name="calendar" :size="12" />{{ item.date }}</span>
        </span>
      </div>
      <div class="hb-playlist-bar">
        <HbButton size="sm" variant="secondary" :disabled="current <= 0" @click="go(current - 1)">
          <template #icon><HbIcon name="arrow-left" :size="12" /></template>
          prev
        </HbButton>
        <HbButton size="sm" variant="secondary" @click="go(current + 1)">
          next
          <template #icon><HbIcon name="arrow-right" :size="12" /></template>
        </HbButton>
        <HbChip v-model="autoplay">autoplay</HbChip>
      </div>
    </div>
    <div>
      <div class="hb-label" style="margin-bottom: 6px">{{ props.heading }}</div>
      <div class="hb-playlist-tracks">
        <button
          v-for="(track, index) in props.items"
          :key="index"
          type="button"
          class="hb-track"
          :class="{ 'is-on': index === current }"
          @click="go(index)"
        >
          <span class="no">{{ pad(index) }}</span>
          <span>{{ track.title }}</span>
          <span v-if="track.duration" class="dur">{{ track.duration }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
