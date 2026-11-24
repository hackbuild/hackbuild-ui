<script setup lang="ts">
import { ref } from 'vue'
import { HbCapabilities, type HbCap, type HbCapVerb } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { machine } from '../fixtures/models'

const caps = ref<HbCap[]>([
  { id: 'gpuchat', name: 'webgpu chat', icon: 'brain', state: 'on', speed: 'fast', current: true, stored: true, unload: true, needs: ['webgpu'], size: '1.7 GB', sizeSource: 'measured', licence: 'Llama 3.2 Community License', commercial: true },
  { id: 'cpuchat', name: 'cpu chat', icon: 'brain', state: 'off', speed: 'slow', stored: true, size: '370 MB', sizeSource: 'measured', without: 'the webgpu chat answers instead.' },
  { id: 'mic', name: 'microphone', icon: 'microphone', state: 'off', speed: 'fast', needs: ['microphone'], action: 'allow the microphone', ask: 'the browser asks once. nothing is recorded or sent.', without: 'type instead.' },
  { id: 'kokoro', name: 'kokoro voice', icon: 'comment', state: 'loading', speed: 'ok', loaded: 120 * 1024 * 1024, total: 330 * 1024 * 1024, size: '330 MB', sizeSource: 'inferred' },
  { id: 'imagegen', name: 'image generation', icon: 'image', state: 'unavailable', speed: 'none', needs: [{ kind: 'webgpu', label: 'shader-f16', missing: true }], size: '2.6 GB', sizeSource: 'vendor', reason: 'this gpu has no shader-f16.', without: 'every other tool works.' },
])
function act(id: string, verb: HbCapVerb) {
  caps.value = caps.value.map((c) => {
    if (c.id !== id) return c
    if (verb === 'enable' || verb === 'retry') return { ...c, state: 'on' }
    if (verb === 'disable' || verb === 'cancel') return { ...c, state: 'off' }
    if (verb === 'unload') return { ...c, state: 'off', stored: true }
    return c
  })
}
const code = `<HbCapabilities :caps="caps" machine="webgpu, apple metal-3, shader-f16" @act="(id, verb) => ..." />`
</script>

<template>
  <DemoSection
    title="What this machine can turn on"
    note="The machine in one line from the probe, then one row per thing: state, a speed chip, current and stored marks, what still works without it, and the action. A row on with a model also offers unload: memory freed, weights kept."
    :code="code"
  >
    <div style="max-width: 600px">
      <HbCapabilities :caps="caps" :machine="machine" @act="act" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'machine', type: 'string', notes: 'the probe in one line' },
      { prop: 'caps[].speed', type: `'fast' | 'ok' | 'slow' | 'none'` },
      { prop: 'caps[].current / stored', type: 'boolean' },
      { prop: 'caps[].without', type: 'string', notes: 'what still works without it' },
      { prop: 'caps[].unload', type: 'boolean', notes: 'second button while on; emits act(id, unload)' },
    ]"
  />
</template>
