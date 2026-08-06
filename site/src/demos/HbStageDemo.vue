<script setup lang="ts">
import { HbStage } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbStage label="spectrum" graph>
  <canvas class="hb-scope" />
</HbStage>`

const points = Array.from({ length: 60 }, (_, i) => {
  const u = i / 59
  const y = 90 - 62 * Math.exp(-(((u - 0.5) * 8) ** 2)) - 18 * Math.exp(-(((u - 0.15) * 14) ** 2)) - Math.abs(Math.sin(i * 1.7)) * 6
  return `${(u * 100).toFixed(1)},${y.toFixed(1)}`
}).join(' ')
</script>

<template>
  <DemoSection
    title="The stage"
    note="The void with the pink offset shadow. The one place per view that gets the pink shadow, and the only surface the graph rule may appear on. Never put chrome on it: it is where the machine draws."
    :code="code"
  >
    <HbStage label="spectrum" graph>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="display: block; width: 100%; height: 180px" aria-hidden="true">
        <polyline :points="points" fill="none" stroke="#FE0386" stroke-width="1" vector-effect="non-scaling-stroke" />
      </svg>
    </HbStage>
  </DemoSection>

  <DemoSection title="Lit text" note="Text drawn on the void uses the lit set, never the paper signal colors. The stylesheet swaps hb-ok and friends automatically.">
    <HbStage>
      <div style="font-family: var(--hb-readout); font-size: 20px">
        <span class="hb-ok">locked</span>
        <span class="hb-warn" style="margin-left: 14px">clipping</span>
        <span class="hb-err" style="margin-left: 14px">dropped 41</span>
        <span style="margin-left: 14px; color: var(--hb-pink)">2402.500 MHz</span>
      </div>
    </HbStage>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'graph', type: 'boolean', default: 'false', notes: 'the 32 px pink graticule' },
      { prop: 'label', type: 'string', notes: 'dimmed label at the top' },
    ]"
  />
</template>
