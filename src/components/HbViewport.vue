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
  /** void: black (the default). lit: the pink glow over diagonal
      hairlines on sunk paper. graph: the void with the pink graph rule. */
  look?: 'void' | 'lit' | 'graph'
}

const props = withDefaults(defineProps<Props>(), {
  aspect: '16/9',
  quiet: false,
  label: '',
  coverTitle: '',
  coverNote: '',
  coverError: false,
  look: 'void',
})

const slots = defineSlots<{
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
  /** Under the top left content: HbHudStat figures, goal and thought.
      With a pad slot it moves under the top right content on a touch
      phone held sideways, where the stick covers the left. */
  telemetry?: () => unknown
  /** At the foot under the band: an HbPad. */
  pad?: () => unknown
  center?: () => unknown
  /** Extra cover content under the title and note: progress, a button. */
  cover?: () => unknown
}>()

// Functions, not computeds: which slots are passed can change per render.
const hasTop = () => !!(slots.tl || slots.tr || slots.telemetry)
const hasFoot = () => !!(slots.hint || slots.caption || slots.b || slots.bl || slots.br || slots.pad)
const fill = computed(() => props.aspect === 'fill')
const style = computed(() => (fill.value ? undefined : { '--hb-vp-ratio': props.aspect }))
</script>

<template>
  <section
    class="hb-viewport"
    :class="{ 'is-fill': fill, 'is-quiet': props.quiet, 'hb-stage-lit': props.look === 'lit', 'hb-stage-void': props.look === 'graph' }"
    :style="style"
    :aria-label="props.label || undefined"
  >
    <slot />
    <!-- One frame holds every overlay slot in a column: the top grid
         (tl, tr, telemetry) then the foot (hint, caption, band, the low
         corners, pad). The slots cannot overlap; on a short stage the
         caption gives up its oldest lines first. With a pad, telemetry
         moves right on a phone held sideways, clear of the stick. -->
    <div v-if="hasTop() || hasFoot()" class="hb-ov-frame" :class="{ 'has-pad': !!$slots.pad }">
      <div v-if="hasTop()" class="hb-ov hb-ov-top">
        <div v-if="$slots.tl" class="hb-ov hb-ov-tl"><slot name="tl" /></div>
        <div v-if="$slots.tr" class="hb-ov hb-ov-tr"><slot name="tr" /></div>
        <div v-if="$slots.telemetry" class="hb-ov-tele"><slot name="telemetry" /></div>
      </div>
      <div v-if="hasFoot()" class="hb-ov hb-ov-foot">
        <div v-if="$slots.hint" class="hb-ov-hint"><slot name="hint" /></div>
        <div v-if="$slots.caption" class="hb-ov-cap"><slot name="caption" /></div>
        <div v-if="$slots.b" class="hb-ov-b"><slot name="b" /></div>
        <div v-if="$slots.bl || $slots.br" class="hb-ov-low">
          <div v-if="$slots.bl" class="hb-ov hb-ov-bl"><slot name="bl" /></div>
          <div v-if="$slots.br" class="hb-ov hb-ov-br"><slot name="br" /></div>
        </div>
        <div v-if="$slots.pad" class="hb-ov-pad"><slot name="pad" /></div>
      </div>
    </div>
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
