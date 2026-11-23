<script setup lang="ts">
export interface HbTranscriptSegment {
  /** Seconds. */
  start: number
  end: number
  text: string
  /** Still being heard; the words may change. */
  partial?: boolean
}

interface Props {
  segments: HbTranscriptSegment[]
  /** Playback time in seconds: the segment under it is marked. */
  now?: number | null
  /** Segments are buttons that emit seek. */
  seekable?: boolean
  label?: string
  empty?: string
}

const props = withDefaults(defineProps<Props>(), { now: null, seekable: false, label: 'transcript', empty: 'no speech found.' })

const emit = defineEmits<{ seek: [seconds: number] }>()

const isNow = (s: HbTranscriptSegment) => props.now !== null && props.now >= s.start && props.now < s.end
const t = (s: number) => s.toFixed(2)
</script>

<template>
  <ol class="hb-transcript" :aria-label="props.label">
    <li v-for="(s, i) in props.segments" :key="i">
      <component
        :is="props.seekable ? 'button' : 'div'"
        :type="props.seekable ? 'button' : undefined"
        class="hb-tseg"
        :class="{ 'is-now': isNow(s), 'is-partial': s.partial }"
        :aria-current="isNow(s) ? 'time' : undefined"
        @click="props.seekable && emit('seek', s.start)"
      >
        <span class="hb-tseg-t">{{ t(s.start) }} to {{ t(s.end) }}</span>
        <span class="hb-tseg-text">{{ s.text }}</span>
      </component>
    </li>
    <li v-if="!props.segments.length"><div class="hb-tseg"><span class="hb-tseg-t">--</span><span class="hb-tseg-text">{{ props.empty }}</span></div></li>
  </ol>
</template>
