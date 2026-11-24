<script setup lang="ts">
import { ref } from 'vue'
import { HbArtboard, HbPromptCanvas, HbSeg, HbSlider, HbTag, HbViewport, type ArtLayer, type ArtStroke, type ArtTool, type ArtTransform, type SegPrompt, type PromptTool } from '@hackbuild/ui'
import { applyStroke } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { sceneUrl, SCENE_W, SCENE_H } from '../fixtures/vision'

// A relief face: the photo layer takes the erase brush, the ring is art.
// The mask lives in a canvas per layer, in layer pixels; no model runs.
const ringUrl = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a1a" stroke-width="12"/><rect x="44" y="4" width="12" height="20" fill="#FE0386"/></svg>')}`

const layers = ref<ArtLayer[]>([
  { id: 'photo', kind: 'image', src: sceneUrl, w: SCENE_W, h: SCENE_H, label: 'photo relief', transform: { x: 200, y: 180, scale: 0.5, rot: 0 } },
  { id: 'ring', kind: 'image', src: ringUrl, w: 100, h: 100, label: 'ring mark', transform: { x: 330, y: 120, scale: 1, rot: -12 } },
])
const selected = ref<string | number | null>('photo')
const tool = ref<ArtTool>('move')
const brush = ref(18)
const last = ref('')

function onTransform(id: string | number, t: ArtTransform, done: boolean) {
  layers.value = layers.value.map((L) => (L.id === id ? { ...L, transform: t } : L))
  if (done) last.value = `${id} at ${Math.round(t.x)}, ${Math.round(t.y)}, x${t.scale.toFixed(2)}, ${Math.round(t.rot)} deg`
}

const masks = new Map<string | number, HTMLCanvasElement>()
function onStroke(s: ArtStroke) {
  const L = layers.value.find((q) => q.id === s.id)
  if (!L) return
  let c = masks.get(s.id)
  if (!c) { c = document.createElement('canvas'); c.width = 512; c.height = Math.round((512 * L.h) / L.w); masks.set(s.id, c) }
  const ctx = c.getContext('2d')
  if (!ctx) return
  applyStroke(ctx, s, c.width / L.w)
  layers.value = layers.value.map((q) => (q.id === s.id ? { ...q, mask: c!.toDataURL('image/png') } : q))
  last.value = `${s.tool} stroke, ${s.points.length} points`
}
function onRemove(id: string | number) { layers.value = layers.value.filter((L) => L.id !== id); selected.value = null }

// The prompt canvas on a board: the left press places prompts, the
// board pans with a middle or right drag, space, two fingers or keys.
const prompts = ref<SegPrompt[]>([{ kind: 'point', x: 140, y: 240, positive: true }])
const ptool = ref<PromptTool>('positive')

const code = `<HbArtboard :width="400" :height="320" :layers="layers" v-model:selected="sel"
  v-model:tool="tool" :brush="{ size: 18 }" caption="front  preview"
  @transform="(id, t, done) => place(id, t)" @stroke="(s) => applyStroke(mask(s.id), s, k)" />

<HbViewport aspect="4/3">
  <HbArtboard fill :width="w" :height="h">
    <HbPromptCanvas bare :image="url" :width="w" :height="h" v-model:prompts="prompts" />
  </HbArtboard>
  <template #tl><HbTag>prompts</HbTag></template>
</HbViewport>`
</script>

<template>
  <DemoSection title="Artboard" note="Wheel zooms at the cursor, a drag on the empty board pans, two fingers pinch. Drag a layer to move it (snaps to the centre, alt off), corners scale, the dot rotates (shift snaps 15). Erase and restore paint a mask in the layer's own pixels, so it follows the layer. Keys on the focused board: + - 0 1, arrows, [ ] pick, v e r tool, esc drops the brush." :code="code">
    <div class="demo-pair">
      <HbArtboard
        v-model:selected="selected"
        v-model:tool="tool"
        :width="400"
        :height="320"
        :layers="layers"
        :brush="{ size: brush }"
        caption="front  preview"
        label="front face"
        @transform="onTransform"
        @stroke="onStroke"
        @remove="onRemove"
      />
      <div class="demo-col">
        <HbSeg v-model="tool" :options="[{ label: 'move', value: 'move' }, { label: 'erase', value: 'erase' }, { label: 'restore', value: 'restore' }]" />
        <HbSlider v-model="brush" label="brush" :min="4" :max="60" unit="px" />
        <p class="hb-hint">{{ last || 'select the photo, then erase' }}</p>
      </div>
    </div>
  </DemoSection>
  <DemoSection title="Prompt canvas on a board" note="HbPromptCanvas with bare sits in the board slot inside HbViewport. A press places prompts in image pixels at any zoom; pan with a middle or right drag, space drag, two fingers or arrows.">
    <div class="demo-col">
      <HbSeg v-model="ptool" :options="[{ label: 'keep', value: 'positive' }, { label: 'leave out', value: 'negative' }, { label: 'box', value: 'box' }]" />
      <HbViewport aspect="4/3" label="desk photo">
        <HbArtboard fill :width="SCENE_W" :height="SCENE_H" label="desk photo board">
          <HbPromptCanvas v-model:prompts="prompts" v-model:tool="ptool" bare :image="sceneUrl" :width="SCENE_W" :height="SCENE_H" label="desk photo" />
        </HbArtboard>
        <template #tl><HbTag>{{ prompts.length }} prompts</HbTag></template>
      </HbViewport>
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'width / height', type: 'number', notes: 'board size in board pixels' },
      { prop: 'image', type: 'string', notes: 'drawn under the layers, filling the board' },
      { prop: 'layers', type: 'ArtLayer[]', notes: '{id, kind image or slot, src, w, h, transform {x, y, scale, rot}, mask, label, hidden, locked}' },
      { prop: 'v-model:selected / tool / view', type: `id | null / 'move' | 'erase' | 'restore' / {zoom, x, y}` },
      { prop: 'brush', type: '{size}', default: '{size: 16}', notes: 'board pixels' },
      { prop: 'caption / label / readonly / fill', type: 'string / string / boolean / boolean' },
      { prop: 'minZoom / maxZoom / pad', type: 'number', default: '0.25 / 16 / 16' },
      { prop: 'slots', type: 'default {scale}, layer {layer}, overlay {scale, zoom}' },
      { prop: 'emits', type: 'transform(id, t, done), stroke(s), remove(id)' },
    ]"
  />
</template>
