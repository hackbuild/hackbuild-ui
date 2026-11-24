<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HbSelect, { type HbSelectOption } from './HbSelect.vue'
import HbSwitch from './HbSwitch.vue'
import HbSeg, { type HbSegOption } from './HbSeg.vue'
import HbIcon from './HbIcon.vue'
import { rangeRow, type RangeRowHandle } from '../vanilla/settings'

export type HbParamValue = number | string | boolean

interface Props {
  /** Lowercase label in the 96 px column. */
  label: string
  /** range: slider plus a paired number. select, switch, seg, text: one control. */
  type?: 'range' | 'select' | 'switch' | 'seg' | 'text'
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
  /** One or two sentences under the row: what it does, what it costs. */
  help?: string
  /** A word beside the label: 'experimental', 'recommended'. */
  tag?: string
  /** When a change takes effect: 'next load'. Live when empty. */
  applies?: string
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
  help: '',
  tag: '',
  applies: '',
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

const row = ref<HTMLElement | null>(null)
let range: RangeRowHandle | null = null
function bind() {
  range?.dispose()
  range = null
  if (props.type !== 'range' || !row.value) return
  range = rangeRow(row.value, {
    onPreview(v) {
      model.value = v
      emit('touch', v)
    },
    onCommit(v) {
      model.value = v
      emit('commit', v)
    },
  })
}
onMounted(bind)
watch(() => props.type, () => queueMicrotask(bind))
watch(model, (v) => { if (range && range.value !== v) range.set(Number(v)) })
onBeforeUnmount(() => range?.dispose())

function onDiscrete(value: HbParamValue | undefined) {
  if (value === undefined) return
  model.value = value
  emit('commit', value)
}

function onText(event: Event) {
  onDiscrete((event.target as HTMLInputElement).value)
}

function reset() {
  if (props.defaultValue === undefined) return
  model.value = props.defaultValue
  emit('commit', props.defaultValue)
  emit('reset', props.defaultValue)
}
</script>

<template>
  <!-- One parameter: label with its tag and reset mark, the control, the
       paired number and unit, then the line that says what it does. -->
  <div ref="row" class="hb-prow" :class="{ 'is-disabled': props.disabled, 'has-help': props.help }">
    <span class="hb-prow-label">
      <span class="hb-prow-name">{{ props.label }}</span>
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
      <input
        v-if="props.type === 'range'"
        class="hb-range"
        type="range"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        :value="Number(model)"
        :disabled="props.disabled"
        :aria-label="props.label"
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
      <input
        v-else-if="props.type === 'text'"
        class="hb-input"
        type="text"
        :value="String(model)"
        :disabled="props.disabled"
        :aria-label="props.label"
        @change="onText"
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
    />
    <span v-if="props.unit" class="hb-prow-unit">{{ props.unit }}</span>
    <span v-if="props.tag || props.applies" class="hb-prow-tags">
      <span v-if="props.tag" class="hb-prow-tag">{{ props.tag }}</span>
      <span v-if="props.applies" class="hb-prow-tag is-applies">{{ props.applies }}</span>
    </span>
    <span v-if="props.help" class="hb-prow-help">{{ props.help }}</span>
    <span v-if="props.disabled && props.reason" class="hb-prow-why">{{ props.reason }}</span>
  </div>
</template>
