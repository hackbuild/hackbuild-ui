<script setup lang="ts">
import { computed, ref } from 'vue'

export interface HbTabOption {
  label: string
  value: string | number
}

interface Props {
  /** Three to eight destinations, nothing else in the strip. */
  tabs: Array<HbTabOption | string>
  /** Accessible name of the strip. */
  label?: string
  /** Ties each tab to its panel: tab `${idPrefix}-tab-${value}` controls
      `${idPrefix}-panel-${value}`. Give the panel that id, role="tabpanel"
      and aria-labelledby the tab id. */
  idPrefix?: string
}

const props = withDefaults(defineProps<Props>(), { label: undefined, idPrefix: '' })

const model = defineModel<string | number>()

const normalized = computed<HbTabOption[]>(() =>
  props.tabs.map((tab) => (typeof tab === 'object' ? tab : { label: tab, value: tab })),
)
const buttons = ref<HTMLButtonElement[]>([])
const current = computed(() => {
  const i = normalized.value.findIndex((t) => t.value === model.value)
  return i < 0 ? 0 : i
})

function onKey(event: KeyboardEvent, index: number) {
  const last = normalized.value.length - 1
  let next = -1
  if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
  else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = last
  if (next < 0) return
  event.preventDefault()
  model.value = normalized.value[next]!.value
  buttons.value[next]?.focus()
}
</script>

<template>
  <nav class="hb-tabs" role="tablist" :aria-label="props.label">
    <button
      v-for="(tab, index) in normalized"
      :id="props.idPrefix ? `${props.idPrefix}-tab-${tab.value}` : undefined"
      :key="tab.value"
      ref="buttons"
      type="button"
      role="tab"
      class="hb-tab"
      :aria-selected="model === tab.value"
      :aria-controls="props.idPrefix ? `${props.idPrefix}-panel-${tab.value}` : undefined"
      :tabindex="index === current ? 0 : -1"
      @click="model = tab.value"
      @keydown="onKey($event, index)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>
