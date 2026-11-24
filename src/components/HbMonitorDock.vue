<script setup lang="ts">
import HbInset from './HbInset.vue'

export interface HbMonitorView {
  /** Slot name for the media: `#camera`, `#depth`. */
  key: string
  title: string
  aux?: string
  /** Media aspect ratio, 4/3 by default. */
  ratio?: string
  /** Views of the same data, picked in the tile head. */
  modes?: string[]
}

interface Props {
  views: HbMonitorView[]
  /** Docked on a viewport corner: tiles at a fixed width, wrapping up. */
  overlay?: boolean
}

const props = withDefaults(defineProps<Props>(), { overlay: false })

/** Keys of the open tiles. A closed tile keeps its head. */
const open = defineModel<string[]>({ default: () => [] })
/** The mode picked per view key. */
const modes = defineModel<Record<string, string>>('modes', { default: () => ({}) })

function setOpen(key: string, on: boolean) {
  const has = open.value.includes(key)
  if (on && !has) open.value = [...open.value, key]
  else if (!on && has) open.value = open.value.filter((k) => k !== key)
}
</script>

<template>
  <!-- Monitors side by side: the raw feed and what the model made of it,
       one inset per view. Each head folds its tile away; modes switch
       the view inside a tile. Media goes in a slot named by the key. -->
  <div class="hb-mdock" :class="{ 'is-overlay': props.overlay }" role="group" aria-label="monitors">
    <HbInset
      v-for="v in props.views"
      :key="v.key"
      :title="v.title"
      :aux="v.aux"
      :ratio="v.ratio"
      :modes="v.modes"
      collapsible
      :open="open.includes(v.key)"
      :mode="modes[v.key] || ''"
      @update:open="setOpen(v.key, $event)"
      @update:mode="modes = { ...modes, [v.key]: $event }"
    >
      <slot :name="v.key" :view="v" :mode="modes[v.key] || v.modes?.[0] || ''" />
    </HbInset>
  </div>
</template>
