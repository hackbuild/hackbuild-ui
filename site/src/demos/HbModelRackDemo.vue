<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { HbButton, HbModelRack, type HbRackSlot, type HbRackSlotState } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { rackPresets, rackSlots } from '../fixtures/models'

// A stored pick the catalogue no longer carries: named in its row with remove.
const picks = ref<Record<string, string>>({ depth: 'depth-pro-old' })
const states = ref<Record<string, HbRackSlotState>>({})
const ready = ref(false)
let t = 0
/** Stub loader: no weights move. Ears fault once to show a fault on one row. */
function load(slot: string, id: string) {
  states.value = { ...states.value, [slot]: { state: 'loading', pct: 0 } }
  let p = 0
  t = window.setInterval(() => {
    p += 0.2
    if (slot === 'ears' && p > 0.5 && !states.value.ears?.fault) {
      clearInterval(t)
      states.value = { ...states.value, ears: { state: 'fault', fault: `${id}: the session build ran out of memory. press try again.` } }
      return
    }
    if (p >= 1) { clearInterval(t); states.value = { ...states.value, [slot]: { state: 'ready' } } }
    else states.value = { ...states.value, [slot]: { state: 'loading', pct: p } }
  }, 180)
}
onBeforeUnmount(() => clearInterval(t))

// The body is an organ but not a model: a source and a size, no download.
const body = ref<HbRackSlot>({ slot: 'body', label: 'body', role: 'moves and holds', kind: 'organ', source: 'stand-in capsule, built in', size: '0 mb (computed)' })
const organSlots = [body.value, rackSlots[0]!]
function dropBody() {
  body.value.source = 'robot.glb, dropped'
  body.value.size = '2.1 mb (measured)'
}
const organCode = `{ slot: 'body', label: 'body', role: 'moves and holds', kind: 'organ', source: 'robot.glb, dropped', size: '2.1 mb (measured)' }`
const code = `<HbModelRack v-model="picks" :slots="slots" :states="states" :presets="presets" @load="(slot, id) => hub.load(slot, id)" @remove="(slot) => hub.forget(slot)" @ready="wake.disabled = !$event" />`
</script>

<template>
  <DemoSection
    title="The slot rack"
    note="Presets named by weight class, each stating the summed download before anything loads. A preset fills the slots it names and loads the missing ones one after another. The gate line names the required slots; ears fault here on purpose and the rest go on. depth holds a pick the catalogue no longer has: the row names it and offers remove. The loader is a stub."
    :code="code"
  >
    <div style="max-width: 760px">
      <HbModelRack v-model="picks" :slots="rackSlots" :states="states" :presets="rackPresets" @load="load" @ready="ready = $event">
        <template #gate="{ ready: ok }">
          <button type="button" class="hb-btn" :disabled="!ok">wake the agent</button>
        </template>
      </HbModelRack>
    </div>
  </DemoSection>

  <DemoSection
    title="An organ that is not a model"
    note="kind organ: label, role, source and size. No pick, no load button, no state square; presets and the ready gate skip it. The organ slot holds the row's own action. Fixture data."
    :code="organCode"
  >
    <div style="max-width: 760px">
      <HbModelRack :slots="[body, ...organSlots.slice(1)]" label="organs">
        <template #organ="{ row }">
          <HbButton v-if="row.slot === 'body'" variant="secondary" size="sm" @click="dropBody">pick a glb</HbButton>
        </template>
      </HbModelRack>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'slots', type: '{slot, label, role, required, options, sharedWith, kind, source, size}[]', notes: `kind 'organ': source and size, no download` },
      { prop: '#organ', type: 'slot { row }', notes: 'the action on an organ row' },
      { prop: 'states', type: 'Record<slot, {state, pct, fault}>' },
      { prop: 'presets', type: '{id, label, picks, totalMB, totalSource, unknown}[]', notes: 'totals from presetTotal' },
      { prop: 'v-model', type: 'Record<slot, id>' },
      { prop: 'slots', type: 'gate (ready, missing)' },
      { prop: 'emits', type: 'load(slot, id), preset(id), remove(slot), ready(boolean)', notes: 'remove: a pick with no catalogue record; the rack clears it' },
    ]"
  />
</template>
