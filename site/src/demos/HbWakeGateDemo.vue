<script setup lang="ts">
import { computed, ref } from 'vue'
import { HbPills, HbSelect, HbWakeGate, type WakeSystem } from '@hackbuild/ui'
import { wakeError, wakePills } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const waiting = (): WakeSystem[] => [
  { id: 'brain', label: 'brain', state: 'waiting', required: true },
  { id: 'voice', label: 'voice', state: 'waiting' },
  { id: 'memory', label: 'memory', state: 'waiting' },
  { id: 'body', label: 'body', state: 'waiting' },
]
const systems = ref<WakeSystem[]>(waiting())
const error = ref('')
const busy = ref(false)
const brain = ref('e4b')
const sizes: Record<string, number> = { e4b: 5427, e2b: 3482, q2b: 1331 }
const pills = computed(() => wakePills(systems.value))

const timers: number[] = []
function set(id: string, patch: Partial<WakeSystem>) {
  systems.value = systems.value.map((s) => (s.id === id ? { ...s, ...patch } : s))
}
function run(fail: boolean, lite = false) {
  timers.forEach(clearTimeout)
  systems.value = waiting()
  error.value = ''
  busy.value = true
  set('brain', { state: 'loading', pct: 0.02, note: 'connecting' })
  set('memory', { state: 'loading', pct: null, note: 'vectors loading' })
  if (lite) set('voice', { state: 'off', note: 'off, no voice' })
  else set('voice', { state: 'loading', pct: 0.4, note: '40 of 100 mb' })
  set('body', { state: 'loading', pct: 0.6, note: 'model.glb' })
  timers.push(window.setTimeout(() => {
    set('memory', { state: 'ready', note: '214 notes, hybrid search' })
    if (!lite) set('voice', { state: 'error', note: 'pocket tts failed: worker blocked. using the browser voice.' })
    set('body', { state: 'ready', note: 'ready, 3 animations' })
    set('brain', { state: 'loading', pct: 0.46, note: '2.48 / 5.30 GB' })
  }, 700))
  timers.push(window.setTimeout(() => {
    if (fail) {
      set('brain', { state: 'error', note: 'failed: out of memory' })
      error.value = wakeError('brain', 'the gpu ran out of memory at 4.1 GB')
    } else set('brain', { state: 'ready', note: 'ready, webgpu' })
    busy.value = false
  }, 1500))
}

const code = `<HbWakeGate :systems="rows" tag="character // in this tab" :size-m-b="5427" size-source="vendor"
  :origin="fileOrigin ? 'file' : 'http'" :quota-m-b="quotaMB" :webgpu="env.webgpu" :error="error"
  @wake="wake(false)" @wake-lite="wake(true)">
  <template #picker><HbSelect v-model="brain" :options="brains" /></template>
</HbWakeGate>
<HbPills :items="wakePills(rows)" />   // the same rows, after the gate closes`
</script>

<template>
  <DemoSection
    title="The wake gate"
    note="One press is the audio gesture and starts every load. Each subsystem reports on its own row. A voice failure marks its row and pill and the rest goes on; a brain failure writes one line with two fixes and gives both buttons back. The note under the picker is built from the size, the origin and the quota. Press wake for a run that fails, no voice for one that works."
    :code="code"
  >
    <div class="demo-col" style="max-width: 640px">
      <HbPills :items="pills" :compact="false" label="subsystems" />
      <HbWakeGate
        :systems="systems"
        tag="character // in this tab"
        ver="v1"
        title="wake it up."
        lede="a character that lives in this tab: a brain, a voice, a body and a memory. nothing is sent to a server. everything downloads once and is cached."
        :size-m-b="sizes[brain]"
        size-source="vendor"
        extras="the voice and memory models"
        :quota-m-b="4096"
        :error="error"
        :busy="busy"
        @wake="run(true)"
        @wake-lite="run(false, true)"
      >
        <template #picker>
          <label class="hb-ctl is-wide">brain
            <HbSelect v-model="brain" :options="[{ value: 'e4b', label: 'gemma 4 e4b, 5.3 GB (vendor)' }, { value: 'e2b', label: 'gemma 4 e2b, 3.4 GB (vendor)' }, { value: 'q2b', label: 'qwen3.5 2b, 1.3 GB (vendor)' }]" />
          </label>
        </template>
      </HbWakeGate>
    </div>
  </DemoSection>

  <DemoSection title="From a file, no webgpu" note="The note names each thing that will make the download fail before the button is pressed.">
    <div style="max-width: 640px">
      <HbWakeGate :systems="waiting()" tag="chat // in this tab" title="load the brain." :size-m-b="1733" size-source="measured" origin="file" :webgpu="false" lite-label="" wake-label="load 1.7 GB" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'systems', type: '{id, label, state, pct, note, required}[]', notes: 'state waiting, loading, ready, error, off' },
      { prop: 'tag / ver / title / lede', type: 'string', notes: 'default slot replaces lede' },
      { prop: 'sizeMB / sizeSource / origin / quotaMB / webgpu / extras', type: 'gate note inputs', notes: 'gateNote() in the vanilla entry' },
      { prop: 'note / error / busy', type: 'string / string / boolean' },
      { prop: 'wakeLabel / liteLabel', type: 'string', default: `'wake' / 'no voice'`, notes: 'empty lite label hides it' },
      { prop: 'overlay', type: 'boolean', notes: 'fixed over the page, wake takes focus' },
      { prop: 'slots', type: 'default, persona, picker, fallback' },
      { prop: 'emits', type: 'wake, wake-lite' },
    ]"
  />
</template>
