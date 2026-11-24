<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { HbMicButton, type MicState } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

// A stub: no recognition runs here. Start walks asking, listening,
// hearing with a fake level; stop ends it.
const state = ref<MicState>('off')
const level = ref(0)
let t: ReturnType<typeof setInterval> | undefined
let s: ReturnType<typeof setTimeout> | undefined
function start() {
  state.value = 'asking'
  s = setTimeout(() => {
    state.value = 'hearing'
    t = setInterval(() => { level.value = Math.abs(Math.sin(Date.now() / 180)) * 0.9 }, 60)
  }, 500)
}
function stop() { clearTimeout(s); clearInterval(t); level.value = 0; state.value = 'off' }
onBeforeUnmount(stop)
const held = ref<MicState>('off')
const code = `<HbMicButton listen :speaking="voiceSpeaking" @interim="draft = $event" @final="send" />
<HbMicButton v-model:state="state" :level="level" hold @start="open" @stop="close" />
<HbMicButton state="blocked" />`
</script>

<template>
  <DemoSection title="Mic button" note="Pink while it takes input, the level along the foot. Push to talk holds the pointer, Space or Enter. With listen on it runs the browser's recognition, sends interim words, and drops results while the voice speaks. Blocked and unsupported name the way around." :code="code">
    <div class="demo-col">
      <div class="demo-row"><HbMicButton v-model:state="state" :level="level" @start="start" @stop="stop" /></div>
      <div class="demo-row"><HbMicButton v-model:state="held" hold @start="held = 'listening'" @stop="held = 'off'" /></div>
      <div class="demo-row"><HbMicButton state="listening" :note="false" /><HbMicButton state="asking" :note="false" /></div>
      <HbMicButton state="blocked" />
      <HbMicButton state="unsupported" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'v-model:state', type: 'off | asking | listening | hearing | blocked | unsupported' },
      { prop: 'level', type: 'number', notes: '0 to 1' },
      { prop: 'hold', type: 'boolean', notes: 'push to talk' },
      { prop: 'listen', type: 'boolean', notes: 'run recognition here' },
      { prop: 'speaking / tailMs', type: 'boolean / number', default: 'false / 400' },
      { prop: 'note', type: 'boolean', default: 'true' },
      { prop: 'emits', type: 'start, stop, interim, final' },
    ]"
  />
</template>
