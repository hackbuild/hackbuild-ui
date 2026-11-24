<script lang="ts">
let seq = 0
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import HbIcon from './HbIcon.vue'
import {
  ART_FIT, ART_KEYS, addStrokePoint, artViewKey, boardRect, fitScale, hitLayer, pinch, snapRot, snapTo,
  toBoard, toLayer, wheelFactor, zoomAt, zoomWord,
  type ArtLayer, type ArtStroke, type ArtTool, type ArtTransform, type ArtView,
} from '../vanilla/artboard'

export interface Props {
  /** Board size, board pixels. */
  width: number
  height: number
  /** Drawn under the layers and the default slot, filling the board. */
  image?: string
  /** The last one is on top. */
  layers?: ArtLayer[]
  /** Brush diameter in board pixels. */
  brush?: { size: number }
  /** Truth label, top left: what the board shows. The zoom is added
      when it is not 1. */
  caption?: string
  /** Names the board for screen readers. */
  label?: string
  /** Pans and zooms, edits nothing. */
  readonly?: boolean
  /** Take the parent's height, as inside HbViewport. */
  fill?: boolean
  /** Zoom range relative to fit. */
  minZoom?: number
  maxZoom?: number
  /** Space around the fitted board, screen pixels. */
  pad?: number
}

const props = withDefaults(defineProps<Props>(), {
  image: '',
  layers: () => [],
  brush: () => ({ size: 16 }),
  caption: '',
  label: 'artboard',
  readonly: false,
  fill: false,
  minZoom: 0.25,
  maxZoom: 16,
  pad: 16,
})

const selected = defineModel<string | number | null>('selected', { default: null })
const tool = defineModel<ArtTool>('tool', { default: 'move' })
const view = defineModel<ArtView>('view', { default: () => ({ ...ART_FIT }) })

const emit = defineEmits<{
  /** A layer moved, scaled or rotated. `done` on release. */
  transform: [id: string | number, t: ArtTransform, done: boolean]
  /** An erase or restore stroke on the selected layer, layer pixels. */
  stroke: [s: ArtStroke]
  /** Delete on the selected layer. */
  remove: [id: string | number]
}>()

defineSlots<{
  /** Board content under the layers: a canvas, or a part such as
      HbPromptCanvas. Sized to the board; it zooms by layout, not by a
      scale transform, so handles inside keep their size. */
  default?: (p: { scale: number }) => unknown
  /** A `slot` layer's content. */
  layer?: (p: { layer: ArtLayer }) => unknown
  /** Screen space over everything: labels, covers, HbStageOverlay corners. */
  overlay?: (p: { scale: number; zoom: number }) => unknown
}>()

seq += 1
const helpId = `hb-ab-${seq}-help`
const vp = ref<HTMLElement | null>(null)
const box = ref({ w: 0, h: 0 })
const said = ref('')
const space = ref(false)

let ro: ResizeObserver | null = null
onMounted(() => {
  const el = vp.value
  if (!el) return
  const read = () => { box.value = { w: el.clientWidth, h: el.clientHeight } }
  read()
  ro = new ResizeObserver(read)
  ro.observe(el)
  el.addEventListener('wheel', onWheel, { passive: false })
})
onBeforeUnmount(() => { ro?.disconnect(); vp.value?.removeEventListener('wheel', onWheel) })

const fit = computed(() => fitScale(box.value.w, box.value.h, props.width, props.height, props.pad))
const rect = computed(() => boardRect(view.value, box.value.w, box.value.h, props.width, props.height, fit.value))
const scale = computed(() => rect.value.scale)
const zoomText = computed(() => zoomWord(scale.value))
const sel = computed(() => props.layers.find((L) => L.id === selected.value) ?? null)
const painting = computed(() => !props.readonly && tool.value !== 'move' && !!sel.value)

const boardStyle = computed(() => ({
  width: `${props.width * scale.value}px`,
  height: `${props.height * scale.value}px`,
  transform: `translate(${rect.value.left}px, ${rect.value.top}px)`,
}))
const pctX = (v: number) => `${(v / props.width) * 100}%`
const pctY = (v: number) => `${(v / props.height) * 100}%`
function layerStyle(L: ArtLayer) {
  const t = L.transform
  const w = L.w * t.scale
  const h = L.h * t.scale
  return { left: pctX(t.x - w / 2), top: pctY(t.y - h / 2), width: pctX(w), height: pctY(h), transform: t.rot ? `rotate(${t.rot}deg)` : undefined }
}
const cssUrl = (s: string) => `url("${s}")`

/* View --------------------------------------------------------------- */

function setView(v: ArtView, word?: string) {
  view.value = v
  if (word) said.value = word
}
function zoomBy(f: number, px = box.value.w / 2, py = box.value.h / 2) {
  setView(zoomAt(view.value, f, px, py, box.value.w, box.value.h, props.width, props.height, fit.value, props.minZoom, props.maxZoom))
  said.value = `zoom ${zoomWord(fit.value * view.value.zoom)}`
}
function fitView() { setView({ ...ART_FIT }, `fit, zoom ${zoomWord(fit.value)}`) }
function actual() { zoomBy(1 / (fit.value * view.value.zoom)) }
defineExpose({ fit: fitView, zoomBy })

function local(e: { clientX: number; clientY: number }) {
  const r = vp.value!.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}

function onWheel(e: WheelEvent) {
  if (!vp.value) return
  e.preventDefault()
  const p = local(e)
  zoomBy(wheelFactor(e.deltaY, e.deltaMode, e.ctrlKey), p.x, p.y)
}

/* Pointer ------------------------------------------------------------ */

type Drag =
  | { mode: 'pan'; id: number; x: number; y: number; v: ArtView }
  | { mode: 'move' | 'scale' | 'rotate'; id: number; L: ArtLayer; t0: ArtTransform; b0: { x: number; y: number }; d0: number; a0: number; moved: boolean }
  | { mode: 'paint'; id: number; L: ArtLayer; s: ArtStroke }
  | { mode: 'pinch'; ids: [number, number]; p0: [{ x: number; y: number }, { x: number; y: number }]; v: ArtView }

const drag = ref<Drag | null>(null)
const live = ref<{ id: string | number; t: ArtTransform } | null>(null)
const guide = ref<{ x: boolean; y: boolean }>({ x: false, y: false })
const hover = ref<{ x: number; y: number } | null>(null)
const pts = new Map<number, { x: number; y: number; target: EventTarget | null; type: string }>()
let swallow = false

const shown = (L: ArtLayer): ArtLayer => (live.value && live.value.id === L.id ? { ...L, transform: live.value.t } : L)
const shownLayers = computed(() => props.layers.map(shown))
const selShown = computed(() => (sel.value ? shown(sel.value) : null))

function owned(t: EventTarget | null) {
  const el = t as Element | null
  if (!el?.closest) return false
  return !!el.closest('.hb-ab-ov, .hb-ab-zoom, .hb-ab-slot [tabindex], .hb-ab-slot button, .hb-ab-slot input, .hb-ab-slot select, .hb-ab-slot [data-ab-own]')
}

function capture(id: number) { try { vp.value?.setPointerCapture(id) } catch { /* pointer gone */ } }

function startPinch() {
  const ids = [...pts.keys()].slice(0, 2) as [number, number]
  const a = pts.get(ids[0])!
  const b = pts.get(ids[1])!
  endDrag(true)
  // A part in the slot took the first touch: cancel it there so it
  // places nothing, and keep both touches from it until they lift.
  if (a.target && owned(a.target)) {
    swallow = true
    a.target.dispatchEvent(new PointerEvent('pointercancel', { pointerId: ids[0], bubbles: true, pointerType: 'touch' }))
    swallow = false
  }
  drag.value = { mode: 'pinch', ids, p0: [{ x: a.x, y: a.y }, { x: b.x, y: b.y }], v: { ...view.value } }
}

function down(e: PointerEvent) {
  if (swallow) return
  const p = local(e)
  pts.set(e.pointerId, { ...p, target: e.target, type: e.pointerType })
  const touches = [...pts.values()].filter((q) => q.type === 'touch').length
  if (e.pointerType === 'touch' && touches === 2) { e.stopPropagation(); startPinch(); return }
  if (drag.value?.mode === 'pinch') { e.stopPropagation(); return }
  if (!owned(e.target)) vp.value?.focus({ preventScroll: true })
  const panBtn = e.button === 1 || (e.button === 2 && !owned(e.target)) || (e.button === 0 && space.value)
  if (panBtn) { e.preventDefault(); e.stopPropagation(); capture(e.pointerId); drag.value = { mode: 'pan', id: e.pointerId, x: p.x, y: p.y, v: { ...view.value } }; return }
  if (e.button !== 0 || owned(e.target)) return
  const b = toBoard(p.x, p.y, rect.value)
  if (painting.value && sel.value) {
    const L = sel.value
    const s: ArtStroke = { id: L.id, tool: tool.value as 'erase' | 'restore', size: props.brush.size / L.transform.scale, points: [] }
    addStrokePoint(s.points, toLayer(L, b.x, b.y), s.size)
    capture(e.pointerId)
    drag.value = { mode: 'paint', id: e.pointerId, L, s }
    return
  }
  const h = (e.target as Element).closest?.('[data-ab-h]')?.getAttribute('data-ab-h') as 'scale' | 'rotate' | null
  let L = h && sel.value ? sel.value : props.readonly ? null : hitLayer(props.layers, b.x, b.y)
  if (!L) {
    if (selected.value !== null && !props.readonly) selected.value = null
    capture(e.pointerId)
    drag.value = { mode: 'pan', id: e.pointerId, x: p.x, y: p.y, v: { ...view.value } }
    return
  }
  if (selected.value !== L.id) { selected.value = L.id; said.value = `${L.label || 'layer'} selected` }
  L = props.layers.find((q) => q.id === L!.id)!
  const t = L.transform
  capture(e.pointerId)
  drag.value = { mode: h || 'move', id: e.pointerId, L, t0: { ...t }, b0: b, d0: Math.max(0.5, Math.hypot(b.x - t.x, b.y - t.y)), a0: Math.atan2(b.y - t.y, b.x - t.x), moved: false }
}

function move(e: PointerEvent) {
  if (swallow) return
  const p = local(e)
  const q = pts.get(e.pointerId)
  if (q) { q.x = p.x; q.y = p.y }
  const d = drag.value
  if (!d) {
    if (e.pointerType !== 'touch') hover.value = toBoard(p.x, p.y, rect.value)
    return
  }
  if (d.mode === 'pinch') {
    if (!d.ids.includes(e.pointerId)) return
    e.stopPropagation()
    const a = pts.get(d.ids[0])
    const b = pts.get(d.ids[1])
    if (!a || !b) return
    const g = pinch(d.p0[0], d.p0[1], a, b)
    const z = zoomAt(d.v, g.factor, g.mid0.x, g.mid0.y, box.value.w, box.value.h, props.width, props.height, fit.value, props.minZoom, props.maxZoom)
    view.value = { zoom: z.zoom, x: z.x + g.mid1.x - g.mid0.x, y: z.y + g.mid1.y - g.mid0.y }
    return
  }
  if (d.id !== e.pointerId) return
  if (d.mode === 'pan') { view.value = { ...d.v, x: d.v.x + p.x - d.x, y: d.v.y + p.y - d.y }; return }
  const b = toBoard(p.x, p.y, rect.value)
  if (e.pointerType !== 'touch') hover.value = b
  if (d.mode === 'paint') { addStrokePoint(d.s.points, toLayer(d.L, b.x, b.y), d.s.size); d.s = { ...d.s }; return }
  const t = { ...d.t0 }
  const tol = 6 / scale.value
  if (d.mode === 'move') {
    let dx = b.x - d.b0.x
    let dy = b.y - d.b0.y
    if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0 }
    const sx = snapTo(d.t0.x + dx, props.width / 2, tol, e.altKey)
    const sy = snapTo(d.t0.y + dy, props.height / 2, tol, e.altKey)
    t.x = Math.round(sx.v * 10) / 10
    t.y = Math.round(sy.v * 10) / 10
    guide.value = { x: sx.snapped, y: sy.snapped }
  } else if (d.mode === 'scale') {
    const k = Math.hypot(b.x - d.t0.x, b.y - d.t0.y) / d.d0
    t.scale = Math.max(0.01, Math.round(d.t0.scale * k * 1000) / 1000)
  } else {
    t.rot = snapRot(d.t0.rot + ((Math.atan2(b.y - d.t0.y, b.x - d.t0.x) - d.a0) * 180) / Math.PI, e.shiftKey, e.altKey)
  }
  d.moved = true
  live.value = { id: d.L.id, t }
  emit('transform', d.L.id, t, false)
}

function endDrag(cancel = false) {
  const d = drag.value
  drag.value = null
  guide.value = { x: false, y: false }
  if (!d) return
  if (d.mode === 'paint' && !cancel && d.s.points.length) { emit('stroke', d.s); said.value = `${d.s.tool} stroke` }
  if ((d.mode === 'move' || d.mode === 'scale' || d.mode === 'rotate') && d.moved && live.value) {
    const t = live.value.t
    emit('transform', d.L.id, t, true)
    said.value = `${d.L.label || 'layer'} at ${Math.round(t.x)}, ${Math.round(t.y)}, scale ${Math.round(t.scale * 100)} percent, ${Math.round(t.rot)} degrees`
  }
  live.value = null
}

function up(e: PointerEvent) {
  if (swallow) return
  const d = drag.value
  pts.delete(e.pointerId)
  if (d?.mode === 'pinch') {
    if (d.ids.includes(e.pointerId)) { e.stopPropagation(); drag.value = null; said.value = `zoom ${zoomText.value}` }
    return
  }
  if (d && d.id === e.pointerId) endDrag(e.type === 'pointercancel')
}

function leave(e: PointerEvent) { if (e.pointerType !== 'touch') hover.value = null }

/* Keyboard ----------------------------------------------------------- */

const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

function commitT(L: ArtLayer, t: ArtTransform, word: string) {
  emit('transform', L.id, t, true)
  said.value = word
}

function key(e: KeyboardEvent) {
  if (e.key === ' ' && e.target === e.currentTarget) { e.preventDefault(); space.value = true; return }
  if (e.target !== e.currentTarget || e.ctrlKey || e.metaKey) return
  const k = e.key.toLowerCase()
  const v = artViewKey(e.key)
  if (v) { e.preventDefault(); if (v === 'in') zoomBy(1.25); else if (v === 'out') zoomBy(0.8); else if (v === 'fit') fitView(); else actual(); return }
  if (!props.readonly && !e.altKey && ART_KEYS[k]) { tool.value = ART_KEYS[k]; said.value = `tool ${ART_KEYS[k]}`; return }
  if (e.key === 'Escape') {
    if (tool.value !== 'move') { tool.value = 'move'; said.value = 'tool move' } else if (selected.value !== null) { selected.value = null; said.value = 'nothing selected' }
    return
  }
  if ((e.key === '[' || e.key === ']') && !props.readonly) {
    const pick = props.layers.filter((L) => !L.hidden && !L.locked)
    if (!pick.length) return
    const i = pick.findIndex((L) => L.id === selected.value)
    const n = pick[(i + (e.key === ']' ? 1 : -1) + pick.length + (i < 0 && e.key === '[' ? 1 : 0)) % pick.length]
    selected.value = n.id
    said.value = `${n.label || 'layer'} selected`
    return
  }
  const a = ARROWS[e.key]
  const L = sel.value
  if (a) {
    e.preventDefault()
    if (L && !props.readonly) {
      const s = e.shiftKey ? 10 : 1
      commitT(L, { ...L.transform, x: L.transform.x + a[0] * s, y: L.transform.y + a[1] * s }, `${L.label || 'layer'} at ${Math.round(L.transform.x + a[0] * s)}, ${Math.round(L.transform.y + a[1] * s)}`)
    } else {
      const s = e.shiftKey ? 160 : 40
      setView({ ...view.value, x: view.value.x - a[0] * s, y: view.value.y - a[1] * s })
    }
    return
  }
  if ((e.key === 'Delete' || e.key === 'Backspace') && L && !props.readonly) { e.preventDefault(); emit('remove', L.id); said.value = `${L.label || 'layer'} removed` }
}
function keyUp(e: KeyboardEvent) { if (e.key === ' ') space.value = false }

function handleKey(e: KeyboardEvent, h: 'scale' | 'rotate') {
  const L = sel.value
  const a = ARROWS[e.key]
  if (!L || !a || props.readonly) return
  e.preventDefault()
  e.stopPropagation()
  const grow = a[0] + -a[1]
  const t = { ...L.transform }
  if (h === 'scale') t.scale = Math.max(0.01, Math.round(t.scale * (1 + grow * (e.shiftKey ? 0.1 : 0.02)) * 1000) / 1000)
  else t.rot = snapRot(t.rot + grow * (e.shiftKey ? 15 : 1), false, true)
  commitT(L, t, h === 'scale' ? `scale ${Math.round(t.scale * 100)} percent` : `${Math.round(t.rot)} degrees`)
}

function dbl(e: MouseEvent) {
  if (owned(e.target)) return
  const p = local(e)
  const b = toBoard(p.x, p.y, rect.value)
  if (!hitLayer(props.layers, b.x, b.y)) fitView()
}

const capText = computed(() => (props.caption ? props.caption + (Math.abs(view.value.zoom - 1) > 0.01 ? `  x${view.value.zoom.toFixed(1)}` : '') : ''))
const ring = computed(() => (painting.value && hover.value ? { left: pctX(hover.value.x), top: pctY(hover.value.y), width: `${props.brush.size * scale.value}px`, height: `${props.brush.size * scale.value}px` } : null))
const strokePts = computed(() => (drag.value?.mode === 'paint' ? drag.value : null))
</script>

<template>
  <!-- A board that pans and zooms: wheel and ctrl wheel zoom at the
       cursor, a drag on empty board, middle or right drag, or space drag
       pans, two fingers pinch and pan, keys + - 0 1. Layers move by drag,
       corners scale, the dot rotates; erase and restore paint a mask in
       the layer's own pixels. -->
  <div class="hb-ab" :class="{ 'is-fill': props.fill, 'is-readonly': props.readonly }">
    <div
      ref="vp"
      class="hb-ab-vp"
      :class="[`is-${tool}`, { 'is-pan': drag?.mode === 'pan' || space, 'is-paint': painting }]"
      :style="{ '--hb-ab-ratio': `${props.width} / ${props.height}` }"
      tabindex="0"
      role="application"
      :aria-label="`${props.label}, zoom ${zoomText}${sel ? `, ${sel.label || 'layer'} selected` : ''}`"
      :aria-describedby="helpId"
      @pointerdown.capture="down"
      @pointermove.capture="move"
      @pointerup.capture="up"
      @pointercancel.capture="up"
      @pointerleave="leave"
      @keydown="key"
      @keyup="keyUp"
      @blur="space = false"
      @dblclick="dbl"
      @contextmenu.prevent
    >
      <div class="hb-ab-board" :style="boardStyle">
        <img v-if="props.image" class="hb-ab-img" :src="props.image" alt="" draggable="false">
        <div class="hb-ab-slot"><slot :scale="scale" /></div>
        <div v-for="L in shownLayers" v-show="!L.hidden" :key="L.id" class="hb-ab-layer" :class="{ 'is-on': L.id === selected }" :style="layerStyle(L)">
          <img v-if="L.kind === 'image' && L.src" class="hb-ab-img" :src="L.src" alt="" draggable="false">
          <slot v-else name="layer" :layer="L" />
          <div v-if="L.mask" class="hb-ab-mask" :class="{ 'is-live': painting && L.id === selected }" :style="{ '--hb-ab-src': cssUrl(L.mask) }" />
          <svg v-if="strokePts && strokePts.L.id === L.id" class="hb-ab-stroke" :class="`is-${strokePts.s.tool}`" :viewBox="`0 0 ${L.w} ${L.h}`" preserveAspectRatio="none" aria-hidden="true">
            <polyline :points="strokePts.s.points.map((q) => `${q.x},${q.y}`).join(' ')" :stroke-width="strokePts.s.size" />
          </svg>
        </div>
        <span v-if="guide.x" class="hb-ab-guide is-x" aria-hidden="true" />
        <span v-if="guide.y" class="hb-ab-guide is-y" aria-hidden="true" />
        <div v-if="selShown && !props.readonly" class="hb-ab-sel" :class="{ 'is-paint': painting }" :style="layerStyle(selShown)">
          <template v-if="!painting">
            <button v-for="c in ['tl', 'tr', 'br', 'bl']" :key="c" type="button" class="hb-ab-h" :class="`is-${c}`" data-ab-h="scale" :aria-label="`scale ${selShown.label || 'layer'}, ${Math.round(selShown.transform.scale * 100)} percent`" :tabindex="c === 'br' ? 0 : -1" @keydown="handleKey($event, 'scale')"><span class="hb-ab-hsq" /></button>
            <span class="hb-ab-stem" aria-hidden="true" />
            <button type="button" class="hb-ab-h is-rot" data-ab-h="rotate" :aria-label="`rotate ${selShown.label || 'layer'}, ${Math.round(selShown.transform.rot)} degrees`" @keydown="handleKey($event, 'rotate')"><span class="hb-ab-hdot" /></button>
          </template>
          <span v-if="drag && 'L' in drag && drag.mode !== 'paint'" class="hb-ab-read">{{ drag.mode === 'rotate' ? `${Math.round(selShown.transform.rot)} deg` : drag.mode === 'scale' ? `${Math.round(selShown.transform.scale * 100)}%` : `${Math.round(selShown.transform.x)}, ${Math.round(selShown.transform.y)}` }}</span>
        </div>
        <span v-if="ring" class="hb-ab-ring" :class="`is-${tool}`" :style="ring" aria-hidden="true" />
      </div>
      <div class="hb-ab-ov">
        <span v-if="capText" class="hb-ab-cap">{{ capText }}</span>
        <slot name="overlay" :scale="scale" :zoom="view.zoom" />
      </div>
      <div class="hb-ab-zoom" role="group" aria-label="zoom">
        <button type="button" class="hb-iconbtn" aria-label="zoom out" title="zoom out (-)" @click="zoomBy(0.8)"><HbIcon name="minus" :size="14" /></button>
        <button type="button" class="hb-ab-pct" :aria-label="`zoom ${zoomText}, show board pixels at 100 percent`" title="100 percent (1)" @click="actual">{{ zoomText }}</button>
        <button type="button" class="hb-iconbtn" aria-label="zoom in" title="zoom in (+)" @click="zoomBy(1.25)"><HbIcon name="plus" :size="14" /></button>
        <button type="button" class="hb-iconbtn" aria-label="fit to view" title="fit (0)" @click="fitView"><HbIcon name="crosshairs" :size="14" /></button>
      </div>
    </div>
    <p :id="helpId" class="hb-ab-help">
      wheel zooms at the cursor, drag the empty board or hold space to pan, two fingers pinch. keys: + - zoom, 0 fits, 1 is 100 percent, arrows pan<template v-if="!props.readonly">. drag a layer to move it, corners scale, the dot rotates; arrows nudge, [ ] pick, delete removes, v e r pick move, erase, restore, esc drops the brush</template>
    </p>
    <p class="hb-sr" role="status" aria-live="polite">{{ said }}</p>
  </div>
</template>
