<script setup lang="ts">
import { HbStatusLine } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbStatusLine kind="err" text="webgpu is off in this browser, running on wasm." />`
</script>

<template>
  <DemoSection title="Status line" note="One lowercase sentence about what the tool is doing. Name the failure when there is one." :code="code">
    <div class="demo-col">
      <HbStatusLine text="idle." />
      <HbStatusLine kind="busy" text="slicing 3 parts." />
      <HbStatusLine kind="ok" text="exported case.3mf, 3 slots." />
      <HbStatusLine kind="info" text="drag art onto the lid to inlay it." />
      <HbStatusLine kind="warn" text="lid lip overhangs 62 degrees." />
      <HbStatusLine kind="err" text="webgpu is off in this browser, running on wasm." />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'text', type: 'string' },
      { prop: 'kind', type: `'none' | 'ok' | 'warn' | 'err' | 'info' | 'busy'`, default: 'none' },
    ]"
  />
</template>
