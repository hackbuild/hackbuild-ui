<script setup lang="ts">
import { ref } from 'vue'
import { HbBubble, HbStage } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const lines = ['sit.', 'good. now the red ball, the one by the door, not the blue one under the couch. bring it here and drop it at my feet so i can throw it again.']
const i = ref(0)
const show = ref(true)
const speaking = ref(false)
function say() { i.value = (i.value + 1) % lines.length; show.value = true }
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
  <PropsTable
    :rows="[
      { prop: 'x / y', type: 'number', notes: 'anchor in px; the bubble sits above' },
      { prop: 'text / ink', type: 'string / boolean' },
      { prop: 'v-model:show', type: 'boolean', default: 'true' },
      { prop: 'lines', type: 'number', default: '3', notes: '0 shows all' },
      { prop: 'ttl', type: `number | 'auto'`, default: '0', notes: 'emits expire' },
      { prop: 'hold', type: 'boolean' },
    ]"
  />
</template>
