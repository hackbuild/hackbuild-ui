<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** A CSS aspect ratio such as '16/9', or 'fill' to take the parent's height.
      Under 640 px the viewport goes square unless --hb-vp-ratio-sm says otherwise. */
  aspect?: string
  /** Drop the pink shadow while another element holds it. */
  quiet?: boolean
  /** Accessible name for the scene. */
  label?: string
  /** Cover title while the scene cannot show: 'loading the gait wasm'. */
  coverTitle?: string
  /** Cover note: what is happening or why it failed. */
  coverNote?: string
  /** The cover is a failure: the note takes the lit error color. */
  coverError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  aspect: '16/9',
  quiet: false,
  label: '',
  coverTitle: '',
  coverNote: '',
  coverError: false,
})

defineSlots<{
  /** The canvas, video or image that fills the viewport. */
  default?: () => unknown
  tl?: () => unknown
  tr?: () => unknown
  bl?: () => unknown
  br?: () => unknown
  /** Bottom band: a wrapping row of scene verbs. */
  b?: () => unknown
  /** Over the band: an HbStageCaption. */
  caption?: () => unknown
  /** Over the caption: a short note on how to drive the scene. */
  hint?: () => unknown
  /** Under the top left content: HbHudStat figures, goal and thought. */
  telemetry?: () => unknown
  /** At the foot under the band: an HbPad. */
  pad?: () => unknown
  center?: () => unknown
  /** Extra cover content under the title and note: progress, a button. */
  cover?: () => unknown
}>()

const fill = computed(() => props.aspect === 'fill')
const style = computed(() => (fill.value ? undefined : { '--hb-vp-ratio': props.aspect }))
</script>

<template>
  <section
    class="hb-viewport"
    :class="{ 'is-fill': fill, 'is-quiet': props.quiet }"
    :style="style"
    :aria-label="props.label || undefined"
  >
    <slot />
    <div v-if="$slots.tl || $slots.telemetry" class="hb-ov hb-ov-tl">
      <slot name="tl" />
      <div v-if="$slots.telemetry" class="hb-ov-tele"><slot name="telemetry" /></div>
    </div>
    <div v-if="$slots.tr" class="hb-ov hb-ov-tr"><slot name="tr" /></div>
    <div v-if="$slots.bl" class="hb-ov hb-ov-bl"><slot name="bl" /></div>
    <div v-if="$slots.br" class="hb-ov hb-ov-br"><slot name="br" /></div>
    <div v-if="$slots.hint || $slots.caption || $slots.pad" class="hb-ov hb-ov-foot">
      <div v-if="$slots.hint" class="hb-ov-hint"><slot name="hint" /></div>
      <div v-if="$slots.caption" class="hb-ov-cap"><slot name="caption" /></div>
      <div v-if="$slots.b" class="hb-ov-b"><slot name="b" /></div>
      <div v-if="$slots.pad" class="hb-ov-pad"><slot name="pad" /></div>
    </div>
    <div v-else-if="$slots.b" class="hb-ov hb-ov-b"><slot name="b" /></div>
    <div v-if="$slots.center" class="hb-ov hb-ov-c"><slot name="center" /></div>
    <div
      v-if="props.coverTitle || $slots.cover"
      class="hb-vp-cover"
      :class="{ 'is-err': props.coverError }"
      :role="props.coverError ? 'alert' : 'status'"
    >
      <div v-if="props.coverTitle" class="hb-vp-cover-title">{{ props.coverTitle }}</div>
      <div v-if="props.coverNote" class="hb-vp-cover-note">{{ props.coverNote }}</div>
      <slot name="cover" />
    </div>
  </section>
</template>
