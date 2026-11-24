<script setup lang="ts">
import { computed, ref } from 'vue'
import { HbWave } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

// A fixed envelope: speech bursts over a noise floor.
const env = Array.from({ length: 120 }, (_, i) => {
  const burst = (i > 12 && i < 40) || (i > 58 && i < 90) || (i > 100 && i < 112)
  return burst ? 0.35 + 0.5 * Math.abs(Math.sin(i * 0.7)) : 0.06 + 0.05 * Math.abs(Math.sin(i * 2.3))
})
const gate = ref(0.3)
const kept = computed(() => env.map((v) => v >= gate.value))
const at = ref(0.25)
const wave = Array.from({ length: 160 }, (_, i) => Math.sin(i / 3) * Math.exp(-(((i - 80) / 50) ** 2)))
const code = `<HbWave bars :samples="env" :kept="vad" :floor="0.12" :gate="0.3" :ticks="10"
  :at="at" seekable @seek="at = $event" label="level" value="-18 dB" />`
</script>

<template>
  <DemoSection title="Wave and level rail" note="A waveform, or with bars a level history. The rail base: bars slime where speech was kept and grey where silence was cut, a dashed amber noise floor, a dotted red gate, time ticks. Seekable takes a click, a drag, or arrow keys (shift for 10 percent)." :code="code">
    <div class="demo-col" style="max-width: 640px">
      <HbWave bars :samples="env" :kept="kept" :floor="0.12" :gate="gate" :ticks="10" :at="at" seekable label="level" :value="`gate ${gate.toFixed(2)}`" @seek="at = $event" />
      <div class="demo-row">
        <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="gate = Math.max(0.05, gate - 0.05)">gate down</button>
        <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="gate = Math.min(0.9, gate + 0.05)">gate up</button>
      </div>
      <HbWave :samples="wave" label="voice" value="-12 dB" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'samples', type: 'number[] | Float32Array' },
      { prop: 'bars', type: 'boolean' },
      { prop: 'kept', type: 'boolean[]', notes: 'per sample, kept slime, cut grey' },
      { prop: 'floor / gate', type: 'number | null', notes: '0 to 1 of bar height, bars only' },
      { prop: 'ticks', type: 'number', default: '0' },
      { prop: 'at + seekable', type: 'number / boolean', notes: 'emits seek(0 to 1)' },
      { prop: 'label / value / off', type: 'string / string / boolean' },
    ]"
  />
</template>
