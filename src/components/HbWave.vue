<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface Props {
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
  /** Per sample: true kept (slime), false cut (grey). The level rail's speech mask. */
  kept?: boolean[] | null
  /** Noise floor, 0 to 1 of the bar height: a dashed amber line. Bars only. */
  floor?: number | null
  /** Gate threshold, 0 to 1 of the bar height: a dotted red line. Bars only. */
  gate?: number | null
  /** Time ticks along the foot. */
  ticks?: number
  /** Click, drag or arrow keys move the playhead; emits `seek`. */
  seekable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '', value: '', at: null, samples: null, bars: false, off: false,
  kept: null, floor: null, gate: null, ticks: 0, seekable: false,
})

const emit = defineEmits<{ seek: [at: number] }>()

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
let ro: ResizeObserver | null = null

function line(g: CanvasRenderingContext2D, y: number, w: number, dash: number[], color: string, dpr: number) {
  g.save()
  g.strokeStyle = color
  g.lineWidth = dpr
  g.setLineDash(dash.map((d) => d * dpr))
  g.beginPath()
  g.moveTo(0, Math.round(y) + 0.5)
  g.lineTo(w, Math.round(y) + 0.5)
  g.stroke()
  g.restore()
}

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
  const tok = (n: string) => css.getPropertyValue(n).trim()
  const dim = tok('--hb-lit-dim')
  g.clearRect(0, 0, w, h)
  g.fillStyle = dim
  g.fillRect(0, props.bars ? h - dpr : Math.floor(h / 2), w, dpr)
  const span = h - 4 * dpr
  if (props.ticks > 0) {
    for (let i = 1; i < props.ticks; i++) g.fillRect(Math.round((i / props.ticks) * w), h - 4 * dpr, dpr, 4 * dpr)
  }
  const n = props.samples.length
  if (n) {
    const pink = tok('--hb-pink')
    const keep = tok('--hb-slime')
    const bw = w / n
    for (let i = 0; i < n; i++) {
      const v = Math.max(-1, Math.min(1, props.samples[i] ?? 0))
      g.fillStyle = props.kept ? (props.kept[i] ? keep : dim) : pink
      if (props.bars) {
        const bh = Math.abs(v) * span
        g.fillRect(i * bw, h - bh, Math.max(dpr, bw - dpr), bh)
      } else {
        const bh = Math.max(dpr, Math.abs(v) * (h / 2 - 2 * dpr))
        g.fillRect(i * bw, h / 2 - bh, Math.max(dpr, bw - dpr), bh * 2)
      }
    }
  }
  if (props.bars && props.floor !== null) line(g, h - props.floor * span, w, [4, 3], tok('--hb-lit-warn'), dpr)
  if (props.bars && props.gate !== null) line(g, h - props.gate * span, w, [1, 3], tok('--hb-lit-err'), dpr)
}

function seekAt(e: PointerEvent) {
  const r = root.value?.getBoundingClientRect()
  if (!r || !r.width) return
  emit('seek', Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)))
}
function down(e: PointerEvent) {
  if (!props.seekable || e.button !== 0) return
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  seekAt(e)
}
function move(e: PointerEvent) {
  if (props.seekable && (e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) seekAt(e)
}
function key(e: KeyboardEvent) {
  if (!props.seekable) return
  const at = props.at ?? 0
  const step = e.shiftKey ? 0.1 : 0.01
  const next = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? at + step
    : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? at - step
    : e.key === 'Home' ? 0 : e.key === 'End' ? 1 : null
  if (next === null) return
  e.preventDefault()
  emit('seek', Math.max(0, Math.min(1, next)))
}

watch(() => [props.samples, props.bars, props.kept, props.floor, props.gate, props.ticks], draw, { deep: false })
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
  <div
    ref="root"
    class="hb-wave"
    :class="{ 'is-off': props.off, 'is-seek': props.seekable }"
    :role="props.seekable ? 'slider' : 'img'"
    :tabindex="props.seekable ? 0 : undefined"
    :aria-label="[props.label, props.value].filter(Boolean).join(' ') || 'audio'"
    :aria-valuemin="props.seekable ? 0 : undefined"
    :aria-valuemax="props.seekable ? 100 : undefined"
    :aria-valuenow="props.seekable ? Math.round((props.at ?? 0) * 100) : undefined"
    @pointerdown="down"
    @pointermove="move"
    @keydown="key"
  >
    <slot><canvas ref="canvas" /></slot>
    <span v-if="props.label" class="hb-wave-label">{{ props.label }}</span>
    <span v-if="props.value" class="hb-wave-value">{{ props.value }}</span>
    <span v-if="props.at !== null" class="hb-wave-head" :style="{ '--hb-at': Math.min(1, Math.max(0, props.at)) }" />
  </div>
</template>
