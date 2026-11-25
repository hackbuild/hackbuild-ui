<script setup lang="ts">
import HbStage from './HbStage.vue'
import { noteOnce } from '../utils/note'

noteOnce('HbStageOverlay', 'HbStageOverlay is merged since 0.10.0 and goes in 0.11.0; use HbViewport overlay slots')

interface Props {
  /** The pink graticule, passed to HbStage. */
  graph?: boolean
  /** Drop the stage's pink shadow while another element holds it, such as
      the welcome card. One pink-shadowed object per view. */
  quiet?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  graph: false,
  quiet: false,
})

defineSlots<{
  /** The canvas or view that fills the stage. */
  default?: () => unknown
  /** Top left: cams and modes. */
  tl?: () => unknown
  /** Top right: the legend. */
  tr?: () => unknown
  /** Bottom left: hud and drive pad. */
  bl?: () => unknown
  /** Bottom right: busy readout. */
  br?: () => unknown
  /** Centre: the welcome card or a building notice. */
  center?: () => unknown
  /** Bottom band: a wrapping row of stage verbs. */
  b?: () => unknown
  /** Over the band: an HbStageCaption. */
  caption?: () => unknown
  /** Over the caption: a short note on how to drive the stage. */
  hint?: () => unknown
  /** Under the top left content: HbHudStat figures, goal and thought. */
  telemetry?: () => unknown
  /** At the foot under the band: an HbPad. */
  pad?: () => unknown
}>()
</script>

<template>
  <!-- Overlays sit at the four corners, the foot and the centre only. -->
  <HbStage class="hb-stage-ov" :class="{ 'is-quiet': props.quiet }" :graph="props.graph">
    <slot />
    <div v-if="$slots.tl || $slots.telemetry" class="hb-ov hb-ov-tl">
      <slot name="tl" />
      <div v-if="$slots.telemetry" class="hb-ov-tele"><slot name="telemetry" /></div>
    </div>
    <div v-if="$slots.tr" class="hb-ov hb-ov-tr"><slot name="tr" /></div>
    <div v-if="$slots.bl" class="hb-ov hb-ov-bl"><slot name="bl" /></div>
    <div v-if="$slots.br" class="hb-ov hb-ov-br"><slot name="br" /></div>
    <div v-if="$slots.hint || $slots.caption || $slots.b || $slots.pad" class="hb-ov hb-ov-foot">
      <div v-if="$slots.hint" class="hb-ov-hint"><slot name="hint" /></div>
      <div v-if="$slots.caption" class="hb-ov-cap"><slot name="caption" /></div>
      <div v-if="$slots.b" class="hb-ov-b"><slot name="b" /></div>
      <div v-if="$slots.pad" class="hb-ov-pad"><slot name="pad" /></div>
    </div>
    <div v-if="$slots.center" class="hb-ov hb-ov-c"><slot name="center" /></div>
  </HbStage>
</template>
