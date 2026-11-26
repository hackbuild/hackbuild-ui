<script setup lang="ts">
// The one bar of every layout demo: the mark, the tool name, one model
// chip and the menu. Fixture rows; a load only moves a fake progress.
import { useRoute } from 'vue-router'
import { HbHeader, HbIcon, HbModelSelect, type HbSwitchTool, type ModelRow } from '@hackbuild/ui'

const props = withDefaults(defineProps<{ title: string; rows: ModelRow[]; chip?: boolean }>(), { chip: true })
const chosen = defineModel<string>({ default: '' })
const emit = defineEmits<{ load: [ids: string[]] }>()
// the tool name switches between the six layout demos
const tools: HbSwitchTool[] = [
  { id: 'stage-rack', label: 'yard', note: 'stage and rack', href: '#/layouts/stage-rack' },
  { id: 'canvas-rail', label: 'cut out', note: 'canvas and rail', href: '#/layouts/canvas-rail' },
  { id: 'drop-first', label: 'transcribe', note: 'drop first', href: '#/layouts/drop-first' },
  { id: 'conversation', label: 'chat', note: 'conversation', href: '#/layouts/conversation' },
  { id: 'gate', label: 'character', note: 'gate', href: '#/layouts/gate' },
  { id: 'form-frame', label: 'make an image', note: 'form and frame', href: '#/layouts/form-frame' },
]
const route = useRoute()
const current = () => String(route.path).split('/').pop() ?? ''
</script>

<template>
  <HbHeader :title="props.title" accent="." :tools="tools" :current="current()">
    <div class="hb-header-end">
      <slot />
      <HbModelSelect v-if="props.chip" v-model="chosen" variant="chip" :rows="props.rows" @load="(ids) => emit('load', ids)" />
      <button type="button" class="hb-iconbtn" aria-label="menu"><HbIcon name="menu" :size="16" /></button>
    </div>
  </HbHeader>
</template>
