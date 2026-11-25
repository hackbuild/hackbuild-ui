<script setup lang="ts">
import HbIcon from './HbIcon.vue'
import { thumbKind, thumbSrc } from '../vanilla/media'

export interface HbHistoryItem {
  id: string | number
  /** An image url (data, object or http), svg markup such as a waveform,
      or a short label such as '0:42'. Empty draws the label's first
      letters; the thumb slot overrides all of these. */
  thumb?: string
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
  /** Show the remove buttons and take Delete. Off, the strip only restores. */
  removable?: boolean
  /** Names the list for screen readers. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  current: null,
  grid: false,
  empty: 'runs appear here',
  removable: true,
  label: 'run history',
})

const emit = defineEmits<{
  restore: [item: HbHistoryItem]
  remove: [item: HbHistoryItem]
}>()

const title = (it: HbHistoryItem) => [it.meta, it.label].filter(Boolean).join('\n')

function key(e: KeyboardEvent, i: number) {
  const it = props.items[i]
  if (props.removable && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); emit('remove', it); return }
  const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
  if (!d) return
  const all = [...((e.currentTarget as HTMLElement).closest('.hb-hist')?.querySelectorAll<HTMLElement>('.hb-hist-thumb') ?? [])]
  const next = all[i + d]
  if (next) { e.preventDefault(); next.focus() }
}
defineSlots<{
  /** Draws the thumb: a wave canvas, an icon. */
  thumb?: (p: { item: HbHistoryItem }) => unknown
}>()

const thumbText = (it: HbHistoryItem) => (thumbKind(it.thumb) === 'label' ? String(it.thumb).trim() : (it.label ?? '').slice(0, 3))
const cur = () => props.items.find((x) => x.id === props.current)
</script>

<template>
  <!-- Newest first. A press restores the run with its settings; remove is
       a corner x on a fine pointer, one 44 px button for the current run
       on touch, and Delete on a focused thumb. -->
  <div class="hb-hist" :class="{ 'is-grid': props.grid }">
    <p v-if="!props.items.length" class="hb-hist-empty">{{ props.empty }}</p>
    <ul v-else class="hb-hist-list" :aria-label="props.label">
      <li v-for="(it, i) in props.items" :key="it.id" class="hb-hist-item" :class="{ 'is-current': it.id === props.current }">
        <button
          type="button"
          class="hb-hist-thumb"
          :title="title(it)"
          :aria-label="`restore ${it.label || 'run'}${it.meta ? `, ${it.meta}` : ''}`"
          :aria-current="it.id === props.current ? 'true' : undefined"
          @click="emit('restore', it)"
          @keydown="key($event, i)"
        ><slot name="thumb" :item="it"><img v-if="thumbSrc(it.thumb)" :src="thumbSrc(it.thumb)" alt="" loading="lazy"><span v-else class="hb-hist-tx">{{ thumbText(it) }}</span></slot></button>
        <span v-if="props.grid" class="hb-hist-cap">
          <span class="hb-hist-label">{{ it.label }}</span>
          <span v-if="it.meta" class="hb-hist-meta">{{ it.meta }}</span>
        </span>
        <button v-if="props.removable" type="button" class="hb-hist-x" :aria-label="`remove ${it.label || 'run'}`" title="remove" @click="emit('remove', it)">
          <HbIcon name="x" :size="10" />
        </button>
      </li>
    </ul>
    <button v-if="props.removable && !props.grid && cur()" type="button" class="hb-iconbtn hb-hist-drop" aria-label="remove the run on screen" title="remove the run on screen" @click="emit('remove', cur()!)">
      <HbIcon name="trash" :size="14" />
    </button>
  </div>
</template>
