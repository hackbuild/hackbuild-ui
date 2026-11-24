<script setup lang="ts">
import { ref } from 'vue'
import { HbChipGroup, HbNameHud, HbStageOverlay, HbTag, type HudState } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { CHAR_NAME } from '../fixtures/stage'

const state = ref<HudState>('talking')
const states: HudState[] = ['idle', 'thinking', 'listening', 'talking']
const code = `<HbNameHud name="rook" :state="state">
  <HbTag v-if="camLive">camera on</HbTag>
</HbNameHud>`
</script>

<template>
  <DemoSection title="Name hud" note="The name and one state word from the signal that drives the mouth and the mic gate. Talking is the pink one. A live camera or mic says so beside it." :code="code">
    <div class="demo-col">
      <HbStageOverlay>
        <div style="height: 160px" aria-hidden="true" />
        <template #tl>
          <HbNameHud :name="CHAR_NAME" :state="state"><HbTag v-if="state === 'listening'">mic live</HbTag><HbTag>camera on</HbTag></HbNameHud>
        </template>
      </HbStageOverlay>
      <HbChipGroup v-model="state" :options="states" label="state" />
      <div class="demo-grid">
        <HbStageOverlay v-for="s in states" :key="s" quiet>
          <div style="height: 64px" aria-hidden="true" />
          <template #tl><HbNameHud :name="CHAR_NAME" :state="s" /></template>
        </HbStageOverlay>
      </div>
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'name', type: 'string' },
      { prop: 'state', type: `'idle' | 'thinking' | 'talking' | 'listening'`, default: 'idle' },
      { prop: 'stateText', type: 'string', notes: 'replaces the word' },
      { prop: 'slots', type: 'default: privacy chips' },
    ]"
  />
</template>
