<script setup lang="ts">
export interface HbModelRow {
  id: string
  label: string
  /** Size with its source word: '17.7 MB, vendor'. */
  size: string
  /** 'webgpu or wasm'. */
  devices?: string
  /** 'weights Apache-2.0, commercial use allowed'. */
  licence: string
  /** Why this device cannot run it, or null when it can. */
  disabled?: string | null
  /** First rung this device would try: 'webgpu q4f16'. */
  first?: string | null
}

interface Props {
  models: HbModelRow[]
  label?: string
  empty?: string
}

const props = withDefaults(defineProps<Props>(), { label: 'models', empty: 'no models registered.' })

const selected = defineModel<string | null>({ default: null })

const emit = defineEmits<{ pick: [id: string] }>()

function pick(id: string) {
  selected.value = id
  emit('pick', id)
}
</script>

<template>
  <ul class="hb-models" role="listbox" :aria-label="props.label">
    <li
      v-for="m in props.models"
      :key="m.id"
      class="hb-model"
      role="option"
      :aria-selected="m.id === selected"
      :aria-disabled="!!m.disabled"
    >
      <span class="hb-model-name">{{ m.label }}</span>
      <button
        type="button"
        class="hb-btn hb-btn-2 hb-btn-sm"
        :disabled="!!m.disabled"
        :aria-label="`${m.id === selected ? 'in use' : 'use'} ${m.label}`"
        @click="pick(m.id)"
      >{{ m.id === selected ? 'in use' : 'use' }}</button>
      <span class="hb-model-meta">{{ m.size }}<template v-if="m.devices">. {{ m.devices }}</template><template v-if="m.first">, first try {{ m.first }}</template></span>
      <span class="hb-model-lic">{{ m.licence }}</span>
      <span v-if="m.disabled" class="hb-model-why">{{ m.disabled }}</span>
    </li>
    <li v-if="!props.models.length" class="hb-model"><span class="hb-model-meta">{{ props.empty }}</span></li>
  </ul>
</template>
