<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  min?: number
  max?: number
  step?: number
  /** Appended to the readout, for example dB or MHz. */
  unit?: string
  /** Custom readout formatter. */
  format?: (value: number) => string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
})

const model = defineModel<number>({ default: 0 })

const emit = defineEmits<{
  /** The value settled: released, or set from the keyboard. v-model
      follows the drag for a preview; rebuild on this. */
  commit: [value: number]
}>()

const readout = computed(() => {
  const text = props.format ? props.format(model.value) : String(model.value)
  return props.unit ? `${text} ${props.unit}` : text
})
</script>

<template>
  <!-- Label, track, live value. The default control of every panel. -->
  <div class="hb-slider">
    <span class="hb-label">{{ props.label }}</span>
    <span class="hb-readout">{{ readout }}</span>
    <input
      v-model.number="model"
      type="range"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      :aria-label="props.label"
      :disabled="props.disabled"
      @change="emit('commit', model)"
    />
  </div>
</template>
