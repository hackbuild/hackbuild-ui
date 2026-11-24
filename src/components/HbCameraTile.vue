<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import HbIcon from './HbIcon.vue'

/** A corner tag: text, or text with a tone. */
export type HbCameraTag = string | { text: string; tone?: 'ok' | 'warn' | 'rec' | 'dim' }

interface Props {
  /** The live stream; null shows the off line or the denied state. */
  stream?: MediaStream | null
  /** Four corners: top left timer, top right record, bottom left effect, bottom right model. */
  tags?: { tl?: HbCameraTag; tr?: HbCameraTag; bl?: HbCameraTag; br?: HbCameraTag }
  /** Camera refused: the tile keeps its size and says so. */
  denied?: boolean
  deniedText?: string
  offText?: string
  /** Flip the picture like a mirror; the default for a front camera. */
  mirror?: boolean
  /** Record dot blinking in the top right. */
  rec?: boolean
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  stream: null,
  tags: () => ({}),
  denied: false,
  deniedText: 'camera access required',
  offText: 'camera off',
  mirror: true,
  rec: false,
  label: 'camera',
})

const video = ref<HTMLVideoElement | null>(null)
const ready = ref(false)

function attach() {
  const v = video.value
  if (!v) return
  ready.value = false
  if (v.srcObject !== props.stream) v.srcObject = props.stream
  if (props.stream) v.play().catch(() => {})
}
watch(() => props.stream, attach)
watch(video, attach)
onBeforeUnmount(() => { if (video.value) video.value.srcObject = null })

const text = (t?: HbCameraTag) => (t === undefined ? '' : typeof t === 'string' ? t : t.text)
const tone = (t?: HbCameraTag) => (t && typeof t === 'object' && t.tone ? `is-${t.tone}` : '')
const corners = ['tl', 'tr', 'bl', 'br'] as const
</script>

<template>
  <!-- The feed on the void with a tag in each corner. Denied and off keep
       the same box, so the layout never moves. The default slot lays a
       canvas over the video for a filtered feed. -->
  <figure class="hb-camtile" :class="{ 'is-denied': props.denied, 'is-live': !!props.stream && !props.denied, 'is-mirror': props.mirror }" :aria-label="props.label">
    <video v-show="props.stream && !props.denied" ref="video" class="hb-camtile-video" autoplay playsinline muted @loadeddata="ready = true" />
    <slot />
    <template v-for="c in corners" :key="c">
      <span v-if="text(props.tags[c])" class="hb-camtile-tag" :class="[`is-${c}`, tone(props.tags[c])]">{{ text(props.tags[c]) }}</span>
    </template>
    <span v-if="props.rec" class="hb-camtile-rec" role="img" aria-label="recording" />
    <div v-if="props.denied" class="hb-camtile-none" role="status">
      <slot name="denied"><HbIcon name="video-slash" :size="26" />{{ props.deniedText }}</slot>
    </div>
    <div v-else-if="!props.stream && !$slots.default" class="hb-camtile-none">{{ props.offText }}</div>
  </figure>
</template>
