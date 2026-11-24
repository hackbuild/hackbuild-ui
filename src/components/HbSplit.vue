<script setup lang="ts">
import { ref } from 'vue'
import { splitAt, splitKey } from '../vanilla/vision'

interface Props {
  /** Names of the two sides: ['source', 'depth']. */
  labels?: [string, string]
  /** CSS aspect ratio of the frame. */
  ratio?: string
}

const props = withDefaults(defineProps<Props>(), { labels: () => ['before', 'after'], ratio: '4/3' })

/** Divider position, 0 at the left edge to 1 at the right. */
const pos = defineModel<number>({ default: 0.5 })

const box = ref<HTMLElement | null>(null)
const dragging = ref(false)

function at(e: PointerEvent) {
  const el = box.value
  if (el) pos.value = splitAt(e.clientX, el.getBoundingClientRect())
}
function down(e: PointerEvent) {
  if (e.button !== 0) return
  dragging.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  at(e)
}
function move(e: PointerEvent) { if (dragging.value) at(e) }
function key(e: KeyboardEvent) {
  const v = splitKey(e.key, pos.value, e.shiftKey)
  if (v === null) return
  e.preventDefault()
  pos.value = v
}
</script>

<template>
  <!-- A compare wipe: the left slot under the right slot, the right one
       cut at the divider. Press or drag anywhere on the frame; the
       divider handle takes arrows (shift for 1 percent), page keys, home
       and end. Both slots fill the same frame at the same size. -->
  <div
    ref="box"
    class="hb-split"
    :class="{ 'is-drag': dragging }"
    :style="{ '--hb-split-ratio': props.ratio, '--hb-split-pos': `${pos * 100}%` }"
    @pointerdown="down"
    @pointermove="move"
    @pointerup="dragging = false"
    @pointercancel="dragging = false"
  >
    <div class="hb-split-side is-left"><slot name="left" /></div>
    <div class="hb-split-side is-right"><slot name="right" /></div>
    <span class="hb-split-tag is-left" aria-hidden="true">{{ props.labels[0] }}</span>
    <span class="hb-split-tag is-right" aria-hidden="true">{{ props.labels[1] }}</span>
    <div
      class="hb-split-bar"
      role="slider"
      tabindex="0"
      :aria-label="`compare ${props.labels[0]} and ${props.labels[1]}`"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(pos * 100)"
      :aria-valuetext="`${Math.round(pos * 100)} percent ${props.labels[0]}`"
      aria-orientation="horizontal"
      @keydown="key"
    ><span class="hb-split-grip" aria-hidden="true" /></div>
  </div>
</template>
