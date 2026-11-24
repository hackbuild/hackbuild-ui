<script setup lang="ts">
import { ref, watch } from 'vue'
import { HbImageSlot, type HbImageValue } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

// A fixture sample drawn as svg, and a stub detector: no model runs here.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#f5f0e6"/><rect x="30" y="22" width="60" height="70" fill="#1a1a1a"/><rect x="42" y="44" width="10" height="8" fill="#f5f0e6"/><rect x="68" y="44" width="10" height="8" fill="#f5f0e6"/><rect x="48" y="70" width="24" height="5" fill="#FE0386"/></svg>`
const sample = { url: `data:image/svg+xml,${encodeURIComponent(svg)}`, name: 'sample face.svg' }
const source = ref<HbImageValue | null>({ ...sample, from: 'sample' })
const target = ref<HbImageValue | null>(null)
const info = ref('face detected')
watch(source, (v) => { info.value = v ? 'detecting face...' : ''; if (v) setTimeout(() => { info.value = v.from === 'sample' ? 'face detected' : 'no face found' }, 600) })
const code = `<HbImageSlot v-model="source" label="1. source face" :sources="['upload', 'camera', 'paste', 'sample']"
  :sample="sample" :info="detector.line" :info-tone="detector.found ? 'ok' : 'warn'" />`
</script>

<template>
  <DemoSection title="Image slot" note="One image input. Upload, camera then capture, paste and a sample; drop and ctrl v land on the whole slot. The line under it names what the tool found, or what failed and the way around." :code="code">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; max-width: 720px">
      <HbImageSlot v-model="source" label="1. source face" :sources="['upload', 'camera', 'paste', 'sample']" :sample="sample" :info="info" :info-tone="info === 'face detected' ? 'ok' : info === 'no face found' ? 'warn' : ''" />
      <HbImageSlot v-model="target" label="2. target image" ratio="16/9" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'v-model', type: '{url, name, from, blob?} | null', notes: 'from: upload | camera | paste | sample | drop' },
      { prop: 'label / accept', type: 'string', default: `accept 'image/*'` },
      { prop: 'sources', type: `('upload' | 'camera' | 'paste' | 'sample')[]`, default: 'upload, camera, paste' },
      { prop: 'sample', type: '{url, name} | null' },
      { prop: 'info / infoTone', type: `string / '' | 'ok' | 'warn' | 'err'` },
      { prop: 'facingMode / disabled', type: `'user' | 'environment' / boolean` },
      { prop: 'ratio', type: `'1/1' | '4/3' | '16/9' | 'w/h' | 'auto'`, default: `'1/1'`, notes: 'auto follows the picture, 4/3 while empty' },
      { prop: 'emits', type: 'rejected' },
    ]"
  />
</template>
