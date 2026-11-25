<script setup lang="ts">
import { computed } from 'vue'
import { mbText, sizeText, type SizeSource } from '../vanilla/models'
import type { SlotState } from '../vanilla/rack'
import { uid as makeUid } from '../utils/uid'
import { noteOnce } from '../utils/note'

noteOnce('HbModelSlot', 'HbModelSlot is merged since 0.10.0 and goes in 0.11.0; use HbModelSelect')

export type HbSlotState = SlotState

export interface HbSlotOption {
  /** Record id. */
  value: string
  label: string
  sizeMB: number | null
  sizeSource: SizeSource
  /** Why this machine cannot run it; the option is disabled. */
  disabled?: string
}

interface Props {
  /** The organ: 'brain', 'ears'. */
  label: string
  /** One line on its job: 'replies and plans'. */
  role?: string
  required?: boolean
  options: HbSlotOption[]
  state?: SlotState
  /** 0 to 1 while loading, or null when the total is unknown. */
  pct?: number | null
  /** The error, named, when the state is fault. */
  fault?: string
  /** Other parts using the loaded model: 'memory, recall'. */
  sharedWith?: string[]
  /** Why the pick has no catalogue record. Set, the row names it and
      offers remove instead of the select. */
  missing?: string
}

const props = withDefaults(defineProps<Props>(), {
  role: '',
  required: false,
  state: 'empty',
  pct: null,
  fault: '',
  sharedWith: () => [],
  missing: '',
})

const value = defineModel<string>({ default: '' })
const emit = defineEmits<{ load: [id: string]; remove: [] }>()

const uid = makeUid('hb-slot')
const pick = computed(() => props.options.find((o) => o.value === value.value) ?? props.options[0] ?? null)
const STATE: Record<SlotState, string> = { empty: 'empty', loading: 'loading', ready: 'ready', fault: 'fault' }
const status = computed(() => {
  if (props.missing) return 'missing'
  if (props.state === 'loading') return props.pct === null ? 'loading' : `loading ${Math.floor(props.pct * 100)}%`
  if (props.state === 'fault') return 'fault'
  return STATE[props.state]
})
const meta = computed(() => {
  const bits = [props.required ? 'required' : 'optional', pick.value ? sizeText(pick.value.sizeMB, pick.value.sizeSource) : '']
  if (props.sharedWith.length && props.state === 'ready') bits.push(`used by: ${props.sharedWith.join(', ')}`)
  return bits.filter(Boolean).join('. ')
})
const button = computed(() => {
  if (props.state === 'ready') return 'reload'
  if (props.state === 'fault') return 'try again'
  return pick.value?.sizeMB != null ? `load ${mbText(pick.value.sizeMB)}` : 'load'
})
function optionText(o: HbSlotOption) {
  return `${o.label}, ${o.sizeMB === null ? 'size unknown' : mbText(o.sizeMB)}${o.disabled ? `, ${o.disabled}` : ''}`
}
function load() {
  if (pick.value && props.state !== 'loading') emit('load', pick.value.value)
}
</script>

<template>
  <div class="hb-slot" :class="[props.missing ? 'is-missing' : `is-${props.state}`, { 'is-required': props.required }]" role="group" :aria-labelledby="`${uid}-n`">
    <div class="hb-slot-in">
    <div class="hb-slot-id">
      <span :id="`${uid}-n`" class="hb-slot-name">{{ props.label }}</span>
      <span v-if="props.role" class="hb-slot-role">{{ props.role }}</span>
    </div>
    <div v-if="props.missing" class="hb-slot-mid">
      <div class="hb-slot-row">
        <p class="hb-slot-fault" role="alert">{{ props.missing }}</p>
        <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('remove')">remove<span class="hb-sr">, {{ props.label }}</span></button>
      </div>
      <span class="hb-slot-meta">{{ props.required ? 'required' : 'optional' }}</span>
    </div>
    <div v-else class="hb-slot-mid">
      <div class="hb-slot-row">
        <label class="hb-slot-pick">
          <span class="hb-sr">model for {{ props.label }}</span>
          <select v-model="value" class="hb-select" :disabled="props.state === 'loading'">
            <option v-for="o in props.options" :key="o.value" :value="o.value" :disabled="!!o.disabled">{{ optionText(o) }}</option>
          </select>
        </label>
        <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" :disabled="props.state === 'loading' || !pick || !!pick.disabled" @click="load">
          {{ button }}<span class="hb-sr">, {{ props.label }}</span>
        </button>
      </div>
      <span class="hb-slot-meta">{{ meta }}</span>
      <div
        v-if="props.state === 'loading'"
        class="hb-slot-bar"
        :class="{ 'is-busy': props.pct === null }"
        role="progressbar"
        :aria-label="props.label"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="props.pct === null ? undefined : Math.floor(props.pct * 100)"
      ><i :style="{ width: (props.pct === null ? 30 : props.pct * 100) + '%' }" /></div>
      <p v-if="props.state === 'fault' && props.fault" class="hb-slot-fault" role="alert">{{ props.fault }}</p>
    </div>
    <span class="hb-slot-stat"><span class="hb-slot-sq" aria-hidden="true" />{{ status }}</span>
    </div>
  </div>
</template>
