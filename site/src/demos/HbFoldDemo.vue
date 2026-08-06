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

  <PropsTable
    :rows="[
      { prop: 'summary', type: 'string', notes: 'required' },
      { prop: 'v-model', type: 'boolean', notes: 'open state, optional' },
    ]"
  />
</template>
