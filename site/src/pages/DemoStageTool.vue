<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  HbAppShell, HbButton, HbChat, HbChip, HbDrawer, HbHeader, HbHudStat, HbIcon, HbInset, HbKbd, HbPad, HbPanel, HbParamRow, HbPill,
  HbSeed, HbSeg, HbStageCaption, HbToolbar, HbTransport, HbViewport, HbWave, type PadVector,
} from '@hackbuild/ui'

// A stage tool (motion tools): the toolbar, the stage, a strip under it
// and the transport in the main column, a rack in the side column on the
// right from 1024 px. The main column has more parts than the side has
// height for; each part keeps its own row and none sits under the stage.
// The hint keys are HbKbd on the dark hud plate. Fixture data only.
// The toolbar carries as many verbs as the room tool: it fits to its own
// column, and what still does not fit moves into the more menu, tune
// always in view. The pad stays inside the stage at every phone height.
// The dock arrives after mount, as a tool's teleported composer does, and
// the tune sheet stops at its top edge.
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
const move = ref<PadVector>({ x: 0, y: 0 })
const run = ref<string | number>('prompted')
const tune = ref(false)
const dock = ref(false)
let late = 0

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
onMounted(() => {
  last = performance.now()
  raf = requestAnimationFrame(tick)
  late = window.setTimeout(() => { dock.value = true }, 300)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); clearTimeout(late) })
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
      <!-- overflow: one row by the bar's own width. Labels drop to icons,
           seed and the tool verbs fold behind the more button, and verbs
           that still do not fit move in after them. tune stays. -->
      <HbToolbar overflow>
        <HbButton variant="secondary"><HbIcon name="refresh" :size="14" /><span class="hb-bar-lbl">restart</span></HbButton>
        <HbButton variant="secondary"><HbIcon name="upload" :size="14" /><span class="hb-bar-lbl">body</span></HbButton>
        <HbButton variant="secondary"><HbIcon name="layer-group" :size="14" /><span class="hb-bar-lbl">panels</span></HbButton>
        <HbButton variant="secondary"><HbIcon name="record" :size="14" /><span class="hb-bar-lbl">record</span></HbButton>
        <HbButton variant="secondary"><HbIcon name="camera" :size="14" /><span class="hb-bar-lbl">snap</span></HbButton>
        <template #more>
          <HbSeed v-model="seed" v-model:locked="locked" />
          <HbButton variant="ghost" size="sm" title="who decides: in tab"><HbPill status="ok">brain in tab</HbPill></HbButton>
          <HbPill status="none">idle</HbPill>
          <HbSeg v-model="run" :options="['prompted', 'free run']" label="who starts" />
          <HbButton variant="secondary">stop</HbButton>
          <HbButton variant="secondary"><HbIcon name="circle-nodes" :size="14" /><span class="hb-bar-lbl">open rack</span></HbButton>
        </template>
        <template #end>
          <span class="hb-spacer" />
          <HbButton variant="secondary" :aria-expanded="tune" @click="tune = true"><HbIcon name="sliders" :size="14" /><span class="hb-bar-lbl">tune</span></HbButton>
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
        <template #pad><HbPad v-model="move" action="act" always keys /></template>
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
    <template v-if="dock" #dock>
      <HbChat :lines="[]" :log="false" placeholder="tell the walker what to do" label="talk to the walker" />
    </template>
  </HbAppShell>
  <HbDrawer v-model="tune" side="auto" title="tune the walker">
    <div class="hb-rail is-above-dock">
      <HbPanel heading="gait" sunk class="hb-instrument">
        <HbParamRow v-model="reach" label="reach" :min="0" :max="1" :step="0.05" unit="m" :default-value="0.6" />
      </HbPanel>
    </div>
  </HbDrawer>
</template>
