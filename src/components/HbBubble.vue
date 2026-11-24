<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { bubbleTimer, type BubbleTimerHandle } from '../vanilla/bubble'

export interface Props {
  /** Anchor point in px from the viewport's left and top. The bubble sits above it. */
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
}

const props = withDefaults(defineProps<Props>(), { text: '', ink: false, show: true, lines: 3, ttl: 0, hold: false })
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
onMounted(arm)
onBeforeUnmount(() => timer?.dispose())
</script>

<template>
  <div
    class="hb-bubble"
    :class="{ 'is-ink': props.ink, 'is-clamped': props.lines > 0 }"
    :hidden="!props.show"
    :style="{ '--hb-x': props.x + 'px', '--hb-y': props.y + 'px', '--hb-lines': props.lines }"
    role="status"
    aria-live="polite"
  ><span class="hb-bubble-text"><slot>{{ props.text }}</slot></span></div>
</template>
