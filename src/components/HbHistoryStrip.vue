<script setup lang="ts">
import HbIcon from './HbIcon.vue'

export interface HbHistoryItem {
  id: string | number
  /** Image url: a data url or an object url. */
  thumb: string
  /** The prompt, the file name. */
  label?: string
  /** 'sd turbo, seed 12345, 2 steps': `runMeta` builds it. */
  meta?: string
}

interface Props {
  items: HbHistoryItem[]
  /** The run on screen. */
  current?: string | number | null
  /** Tiles with the label and meta under each, instead of a thumb strip. */
  grid?: boolean
  empty?: string
}

const props = withDefaults(defineProps<Props>(), {
  current: null,
  grid: false,
  empty: 'runs appear here',
})

const emit = defineEmits<{
  restore: [item: HbHistoryItem]
  remove: [item: HbHistoryItem]
}>()

const title = (it: HbHistoryItem) => [it.meta, it.label].filter(Boolean).join('\n')

function key(e: KeyboardEvent, i: number) {
  const it = props.items[i]
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); emit('remove', it); return }
  const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
  if (!d) return
  const all = [...((e.currentTarget as HTMLElement).closest('.hb-hist')?.querySelectorAll<HTMLElement>('.hb-hist-thumb') ?? [])]
  const next = all[i + d]
  if (next) { e.preventDefault(); next.focus() }
}
const cur = () => props.items.find((x) => x.id === props.current)
</script>

<template>
  <!-- Newest first. A press restores the run with its settings; remove is
       a corner x on a fine pointer, one 44 px button for the current run
       on touch, and Delete on a focused thumb. -->
  <div class="hb-hist" :class="{ 'is-grid': props.grid }">
    <p v-if="!props.items.length" class="hb-hist-empty">{{ props.empty }}</p>
    <ul v-else class="hb-hist-list" aria-label="run history">
      <li v-for="(it, i) in props.items" :key="it.id" class="hb-hist-item" :class="{ 'is-current': it.id === props.current }">
        <button
          type="button"
          class="hb-hist-thumb"
          :title="title(it)"
          :aria-label="`restore ${it.label || 'run'}${it.meta ? `, ${it.meta}` : ''}`"
          :aria-current="it.id === props.current ? 'true' : undefined"
          @click="emit('restore', it)"
          @keydown="key($event, i)"
        ><img :src="it.thumb" alt="" loading="lazy"></button>
        <span v-if="props.grid" class="hb-hist-cap">
          <span class="hb-hist-label">{{ it.label }}</span>
          <span v-if="it.meta" class="hb-hist-meta">{{ it.meta }}</span>
        </span>
        <button type="button" class="hb-hist-x" :aria-label="`remove ${it.label || 'run'}`" title="remove" @click="emit('remove', it)">
          <HbIcon name="x" :size="10" />
        </button>
      </li>
    </ul>
    <button v-if="!props.grid && cur()" type="button" class="hb-iconbtn hb-hist-drop" aria-label="remove the run on screen" title="remove the run on screen" @click="emit('remove', cur()!)">
      <HbIcon name="trash" :size="14" />
    </button>
  </div>
</template>
