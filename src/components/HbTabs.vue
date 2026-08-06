<script setup lang="ts">
import { computed } from 'vue'

export interface HbTabOption {
  label: string
  value: string | number
}

interface Props {
  /** Three to eight destinations, nothing else in the strip. */
  tabs: Array<HbTabOption | string>
}

const props = defineProps<Props>()

const model = defineModel<string | number>()

const normalized = computed<HbTabOption[]>(() =>
  props.tabs.map((tab) => (typeof tab === 'object' ? tab : { label: tab, value: tab })),
)
</script>

<template>
  <nav class="hb-tabs" role="tablist">
    <button
      v-for="tab in normalized"
      :key="tab.value"
      type="button"
      role="tab"
      class="hb-tab"
      :aria-selected="model === tab.value"
      @click="model = tab.value"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>
