<script setup lang="ts">
import { ref } from 'vue'
import { HbBubble, HbSlider, HbStage } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const lines = ['sit.', 'good. now the red ball, the one by the door, not the blue one under the couch. bring it here and drop it at my feet so i can throw it again.']
const i = ref(0)
const show = ref(true)
const speaking = ref(false)
function say() { i.value = (i.value + 1) % lines.length; show.value = true }
const ax = ref(8)
const ay = ref(20)
const clampCode = `<HbBubble clamp :pad="8" :x="headX" :y="headY" :text="reply" />  // vanilla: placeBubble(el, x, y, { pad: 8 })`
const code = `<HbBubble :x="headX" :y="headY" :text="reply" v-model:show="shown" ttl="auto" :hold="speaking" :lines="3" />`
</script>

<template>
  <DemoSection title="Bubble" note="Speech pinned over a point. Clamped at three lines; with ttl auto it stays for reading time, 1.5 s plus 60 ms a character, and holds while the voice speaks." :code="code">
    <HbStage label="room" style="position: relative; height: 220px; overflow: hidden">
      <HbBubble v-model:show="show" :x="140" :y="170" :text="lines[i]" ttl="auto" :hold="speaking" />
      <HbBubble :x="250" :y="80" text="woof." ink />
    </HbStage>
    <div class="demo-row" style="margin-top: 12px">
      <button type="button" class="hb-btn hb-btn-sm" @click="say">next line</button>
      <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" :aria-pressed="speaking" @click="speaking = !speaking">{{ speaking ? 'voice speaking' : 'voice quiet' }}</button>
      <span class="hb-label">{{ show ? 'shown' : 'expired' }}</span>
    </div>
  </DemoSection>
  <DemoSection title="Clamped to the stage" note="clamp keeps the whole bubble inside its stage host: it slides sideways first and the tail keeps pointing at the head, then hangs under the point when the top has no room. Move the anchor to the edges." :code="clampCode">
    <HbStage label="room" style="position: relative; height: 200px; overflow: hidden">
      <HbBubble clamp :x="ax" :y="ay" text="the mug is on the shelf, by the window. i will bring it." />
      <span aria-hidden="true" :style="{ position: 'absolute', left: ax - 3 + 'px', top: ay - 3 + 'px', width: '6px', height: '6px', background: 'var(--hb-pink)' }" />
    </HbStage>
    <div style="margin-top: 12px; max-width: 420px">
      <HbSlider v-model="ax" label="anchor x" :min="0" :max="360" :step="1" unit="px" />
      <HbSlider v-model="ay" label="anchor y" :min="0" :max="200" :step="1" unit="px" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'x / y', type: 'number', notes: 'anchor in px; the bubble sits above' },
      { prop: 'text / ink', type: 'string / boolean' },
      { prop: 'v-model:show', type: 'boolean', default: 'true' },
      { prop: 'lines', type: 'number', default: '3', notes: '0 shows all' },
      { prop: 'ttl', type: `number | 'auto'`, default: '0', notes: 'emits expire' },
      { prop: 'hold', type: 'boolean' },
      { prop: 'clamp / pad', type: 'boolean / number', default: 'false / 8', notes: 'stay inside the positioned parent' },
    ]"
  />
</template>
