<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  HbActivity, HbAppShell, HbButton, HbHeader, HbPalette, HbPills, HbStatusBar, HbSuiteNav,
  HbTag, HbViewport, HbWorkspaceMenu,
} from '@hackbuild/ui'
import { activity } from '@hackbuild/ui/vanilla'
import { suiteGroups, suiteStatus } from '../fixtures/suite'

// The suite header strips on fixtures: workspace and level, status pills,
// the local only tag, the activity line, then groups, tools and verbs.
const route = ref('vision')
const level = ref('guided')
const store = activity()
store.set('weights', 'loading florence 2 base', 0.42, () => {})
store.set('cache', 'checking the weights cache', null)
onBeforeUnmount(() => store.dispose())
const sections = [{ label: 'tools', items: suiteGroups.flatMap((g) => g.tools.map((t) => ({ key: t.key, label: t.label, hint: g.label }))) }]
const tool = computed(() => suiteGroups.flatMap((g) => g.tools).find((t) => t.key === route.value))
</script>

<template>
  <HbAppShell>
    <template #header>
      <HbHeader title="suite" accent=".">
        <HbWorkspaceMenu
          v-model:level="level"
          name="dog walk"
          current="a"
          :projects="[{ id: 'a', name: 'dog walk' }, { id: 'b', name: 'relief for the lid', updated: '2 h ago' }]"
        />
        <HbPills :items="suiteStatus" />
        <HbActivity :source="store" />
        <HbTag>local only</HbTag>
        <a class="hb-link" href="#/demos">exit demo</a>
      </HbHeader>
    </template>
    <template #tabs>
      <HbSuiteNav v-model:route="route" :groups="suiteGroups" keys>
        <template #toolbar>
          <span class="hb-spacer" />
          <HbButton size="sm">run</HbButton>
        </template>
      </HbSuiteNav>
    </template>
    <HbPalette :sections="sections" @run="(k) => (route = k)" />
    <HbViewport :label="tool?.label ?? 'tool'" cover-title="fixture stage" cover-note="no model runs in this demo." />
    <template #statusbar>
      <HbStatusBar><span>job <b>weights 42%</b></span><span>device <b>webgpu</b></span><span>level <b>{{ level }}</b></span></HbStatusBar>
    </template>
  </HbAppShell>
</template>
