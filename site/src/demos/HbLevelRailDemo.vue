<script setup lang="ts">
import { computed, ref } from 'vue'
import { HbLevelRail, HbParamRow } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { duration, env, noiseDb, open, segments } from '../fixtures/transcript'

// The gate margin slider moves the threshold line and the kept mask, as
// regate does in the transcribe package; here the mask is recomputed
// from the fixture levels.
const playhead = ref(5.2)
const margin = ref(12)
const thr = computed(() => noiseDb + margin.value)
const kept = computed(() => Array.from(env, (d, i) => (open[i] && d > thr.value ? 1 : 0)))
const code = `<HbLevelRail :env="rail.db" :vad="rail.open" :noise-db="rail.noiseDb" :thr-db="rail.thrDb"
  :segments="segments" :playhead="time" :duration="rail.duration" @seek="time = $event" />`
</script>

<template>
  <DemoSection title="Level rail" note="Bars slime where the gate kept speech, grey where silence was cut. The noise floor is dashed amber and the gate dotted red, in the scale of the bars, and the legend reads both as numbers. Kept segments sit under the rail, the one playing lit. Click, drag or arrow keys seek." :code="code">
    <div class="demo-col">
      <HbLevelRail :env="env" :vad="kept" :noise-db="noiseDb" :thr-db="thr" :segments="segments" :playhead="playhead" :duration="duration" @seek="playhead = $event" />
      <HbParamRow v-model="margin" label="gate margin" :min="0" :max="24" :step="1" unit="dB" />
      <HbLevelRail :env="env" :vad="[[0.6, 3.4], [4.2, 8.1]]" :duration="duration" :ticks="6" label="regions in seconds" :seekable="false" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'env', type: 'ArrayLike<number>', notes: 'dBFS per frame, the rail db' },
      { prop: 'vad', type: 'per frame mask | [start, end][] seconds', default: 'null' },
      { prop: 'noiseDb / thrDb', type: 'number | null', default: 'null' },
      { prop: 'segments', type: '{start, end}[]', default: '[]' },
      { prop: 'playhead', type: 'number | null', default: 'null', notes: 'seconds' },
      { prop: 'duration', type: 'number', notes: 'seconds' },
      { prop: 'bins / ticks', type: 'number', default: '240 / 10' },
      { prop: 'label', type: 'string', default: 'level rail' },
      { prop: 'seekable', type: 'boolean', default: 'true' },
      { prop: 'default slot', type: 'legend extras', notes: 'a dropped count' },
      { prop: '@seek', type: '(seconds: number)' },
    ]"
  />
</template>
