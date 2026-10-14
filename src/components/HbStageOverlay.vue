<script setup lang="ts">
import HbStage from './HbStage.vue'

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
}>()
</script>

<template>
  <!-- Overlays sit at the four corners and the centre only. -->
  <HbStage class="hb-stage-ov" :class="{ 'is-quiet': props.quiet }" :graph="props.graph">
    <slot />
    <div v-if="$slots.tl" class="hb-ov hb-ov-tl"><slot name="tl" /></div>
    <div v-if="$slots.tr" class="hb-ov hb-ov-tr"><slot name="tr" /></div>
    <div v-if="$slots.bl" class="hb-ov hb-ov-bl"><slot name="bl" /></div>
    <div v-if="$slots.br" class="hb-ov hb-ov-br"><slot name="br" /></div>
    <div v-if="$slots.center" class="hb-ov hb-ov-c"><slot name="center" /></div>
  </HbStage>
</template>
