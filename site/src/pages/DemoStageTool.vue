<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  HbAppShell, HbButton, HbChip, HbHeader, HbHudStat, HbIcon, HbInset, HbKbd, HbPanel, HbParamRow, HbSeed, HbStageCaption, HbToolbar,
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
const VIEWS = ['front', 'side', 'back', 'top'] as const
const view = ref<string>('front')
const reach = ref(0.6)
const weight = ref(1)
const EYES = ['what it sees', 'depth', 'detector']
const eye = ref('what it sees')
const eyeOpen = ref(true)

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
      <!-- overflow: one row on a phone. Labels drop to icons, seed and the
           tool verbs fold behind the more button. -->
      <HbToolbar overflow>
        <HbButton variant="secondary"><HbIcon name="refresh" :size="14" /><span class="hb-bar-lbl">restart</span></HbButton>
        <HbButton variant="secondary"><HbIcon name="upload" :size="14" /><span class="hb-bar-lbl">body</span></HbButton>
        <template #more>
          <HbSeed v-model="seed" v-model:locked="locked" />
          <HbButton variant="secondary">record</HbButton>
        </template>
        <template #end>
          <span class="hb-spacer" />
          <HbButton variant="secondary"><HbIcon name="sliders" :size="14" /><span class="hb-bar-lbl">tune</span></HbButton>
        </template>
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
        <template #tr>
          <div class="hb-cams" role="group" aria-label="camera">
            <HbChip v-for="(v, i) in VIEWS" :key="v" :model-value="view === v" toggle :hotkey="String(i + 1)" :hotkey-label="`view from the ${v}`" hotkey-group="stage" @click="view = v">{{ v }}</HbChip>
          </div>
        </template>
        <template #telemetry>
          <HbHudStat label="fps" :value="60" :digits="0" />
          <HbHudStat label="seed" :value="seed" :digits="0" />
          <HbHudStat label="t" :value="time" :digits="2" unit="s" />
          <HbHudStat label="goal" value="bring the mug" />
        </template>
        <template #hint>
          <span class="hb-hudnote"><HbKbd>space</HbKbd> play, <HbKbd>.</HbKbd> step, <HbKbd>1</HbKbd> to <HbKbd>3</HbKbd> views</span>
        </template>
        <template #caption>
          <HbStageCaption echo="you: walk to the door and stop" line="the left foot plants at 1.2 s and the hips drop to meet it, then the weight rolls forward." who="walker" :max-chars="160" />
        </template>
        <template #bl>
          <HbInset v-model:mode="eye" v-model:open="eyeOpen" :modes="EYES" :title="eye === 'what it sees' ? 'eye' : eye" ratio="16 / 9" collapsible>
            <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <rect width="160" height="90" :fill="eye === 'depth' ? 'var(--hb-ink-2)' : 'var(--hb-void)'" />
              <rect x="70" y="30" width="20" height="40" fill="var(--hb-lit-dim)" />
              <rect v-if="eye === 'detector'" x="66" y="26" width="28" height="48" fill="none" stroke="var(--hb-pink)" stroke-width="2" />
            </svg>
          </HbInset>
        </template>
        <template #b>
          <HbButton variant="secondary">wave</HbButton>
          <HbButton variant="secondary">sit</HbButton>
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
