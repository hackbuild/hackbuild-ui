<script setup lang="ts">
import { ref } from 'vue'
import { HbInstanceList, HbButton, type HbInstanceItem } from '@hackbuild/ui'
import { instanceColour } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

// Fixture rows. The last score is 1.01, as a decoder can return: it reads 100%.
const seed = (): HbInstanceItem[] => [0.94, 0.71, 0.88, 1.01].map((score, i) => ({ id: i + 1, colour: instanceColour(i), score, hidden: i === 1 }))
const items = ref<HbInstanceItem[]>(seed())
const selected = ref<string | number | null>(1)
const note = ref('')
function toggle(it: HbInstanceItem) { items.value = items.value.map((x) => (x.id === it.id ? { ...x, hidden: !x.hidden } : x)) }
function remove(it: HbInstanceItem) { items.value = items.value.filter((x) => x.id !== it.id) }
function merge() { note.value = `merged ${items.value.length} masks`; items.value = [{ id: 'merged', label: 'merged', colour: instanceColour(0), score: null }] }
const code = `<HbInstanceList :items="instances" v-model:selected="picked"
  @toggle="hide" @remove="drop" @merge="mergeAll" @clear="clearAll" />
// rows: { id, colour: instanceColour(i), label?, score?, hidden? }`
</script>

<template>
  <DemoSection title="Instance list" note="One row per mask, in its canvas colour. The score is clamped to 100 percent. Show or hide and delete show on hover or focus with a mouse and stay on screen on touch. Keys on a row: h hides, delete removes, arrows move." :code="code">
    <div class="demo-col" style="max-width: 360px">
      <HbInstanceList v-model:selected="selected" :items="items" @toggle="toggle" @remove="remove" @merge="merge" @clear="items = []" />
      <p class="hb-hint">{{ note || 'merge all joins every visible mask into one' }}</p>
      <div class="hb-acts"><HbButton size="sm" @click="items = seed(); note = ''">reset</HbButton></div>
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'items', type: '{id, colour, label?, score?, hidden?}[]' },
      { prop: 'v-model:selected', type: 'string | number | null' },
      { prop: 'empty / bare', type: 'string / boolean', notes: 'bare drops merge all and clear all' },
      { prop: 'emits', type: 'toggle, remove, merge, clear' },
    ]"
  />
</template>
