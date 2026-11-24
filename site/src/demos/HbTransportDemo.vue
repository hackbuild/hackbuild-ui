<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { HbStageOverlay, HbTag, HbTransport } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { CHAPTERS, CLIP_LEN } from '../fixtures/stage'

// A clock stands in for the clip; no media loads.
const playing = ref(false)
const time = ref(14)
const rate = ref(1)
const loop = ref(false)
let raf = 0
let last = 0
function tick(now: number) {
  const dt = last ? (now - last) / 1000 : 0
  last = now
  let t = time.value + dt * rate.value
  if (t >= CLIP_LEN) { if (loop.value) t = 0; else { t = CLIP_LEN; playing.value = false } }
  time.value = t
  if (playing.value) raf = requestAnimationFrame(tick)
}
watch(playing, (p) => { cancelAnimationFrame(raf); last = 0; if (p) raf = requestAnimationFrame(tick) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
const seek = (t: number) => { time.value = Math.max(0, Math.min(CLIP_LEN, t)) }

const code = `<HbTransport :playing="on" :time="t" :duration="len" :rate="rate" :chapters="chapters"
  v-model:loop="loop" keys :idle="2500"
  @play="play" @pause="pause" @seek="seek" @step="frame" @rate="(r) => rate = r" />`
</script>

<template>
  <DemoSection title="Transport" note="Play, previous and next chapter, the chapter strip over the scrub, time, speed and loop. With keys on, Space plays or pauses, Escape stops and the arrows step, except while typing. With idle set, the bar fades while the pointer rests and the clip plays." :code="code">
    <div class="demo-col">
      <HbStageOverlay>
        <div style="height: 200px" aria-hidden="true" />
        <template #tl><HbTag>{{ playing ? 'playing' : 'paused' }}</HbTag></template>
        <template #b>
          <HbTransport
            v-model:loop="loop"
            :playing="playing"
            :time="time"
            :duration="CLIP_LEN"
            :rate="rate"
            :chapters="CHAPTERS"
            keys
            :idle="2500"
            label="clip"
            @play="playing = true"
            @pause="playing = false"
            @seek="seek"
            @rate="(r) => (rate = r)"
          />
        </template>
      </HbStageOverlay>
      <HbTransport :time="3.2" :duration="NaN" label="unknown length" @step="(d) => seek(time + d / 30)" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'playing / time / duration', type: 'boolean / number / number', notes: 'seconds; NaN or 0 while unknown disables the scrub' },
      { prop: 'rate / rates', type: 'number / number[]', default: '1 / 0.25 0.5 1 1.5 2' },
      { prop: 'v-model:loop', type: 'boolean' },
      { prop: 'chapters', type: '{t, label}[]', notes: 'previous and next jump between them' },
      { prop: 'keys / idle / label', type: 'boolean / ms / string', default: `false / 0 / 'transport'` },
      { prop: 'emits', type: 'play, pause, step(dir) with no chapters, seek(t), rate(r), update:loop' },
    ]"
  />
</template>
