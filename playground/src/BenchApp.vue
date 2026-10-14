<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  HbChip, HbGuide, HbHeader, HbMaterials, HbPanel, HbParamRow, HbPill,
  HbStageOverlay, HbStatusBar, HbSteps, HbTag, HbWelcome,
  type HbMaterialSlot, type HbParamValue, type HbStepOption,
} from '@hackbuild/ui'

// Sample data ported from pip-controller: slots from src/layout.js lines 47
// to 52, roles and guide text from bench/part3.js, ranges and defaults from
// bench/part1.html and src/layout.js.
const slots: HbMaterialSlot[] = [
  { slot: 1, color: '#F4F1EA', material: 'white PETG', parts: 'body, bezel', role: 'body' },
  { slot: 2, color: '#1A1A1A', material: 'conductive PLA', parts: 'buried traces', role: 'traces' },
  { slot: 3, color: '#FE0386', material: 'pink TPU 95A', parts: 'keys', role: 'keys' },
  { slot: 4, color: '#6E6E6E', material: 'conductive TPU', parts: 'contacts', role: 'contacts' },
]

const guides = [
  { name: 'layout', goal: 'shape the body and place the button groups. each group picks its own switch: flex cone, click spring or touch comb.' },
  { name: 'buttons', goal: 'tune the keys you picked. the click spring curve is solved from its numbers; hold a key in the drive pad to see it move.' },
  { name: 'board', goal: 'seat the RP2040-Zero on press fit bumps or wire it to cups, map the pins, then take the wiring drawing and the firmware.' },
  { name: 'print', goal: 'set the buried trace stack and routing, check the filaments, and export the 3MF with every part on its head.' },
]

const step = ref<string | number>('buttons')
const steps = computed<HbStepOption[]>(() =>
  guides.map((g, i) => ({ label: g.name, value: g.name, done: i < guides.findIndex((x) => x.name === step.value) })),
)
const current = computed(() => Math.max(0, guides.findIndex((g) => g.name === step.value)))
const manySteps: HbStepOption[] = ['shape', 'keys', 'contacts', 'routing', 'board', 'wiring', 'firmware', 'print'].map((s, i) => ({ label: s, value: s, done: i < 2 }))
const manyStep = ref<string | number>('contacts')

// bench.html?closed opens with the welcome dismissed, to see the overlays.
const welcomeOpen = ref(!new URLSearchParams(location.search).has('closed'))
const cam = ref('iso')
const cams = ['iso', 'top', 'front', 'under', 'explode', 'xray', 'section', 'plate']
const xray = ref(false)
const plate = ref(true)

const width = ref<HbParamValue>(150)
const depth = ref<HbParamValue>(72)
const corner = ref<HbParamValue>(10)
const alpha = ref<HbParamValue>(40)
const capMat = ref<HbParamValue>('tpu')
const window_ = ref<HbParamValue>(true)
const style = ref<HbParamValue>('stadium')
const gapPct = ref<HbParamValue>(45)

const log = ref<string[]>([])
function note(kind: string, label: string, value: HbParamValue) {
  log.value = [`${kind} ${label} ${value}`, ...log.value].slice(0, 6)
}
function verb(id: string) {
  if (id === 'guide') welcomeOpen.value = true
  log.value = [`verb ${id}`, ...log.value].slice(0, 6)
}
function start(id: string) {
  log.value = [`start ${id}`, ...log.value].slice(0, 6)
}
</script>

<template>
  <div class="pg-bench">
    <HbHeader title="PIP" accent="." suffix="bench" tagline="a game controller printed whole." tagline-kind="tool">
      <HbPill status="ok">mesh current</HbPill>
    </HbHeader>
    <HbSteps v-model="step" :steps="steps" />
    <HbGuide :step="current + 1" :name="guides[current].name" :goal="guides[current].goal" @verb="verb" />

    <div class="pg-main">
      <div class="pg-stage">
        <HbStageOverlay graph :quiet="welcomeOpen">
          <template #tl>
            <div class="hb-cams" role="group" aria-label="camera">
              <button v-for="c in cams" :key="c" type="button" :aria-pressed="cam === c" @click="cam = c">{{ c }}</button>
            </div>
          </template>
          <template #tr>
            <HbMaterials :slots="slots" variant="legend">
              <div v-if="xray" class="hb-ok">xray: nets in colour, shell ghosted</div>
              <div v-if="plate" class="hb-warn">plate does not fit</div>
            </HbMaterials>
          </template>
          <template #bl>
            <div class="hb-hud">
              <div style="display: flex; gap: var(--hb-s1); flex-wrap: wrap">
                <HbTag variant="lit-ok">assembled</HbTag>
                <HbTag variant="lit-warn">print bed</HbTag>
                <HbTag variant="lit-err">checks failed</HbTag>
              </div>
              <span>cam {{ cam }}</span>
            </div>
          </template>
          <template #br>
            <HbTag variant="lit-warn">building</HbTag>
          </template>
          <template #center>
            <HbWelcome
              v-model:open="welcomeOpen"
              title="PIP"
              suffix="bench"
              note="a game controller printed in one go on a four head machine: PETG body, conductive PLA traces buried in it, TPU keys, conductive TPU contacts. a Waveshare RP2040-Zero drops into the pocket."
              :steps="[
                { name: 'layout', text: 'body shape, button groups, flex, clicky or touch per group' },
                { name: 'buttons', text: 'cone, snap spring, touch comb and stick geometry with feel readouts' },
                { name: 'board', text: 'press fit contacts or wire cups, pin map, wiring and firmware' },
                { name: 'print', text: 'stack, routing, filaments, export 3MF, STLs and the print card' },
              ]"
              :starts="[
                { id: 'blank', name: 'start blank', sub: 'factory reset' },
                { id: 'stick', name: 'stick example', sub: 'variant' },
                { id: 'example', name: 'worked example', sub: 'four groups', primary: true },
              ]"
              @start="start"
            />
          </template>
        </HbStageOverlay>
      </div>

      <aside class="pg-rail" aria-label="parameters">
        <HbMaterials :slots="slots" />
        <HbPanel style="margin-top: var(--hb-s4)">
          <div class="hb-panel-hd-inst">body</div>
          <div class="hb-chips" style="display: flex; gap: var(--hb-s2); flex-wrap: wrap; margin-bottom: var(--hb-s2)">
            <HbChip toggle :model-value="style === 'stadium'" @update:model-value="style = 'stadium'">stadium</HbChip>
            <HbChip toggle :model-value="style === 'slab'" @update:model-value="style = 'slab'">slab</HbChip>
            <HbChip toggle :model-value="style === 'grips'" @update:model-value="style = 'grips'">grips</HbChip>
          </div>
          <HbParamRow v-model="width" label="width" :min="100" :max="220" :step="1" unit="mm" :default-value="150" @touch="note('touch', 'width', $event)" @commit="note('commit', 'width', $event)" />
          <HbParamRow v-model="depth" label="depth" :min="50" :max="100" :step="1" unit="mm" :default-value="64" @commit="note('commit', 'depth', $event)" />
          <HbParamRow v-model="corner" label="corner" :min="2" :max="30" :step="0.5" unit="mm" :default-value="10" disabled reason="corner applies to the slab body; pick slab to set it." />
          <HbParamRow v-model="alpha" label="cone angle" :min="25" :max="50" :step="1" unit="deg" :default-value="40" @commit="note('commit', 'cone angle', $event)" />
          <HbParamRow v-model="gapPct" label="contact gap" :min="35" :max="50" :step="1" unit="%" :default-value="45" />
          <HbParamRow v-model="capMat" type="select" label="cap material" :options="[{ label: 'TPU (slot 3)', value: 'tpu' }, { label: 'PETG (slot 1)', value: 'petg' }]" :default-value="'tpu'" @commit="note('commit', 'cap material', $event)" />
          <HbParamRow v-model="window_" type="switch" label="usb window" :default-value="true" @commit="note('commit', 'usb window', $event)" />
          <HbParamRow v-model="style" type="seg" label="style" :options="['stadium', 'slab', 'grips']" :default-value="'stadium'" />
        </HbPanel>
        <HbPanel style="margin-top: var(--hb-s4)">
          <div class="hb-panel-hd-inst">modes</div>
          <div style="display: flex; gap: var(--hb-s2); flex-wrap: wrap">
            <HbChip v-model="xray" toggle>xray</HbChip>
            <HbChip v-model="plate" toggle>plate</HbChip>
            <HbChip disabled toggle>section</HbChip>
          </div>
        </HbPanel>
        <HbPanel style="margin-top: var(--hb-s4)">
          <div class="hb-panel-hd-inst">events</div>
          <div class="hb-readout" style="font-size: 15px">
            <div v-for="(line, i) in log" :key="i">{{ line }}</div>
            <div v-if="!log.length">no events yet. drag a range or press a verb.</div>
          </div>
        </HbPanel>
      </aside>
    </div>

    <HbStatusBar>
      <span>no build in the playground</span>
      <HbMaterials :slots="slots" variant="chips" />
      <span class="hb-spacer" style="margin-left: auto" />
      <HbTag variant="lit-ok">fits bed</HbTag>
      <HbTag variant="lit-warn">mesh stale</HbTag>
    </HbStatusBar>

    <div class="pg-states">
      <HbPanel>
        <div class="hb-panel-hd-inst">steps, eight of them</div>
        <p class="hb-label">a strip that would clip turns into a select. narrow the window to see it.</p>
        <HbSteps v-model="manyStep" :steps="manySteps" />
      </HbPanel>
      <HbPanel>
        <div class="hb-panel-hd-inst">stage bar and chips</div>
        <div class="hb-stagebar">
          <span>section view</span>
          <span class="hb-spacer" style="margin-left: auto" />
          <HbTag variant="lit-ok">fits</HbTag>
        </div>
        <div style="display: flex; gap: var(--hb-s2); flex-wrap: wrap; margin-top: var(--hb-s3)">
          <HbChip toggle :model-value="false">toggle off</HbChip>
          <HbChip toggle :model-value="true">toggle on</HbChip>
          <HbChip :model-value="true">primary on</HbChip>
          <HbTag>ink</HbTag>
          <HbTag variant="outline">outline</HbTag>
        </div>
      </HbPanel>
    </div>
  </div>
</template>
