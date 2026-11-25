<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { HbMaskEditor, type MaskMode, type MaskOutput, type MaskTool } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { sceneUrl } from '../fixtures/vision'

// The desk scene is drawn in code: no image is fetched and no model runs.
const ed = ref<InstanceType<typeof HbMaskEditor> | null>(null)
const tool = ref<MaskTool>('wand')
const mode = ref<MaskMode>('add')
const size = ref(0)
const tolerance = ref(6)
const out = ref('')
const outWord = ref('nothing exported yet')
const edits = ref(0)

async function exportAs(kind: MaskOutput) {
  if (!ed.value) return
  try {
    const blob = await ed.value.toBlob(kind)
    if (out.value) URL.revokeObjectURL(out.value)
    out.value = URL.createObjectURL(blob)
    outWord.value = `${kind} png, ${(blob.size / 1024).toFixed(1)} kb`
  } catch (e) {
    outWord.value = `export failed: ${(e as Error).message}`
  }
}
onBeforeUnmount(() => { if (out.value) URL.revokeObjectURL(out.value) })

const code = `<HbMaskEditor ref="ed" :image="url" v-model:tool="tool" v-model:mode="mode"
  v-model:size="size" v-model:tolerance="tolerance" @edit="onEdit" />
const png = await ed.value.toBlob('alpha')     // white, the mask as alpha
const data = ed.value.toImageData('cutout')    // the source cut out

// vanilla
import { maskEditor } from '@virgilvox/hackbuild-ui/vanilla'
const h = maskEditor(canvas, { image: url, keys: root, onEdit })
h.setTool('brush'); h.swap(); h.undo(); await h.toBlob('matte')`
</script>

<template>
  <DemoSection title="Mask by hand" note="w wand floods the colour you tap, b brush paints, l lasso fills what you draw round. x swaps add and erase, shift flips it for one gesture, [ and ] size the brush, ctrl z and ctrl shift z undo and redo, esc drops a stroke. The brush is 44 px on touch. The mask is in image pixels." :code="code">
    <div class="demo-pair">
      <HbMaskEditor
        ref="ed"
        v-model:tool="tool"
        v-model:mode="mode"
        v-model:size="size"
        v-model:tolerance="tolerance"
        :image="sceneUrl"
        label="desk scene"
        @edit="edits++"
      />
      <div class="demo-col">
        <div style="display: flex; flex-wrap: wrap; gap: var(--hb-s2)">
          <button type="button" class="hb-btn hb-btn-2" @click="exportAs('alpha')">alpha png</button>
          <button type="button" class="hb-btn hb-btn-2" @click="exportAs('matte')">matte png</button>
          <button type="button" class="hb-btn hb-btn-2" @click="exportAs('cutout')">cutout png</button>
        </div>
        <div class="hb-mask-well" style="min-height: 96px; align-items: center">
          <img v-if="out" :src="out" alt="the exported mask" style="display: block; max-width: 100%; height: auto">
        </div>
        <p class="hb-hint">{{ outWord }}. {{ edits }} edits. tool {{ tool }}, {{ mode }}, brush {{ size }} px, reach {{ tolerance }}</p>
      </div>
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'image', type: 'string | CanvasImageSource | ImageData', notes: 'a url, an element a canvas draws, or pixels' },
      { prop: 'v-model:tool', type: `'wand' | 'brush' | 'lasso'`, default: 'wand' },
      { prop: 'v-model:mode', type: `'add' | 'erase'`, default: 'add' },
      { prop: 'v-model:size', type: 'number', default: '0', notes: 'brush in css px; 0 takes 24, 44 on touch' },
      { prop: 'v-model:tolerance', type: 'number', default: '6', notes: 'wand reach, percent' },
      { prop: 'contiguous / history / label', type: 'boolean / number / string', default: 'true / 50 / image' },
      { prop: 'emits', type: 'edit(mask), ready({width, height}), error(err)' },
      { prop: 'exposed', type: 'toImageData(kind), toBlob(kind, type), mask(), setMask(m), undo(), redo(), clear(), invert()', notes: `kind 'alpha' | 'matte' | 'cutout'` },
    ]"
  />
</template>
