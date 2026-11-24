<script setup lang="ts">
import HbIcon from './HbIcon.vue'
import { scorePct } from '../vanilla/vision'

export interface HbInstanceItem {
  id: string | number
  /** Mask colour: `instanceColour(i)`. */
  colour: string
  /** Defaults to 'instance N'. */
  label?: string
  /** Decoder score 0 to 1, shown clamped. */
  score?: number | null
  hidden?: boolean
}

interface Props {
  items: HbInstanceItem[]
  empty?: string
  /** Hides merge all and clear all. */
  bare?: boolean
}

const props = withDefaults(defineProps<Props>(), { empty: 'press the image to add a mask', bare: false })

/** The selected row, or null. */
const selected = defineModel<string | number | null>('selected', { default: null })

const emit = defineEmits<{
  toggle: [item: HbInstanceItem]
  remove: [item: HbInstanceItem]
  merge: []
  clear: []
}>()

const name = (it: HbInstanceItem, i: number) => it.label || `instance ${i + 1}`

function key(e: KeyboardEvent, i: number) {
  const it = props.items[i]
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); emit('remove', it); return }
  if (e.key.toLowerCase() === 'h') { e.preventDefault(); emit('toggle', it); return }
  const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0
  if (!d) return
  const all = [...((e.currentTarget as HTMLElement).closest('.hb-inst')?.querySelectorAll<HTMLElement>('.hb-inst-pick') ?? [])]
  const next = all[i + d]
  if (next) { e.preventDefault(); next.focus() }
}
</script>

<template>
  <!-- One row per mask: colour, name, score, show or hide, delete. The
       row button selects; h hides, Delete removes, arrows move. Actions
       stay on screen on touch and grow to 44 px. -->
  <div class="hb-inst">
    <p v-if="!props.items.length" class="hb-inst-empty">{{ props.empty }}</p>
    <ul v-else class="hb-inst-list" aria-label="masks">
      <li v-for="(it, i) in props.items" :key="it.id" class="hb-inst-row" :class="{ 'is-on': selected === it.id, 'is-hidden': it.hidden }">
        <button
          type="button"
          class="hb-inst-pick"
          :aria-pressed="selected === it.id"
          :aria-keyshortcuts="'h Delete'"
          @click="selected = selected === it.id ? null : it.id"
          @keydown="key($event, i)"
        >
          <span class="hb-inst-sw" :style="{ '--hb-inst-c': it.colour }" aria-hidden="true" />
          <span class="hb-inst-name">{{ name(it, i) }}</span>
          <span v-if="scorePct(it.score)" class="hb-inst-score">{{ scorePct(it.score) }}<span class="hb-sr"> score</span></span>
        </button>
        <button type="button" class="hb-inst-act" :aria-pressed="!it.hidden" :aria-label="`show ${name(it, i)}`" :title="it.hidden ? 'show' : 'hide'" @click="emit('toggle', it)"><HbIcon name="eye" :size="12" /></button>
        <button type="button" class="hb-inst-act is-del" :aria-label="`delete ${name(it, i)}`" title="delete" @click="emit('remove', it)"><HbIcon name="trash" :size="12" /></button>
      </li>
    </ul>
    <div v-if="!props.bare" class="hb-acts hb-inst-foot">
      <button type="button" class="hb-btn hb-btn-sm" :disabled="props.items.length < 2" @click="emit('merge')">merge all</button>
      <button type="button" class="hb-btn hb-btn-sm" :disabled="!props.items.length" @click="emit('clear')">clear all</button>
    </div>
  </div>
</template>
