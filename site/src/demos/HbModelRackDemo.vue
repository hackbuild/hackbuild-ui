<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { HbModelRack, type HbRackSlotState } from '@hackbuild/ui'
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

  <PropsTable
    :rows="[
      { prop: 'slots', type: '{slot, label, role, required, options, sharedWith}[]' },
      { prop: 'states', type: 'Record<slot, {state, pct, fault}>' },
      { prop: 'presets', type: '{id, label, picks, totalMB, totalSource, unknown}[]', notes: 'totals from presetTotal' },
      { prop: 'v-model', type: 'Record<slot, id>' },
      { prop: 'slots', type: 'gate (ready, missing)' },
      { prop: 'emits', type: 'load(slot, id), preset(id), remove(slot), ready(boolean)', notes: 'remove: a pick with no catalogue record; the rack clears it' },
    ]"
  />
</template>
