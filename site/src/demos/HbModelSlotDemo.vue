<script setup lang="ts">
import { ref } from 'vue'
import { HbModelSlot } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { rackSlots } from '../fixtures/models'

const sample = ref('sample-model')
/** The loading row shows a sample name: a fake load never names a real model. */
const sampleOptions = [{ value: 'sample-model', label: 'sample model', sizeMB: null, sizeSource: 'unknown' as const }]
const ears = ref('whisper-base')
const emb = ref('all-minilm-l6-v2')
const voice = ref('kokoro-82m')
/** The slot key is rack data, not a slot prop. */
const sl = (i: number) => {
  const { slot: _key, ...rest } = rackSlots[i]!
  return rest
}
const code = `<HbModelSlot v-model="pick" label="brain" role="replies and plans" required :options="options" :state="state" :pct="pct" @load="hub.load" />`
</script>

<template>
  <DemoSection
    title="One slot per job"
    note="The mortise organ row: name and role, the model select with each size, a load button that names the size, the meta line, its own bar and a status square. A fault marks this row only."
    :code="code"
  >
    <div style="max-width: 720px; display: flex; flex-direction: column; gap: 8px">
      <HbModelSlot v-model="sample" v-bind="sl(0)" :options="sampleOptions" state="loading" :pct="0.42" />
      <HbModelSlot v-model="emb" v-bind="sl(2)" state="ready" />
      <HbModelSlot v-model="ears" v-bind="sl(3)" state="fault" fault="the session build ran out of memory. unload the voice, or pick a smaller model." />
      <HbModelSlot v-model="voice" v-bind="sl(4)" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'label / role', type: 'string' },
      { prop: 'required', type: 'boolean' },
      { prop: 'options', type: '{value, label, sizeMB, sizeSource, disabled}[]' },
      { prop: 'v-model', type: 'string', notes: 'the record id' },
      { prop: 'state', type: `'empty' | 'loading' | 'ready' | 'fault'` },
      { prop: 'pct', type: 'number | null', notes: '0 to 1; null moves the bar without a number' },
      { prop: 'fault', type: 'string' },
      { prop: 'sharedWith', type: 'string[]', notes: 'used by, once ready' },
      { prop: 'emits', type: 'load(id)' },
    ]"
  />
</template>
