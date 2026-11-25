<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  HbAppShell, HbButton, HbHeader, HbHudStat, HbKbd, HbPanel, HbParamRow, HbSeed, HbToolbar,
  HbTransport, HbViewport, HbWave,
} from '@hackbuild/ui'

// A stage tool (motion tools): the toolbar, the stage, a strip under it
// and the transport in the main column, a rack in the side column on the
// right from 1024 px. The main column has more parts than the side has
// height for; each part keeps its own row and none sits under the stage.
// The hint keys are HbKbd on the dark hud plate. Fixture data only.
const seed = ref(7)
const locked = ref(true)
const playing = ref(false)
const loop = ref(true)
const rate = ref(1)
const time = ref(1.2)
const duration = 4
const samples = Array.from({ length: 96 }, (_, i) => Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11)))
const reach = ref(0.6)
const weight = ref(1)

let raf = 0
let last = 0
function tick(t: number) {
  if (playing.value) {
    time.value += ((t - last) / 1000) * rate.value
    if (time.value >= duration) {
      if (loop.value) time.value %= duration
      else { time.value = duration; playing.value = false }
    }
  }
  last = t
  raf = requestAnimationFrame(tick)
}
onMounted(() => { last = performance.now(); raf = requestAnimationFrame(tick) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
const seek = (t: number) => { time.value = Math.min(duration, Math.max(0, t)) }
</script>

<template>
  <HbAppShell>
    <template #header>
      <HbHeader title="stage tool" accent="." tagline="stage, strip and transport" tagline-kind="tool">
        <a class="hb-link" href="#/demos">exit demo</a>
      </HbHeader>
      <p class="hb-fixture is-strip"><b>fixture</b> sample data: the clip, the strip and the numbers are made up. no model loads here.</p>
    </template>

    <div class="hb-toolpage is-split is-stage">
      <HbToolbar>
        <HbSeed v-model="seed" v-model:locked="locked" />
        <HbButton variant="secondary">restart</HbButton>
        <HbButton variant="secondary">body</HbButton>
        <span class="hb-spacer" />
        <HbButton variant="secondary">tune</HbButton>
      </HbToolbar>

      <HbViewport look="lit" aspect="16/9" label="the stage">
        <svg class="hb-viewport-media" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g fill="none" stroke="var(--hb-lit-dim)" stroke-width="1">
            <path d="M0 160 H400 M0 185 H400 M0 215 H400" />
            <path d="M200 160 L0 225 M200 160 L100 225 M200 160 L200 225 M200 160 L300 225 M200 160 L400 225" />
          </g>
          <rect x="188" y="90" width="24" height="64" fill="var(--hb-paper)" />
          <rect x="191" y="72" width="18" height="16" fill="var(--hb-paper)" />
        </svg>
        <template #telemetry>
          <HbHudStat label="fps" :value="60" :digits="0" />
          <HbHudStat label="seed" :value="seed" :digits="0" />
          <HbHudStat label="t" :value="time" :digits="2" unit="s" />
        </template>
        <template #hint>
          <span class="hb-hudnote"><HbKbd>space</HbKbd> play, <HbKbd>.</HbKbd> step, <HbKbd>1</HbKbd> to <HbKbd>3</HbKbd> views</span>
        </template>
      </HbViewport>

      <HbWave label="visemes" bars :samples="samples" :at="time / duration" seekable @seek="(a) => seek(a * duration)" />

      <HbTransport
        v-model:loop="loop"
        :playing="playing"
        :time="time"
        :duration="duration"
        :rate="rate"
        label="stage transport"
        @play="playing = true"
        @pause="playing = false"
        @step="(d: number) => seek(time + d / 30)"
        @seek="seek"
        @rate="(r: number) => (rate = r)"
      />

      <div class="is-side">
        <HbPanel heading="rig" sunk class="hb-instrument">
          <HbParamRow v-model="reach" label="reach" :min="0" :max="1" :step="0.05" unit="m" :default-value="0.6" />
          <HbParamRow v-model="weight" label="weight" :min="0" :max="1" :step="0.05" :default-value="1" />
        </HbPanel>
        <HbPanel heading="clip" sunk>
          <p class="hb-hint">a made up clip of 4 s at 30 fps.</p>
        </HbPanel>
        <HbPanel heading="export" sunk>
          <HbButton variant="secondary">export json</HbButton>
        </HbPanel>
      </div>
    </div>
  </HbAppShell>
</template>
