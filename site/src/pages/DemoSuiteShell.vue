<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  HbActivity, HbAppShell, HbDrawer, HbHeader, HbPalette, HbPills, HbStatusBar, HbSuiteNav,
  HbTag, HbViewport, HbWorkspaceMenu,
} from '@hackbuild/ui'
import { activity } from '@hackbuild/ui/vanilla'
import { suiteGroups, suiteStatus } from '../fixtures/suite'

// The suite header strips on fixtures: workspace and level, status pills,
// the local only tag, the activity line, then groups, tools and verbs.
const route = ref('vision')
const level = ref('guided')
const store = activity()
store.set('weights', 'loading sample model (fixture)', 0.42, () => {})
store.set('cache', 'checking the weights cache', null)
onBeforeUnmount(() => store.dispose())
const sections = [{ label: 'tools', items: suiteGroups.flatMap((g) => g.tools.map((t) => ({ key: t.key, label: t.label, hint: g.label }))) }]
const logOpen = ref(false)
const cells = computed(() => [
  { key: 'job', label: 'job', value: 'sample 42%' },
  { key: 'device', label: 'device', value: 'webgpu' },
  { key: 'level', label: 'level', value: level.value, priority: 2 as const },
  { key: 'stored', label: 'stored', value: '1.2 gb', priority: 3 as const },
])
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
      <p class="hb-fixture is-strip"><b>fixture</b> sample data: states, names and numbers are made up. no model loads here.</p>
    </template>
    <template #tabs>
      <HbSuiteNav v-model:route="route" :groups="suiteGroups" keys />
    </template>
    <HbPalette :sections="sections" @run="(k) => (route = k)" />
    <HbViewport :label="tool?.label ?? 'tool'" cover-title="fixture stage" cover-note="no model runs in this demo." />
    <template #statusbar>
      <HbStatusBar :cells="cells" action="open the event log" @press="logOpen = true" />
    </template>
  </HbAppShell>
  <HbDrawer v-model="logOpen" side="auto" title="event log">
    <p style="margin: 0">fixture: no events in this demo.</p>
  </HbDrawer>
</template>
