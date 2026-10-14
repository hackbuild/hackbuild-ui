<script setup lang="ts">
import { computed } from 'vue'
import HbSlider from './HbSlider.vue'
import HbSelect, { type HbSelectOption } from './HbSelect.vue'
import HbSwitch from './HbSwitch.vue'
import HbSeg, { type HbSegOption } from './HbSeg.vue'
import HbIcon from './HbIcon.vue'

export type HbParamValue = number | string | boolean

interface Props {
  /** Lowercase label in the 96 px column. */
  label: string
  /** range: slider plus a paired number. select, switch, seg: one control. */
  type?: 'range' | 'select' | 'switch' | 'seg'
  min?: number
  max?: number
  step?: number
  /** Unit after the number, mm, deg, %. */
  unit?: string
  /** Options for select and seg. */
  options?: Array<HbSelectOption | HbSegOption | string>
  /** The value reset returns to. Without it the row shows no reset mark. */
  defaultValue?: HbParamValue
  disabled?: boolean
  /** Why the row is disabled, shown under it. */
  reason?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'range',
  min: 0,
  max: 100,
  step: 1,
  unit: '',
  options: () => [],
  defaultValue: undefined,
  disabled: false,
  reason: '',
})

const model = defineModel<HbParamValue>({ required: true })

const emit = defineEmits<{
  /** A range drag in progress: preview only, no rebuild. */
  touch: [value: HbParamValue]
  /** The value settled: rebuild. */
  commit: [value: HbParamValue]
  /** The reset mark returned the value to its default. */
  reset: [value: HbParamValue]
}>()

const changed = computed(() => props.defaultValue !== undefined && model.value !== props.defaultValue)

const segOptions = computed(() => props.options as Array<HbSegOption | string>)
const selectOptions = computed(() => props.options as Array<HbSelectOption | string>)

function decimals(step: number): number {
  const text = String(step)
  const dot = text.indexOf('.')
  return dot < 0 ? 0 : text.length - dot - 1
}

function clamp(value: number): number {
  const bounded = Math.min(props.max, Math.max(props.min, value))
  return Number(bounded.toFixed(decimals(props.step)))
}

function onTouch(value: number) {
  model.value = value
  emit('touch', value)
}

function onRangeChange() {
  emit('commit', model.value)
}

function onNumber(event: Event) {
  const input = event.target as HTMLInputElement
  const parsed = Number.parseFloat(input.value)
  if (Number.isNaN(parsed)) {
    input.value = String(model.value)
    return
  }
  const value = clamp(parsed)
  input.value = String(value)
  model.value = value
  emit('commit', value)
}

function onDiscrete(value: HbParamValue | undefined) {
  if (value === undefined) return
  model.value = value
  emit('commit', value)
}

function reset() {
  if (props.defaultValue === undefined) return
  model.value = props.defaultValue
  emit('commit', props.defaultValue)
  emit('reset', props.defaultValue)
}
</script>

<template>
  <!-- One parameter: label with its reset mark, control, paired number, unit. -->
  <div class="hb-prow" :class="{ 'is-disabled': props.disabled }">
    <span class="hb-prow-label">
      {{ props.label }}
      <button
        v-if="props.defaultValue !== undefined"
        type="button"
        class="hb-prow-reset"
        :hidden="!changed"
        :aria-label="`reset ${props.label} to ${props.defaultValue}${props.unit ? ` ${props.unit}` : ''}`"
        :title="`reset to ${props.defaultValue}`"
        :disabled="props.disabled"
        @click="reset"
      >
        <HbIcon name="undo" :size="11" />
      </button>
    </span>
    <div class="hb-prow-ctl">
      <HbSlider
        v-if="props.type === 'range'"
        :label="props.label"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        :unit="props.unit"
        :disabled="props.disabled"
        :model-value="Number(model)"
        @update:model-value="onTouch"
        @change="onRangeChange"
      />
      <HbSelect
        v-else-if="props.type === 'select'"
        :options="selectOptions"
        :model-value="model as string | number"
        :disabled="props.disabled"
        :aria-label="props.label"
        @update:model-value="onDiscrete"
      />
      <HbSwitch
        v-else-if="props.type === 'switch'"
        :label="props.label"
        :disabled="props.disabled"
        :model-value="Boolean(model)"
        @update:model-value="onDiscrete"
      />
      <HbSeg
        v-else
        :options="segOptions"
        :model-value="model as string | number"
        :aria-label="props.label"
        @update:model-value="onDiscrete"
      />
    </div>
    <input
      v-if="props.type === 'range'"
      class="hb-input hb-prow-num"
      type="number"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      :value="model"
      :disabled="props.disabled"
      :aria-label="`${props.label} value${props.unit ? `, ${props.unit}` : ''}`"
      @change="onNumber"
    />
    <span v-if="props.unit" class="hb-prow-unit">{{ props.unit }}</span>
    <span v-if="props.disabled && props.reason" class="hb-prow-why">{{ props.reason }}</span>
  </div>
</template>
