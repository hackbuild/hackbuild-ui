<script setup lang="ts">
import { ref } from 'vue'
import { HbWaveDrawer, type HbWaveSel } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

// a made up clip: three bursts of a tone under a little noise
const rate = 8000
const dur = 6
const samples = new Float32Array(rate * dur)
for (let i = 0; i < samples.length; i++) {
  const t = i / rate
  const env = Math.max(0, Math.sin(Math.PI * ((t % 2) / 1.4))) * (t % 2 < 1.4 ? 1 : 0)
  samples[i] = env * 0.8 * Math.sin(2 * Math.PI * 220 * t) + (Math.sin(i * 12.9898) * 43758.5453 % 1) * 0.04
}
const at = ref(1.2)
const sel = ref<HbWaveSel | null>({ start: 2, end: 3.1 })
const code = `<HbWaveDrawer :samples="samples" :duration="6" v-model:at="at" v-model:sel="sel" />`
</script>

<template>
  <DemoSection title="Waveform drawer" note="A strip for audio examples. Press to seek, drag to pick a span; arrows move the playhead, shift arrows grow the span, Escape drops it. The head folds the strip away. At the foot of a layout subject it sits over the subject." :code="code">
    <HbWaveDrawer v-model:at="at" v-model:sel="sel" :samples="samples" :duration="dur" label="clip" />
    <p class="hb-fixture"><b>fixture</b> the clip is a generated tone, not a recording.</p>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'samples', type: 'ArrayLike<number> | null', notes: '-1 to 1' },
      { prop: 'duration', type: 'number', notes: 'seconds' },
      { prop: 'v-model:at', type: 'number', notes: 'playhead, seconds' },
      { prop: 'v-model:sel', type: '{ start, end } | null' },
      { prop: 'v-model:open', type: 'boolean', default: 'true' },
      { prop: 'label', type: 'string', default: `'waveform'` },
    ]"
  />
</template>
