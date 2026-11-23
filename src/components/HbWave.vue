<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  /** VT323 caps label, top left: 'mic level', 'viseme'. */
  label?: string
  /** Figure top right: '-18 dB'. */
  value?: string
  /** Playhead position, 0 to 1, or null for none. */
  at?: number | null
  /** Samples from -1 to 1 drawn as a waveform. Leave empty and draw into the default slot's canvas yourself. */
  samples?: number[] | Float32Array | null
  /** Draw samples as a level history (0 to 1 bars from the floor) instead of a centred wave. */
  bars?: boolean
  /** Dims the trace: the source is stopped. */
  off?: boolean
}

const props = withDefaults(defineProps<Props>(), { label: '', value: '', at: null, samples: null, bars: false, off: false })

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
let ro: ResizeObserver | null = null

function draw() {
  const c = canvas.value
  const el = root.value
  if (!c || !el || !props.samples) return
  const dpr = window.devicePixelRatio || 1
  const w = (c.width = Math.max(1, Math.round(c.clientWidth * dpr)))
  const h = (c.height = Math.max(1, Math.round(c.clientHeight * dpr)))
  const g = c.getContext('2d')
  if (!g) return
  const css = getComputedStyle(el)
  g.clearRect(0, 0, w, h)
  g.fillStyle = css.getPropertyValue('--hb-lit-dim').trim()
  g.fillRect(0, props.bars ? h - dpr : Math.floor(h / 2), w, dpr)
  const n = props.samples.length
  if (!n) return
  g.fillStyle = css.getPropertyValue('--hb-pink').trim()
  const bw = w / n
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, props.samples[i] ?? 0))
    if (props.bars) {
      const bh = Math.abs(v) * (h - 4 * dpr)
      g.fillRect(i * bw, h - bh, Math.max(dpr, bw - dpr), bh)
    } else {
      const bh = Math.max(dpr, Math.abs(v) * (h / 2 - 2 * dpr))
      g.fillRect(i * bw, h / 2 - bh, Math.max(dpr, bw - dpr), bh * 2)
    }
  }
}

watch(() => [props.samples, props.bars], draw, { deep: false })
onMounted(() => {
  draw()
  if (typeof ResizeObserver !== 'undefined' && root.value) {
    ro = new ResizeObserver(draw)
    ro.observe(root.value)
  }
})
onBeforeUnmount(() => ro?.disconnect())
defineExpose({ draw })
</script>

<template>
  <div ref="root" class="hb-wave" :class="{ 'is-off': props.off }" role="img" :aria-label="[props.label, props.value].filter(Boolean).join(' ') || 'audio'">
    <slot><canvas ref="canvas" /></slot>
    <span v-if="props.label" class="hb-wave-label">{{ props.label }}</span>
    <span v-if="props.value" class="hb-wave-value">{{ props.value }}</span>
    <span v-if="props.at !== null" class="hb-wave-head" :style="{ '--hb-at': Math.min(1, Math.max(0, props.at)) }" />
  </div>
</template>
