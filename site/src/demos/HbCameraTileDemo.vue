<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { HbButton, HbCameraTile } from '@hackbuild/ui'
import { cameraFault, closeCamera, openCamera } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const stream = ref<MediaStream | null>(null)
const denied = ref(false)
const note = ref('')
async function start() {
  try { stream.value = await openCamera(); denied.value = false; note.value = '' }
  catch (e) { const f = cameraFault(e); denied.value = f.kind === 'denied'; note.value = f.text }
}
function stop() { closeCamera(stream.value); stream.value = null }
onBeforeUnmount(stop)
const code = `<HbCameraTile :stream="stream" :denied="denied" rec
  :tags="{ tl: '00:12', bl: 'ghost + ghost face', br: { text: 'mp ready', tone: 'ok' } }" />`
</script>

<template>
  <DemoSection title="Camera tile" note="The feed on the void with a tag in each corner: timer, record, effect, model state. Denied keeps the box and says what it needs. The default slot lays a canvas over the video for a filtered feed." :code="code">
    <div class="demo-col" style="max-width: 640px">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px">
        <HbCameraTile :stream="stream" :denied="denied" :rec="!!stream" :tags="{ tl: stream ? '00:12' : '', bl: 'ghost + ghost face', br: { text: stream ? 'mp ready' : 'mp loading...', tone: stream ? 'ok' : 'dim' } }" />
        <HbCameraTile denied :tags="{ bl: 'ghost + ghost face', br: 'mp off' }" />
      </div>
      <div class="hb-acts">
        <HbButton size="sm" @click="stream ? stop() : start()">{{ stream ? 'stop camera' : 'start camera' }}</HbButton>
      </div>
      <p v-if="note" class="hb-hint">{{ note }}</p>
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'stream', type: 'MediaStream | null' },
      { prop: 'tags', type: '{tl, tr, bl, br}: string | {text, tone: ok | warn | rec | dim}' },
      { prop: 'denied / deniedText / offText', type: 'boolean / string / string' },
      { prop: 'mirror / rec / label', type: 'boolean / boolean / string', default: 'mirror true' },
      { prop: 'slots', type: 'default (canvas over the video), denied' },
    ]"
  />
</template>
