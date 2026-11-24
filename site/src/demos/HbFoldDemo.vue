<script setup lang="ts">
import { ref } from 'vue'
import { HbFold, HbKv, HbSlider } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const open = ref(false)
const ppm = ref(-1)

const code = `<HbFold v-model="open" summary="advanced">
  <HbSlider v-model="ppm" label="ppm correction" :min="-20" :max="20" />
</HbFold>`
const codeNum = `<HbFold :num="1" summary="source" done persist-key="source">...</HbFold>
<HbFold :num="2" summary="bones" empty-hint="load a model first." />`
</script>

<template>
  <DemoSection
    title="Disclosure"
    note="Fiddly controls fold away rather than being deleted. Easy mode is a fold, not a different app."
    :code="code"
  >
    <HbFold v-model="open" summary="advanced">
      <div style="max-width: 380px">
        <HbSlider v-model="ppm" label="ppm correction" :min="-20" :max="20" />
      </div>
      <HbKv label="firmware" value="1.4.2" />
    </HbFold>
    <p style="margin: 8px 0 0">
      open: <span class="hb-readout" style="font-size: 16px">{{ open }}</span>
    </p>
  </DemoSection>

  <DemoSection
    title="Numbered inspector"
    note="A rack of numbered folds that remembers what you closed. done marks a finished section; an empty section names what to do first."
    :code="codeNum"
  >
    <HbFold :num="1" summary="source" done persist-key="site-demo-source">
      <HbKv label="file" value="shiba.vrm" />
    </HbFold>
    <HbFold :num="2" summary="bones" empty-hint="load a model first." persist-key="site-demo-bones" />
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'summary', type: 'string', notes: 'required' },
      { prop: 'v-model', type: 'boolean', notes: 'open state, optional' },
      { prop: 'num', type: 'number', notes: 'shown as [01]' },
      { prop: 'done', type: 'boolean', default: 'false' },
      { prop: 'emptyHint', type: 'string', notes: 'shown instead of the slot while set' },
      { prop: 'persistKey', type: 'string', notes: 'remember open under hb.fold.<key>' },
    ]"
  />
</template>
