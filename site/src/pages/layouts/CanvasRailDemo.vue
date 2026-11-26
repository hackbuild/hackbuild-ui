<script setup lang="ts">
// canvas and rail, after mask-studio-sam: the tool rail at the left, the
// canvas fills, the rack lists what was found.
import { ref } from 'vue'
import { HbBarPage, HbButton, HbCanvasRail, HbKv, HbPanel, HbToolRail, type HbRailTool } from '@hackbuild/ui'
import { MASK_TOOLS } from '@hackbuild/ui/vanilla'
import DemoBar from './DemoBar.vue'
import { useFakeLoad } from './useFakeLoad'
import { maskRows } from '../../fixtures/picker'

const { rows, load } = useFakeLoad(maskRows)
const chosen = ref('cut-s')
const tabs = [{ id: 'found', label: 'found' }, { id: 'mask', label: 'mask' }, { id: 'view', label: 'view' }]
// the mask studio's tools: six places in the rail, the four shapes share one
const tools: HbRailTool[] = MASK_TOOLS.map((t) => ({ id: t.id, label: t.label, icon: t.icon, key: t.key, hint: t.hint, group: t.group }))
const tool = ref<string>('wand')
const sample = ref(false)
</script>

<template>
  <HbBarPage>
    <template #bar>
      <DemoBar v-model="chosen" title="cut out" :rows="rows" @load="load" />
    </template>
    <HbCanvasRail :tabs="tabs" rack-label="cut out">
      <template #tools>
        <HbToolRail v-model="tool" :tools="tools" :keys="false" :show-hint="false" label="mask tools" />
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
  </HbBarPage>
</template>
