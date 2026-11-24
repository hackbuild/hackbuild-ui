<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { HbButton, HbSpokenText } from '@hackbuild/ui'
import { spokenWords } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

// A stub clock: no voice runs here. The estimate is what a system voice
// with no boundary events gets.
const line = 'i solder in the dark, my flux is fresh, your traces lift, your joints are cold, i pass the test.'
const words = computed(() => spokenWords(line, { rate: 1.1 }))
const time = ref<number | null>(2.1)
let t0 = 0
let raf = 0
function play() {
  cancelAnimationFrame(raf)
  t0 = performance.now()
  const end = (words.value.at(-1)?.end ?? 0) + 0.3
  const tick = () => {
    time.value = (performance.now() - t0) / 1000
    if (time.value < end) raf = requestAnimationFrame(tick)
  }
  tick()
}
onBeforeUnmount(() => cancelAnimationFrame(raf))
const code = `<HbSpokenText who="voltage" :words="spokenWords(line, { rate })" :time="voice.time" breaks />
<HbSpokenText :words="words" :active="wordAtChar(words, e.charIndex)" />`
</script>

<template>
  <DemoSection title="Spoken text" note="The line as word spans: the word being spoken in pink, earlier words kept, later words dim. Times come from measured word timing, or spokenWords estimates them; a boundary event sets active and wins." :code="code">
    <div class="demo-col" style="max-width: 640px">
      <HbSpokenText who="voltage" :words="words" :time="time" breaks />
      <div class="hb-acts"><HbButton size="sm" @click="play">play the stub</HbButton></div>
      <div class="hb-stage" style="padding: 12px">
        <HbSpokenText who="on the stage" :words="['every', 'word', 'lands', 'on', 'time']" :active="2" />
      </div>
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'words', type: '(string | {text, start?, end?, char?})[]' },
      { prop: 'time', type: 'number | null', notes: 'seconds into the line' },
      { prop: 'active', type: 'number | null', notes: 'from a boundary event, wins over time' },
      { prop: 'who / breaks', type: 'string / boolean' },
    ]"
  />
</template>
