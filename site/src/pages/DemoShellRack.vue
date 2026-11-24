<script setup lang="ts">
import { ref } from 'vue'
import {
  HbAppShell, HbButton, HbHeader, HbKv, HbPanel, HbPill, HbSeg, HbSlider,
  HbStatusBar, HbSwitch, HbTabs, HbToolbar, HbViewport, usePersisted, type HbAppMode,
} from '@hackbuild/ui'

// Stage plus rack (P-SHELL-3): the world stays in view and every
// inspector is one tab away. Fixture data only, no model runs.
const mode = usePersisted<HbAppMode>('site-demo-rack-mode', 'split')
const rack = ref(false)
const tab = ref<string | number>('talk')
const tabs = ['talk', 'mind', 'eyes', 'memory', 'body', 'brain', 'voice'].map((t) => ({ label: t, value: t }))
const curiosity = ref(62)
const follow = ref(true)
</script>

<template>
  <HbAppShell v-model:mode="mode" v-model:rail-open="rack" recipe="rack" rail-label="rack">
    <template #header>
      <HbHeader title="room" accent="." tagline="a dog, a yard and seven inspectors" tagline-kind="tool">
        <a class="hb-link" href="#/demos">exit demo</a>
        <HbPill status="ok">brain</HbPill>
        <HbPill status="warn">eyes</HbPill>
      </HbHeader>
    </template>
    <template #toolbar>
      <HbToolbar>
        <HbSeg v-model="mode" :options="[{ label: 'stage', value: 'stage' }, { label: 'split', value: 'split' }]" />
        <span class="hb-spacer" />
        <HbButton size="sm" variant="secondary">reset the room</HbButton>
      </HbToolbar>
    </template>

    <HbViewport label="the yard" cover-title="fixture stage" cover-note="no scene runs in this demo; the stage keeps its size and place." />

    <template #rail>
      <HbTabs v-model="tab" :tabs="tabs" label="rack" persist-key="site-demo-rack" overflow="collapse">
        <template #default="{ value }">
          <div class="demo-rack-body">
            <HbPanel v-if="value === 'talk'" heading="talk" sunk>
              <HbKv label="last heard" value="sit" />
              <HbKv label="reply" value="tail wag, sit" />
            </HbPanel>
            <HbPanel v-else-if="value === 'mind'" heading="drives" sunk>
              <HbSlider v-model="curiosity" label="curiosity" :min="0" :max="100" />
              <label class="hb-check"><HbSwitch v-model="follow" label="follow the ball" /> follow the ball</label>
            </HbPanel>
            <HbPanel v-else :heading="String(value)" sunk>
              <p style="margin: 0">nothing here yet. wake the dog first.</p>
            </HbPanel>
          </div>
        </template>
      </HbTabs>
    </template>

    <template #dock="{ sheet, openRail }">
      <HbButton>throw the ball</HbButton>
      <span class="hb-spacer" />
      <HbButton v-if="sheet" variant="secondary" @click="openRail">rack</HbButton>
    </template>

    <template #statusbar>
      <HbStatusBar>
        <span>job <b>idle</b></span>
        <span>device <b>webgpu</b></span>
        <span>fps <b>60</b></span>
      </HbStatusBar>
    </template>
  </HbAppShell>
</template>
