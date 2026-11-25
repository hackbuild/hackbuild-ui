<script setup lang="ts">
import { HbGauges, type HbGaugeRow } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const rows: HbGaugeRow[] = [
  { label: 'hunger', value: 0.42 },
  { label: 'play', value: 0.81, current: true },
  { label: 'fatigue', value: 0.18 },
  { label: 'fear', value: 0.05 },
]
const code = `<HbGauges :rows="rows" label="drives" />`
// hackle's associations: cue by action, a pink fill by weight
const cues = ['ball', 'treat', 'g:wave']
const acts = ['fetc', 'sit', 'come']
const w = [[0.82, 0.1, 0.3], [0.2, 0.9, 0.45], [0.05, 0.3, 0.7]]
const stackCode = `<div class="hb-rack-stack">
  <section class="hb-panel"><div class="hb-panel-hd-inst">now</div>
    <p class="hb-marker">fetch</p>
    <p class="hb-note">saw the ball, play is high.</p>
  </section>
  <section class="hb-panel"><div class="hb-panel-hd-inst">associations</div>
    <table class="hb-heat is-pink">... <td :class="{ 'is-hi': v > 0.55 }" :style="{ '--v': v }">
  </section>
</div>`
</script>

<template>
  <DemoSection title="Gauges" note="A bar per row on a fixed scale. The row the step is about has the pink bar and a pink label." :code="code">
    <div style="max-width: 420px">
      <HbGauges :rows="rows" label="drives" />
    </div>
  </DemoSection>
  <DemoSection title="Rack stack, marker name, note, pink heat" note="Hackle's rack: blocks 16 px apart (.hb-rack-stack), one behaviour name in Permanent Marker (.hb-marker), a Special Elite note under it (.hb-note), and the association table filled pink by weight (.hb-heat.is-pink, --v from 0 to 1, .is-hi past .55)." :code="stackCode">
    <div class="hb-rack-stack" style="max-width: 380px">
      <section class="hb-panel"><div class="hb-panel-hd-inst">now</div><p class="hb-marker">fetch</p><p class="hb-note">saw the ball, play is high.</p></section>
      <section class="hb-panel"><div class="hb-panel-hd-inst">associations</div>
        <table class="hb-heat is-pink"><tbody>
          <tr><th /><th v-for="a in acts" :key="a" scope="col">{{ a }}</th></tr>
          <tr v-for="(c, i) in cues" :key="c"><th scope="row">{{ c }}</th><td v-for="(v, j) in w[i]" :key="j" :class="{ 'is-hi': v > 0.55 }" :style="{ '--v': v }">{{ Math.round(v * 9) }}</td></tr>
        </tbody></table>
      </section>
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'rows', type: '{label, value, display?, current?}[]' },
      { prop: 'max', type: 'number', default: '1' },
      { prop: 'label', type: 'string' },
    ]"
  />
</template>
