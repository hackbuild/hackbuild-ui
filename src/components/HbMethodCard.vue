<script setup lang="ts">
import { computed } from 'vue'
import { METHOD_WORDS, methodMeta, qualitySquares, type MethodState } from '../vanilla/media'
import { noteOnce } from '../utils/note'

noteOnce('HbMethodCard', 'HbMethodCard is merged since 0.10.0 and goes in 0.11.0; use HbModelSheet')

interface Props {
  label: string
  /** What you gain and lose, one line: 'neural, speaks after the full reply'. */
  trade?: string
  /** '~15 s', 'instant'. */
  time?: string
  /** 0 to 3 lit squares. */
  quality?: number | null
  /** Download size; 0 reads no download. */
  sizeMB?: number | null
  state?: MethodState
  /** The chosen method. */
  active?: boolean
  /** Why another method answered: 'load failed: out of memory. the system voice is used instead.' */
  notice?: string
  /** The letter in the badge; the first of the label when left out. */
  badge?: string
}

const props = withDefaults(defineProps<Props>(), {
  trade: '',
  time: '',
  quality: null,
  sizeMB: null,
  state: 'ready',
  active: false,
  notice: '',
  badge: '',
})

const emit = defineEmits<{ pick: [] }>()

const meta = computed(() => methodMeta(props))
const squares = computed(() => (props.quality === null ? [] : qualitySquares(props.quality)))
const word = computed(() => (props.state === 'ready' ? '' : METHOD_WORDS[props.state]))
const off = computed(() => props.state === 'unsupported')

// Cards in one .hb-methods group move with the arrow keys, as radios do.
function key(e: KeyboardEvent) {
  const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
  if (!d) return
  const me = e.currentTarget as HTMLElement
  const all = [...(me.closest('.hb-methods')?.querySelectorAll<HTMLButtonElement>('.hb-method:not(:disabled)') ?? [])]
  const next = all[(all.indexOf(me as HTMLButtonElement) + d + all.length) % all.length]
  if (!next || next === me) return
  e.preventDefault()
  next.focus()
  next.click()
}
</script>

<template>
  <!-- Badge, name over the trade, time and quality squares on the right;
       the fallback reason under it. Wrap a set in .hb-methods role radiogroup. -->
  <button
    type="button"
    role="radio"
    class="hb-method"
    :class="[`is-${props.state}`, { 'is-active': props.active }]"
    :aria-checked="props.active"
    :disabled="off"
    @click="emit('pick')"
    @keydown="key"
  >
    <span class="hb-method-badge" aria-hidden="true">{{ (props.badge || props.label.charAt(0)).toUpperCase() }}</span>
    <span class="hb-method-body">
      <span class="hb-method-label">{{ props.label }}<span v-if="word" class="hb-method-state">{{ word }}</span></span>
      <span v-if="props.trade" class="hb-method-trade">{{ props.trade }}</span>
      <span v-if="props.notice" class="hb-method-notice">{{ props.notice }}</span>
    </span>
    <span v-if="meta.length || squares.length" class="hb-method-meta">
      <span v-for="m in meta" :key="m">{{ m }}</span>
      <span v-if="squares.length" class="hb-method-q" :aria-label="`quality ${props.quality} of 3`" role="img">
        <i v-for="(on, i) in squares" :key="i" :class="{ 'is-on': on }" />
      </span>
    </span>
  </button>
</template>
