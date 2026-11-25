<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { bubbleTimer, measureBubble, type BubbleBox, type BubbleTimerHandle } from '../vanilla/bubble'

export interface Props {
  /** Anchor point in px from the host's left and top (the positioned
      parent, usually the stage). The bubble sits above it. */
  x: number
  y: number
  text?: string
  /** Ink plate for the second speaker. */
  ink?: boolean
  show?: boolean
  /** Cut the text at this many lines with an ellipsis. 0 shows all. */
  lines?: number
  /** Hide after this many ms; 'auto' is reading time, 1.5 s plus 60 ms
      a character. 0 keeps it up. Sets `show` false and emits `expire`. */
  ttl?: number | 'auto'
  /** Keep it up while true, such as while the voice speaks. */
  hold?: boolean
  /** Keep the whole bubble inside the stage host, `pad` px in from its
      edges: it slides sideways, then hangs under the point, and the tail
      keeps pointing at the anchor. The host is the positioned parent. */
  clamp?: boolean
  pad?: number
}

const props = withDefaults(defineProps<Props>(), { text: '', ink: false, show: true, lines: 3, ttl: 0, hold: false, clamp: false, pad: 8 })
const emit = defineEmits<{ 'update:show': [value: boolean]; expire: [] }>()

let timer: BubbleTimerHandle | null = null
function arm() {
  timer?.dispose()
  timer = null
  if (!props.ttl || !props.show) return
  timer = bubbleTimer(() => {
    emit('update:show', false)
    emit('expire')
  }, props.ttl === 'auto' ? undefined : props.ttl)
  timer.hold(props.hold)
  timer.show(props.text)
}
watch(() => [props.text, props.show, props.ttl], arm)
watch(() => props.hold, (h) => timer?.hold(h))
const el = ref<HTMLElement | null>(null)
const box = ref<BubbleBox | null>(null)
function place() {
  box.value = props.clamp && props.show && el.value ? measureBubble(el.value, props.x, props.y, props.pad) : null
}
watch(() => [props.x, props.y, props.text, props.show, props.clamp, props.pad, props.lines], () => nextTick(place), { flush: 'post' })
let ro: ResizeObserver | null = null
onMounted(() => {
  arm()
  place()
  const host = el.value?.offsetParent
  if (host && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => place())
    ro.observe(host)
  }
})
onBeforeUnmount(() => ro?.disconnect())
const style = computed(() => ({
  '--hb-x': (box.value?.x ?? props.x) + 'px',
  '--hb-y': (box.value?.y ?? props.y) + 'px',
  '--hb-tail': (box.value?.tail ?? 0) + 'px',
  '--hb-lines': props.lines,
}))
onBeforeUnmount(() => timer?.dispose())
</script>

<template>
  <div
    class="hb-bubble"
    ref="el"
    :class="{ 'is-ink': props.ink, 'is-clamped': props.lines > 0, 'is-in-host': props.clamp, 'is-below': !!box?.below }"
    :hidden="!props.show"
    :style="style"
    role="status"
    aria-live="polite"
  ><span class="hb-bubble-text"><slot>{{ props.text }}</slot></span></div>
</template>
