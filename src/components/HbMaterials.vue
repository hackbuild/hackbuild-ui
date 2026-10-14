<script setup lang="ts">
import HbList from './HbList.vue'
import HbRow from './HbRow.vue'

export interface HbMaterialSlot {
  /** Extruder or slot number, one-based. */
  slot: number
  /** Swatch color, a CSS color from the design's slot table. */
  color: string
  /** Material as the slicer names it, with its resistivity where it carries current. */
  material: string
  /** Which parts print in it. */
  parts?: string
  /** Role on the stage legend: body, traces, keys, contacts. */
  role?: string
}

interface Props {
  slots: HbMaterialSlot[]
  /** rail: the materials panel. legend: the stage legend on the void.
      chips: the legend collapsed to slot chips for the status strip. */
  variant?: 'rail' | 'legend' | 'chips'
  /** Accessible name. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'rail',
  label: 'materials',
})

function swatch(slot: HbMaterialSlot): Record<string, string> {
  return { '--hb-mat-color': slot.color }
}
</script>

<template>
  <!-- Props only. The design owns the slot table; this never reads a profile. -->
  <HbList v-if="props.variant === 'rail'" class="hb-mat" role="list" :aria-label="props.label">
    <HbRow v-for="slot in props.slots" :key="slot.slot" as="div" role="listitem">
      <span class="hb-mat-sw" :style="swatch(slot)" aria-hidden="true" />
      <span class="hb-mat-ex">{{ slot.slot }}</span>
      <span class="hb-mat-name">{{ slot.material }}</span>
      <span v-if="slot.parts" class="hb-mat-parts">{{ slot.parts }}</span>
      <span v-if="slot.role" class="hb-mat-role">{{ slot.role }}</span>
    </HbRow>
  </HbList>
  <div v-else-if="props.variant === 'legend'" class="hb-legend" role="list" :aria-label="props.label">
    <div v-for="slot in props.slots" :key="slot.slot" class="hb-legend-item" role="listitem">
      <i class="hb-legend-sw" :style="swatch(slot)" aria-hidden="true" />
      <span>{{ slot.slot }} {{ slot.material }}</span>
      <span v-if="slot.role" class="hb-legend-role">{{ slot.role }}</span>
    </div>
    <slot />
  </div>
  <div v-else class="hb-legend-chips" role="list" :aria-label="props.label">
    <span v-for="slot in props.slots" :key="slot.slot" class="hb-legend-chip" role="listitem" :title="slot.role ? `${slot.material}, ${slot.role}` : slot.material">
      <i class="hb-legend-sw" :style="swatch(slot)" aria-hidden="true" />{{ slot.slot }}<span class="hb-sr"> {{ slot.material }}</span>
    </span>
  </div>
</template>
