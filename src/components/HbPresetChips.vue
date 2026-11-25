<script setup lang="ts">
import { computed } from 'vue'
import { matchPreset, type SettingPreset, type SettingValues } from '../vanilla/settings'
import { noteOnce } from '../utils/note'

noteOnce('HbPresetChips', 'HbPresetChips is merged since 0.10.0 and goes in 0.11.0; use HbChipGroup')

interface Props {
  presets: SettingPreset[]
  /** Accessible name of the row. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), { label: 'presets' })

/** The settings the presets write into. */
const model = defineModel<SettingValues>({ required: true })

const emit = defineEmits<{
  /** A preset was applied, by label. */
  apply: [label: string]
}>()

const on = computed(() => matchPreset(props.presets, model.value))
const hint = computed(() => (on.value < 0 ? 'custom: no preset matches every value' : props.presets[on.value].hint ?? ''))

function apply(p: SettingPreset) {
  model.value = { ...model.value, ...p.values }
  emit('apply', p.label)
}
</script>

<template>
  <!-- One press sets every dial a preset names. The chip whose values all
       hold is on; any dial moved off it reads custom. -->
  <div class="hb-presets">
    <div class="hb-presets-row" role="group" :aria-label="props.label">
      <button
        v-for="(p, i) in props.presets"
        :key="p.label"
        type="button"
        class="hb-chip is-toggle"
        :class="{ 'is-on': i === on }"
        :aria-pressed="i === on"
        @click="apply(p)"
      >{{ p.label }}</button>
    </div>
    <p v-if="hint" class="hb-presets-hint" aria-live="polite">{{ hint }}</p>
  </div>
</template>
