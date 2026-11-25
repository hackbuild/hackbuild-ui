<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HbModelSlot, { type HbSlotOption } from './HbModelSlot.vue'
import { presetJobs, presetText, rackGate, rackQueue, slotMissing, type RackPreset, type SlotState } from '../vanilla/rack'
import { noteOnce } from '../utils/note'

noteOnce('HbModelRack', 'HbModelRack is merged since 0.10.0 and goes in 0.11.0; use HbModelSelect with jobs and presets')

export type HbRackPreset = RackPreset

export interface HbRackSlot {
  slot: string
  label: string
  role?: string
  required?: boolean
  /** Catalogue records for a model slot; an organ takes none. */
  options?: HbSlotOption[]
  sharedWith?: string[]
  /** 'organ' is a row for a part that is not a model, such as the body:
      label, source and size, no pick, no load, no download state. */
  kind?: 'model' | 'organ'
  /** Organ: where it comes from, 'stand-in capsule', 'body.glb, dropped'. */
  source?: string
  /** Organ: its size with the source word, '2.1 mb (measured)'. */
  size?: string
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
  /** Remove pressed on a slot whose pick has no catalogue record; the
      rack clears the pick, the app may drop the slot. */
  remove: [slot: string]
  /** Every required slot is ready, or no longer. */
  ready: [ready: boolean]
}>()

const stateOf = (slot: string): SlotState => props.states[slot]?.state ?? 'empty'
const flat = computed(() => Object.fromEntries(props.slots.map((s) => [s.slot, stateOf(s.slot)])) as Record<string, SlotState>)
const gate = computed(() => rackGate(props.slots, flat.value))
const pickOf = (s: HbRackSlot) => picks.value[s.slot] ?? s.options?.[0]?.value ?? ''
const missingOf = (s: HbRackSlot) => (s.kind === 'organ' ? '' : slotMissing(s.options ?? [], picks.value[s.slot]) ?? '')
const uid = `hb-rack-${Math.random().toString(36).slice(2, 8)}`
const waiting = ref<string[]>([])

const queue = rackQueue((slot) => {
  waiting.value = queue.waiting
  const s = props.slots.find((x) => x.slot === slot)
  if (s && !missingOf(s)) emit('load', slot, pickOf(s))
  else queue.settle(slot, 'fault')
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
  const jobs = presetJobs(p, props.slots, picks.value, flat.value).filter((slot) => {
    const s = props.slots.find((x) => x.slot === slot)
    return s && !slotMissing(s.options ?? [], p.picks[slot])
  })
  picks.value = { ...picks.value, ...p.picks }
  emit('preset', p.id)
  queue.push(jobs)
  waiting.value = queue.waiting
}
function removeSlot(slot: string) {
  const { [slot]: _gone, ...rest } = picks.value
  picks.value = rest
  emit('remove', slot)
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
      <template v-for="s in props.slots" :key="s.slot">
      <div v-if="s.kind === 'organ'" class="hb-slot is-organ" role="group" :aria-labelledby="`${uid}-${s.slot}`" :data-slot="s.slot">
        <div class="hb-slot-in">
          <div class="hb-slot-id">
            <span :id="`${uid}-${s.slot}`" class="hb-slot-name">{{ s.label }}</span>
            <span v-if="s.role" class="hb-slot-role">{{ s.role }}</span>
          </div>
          <div class="hb-slot-mid">
            <div class="hb-slot-row">
              <span class="hb-slot-src">{{ s.source || 'no source yet' }}</span>
              <slot name="organ" :row="s" />
            </div>
            <span class="hb-slot-meta">{{ s.size || 'size unknown' }}, not a model, nothing to download</span>
          </div>
        </div>
      </div>
      <HbModelSlot
        v-else
        :model-value="pickOf(s)"
        :label="s.label"
        :role="s.role"
        :required="s.required"
        :options="s.options ?? []"
        :state="stateOf(s.slot)"
        :pct="props.states[s.slot]?.pct ?? null"
        :fault="props.states[s.slot]?.fault ?? ''"
        :shared-with="s.sharedWith"
        :missing="missingOf(s)"
        @remove="removeSlot(s.slot)"
        @update:model-value="setPick(s.slot, $event)"
        @load="loadOne(s.slot, $event)"
      />
      </template>
    </div>
    <p class="hb-rack-gate" :class="{ 'is-ready': gate.ready }" role="status" aria-live="polite">{{ gate.note }} {{ queueText }}</p>
    <slot name="gate" :ready="gate.ready" :missing="gate.missing" />
  </section>
</template>
