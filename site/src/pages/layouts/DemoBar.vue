<script setup lang="ts">
// The one bar of every layout demo: the mark, the tool name, one model
// chip and the menu. Fixture rows; a load only moves a fake progress.
import { HbHeader, HbIcon, HbModelSelect, type ModelRow } from '@hackbuild/ui'

const props = withDefaults(defineProps<{ title: string; rows: ModelRow[]; chip?: boolean }>(), { chip: true })
const chosen = defineModel<string>({ default: '' })
const emit = defineEmits<{ load: [ids: string[]] }>()
</script>

<template>
  <HbHeader :title="props.title" accent=".">
    <div class="hb-header-end">
      <slot />
      <HbModelSelect v-if="props.chip" v-model="chosen" variant="chip" :rows="props.rows" @load="(ids) => emit('load', ids)" />
      <button type="button" class="hb-iconbtn" aria-label="menu"><HbIcon name="menu" :size="16" /></button>
    </div>
  </HbHeader>
</template>
