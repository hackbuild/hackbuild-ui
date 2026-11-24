<script setup lang="ts">
import { ref } from 'vue'
import { HbLoader, type HbProgressState } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const url = ref('https://huggingface.co/onnx-community/depth-anything-v2-small')
const state = ref<HbProgressState>('idle')
const loaded = ref(0)
let t = 0
function load() {
  state.value = 'running'
  loaded.value = 0
  clearInterval(t)
  t = window.setInterval(() => {
    loaded.value += 6 * 1024 * 1024
    if (loaded.value >= 100 * 1024 * 1024) { clearInterval(t); state.value = 'done' }
  }, 200)
}
function cancel() { clearInterval(t); state.value = 'paused' }
const code = `<HbLoader v-model:url="url" title="depth model" :size-m-b="100" size-source="inferred" licence="Apache-2.0" />`
</script>

<template>
  <DemoSection
    title="Load panel"
    note="The load button names the size. The licence is one quiet line, optional, never a gate."
    :code="code"
  >
    <div style="max-width: 520px">
      <HbLoader
        v-model:url="url"
        title="depth anything v2 small"
        :size-m-b="100"
        size-source="inferred"
        licence="Apache-2.0"
        :commercial="true"
        drop-hint=""
        :loaded="loaded"
        :total="100 * 1024 * 1024"
        :state="state"
        @load="load"
        @cancel="cancel"
        @resume="load"
      />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'sizeMB / sizeSource', type: 'number | null / measured, vendor, inferred, unknown' },
      { prop: 'licence', type: 'string', notes: 'optional, a quiet line' },
      { prop: 'commercial', type: `boolean | 'unknown' | null` },
      { prop: 'loadLabel', type: 'string', default: `'load'`, notes: 'the size is added' },
    ]"
  />
</template>
