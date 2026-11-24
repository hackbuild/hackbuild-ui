<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HbModelSlot, { type HbSlotOption } from './HbModelSlot.vue'
import { presetJobs, presetText, rackGate, rackQueue, type RackPreset, type SlotState } from '../vanilla/rack'

export type HbRackPreset = RackPreset

export interface HbRackSlot {
  slot: string
  label: string
  role?: string
  required?: boolean
  options: HbSlotOption[]
  sharedWith?: string[]
}

export interface HbRackSlotState {
  state: SlotState
  pct?: number | null
  fault?: string
}

interface Props {
  slots: HbRackSlot[]
  /** Slot state from the hub: empty, loading, ready, fault. */
  states?: Record<string, HbRackSlotState | undefined>
  /** Presets named by weight class, each with its summed download. */
  presets?: RackPreset[]
  label?: string
}

const props = withDefaults(defineProps<Props>(), { states: () => ({}), presets: () => [], label: 'models by job' })

/** The chosen record id per slot. */
const picks = defineModel<Record<string, string>>({ default: () => ({}) })

const emit = defineEmits<{
  /** Load this record into this slot; report progress back through states. */
  load: [slot: string, id: string]
  preset: [id: string]
  /** Every required slot is ready, or no longer. */
  ready: [ready: boolean]
}>()

const stateOf = (slot: string): SlotState => props.states[slot]?.state ?? 'empty'
const flat = computed(() => Object.fromEntries(props.slots.map((s) => [s.slot, stateOf(s.slot)])) as Record<string, SlotState>)
const gate = computed(() => rackGate(props.slots, flat.value))
const pickOf = (s: HbRackSlot) => picks.value[s.slot] ?? s.options[0]?.value ?? ''
const waiting = ref<string[]>([])

const queue = rackQueue((slot) => {
  waiting.value = queue.waiting
  const s = props.slots.find((x) => x.slot === slot)
  if (s) emit('load', slot, pickOf(s))
})

watch(flat, (now, before) => {
  for (const [slot, st] of Object.entries(now)) if (!before || before[slot] !== st) queue.settle(slot, st)
  waiting.value = queue.waiting
})
watch(() => gate.value.ready, (r) => emit('ready', r), { immediate: true })

function setPick(slot: string, id: string) {
  picks.value = { ...picks.value, [slot]: id }
}
function loadOne(slot: string, id: string) {
  setPick(slot, id)
  queue.push([slot])
  waiting.value = queue.waiting
}
function runPreset(p: RackPreset) {
  const jobs = presetJobs(p, props.slots, picks.value, flat.value)
  picks.value = { ...picks.value, ...p.picks }
  emit('preset', p.id)
  queue.push(jobs)
  waiting.value = queue.waiting
}
const matches = (p: RackPreset) => Object.entries(p.picks).every(([s, id]) => picks.value[s] === id)
const labelOf = (slot: string) => props.slots.find((s) => s.slot === slot)?.label ?? slot
const queueText = computed(() => (waiting.value.length ? `then ${waiting.value.map(labelOf).join(', ')}, one at a time.` : ''))
</script>

<template>
  <section class="hb-rack" :aria-label="props.label">
    <div v-if="props.presets.length" class="hb-rack-presets" role="group" aria-label="presets">
      <span class="hb-rack-plabel">presets</span>
      <button
        v-for="p in props.presets"
        :key="p.id"
        type="button"
        class="hb-btn hb-btn-2 hb-btn-sm"
        :aria-pressed="matches(p)"
        @click="runPreset(p)"
      >{{ presetText(p) }}</button>
      <span class="hb-rack-pnote">a preset fills every slot it names and loads the missing ones one after another. the total is the download before anything loads.</span>
    </div>
    <div class="hb-rack-slots">
      <HbModelSlot
        v-for="s in props.slots"
        :key="s.slot"
        :model-value="pickOf(s)"
        :label="s.label"
        :role="s.role"
        :required="s.required"
        :options="s.options"
        :state="stateOf(s.slot)"
        :pct="props.states[s.slot]?.pct ?? null"
        :fault="props.states[s.slot]?.fault ?? ''"
        :shared-with="s.sharedWith"
        @update:model-value="setPick(s.slot, $event)"
        @load="loadOne(s.slot, $event)"
      />
    </div>
    <p class="hb-rack-gate" :class="{ 'is-ready': gate.ready }" role="status" aria-live="polite">{{ gate.note }} {{ queueText }}</p>
    <slot name="gate" :ready="gate.ready" :missing="gate.missing" />
  </section>
</template>
