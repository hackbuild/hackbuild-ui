<script setup lang="ts">
import { ref } from 'vue'
import { HbCustomModelForm, type CustomCheck, type CustomMode, type CustomValues, type HbCustomEntry } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const mode = ref<CustomMode>('mlc')
const values = ref<CustomValues>({ lib: 'base', f16: true, url: 'https://huggingface.co/someone/Llama-3.1-8B-abliterated-q4f16_1-MLC' })
const check = ref<CustomCheck | null>(null)
const saved = ref<HbCustomEntry[]>([
  { id: 'onnx-community/gemma-3-270m-it-ONNX', mode: 'onnx', source: 'onnx-community/gemma-3-270m-it-ONNX' },
])
const bases = [
  { id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC', label: 'llama 3.1 8b instruct' },
  { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', label: 'llama 3.2 3b instruct' },
  { id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC', label: 'qwen2.5 3b instruct' },
]
function onCheck(m: CustomMode, v: CustomValues) {
  check.value = { state: 'checking' }
  window.setTimeout(() => {
    check.value = String(v.repo ?? v.url).includes('typo')
      ? { state: 'fail', lines: ['repo not found (404). check the id.'] }
      : { state: 'ok', sizeMB: m === 'mlc' ? 4612 : 552, lines: ['mlc-chat-config.json', 'params_shard_0.bin to params_shard_107.bin', 'tokenizer.json'] }
  }, 600)
}
function onAdd(e: HbCustomEntry) {
  saved.value = [e, ...saved.value]
  values.value = { lib: 'base', f16: true }
  check.value = null
}

const code = `<HbCustomModelForm v-model="values" v-model:mode="mode" :bases="webllmBases" runtime="0.2.84"
  :check="check" :saved="custom" @check="checkRepo" @add="addCustom" @remove="removeCustom" @pick="pick" />`
</script>

<template>
  <DemoSection
    title="Custom model"
    note="Four ways in. Every way a custom build fails is named beside the field that causes it. Check costs one request and no download; put typo in the url to see a failure. Added entries are chips pinned above the catalogue; press one to pick it."
    :code="code"
  >
    <div style="max-width: 720px">
      <HbCustomModelForm
        v-model="values"
        v-model:mode="mode"
        :bases="bases"
        runtime="0.2.84"
        :check="check"
        :saved="saved"
        @check="onCheck"
        @add="onAdd"
        @remove="(id) => (saved = saved.filter((s) => s.id !== id))"
      />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'v-model / v-model:mode', type: 'CustomValues / onnx | mlc | gguf | endpoint' },
      { prop: 'modes', type: 'CustomMode[]', notes: 'order and subset' },
      { prop: 'bases / runtime', type: '{id, label}[] / string', notes: 'mlc .wasm reuse' },
      { prop: 'check', type: '{state, lines, sizeMB}', notes: 'idle, checking, ok, fail' },
      { prop: 'saved', type: '{id, mode, source}[]' },
      { prop: 'emits', type: 'check, add, pick, remove' },
    ]"
  />
</template>
