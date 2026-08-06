<script setup lang="ts">
import { ref } from 'vue'
import { HbSlider } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const volume = ref(72)
const gain = ref(28)
const squelch = ref(-62)

const code = `<HbSlider v-model="volume" label="volume" />
<HbSlider v-model="gain" label="rf gain" :min="0" :max="49" unit="dB" />
<HbSlider v-model="squelch" label="hush the static" :min="-90" :max="0"
  :format="(v) => v.toFixed(0)" unit="dB" />`
</script>

<template>
  <DemoSection
    title="Slider row"
    note="Label, track, live value. The default control of every panel. The readout is VT323 pink and never jitters thanks to tabular figures."
    :code="code"
  >
    <div style="max-width: 460px">
      <HbSlider v-model="volume" label="volume" />
      <HbSlider v-model="gain" label="rf gain" :min="0" :max="49" unit="dB" />
      <HbSlider v-model="squelch" label="hush the static" :min="-90" :max="0" unit="dB" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'label', type: 'string', notes: 'required' },
      { prop: 'v-model', type: 'number' },
      { prop: 'min / max / step', type: 'number', default: '0 / 100 / 1' },
      { prop: 'unit', type: 'string', notes: 'appended to the readout' },
      { prop: 'format', type: '(value: number) => string', notes: 'custom readout' },
    ]"
  />
</template>
