<script setup lang="ts">
import { computed, ref } from 'vue'
import { HbPromptCanvas, HbInstanceList, type HbInstanceItem, type SegPrompt, type PromptTool } from '@hackbuild/ui'
import { instanceColour } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { sceneUrl, maskUrl, decodeAt, SCENE_W, SCENE_H } from '../fixtures/vision'

// A stub decoder finds the drawn object under each prompt: no model runs.
const prompts = ref<SegPrompt[]>([
  { kind: 'point', x: 140, y: 240, positive: true },
  { kind: 'box', x0: 250, y0: 120, x1: 440, y1: 318, positive: true },
])
const tool = ref<PromptTool>('positive')
const hidden = ref<Record<string, boolean>>({})
const selected = ref<string | number | null>(null)
const hoverKey = ref<string | null>(null)

const centre = (p: SegPrompt) => (p.kind === 'point' ? p : { x: (p.x0 + p.x1) / 2, y: (p.y0 + p.y1) / 2 })
const found = computed(() => {
  const keep: { key: string; label: string; score: number }[] = []
  for (const p of prompts.value) {
    const c = centre(p)
    const d = decodeAt(c.x, c.y)
    if (!d) continue
    const at = keep.findIndex((k) => k.key === d.key)
    if (p.positive && at < 0) keep.push(d)
    if (!p.positive && at >= 0) keep.splice(at, 1)
  }
  return keep
})
const items = computed<HbInstanceItem[]>(() => found.value.map((d, i) => ({ id: d.key, label: d.label, colour: instanceColour(i), score: d.score, hidden: !!hidden.value[d.key] })))
const masks = computed(() => items.value.map((it) => ({ id: it.id, colour: it.colour, src: maskUrl(String(it.id)), hidden: it.hidden })))
const preview = computed(() => (hoverKey.value && !found.value.some((f) => f.key === hoverKey.value) ? maskUrl(hoverKey.value) : null))
const last = ref('')

function onHover(at: { x: number; y: number } | null) {
  hoverKey.value = at && tool.value !== 'negative' ? decodeAt(at.x, at.y)?.key ?? null : null
}
function onCommit(p: SegPrompt[]) { last.value = `${p.length} prompts sent to the decoder` }
function remove(it: HbInstanceItem) {
  prompts.value = prompts.value.filter((p) => { const c = centre(p); return decodeAt(c.x, c.y)?.key !== it.id })
}
function merge() { last.value = `merged ${items.value.length} masks into one` }

const code = `<HbPromptCanvas :image="url" :width="w" :height="h" v-model:prompts="prompts" v-model:tool="tool"
  :masks="masks" :preview="hoverMask" :preview-colour="instanceColour(masks.length)"
  @hover="decodeHover" @commit="decode" />
<HbInstanceList :items="instances" v-model:selected="picked"
  @toggle="hide" @remove="drop" @merge="mergeAll" @clear="clearAll" />`
</script>

<template>
  <DemoSection title="Prompt canvas and instances" note="Hover previews the mask under the cursor; a press keeps a point, n or a right press leaves one out, b drags a box. On touch a tap places and handles grow to 44 px. Keys: p n b pick the tool, arrows move a cursor, enter places; on a handle arrows move it, enter flips it, delete removes it. Prompts are in image pixels." :code="code">
    <div class="demo-pair">
      <HbPromptCanvas
        v-model:prompts="prompts"
        v-model:tool="tool"
        :image="sceneUrl"
        :width="SCENE_W"
        :height="SCENE_H"
        :masks="masks"
        :preview="preview"
        :preview-colour="instanceColour(items.length)"
        label="desk photo"
        @hover="onHover"
        @commit="onCommit"
      />
      <div class="demo-col">
        <HbInstanceList v-model:selected="selected" :items="items" @toggle="hidden = { ...hidden, [String($event.id)]: !$event.hidden }" @remove="remove" @merge="merge" @clear="prompts = []" />
        <p class="hb-hint">{{ last || 'decoder idle' }}</p>
      </div>
    </div>
  </DemoSection>
  <DemoSection title="Read only" note="Shows the prompts a run used; places none.">
    <div style="max-width: 360px">
      <HbPromptCanvas :prompts="prompts" :image="sceneUrl" :width="SCENE_W" :height="SCENE_H" :masks="masks" readonly label="last run" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'image / width / height', type: 'string / number', notes: 'size read from the image when left out' },
      { prop: 'v-model:prompts', type: 'SegPrompt[]', notes: 'points and boxes in image pixels, positive or not' },
      { prop: 'v-model:tool', type: `'positive' | 'negative' | 'box'` },
      { prop: 'masks', type: '{id, colour, src, hidden?}[]', notes: 'src is an alpha mask url' },
      { prop: 'preview / previewColour', type: 'string | null / string' },
      { prop: 'readonly / label / throttle', type: 'boolean / string / number', default: 'false / image / 50' },
      { prop: 'emits', type: 'hover, commit, box' },
    ]"
  />
</template>
