<script setup lang="ts">
// canvas and rail, after mask-studio-sam: the tool rail at the left, the
// canvas fills, the rack lists what was found.
import { ref } from 'vue'
import { HbButton, HbCanvasRail, HbIcon, HbKv, HbPanel } from '@hackbuild/ui'
import DemoBar from './DemoBar.vue'
import { useFakeLoad } from './useFakeLoad'
import { maskRows } from '../../fixtures/picker'

const { rows, load } = useFakeLoad(maskRows)
const chosen = ref('cut-s')
const tabs = [{ id: 'found', label: 'found' }, { id: 'mask', label: 'mask' }, { id: 'view', label: 'view' }]
const tools = [
  { id: 'wand', label: 'wand', icon: 'wand' },
  { id: 'brush', label: 'brush', icon: 'brush' },
  { id: 'eraser', label: 'eraser', icon: 'eraser' },
  { id: 'lasso', label: 'lasso', icon: 'lasso' },
  { id: 'crosshairs', label: 'point', icon: 'crosshairs' },
] as const
const tool = ref<string>('wand')
const sample = ref(false)
</script>

<template>
  <HbCanvasRail :tabs="tabs" rack-label="cut out">
    <template #bar><DemoBar v-model="chosen" title="cut out" :rows="rows" @load="load" /></template>
    <template #tools>
      <button v-for="t in tools" :key="t.id" type="button" class="hb-iconbtn" :aria-label="t.label" :aria-pressed="tool === t.id" :title="t.label" @click="tool = t.id"><HbIcon :name="t.icon" :size="18" /></button>
    </template>
    <div v-if="!sample" class="hb-lay-empty">
      <span class="hb-lay-empty-name">drop an image</span>
      <p class="hb-lay-empty-note">press a thing to cut it out. the picture stays on this machine.</p>
      <div class="hb-lay-empty-acts">
        <HbButton variant="go">open an image</HbButton>
        <HbButton @click="sample = true">try a sample</HbButton>
      </div>
    </div>
    <svg v-else viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" role="img" aria-label="sample: a cup on a table">
      <rect width="800" height="600" fill="#efe9db" /><rect y="420" width="800" height="180" fill="#e8e0d0" />
      <path d="M330 260 h140 v150 a20 20 0 0 1 -20 20 h-100 a20 20 0 0 1 -20 -20 Z" fill="rgba(254,3,134,.35)" stroke="#1a1a1a" stroke-width="3" />
    </svg>
    <template #tab-found>
      <HbPanel heading="found" head="instrument"><HbKv v-if="sample" label="cup" value="94%" /><p v-else class="hb-lay-empty-note">nothing yet. open an image or try the sample.</p></HbPanel>
    </template>
    <template #tab-mask><HbPanel heading="mask" head="instrument"><HbKv label="tool" :value="tool" /></HbPanel></template>
    <template #tab-view><HbPanel heading="view" head="instrument"><HbKv label="zoom" value="fit" /></HbPanel></template>
    <template #detail><p class="hb-fixture">fixture: the sample is a drawing and the score is made up.</p></template>
  </HbCanvasRail>
</template>
