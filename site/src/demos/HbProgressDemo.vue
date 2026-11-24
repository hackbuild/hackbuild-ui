<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { HbProgress, type HbLoadPhase, type HbProgressFile } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const MB = 1024 * 1024
const make = (): HbProgressFile[] => [
  { name: 'params_shard_0.bin', loaded: 0, total: 32 * MB },
  { name: 'params_shard_1.bin', loaded: 0, total: 32 * MB },
  { name: 'params_shard_2.bin', loaded: 0, total: 32 * MB },
  { name: 'tokenizer.json', loaded: 0, total: 2.1 * MB },
  { name: 'model.wasm', loaded: 0, total: 4.6 * MB },
]
const files = ref(make())
const phase = ref<HbLoadPhase>('download')
let t = 0
function tick() {
  if (phase.value === 'download') {
    const f = files.value.find((x) => x.total !== null && x.loaded < x.total)
    if (f) f.loaded = Math.min(f.total!, f.loaded + 3 * MB)
    else phase.value = 'compile'
  } else if (phase.value === 'compile') phase.value = 'warm'
  else if (phase.value === 'warm') phase.value = 'ready'
  else { files.value = make(); phase.value = 'download' }
}
onMounted(() => { t = window.setInterval(tick, 400) })
onBeforeUnmount(() => clearInterval(t))
const unknown: HbProgressFile[] = [
  { name: 'unet/model.onnx', loaded: 412 * MB, total: 1700 * MB },
  { name: 'text_encoder/model.onnx', loaded: 96 * MB, total: null },
]
const code = `<HbProgress :files="files" :phase="phase" state="running" @cancel="store.cancel(id)" />`
</script>

<template>
  <DemoSection
    title="Summed bar, named phases, file rows"
    note="One bar over every file. The words name the phase: downloading with files and bytes, compiling, warming up. The percent shows only once every file states its total; compile and warm move the bar without a number. The file rows fold under the bar."
    :code="code"
  >
    <div style="max-width: 520px; display: flex; flex-direction: column; gap: 16px">
      <HbProgress :files="files" :phase="phase" :state="phase === 'ready' ? 'done' : 'running'" label="hermes 3 3b" />
      <HbProgress :files="unknown" phase="download" state="running" quiet label="sd-turbo" />
      <HbProgress phase="cache" :loaded="140 * MB" :total="370 * MB" state="running" :actions="false" />
      <HbProgress state="failed" error="the network dropped at 41 percent." />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'phase', type: `'fetch' | 'download' | 'cache' | 'compile' | 'warm' | 'ready' | 'error'`, notes: 'null keeps the plain byte line' },
      { prop: 'files', type: '{name, loaded, total}[]', notes: 'summed; total known only when every file states one' },
      { prop: 'loaded / total', type: 'number / number | null' },
      { prop: 'state', type: `'idle' | 'running' | 'paused' | 'done' | 'failed'` },
      { prop: 'quiet', type: 'boolean', notes: 'a second download: paper fill' },
      { prop: 'actions', type: 'boolean', default: 'true', notes: 'cancel, resume' },
    ]"
  />
</template>
