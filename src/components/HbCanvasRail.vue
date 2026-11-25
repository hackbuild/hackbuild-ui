<script setup lang="ts">
import { useSlots } from 'vue'
import HbRack from './HbRack.vue'
import type { RackTab } from '../vanilla/layout'

interface Props {
  /** Rack tabs, three to five; the first is the live result. */
  tabs: RackTab[]
  /** Accessible name of the rack. */
  rackLabel?: string
  /** Accessible name of the verb row. */
  verbsLabel?: string
  /** Accessible name of the tool rail. */
  toolsLabel?: string
}

const props = withDefaults(defineProps<Props>(), { rackLabel: 'rack', verbsLabel: 'actions', toolsLabel: 'tools' })
/** The selected rack tab. */
const tab = defineModel<string>('tab', { default: '' })
const slots = useSlots()
</script>

<template>
  <!-- Canvas and rail (mask-studio-sam): the icon tool rail at the left, the canvas, the rack at the right. -->
  <div class="hb-lay hb is-canvas-rail" data-layout="canvas-rail">
    <div v-if="slots.bar" class="hb-lay-bar" data-ux="bar"><slot name="bar" /></div>
    <div class="hb-lay-body">
      <nav v-if="slots.tools" class="hb-lay-tools" :aria-label="props.toolsLabel"><slot name="tools" /></nav>
      <section class="hb-lay-stage">
        <div class="hb-lay-subject" data-ux="subject"><slot /></div>
        <div v-if="slots.inset" class="hb-lay-inset" data-ux="inset"><slot name="inset" /></div>
        <div v-if="slots.verbs" class="hb-lay-verbs" data-ux="verbs" role="toolbar" :aria-label="props.verbsLabel"><slot name="verbs" /></div>
      </section>
    <HbRack v-model:tab="tab" :tabs="props.tabs" :label="props.rackLabel">
      <template v-for="t in props.tabs" :key="t.id" #[t.id]><slot :name="`tab-${t.id}`" /></template>
      <template v-if="slots.detail" #detail><slot name="detail" /></template>
    </HbRack>
    </div>
  </div>
</template>
