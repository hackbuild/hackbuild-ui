<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { HbTable, type HbTableColumn } from '@hackbuild/ui'

/** One part's api as tools/catalogue.mjs reads it from the component file. */
interface Part {
  props: Array<{ name: string; type: string; required: boolean; default?: string; doc?: string }>
  models: Array<{ name: string; type: string; doc?: string }>
  events: Array<{ name: string; args: string; doc?: string }>
  slots: string[]
}

const props = defineProps<{ name: string; group?: string; blurb: string }>()

const part = ref<Part | null>(null)
watchEffect(async () => {
  const name = props.name
  const data = (await import('../catalogue.json')).default as { parts: Record<string, Part> }
  if (name === props.name) part.value = data.parts[name] ?? null
})

const propCols: HbTableColumn[] = [
  { key: 'name', label: 'prop' },
  { key: 'type', label: 'type' },
  { key: 'default', label: 'default' },
  { key: 'doc', label: 'notes' },
]
const eventCols: HbTableColumn[] = [
  { key: 'name', label: 'event' },
  { key: 'args', label: 'payload' },
  { key: 'doc', label: 'notes' },
]
const propRows = computed(() => [
  ...(part.value?.models ?? []).map((m) => ({ name: m.name, type: m.type, default: '', doc: m.doc ?? 'two way state' })),
  ...(part.value?.props ?? []).map((p) => ({ name: p.required ? `${p.name} (required)` : p.name, type: p.type, default: p.default ?? '', doc: p.doc ?? '' })),
])
</script>

<template>
  <section class="demo-col" aria-label="api">
    <div>
      <div class="hb-label">when to use</div>
      <p style="margin-top: 4px">{{ props.blurb }}<template v-if="props.group">. layout: {{ props.group }}.</template></p>
    </div>
    <template v-if="part">
      <div v-if="propRows.length">
        <div class="hb-label" style="margin-bottom: 6px">props and models</div>
        <HbTable :columns="propCols" :rows="propRows" />
      </div>
      <div v-if="part.events.length">
        <div class="hb-label" style="margin-bottom: 6px">events</div>
        <HbTable :columns="eventCols" :rows="part.events" />
      </div>
      <div v-if="part.slots.length">
        <div class="hb-label">slots</div>
        <p style="margin-top: 4px"><code v-for="(s, i) in part.slots" :key="s">{{ s }}{{ i < part.slots.length - 1 ? ', ' : '' }}</code></p>
      </div>
    </template>
  </section>
</template>
