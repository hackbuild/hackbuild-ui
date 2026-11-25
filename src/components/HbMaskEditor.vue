<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HbIcon from './HbIcon.vue'
import HbToolRail, { type HbRailTool } from './HbToolRail.vue'
import { MASK_TOOLS, maskEditor, maskHint, type MaskEditorHandle, type MaskEditorState, type MaskMode, type MaskOutput, type MaskSource, type MaskTool } from '../vanilla/mask'

export interface Props {
  /** The image to mask: a url, an element a canvas can draw, or pixels. */
  image: MaskSource
  /** Names the image for screen readers. */
  label?: string
  /** Wand floods through neighbours; off takes the colour everywhere. */
  contiguous?: boolean
  /** Undo depth. */
  history?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'image',
  contiguous: true,
  history: 50,
})

const tool = defineModel<MaskTool>('tool', { default: 'wand' })
const mode = defineModel<MaskMode>('mode', { default: 'add' })
/** Brush diameter in css px. 0 takes the default: 24, 44 on touch. */
const size = defineModel<number>('size', { default: 0 })
/** Wand reach, percent of the colour cube. */
const tol = defineModel<number>('tolerance', { default: 6 })

const emit = defineEmits<{
  /** The mask changed, undo and redo included. */
  edit: [mask: Uint8Array]
  ready: [size: { width: number; height: number }]
  error: [err: Error]
}>()

const root = ref<HTMLElement | null>(null)
const cv = ref<HTMLCanvasElement | null>(null)
const st = ref<MaskEditorState | null>(null)
const failed = ref('')
let handle: MaskEditorHandle | null = null

const rail = computed<HbRailTool[]>(() => MASK_TOOLS.map((t) => ({ id: t.id, label: t.label, icon: t.icon, key: t.key, hint: t.hint })))
const hint = computed(() => maskHint(tool.value, mode.value))
const ratio = computed(() => (st.value?.width && st.value.height ? st.value.width / st.value.height : 4 / 3))
const pct = computed(() => Math.round((st.value?.coverage ?? 0) * 100))

function sync(s: MaskEditorState) {
  const was = st.value?.ready
  st.value = s
  if (s.tool !== tool.value) tool.value = s.tool
  if (s.mode !== mode.value) mode.value = s.mode
  if (s.size !== size.value) size.value = s.size
  if (s.tolerance !== tol.value) tol.value = s.tolerance
  if (s.ready && !was) emit('ready', { width: s.width, height: s.height })
}

function load(src: MaskSource) {
  failed.value = ''
  handle?.setImage(src).catch((e: Error) => { failed.value = e.message })
}

onMounted(() => {
  if (!cv.value) return
  handle = maskEditor(cv.value, {
    tool: tool.value,
    mode: mode.value,
    size: size.value || undefined,
    tolerance: tol.value,
    contiguous: props.contiguous,
    history: props.history,
    keys: root.value ?? undefined,
    onEdit: (m) => emit('edit', m),
    onError: (e) => emit('error', e),
  })
  handle.subscribe(sync)
  sync(handle.state)
  load(props.image)
})
onBeforeUnmount(() => handle?.dispose())

watch(() => props.image, (v) => load(v))
watch(tool, (v) => handle?.setTool(v))
watch(mode, (v) => handle?.setMode(v))
watch(size, (v) => { if (v) handle?.setSize(v) })
watch(tol, (v) => handle?.setTolerance(v))
watch(() => props.contiguous, (v) => handle?.setContiguous(v))

function onTol(e: Event) { tol.value = Number((e.target as HTMLInputElement).value) }

defineExpose({
  /** The mask as ImageData: `alpha` (white, mask as alpha), `matte`, `cutout`. */
  toImageData: (kind?: MaskOutput) => handle!.toImageData(kind),
  /** The same as a png blob, or `type`. */
  toBlob: (kind?: MaskOutput, type?: string) => handle!.toBlob(kind, type),
  /** A copy of the mask, one byte a pixel. */
  mask: () => handle?.mask() ?? new Uint8Array(0),
  setMask: (m: ArrayLike<number>) => handle?.setMask(m),
  undo: () => handle?.undo() ?? false,
  redo: () => handle?.redo() ?? false,
  clear: () => handle?.clear(),
  invert: () => handle?.invert(),
  handle: () => handle,
})
</script>

<template>
  <!-- Mask by hand: wand, brush and lasso over a canvas in image pixels.
       Keys work while focus is inside: w b l, x swaps add and erase,
       [ ] brush size, ctrl z and ctrl shift z, esc drops a gesture. -->
  <div ref="root" class="hb-mask" :class="`is-${mode}`">
    <div class="hb-mask-bar">
      <HbToolRail v-model="tool" :tools="rail" orientation="horizontal" :keys="false" :show-hint="false" label="mask tools" />
      <div class="hb-seg is-toggle" role="group" aria-label="mode">
        <button v-for="m in (['add', 'erase'] as const)" :key="m" type="button" :class="{ 'is-on': mode === m }" :aria-pressed="mode === m" aria-keyshortcuts="X" @click="mode = m">
          {{ m }}<span class="hb-mask-key" aria-hidden="true">x</span>
        </button>
      </div>
      <div v-if="tool === 'brush' || tool === 'eraser'" class="hb-mask-size" role="group" aria-label="brush size">
        <button type="button" class="hb-iconbtn" aria-label="smaller brush" aria-keyshortcuts="[" title="smaller brush ([)" @click="handle?.stepSize(-1)"><HbIcon name="minus" :size="14" /></button>
        <span class="hb-mask-val" aria-live="polite">{{ size }}</span>
        <button type="button" class="hb-iconbtn" aria-label="larger brush" aria-keyshortcuts="]" title="larger brush (])" @click="handle?.stepSize(1)"><HbIcon name="plus" :size="14" /></button>
      </div>
      <label v-else-if="tool === 'wand' || tool === 'flood'" class="hb-mask-tol">
        <span>reach</span>
        <input class="hb-range" type="range" min="0" max="100" step="1" :value="tol" aria-label="wand tolerance, percent" @input="onTol">
        <span class="hb-mask-val">{{ tol }}</span>
      </label>
      <span class="hb-spacer" />
      <div class="hb-mask-hist" role="group" aria-label="history">
        <button type="button" class="hb-iconbtn" aria-label="undo" aria-keyshortcuts="Control+Z" title="undo (ctrl z)" :disabled="!st?.canUndo" @click="handle?.undo()"><HbIcon name="undo" :size="14" /></button>
        <button type="button" class="hb-iconbtn" aria-label="redo" aria-keyshortcuts="Control+Shift+Z" title="redo (ctrl shift z)" :disabled="!st?.canRedo" @click="handle?.redo()"><HbIcon name="redo" :size="14" /></button>
        <button type="button" class="hb-iconbtn" aria-label="clear the mask" title="clear the mask" :disabled="!st?.coverage" @click="handle?.clear()"><HbIcon name="trash" :size="14" /></button>
      </div>
    </div>
    <div class="hb-mask-well">
      <div class="hb-mask-frame" :style="{ aspectRatio: String(ratio), '--hb-mask-ratio': ratio }">
        <canvas ref="cv" class="hb-mask-canvas" tabindex="0" role="img" :aria-label="`${props.label}, mask keeps ${pct} percent`" />
        <p v-if="failed" class="hb-mask-empty">{{ failed }}. the browser may block an image from another site without cors.</p>
        <p v-else-if="!st?.ready" class="hb-mask-empty">loading the image</p>
        <p v-else class="hb-mask-hint" aria-live="polite">{{ hint }}</p>
      </div>
    </div>
  </div>
</template>
