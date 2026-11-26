<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { waveDrawer, type WaveDrawerHandle, type WaveSel } from '../vanilla/wavedraw'

export type HbWaveSel = WaveSel

interface Props {
  /** Samples from -1 to 1; peaks are drawn per pixel column. */
  samples?: ArrayLike<number> | null
  /** Length in seconds. */
  duration: number
  /** The drawer's name in its head. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), { samples: null, label: 'waveform' })
/** Playhead in seconds. */
const at = defineModel<number>('at', { default: 0 })
/** The picked span, or null. */
const sel = defineModel<WaveSel | null>('sel', { default: null })
/** Open shows the strip; closed keeps the head. */
const open = defineModel<boolean>('open', { default: true })

const root = ref<HTMLElement | null>(null)
let h: WaveDrawerHandle | null = null
onMounted(() => {
  if (!root.value) return
  h = waveDrawer(root.value, {
    samples: props.samples,
    duration: props.duration,
    at: at.value,
    sel: sel.value,
    open: open.value,
    onSeek: (t) => { at.value = t },
    onSelect: (s) => { sel.value = s },
    onToggle: (o) => { open.value = o },
  })
})
watch(() => [props.samples, props.duration] as const, ([s, d]) => h?.setSamples(s, d))
watch(at, (t) => { if (h && h.at !== t) h.setAt(t) })
watch(sel, (s) => { if (h && h.sel !== s) h.setSel(s) })
watch(open, (o) => h?.toggle(o))
onBeforeUnmount(() => h?.dispose())
</script>

<template>
  <!-- A waveform strip for audio: a press seeks, a drag picks a span,
       arrows move, shift arrows grow the span, Escape drops it. -->
  <section ref="root" class="hb-wavedraw is-open">
    <div class="hb-wavedraw-head">
      <button type="button" class="hb-wavedraw-toggle" aria-expanded="true">{{ props.label }}</button>
      <span class="hb-wavedraw-time" aria-hidden="true" />
      <slot name="actions" />
    </div>
    <div class="hb-wavedraw-body">
      <canvas class="hb-wavedraw-canvas" :aria-label="`${props.label} playhead`" />
    </div>
  </section>
</template>
