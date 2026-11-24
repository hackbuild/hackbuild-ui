<script setup lang="ts">
import { ref } from 'vue'
import { HbChip, HbHeader, HbWorkspaceMenu } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const level = ref('guided')
const busy = ref(false)
const last = ref('none yet')
const projects = [
  { id: 'a', name: 'dog walk', updated: 'now' },
  { id: 'b', name: 'relief for the lid', updated: '2 h ago' },
  { id: 'c', name: 'transcripts, march', updated: '3 days ago' },
]
const log = (what: string) => (last.value = what)

const code = `<HbHeader title="suite">
  <HbWorkspaceMenu name="dog walk" :projects="projects" current="a" v-model:level="level"
    :busy="busy" @new="..." @open="(id) => ..." @export="..." @delete="...">
    <template #reason>importing, the actions wait</template>
  </HbWorkspaceMenu>
</HbHeader>`
</script>

<template>
  <DemoSection
    title="Workspace and level"
    note="The workspace name opens its menu; the level toggle sits beside it from 641 px. On a phone one menu button opens a sheet with the name, a level button that cycles guided, standard, expert, the actions and the other workspaces. While busy every action waits and the reason shows."
    :code="code"
  >
    <div style="margin: -16px">
      <HbHeader title="suite" accent=".">
        <HbWorkspaceMenu
          v-model:level="level"
          name="dog walk"
          :projects="projects"
          current="a"
          :busy="busy"
          @new="log('new')"
          @open="(id) => log(`open ${id}`)"
          @rename="log('rename')"
          @duplicate="log('duplicate')"
          @export="log('export')"
          @import="log('import')"
          @delete="log('delete')"
        >
          <template #reason>importing, the actions wait</template>
        </HbWorkspaceMenu>
      </HbHeader>
    </div>
    <div class="demo-row" style="margin-top: 24px">
      <HbChip v-model="busy" toggle>busy</HbChip>
      <span>level: <code>{{ level }}</code></span>
      <span>last: <code>{{ last }}</code></span>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'name', type: 'string', notes: 'the open workspace' },
      { prop: 'projects', type: 'HbWorkspaceProject[]', default: '[]', notes: '{ id, name, updated }' },
      { prop: 'current', type: 'string', notes: 'id of the open one, left out of the list' },
      { prop: 'busy', type: 'boolean', default: 'false', notes: 'actions wait; slot reason says why' },
      { prop: 'v-model:level', type: 'string', notes: 'unbound shows no level control' },
      { prop: 'levels', type: 'string[]', default: 'guided, standard, expert' },
      { prop: 'emits', type: 'new, open(id), rename, duplicate, export, import, delete' },
    ]"
  />
</template>
