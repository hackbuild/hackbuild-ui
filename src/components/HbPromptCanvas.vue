<script lang="ts">
let seq = 0
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import HbIcon from './HbIcon.vue'
import { hoverThrottle, isBox, normBox, nudge, PROMPT_KEYS, promptStep, promptWord, toImage, type PromptTool, type SegPrompt } from '../vanilla/vision'

export interface HbPromptMask {
  id: string | number
  /** Mask colour: `instanceColour(i)`. */
  colour: string
  /** Alpha mask image url, image sized: white keeps, clear drops. */
  src: string
  hidden?: boolean
}

export interface Props {
  /** The image url. */
  image: string
  /** Natural size in pixels. Read from the image when left out. */
  width?: number
  height?: number
  /** Committed masks, tinted in their colour. */
  masks?: HbPromptMask[]
  /** The mask under the cursor, before it is committed. */
  preview?: string | null
  /** Colour of the preview: the next instance colour. */
  previewColour?: string
  /** Names the image for screen readers. */
  label?: string
  /** Shows prompts, places none. */
  readonly?: boolean
  /** Hover throttle in ms. */
  throttle?: number
  /** No tool row, well or help: the host shows the tools, as inside
      HbArtboard. Keys still work on the frame. */
  bare?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  masks: () => [],
  preview: null,
  previewColour: '',
  label: 'image',
  readonly: false,
  throttle: 50,
  bare: false,
})

const prompts = defineModel<SegPrompt[]>('prompts', { default: () => [] })
const tool = defineModel<PromptTool>('tool', { default: 'positive' })

const emit = defineEmits<{
  /** Pointer or keyboard cursor in image pixels; null when it leaves. */
  hover: [at: { x: number; y: number } | null]
  /** The prompts changed: decode with these. */
  commit: [prompts: SegPrompt[]]
  /** A box was drawn, in image pixels. */
  box: [box: { x0: number; y0: number; x1: number; y1: number; positive: boolean }]
}>()

seq += 1
const helpId = `hb-pc-${seq}-help`
const frame = ref<HTMLElement | null>(null)
const nat = ref({ w: 0, h: 0 })
const W = computed(() => props.width || nat.value.w || 1)
const H = computed(() => props.height || nat.value.h || 1)
const ratio = computed(() => `${W.value} / ${H.value}`)
const said = ref('')

function onLoad(e: Event) {
  const img = e.target as HTMLImageElement
  nat.value = { w: img.naturalWidth, h: img.naturalHeight }
}

const cssUrl = (s: string) => `url("${s}")`
const pct = (x: number, y: number) => ({ left: `${(x / W.value) * 100}%`, top: `${(y / H.value) * 100}%` })
const boxStyle = (b: { x0: number; y0: number; x1: number; y1: number }) => ({
  left: `${(b.x0 / W.value) * 100}%`,
  top: `${(b.y0 / H.value) * 100}%`,
  width: `${((b.x1 - b.x0) / W.value) * 100}%`,
  height: `${((b.y1 - b.y0) / H.value) * 100}%`,
})

const hover = hoverThrottle<{ x: number; y: number } | null>((v) => emit('hover', v), props.throttle)
onBeforeUnmount(() => hover.cancel())

function set(next: SegPrompt[], word?: string) {
  prompts.value = next
  if (word) said.value = word
  emit('commit', next)
}
function add(p: SegPrompt) {
  set([...prompts.value, p], promptWord(p))
  if (p.kind === 'box') emit('box', { x0: p.x0, y0: p.y0, x1: p.x1, y1: p.y1, positive: p.positive })
}

/* Pointer ---------------------------------------------------------------- */

type Drag =
  | { mode: 'box'; a: { x: number; y: number }; b: { x: number; y: number }; positive: boolean }
  | { mode: 'tap'; at: { x: number; y: number }; positive: boolean }
  | { mode: 'move'; i: number; corner: 0 | 1; moved: boolean }
const drag = ref<Drag | null>(null)

function at(e: PointerEvent, clamp = false) {
  const el = frame.value
  if (!el) return null
  const r = el.getBoundingClientRect()
  return toImage(e.clientX, e.clientY, r, W.value, H.value, clamp)
}

function down(e: PointerEvent) {
  if (props.readonly || (e.button !== 0 && e.button !== 2)) return
  kb.value = false
  const p = at(e)
  if (!p) return
  const positive = !(e.button === 2 || e.altKey || tool.value === 'negative')
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  drag.value = tool.value === 'box' ? { mode: 'box', a: p, b: p, positive } : { mode: 'tap', at: p, positive }
}

function grab(e: PointerEvent, i: number, corner: 0 | 1) {
  if (props.readonly || e.button !== 0) return
  e.stopPropagation()
  kb.value = false
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  drag.value = { mode: 'move', i, corner, moved: false }
}

function move(e: PointerEvent) {
  const d = drag.value
  if (d?.mode === 'box') { const p = at(e, true); if (p) d.b = p; return }
  if (d?.mode === 'move') {
    const p = at(e, true)
    if (!p) return
    const q = prompts.value[d.i]
    if (!q) return
    const r = nudge(p, 0, 0, W.value, H.value)
    const next = prompts.value.slice()
    next[d.i] = q.kind === 'point' ? { ...q, ...r } : d.corner === 0 ? { ...q, x0: r.x, y0: r.y } : { ...q, x1: r.x, y1: r.y }
    prompts.value = next
    d.moved = true
    return
  }
  if (e.pointerType === 'touch') return
  hover(at(e))
}

function up() {
  const d = drag.value
  drag.value = null
  if (!d) return
  if (d.mode === 'box') {
    const b = normBox(d.a, d.b, W.value, H.value)
    if (isBox(b)) add({ kind: 'box', ...b, positive: d.positive })
  } else if (d.mode === 'tap') {
    const r = nudge(d.at, 0, 0, W.value, H.value)
    add({ kind: 'point', x: r.x, y: r.y, positive: d.positive })
  } else if (d.moved) {
    const q = prompts.value[d.i]
    if (q && q.kind === 'box') {
      const b = normBox({ x: q.x0, y: q.y0 }, { x: q.x1, y: q.y1 }, W.value, H.value)
      const next = prompts.value.slice()
      next[d.i] = { ...q, ...b }
      set(next, promptWord(next[d.i]))
    } else if (q) set(prompts.value.slice(), promptWord(q))
  }
}

function leave(e: PointerEvent) {
  if (e.pointerType !== 'touch' && !drag.value) { hover.cancel(); emit('hover', null) }
}

const band = computed(() => (drag.value?.mode === 'box' ? { ...normBox(drag.value.a, drag.value.b, W.value, H.value), positive: drag.value.positive } : null))

/* Keyboard --------------------------------------------------------------- */

const kb = ref(false)
const cursor = ref<{ x: number; y: number } | null>(null)
const anchor = ref<{ x: number; y: number } | null>(null)
const cur = () => cursor.value ?? { x: Math.round(W.value / 2), y: Math.round(H.value / 2) }

const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

function stageKey(e: KeyboardEvent) {
  if (e.target !== e.currentTarget || props.readonly) return
  const k = e.key.toLowerCase()
  if (!e.ctrlKey && !e.metaKey && !e.altKey && PROMPT_KEYS[k]) { tool.value = PROMPT_KEYS[k]; anchor.value = null; said.value = `tool ${PROMPT_KEYS[k]}`; return }
  const a = ARROWS[e.key]
  if (a) {
    e.preventDefault()
    kb.value = true
    const s = promptStep(W.value, H.value, e.shiftKey)
    cursor.value = nudge(cur(), a[0] * s, a[1] * s, W.value, H.value)
    hover(cursor.value)
    return
  }
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    kb.value = true
    const c = cur()
    cursor.value = c
    if (tool.value !== 'box') { add({ kind: 'point', x: c.x, y: c.y, positive: tool.value === 'positive' }); return }
    if (!anchor.value) { anchor.value = c; said.value = `box corner at ${c.x}, ${c.y}. move to the other corner and press enter`; return }
    const b = normBox(anchor.value, c, W.value, H.value)
    anchor.value = null
    if (isBox(b)) add({ kind: 'box', ...b, positive: true })
    else said.value = 'box too small'
    return
  }
  if (e.key === 'Escape') { anchor.value = null; drag.value = null; return }
  if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); undo() }
}

function handleKey(e: KeyboardEvent, i: number, corner: 0 | 1) {
  if (props.readonly) return
  const q = prompts.value[i]
  if (!q) return
  const a = ARROWS[e.key]
  const next = prompts.value.slice()
  if (a) {
    e.preventDefault()
    const s = promptStep(W.value, H.value, e.shiftKey)
    if (q.kind === 'point') next[i] = { ...q, ...nudge(q, a[0] * s, a[1] * s, W.value, H.value) }
    else {
      const p = corner === 0 ? { x: q.x0, y: q.y0 } : { x: q.x1, y: q.y1 }
      const r = nudge(p, a[0] * s, a[1] * s, W.value, H.value)
      const b = corner === 0 ? normBox(r, { x: q.x1, y: q.y1 }, W.value, H.value) : normBox({ x: q.x0, y: q.y0 }, r, W.value, H.value)
      next[i] = { ...q, ...b }
    }
    set(next, promptWord(next[i]))
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault()
    next.splice(i, 1)
    set(next, `removed ${promptWord(q)}`)
    frame.value?.focus()
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    next[i] = { ...q, positive: !q.positive }
    set(next, promptWord(next[i]))
  }
}

function undo() {
  const last = prompts.value[prompts.value.length - 1]
  if (last) set(prompts.value.slice(0, -1), `removed ${promptWord(last)}`)
}
function clear() {
  if (prompts.value.length) set([], 'prompts cleared')
}

const TOOLS: { key: string; tool: PromptTool; word: string }[] = [
  { key: 'p', tool: 'positive', word: 'keep' },
  { key: 'n', tool: 'negative', word: 'leave out' },
  { key: 'b', tool: 'box', word: 'box' },
]
</script>

<template>
  <!-- Prompts for a promptable mask model: keep and leave out points and
       boxes, all in image pixels. Hover emits for a preview, a press
       commits. Handles drag, take arrows, Enter flips keep and leave out,
       Delete removes. The frame takes keys: p n b, arrows, Enter. -->
  <div class="hb-pc" :class="{ 'is-readonly': props.readonly, 'is-bare': props.bare }">
    <div v-if="!props.readonly && !props.bare" class="hb-pc-tools" role="toolbar" aria-label="prompt tools">
      <div class="hb-seg is-toggle" role="group" aria-label="tool">
        <button v-for="t in TOOLS" :key="t.tool" type="button" :class="{ 'is-on': tool === t.tool }" :aria-pressed="tool === t.tool" :aria-keyshortcuts="t.key" @click="tool = t.tool">
          {{ t.word }}<span class="hb-pc-key" aria-hidden="true">{{ t.key }}</span>
        </button>
      </div>
      <button type="button" class="hb-iconbtn" aria-label="undo the last prompt" title="undo the last prompt" :disabled="!prompts.length" @click="undo"><HbIcon name="undo" :size="14" /></button>
      <button type="button" class="hb-iconbtn" aria-label="clear prompts" title="clear prompts" :disabled="!prompts.length" @click="clear"><HbIcon name="trash" :size="14" /></button>
    </div>
    <div class="hb-pc-well">
      <div
        ref="frame"
        class="hb-pc-frame"
        :class="[`is-${tool}`, { 'is-kb': kb }]"
        :style="{ aspectRatio: ratio, '--hb-pc-ratio': W / H }"
        tabindex="0"
        role="application"
        :aria-label="`${props.label}, ${prompts.length} prompts`"
        :aria-describedby="helpId"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="drag = null"
        @pointerleave="leave"
        @keydown="stageKey"
        @contextmenu.prevent
      >
        <img class="hb-pc-img" :src="props.image" alt="" draggable="false" @load="onLoad">
        <div
          v-for="m in props.masks"
          v-show="!m.hidden"
          :key="m.id"
          class="hb-pc-mask"
          :style="{ '--hb-pc-c': m.colour, '--hb-pc-src': cssUrl(m.src) }"
        />
        <div v-if="props.preview" class="hb-pc-mask is-preview" :style="{ '--hb-pc-c': props.previewColour || undefined, '--hb-pc-src': cssUrl(props.preview) }" />
        <template v-for="(q, i) in prompts" :key="i">
          <template v-if="q.kind === 'box'">
            <div class="hb-pc-box" :class="{ 'is-neg': !q.positive }" :style="boxStyle(q)" />
            <button v-for="c in ([0, 1] as const)" :key="c" type="button" class="hb-pc-h is-corner" :class="{ 'is-neg': !q.positive }" :style="c === 0 ? pct(q.x0, q.y0) : pct(q.x1, q.y1)" :aria-label="`${promptWord(q)}, ${c === 0 ? 'first' : 'second'} corner`" @pointerdown="grab($event, i, c)" @keydown="handleKey($event, i, c)"><span class="hb-pc-dot" /></button>
          </template>
          <button v-else type="button" class="hb-pc-h" :class="{ 'is-neg': !q.positive }" :style="pct(q.x, q.y)" :aria-label="promptWord(q)" @pointerdown="grab($event, i, 0)" @keydown="handleKey($event, i, 0)"><span class="hb-pc-dot" /></button>
        </template>
        <div v-if="band" class="hb-pc-box is-band" :class="{ 'is-neg': !band.positive }" :style="boxStyle(band)" />
        <div v-if="anchor && cursor" class="hb-pc-box is-band" :style="boxStyle(normBox(anchor, cursor, W, H))" />
        <span v-if="kb" class="hb-pc-cursor" :style="pct(cur().x, cur().y)" aria-hidden="true" />
      </div>
    </div>
    <p :id="helpId" class="hb-pc-help" :class="{ 'hb-sr': props.bare }">
      <template v-if="props.readonly">prompts are shown, not placed</template>
      <template v-else>press to keep, leave out with n or a right press, drag a box with b. arrows move the cursor, enter places. drag a handle to move it, enter flips it, delete removes it</template>
    </p>
    <p class="hb-sr" role="status" aria-live="polite">{{ said }}</p>
  </div>
</template>
