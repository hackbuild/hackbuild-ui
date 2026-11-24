<script setup lang="ts">
import { ref } from 'vue'
import { HbConversationList, useToast, type HbConversation } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const { toast } = useToast()
const NOW = Date.UTC(2026, 10, 24, 12, 0)
const items = ref<HbConversation[]>([
  { id: 'a', title: 'pico pinout for the servo board', updated: NOW - 4 * 60e3, count: 12 },
  { id: 'b', title: 'crimping 22 awg', updated: NOW - 3 * 3600e3, count: 6 },
  { id: 'c', title: 'a very long chat title that will not fit in the rail at any width', updated: NOW - 2 * 86400e3, count: 31 },
])
const current = ref('a')
const docs = ref<HbConversation[]>([
  { id: 'w', title: 'wiring', kind: 'sketch', updated: NOW - 9 * 60e3 },
  { id: 'p', title: 'pico case lid', kind: 'part', updated: NOW - 5 * 3600e3 },
  { id: 'n', title: 'bring up notes', kind: 'note', updated: NOW - 3 * 86400e3 },
])
const picked = ref<string | null>('w')
const docCode = `<HbConversationList noun="document" :items="docs" :current="picked"
  :duplicable="false" :exportable="false" :importable="false" :creatable="false"
  note="" @open="(id) => (picked = id)" @rename="rename" @remove="remove" />`
let n = 0
const code = `<HbConversationList :items="sessions" :current="active" @open="openChat" @new="newChat"
  @rename="rename" @duplicate="duplicate" @remove="remove" @export="exportChat" @import="importChat" />`
</script>

<template>
  <DemoSection
    title="Chats rail"
    note="New chat at the head. Each row: title, when and how many messages; rename in place, duplicate, delete on a second press. Up and down move between chats. The foot says where chats live. In the suite it sits in a left drawer."
    :code="code"
  >
    <div style="max-width: 320px; height: 420px; display: flex">
      <HbConversationList
        style="flex: 1"
        :items="items"
        :current="current"
        :now="NOW"
        @open="(id) => (current = id)"
        @new="items.unshift({ id: `n${++n}`, title: 'new chat', updated: NOW, count: 0 }); current = `n${n}`"
        @rename="(id, t) => (items.find((c) => c.id === id)!.title = t)"
        @duplicate="(id) => { const c = items.find((x) => x.id === id)!; items.unshift({ ...c, id: `d${++n}`, title: `${c.title} (copy)`, updated: NOW }) }"
        @remove="(id) => (items = items.filter((c) => c.id !== id))"
        @export="toast('exported as .hbchat.json', { kind: 'ok' })"
        @import="toast('drop a .hbchat.json file')"
      />
    </div>
  </DemoSection>

  <DemoSection
    title="Documents"
    note="The same rail for any saved thing. noun sets every label: the head, the empty line, the rename box, new. Rows show kind and when; count is left out when the item has none. Click or Enter picks a row and sets current; rename in place, delete on a second press. Row actions are always drawn, never behind a hover; on a focused row F2 renames and Delete arms delete. 44 px rows on a touch screen."
    :code="docCode"
  >
    <div style="max-width: 360px; height: 300px; display: flex">
      <HbConversationList
        style="flex: 1"
        noun="document"
        :items="docs"
        :current="picked"
        :now="NOW"
        :duplicable="false"
        :exportable="false"
        :importable="false"
        :creatable="false"
        note=""
        @open="(id) => (picked = id)"
        @rename="(id, t) => (docs.find((c) => c.id === id)!.title = t)"
        @remove="(id) => (docs = docs.filter((c) => c.id !== id))"
      />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'items', type: '{id, title, updated, count?, kind?}[]' },
      { prop: 'current / busy', type: 'string | null / boolean' },
      { prop: 'noun / nouns', type: 'string', default: 'chat / noun + s', notes: 'every label reads from it' },
      { prop: 'title / note', type: 'string', default: 'plural noun / stored in this browser only', notes: 'empty note hides it' },
      { prop: 'creatable / duplicable / exportable / importable', type: 'boolean', default: 'true' },
      { prop: 'newKey', type: 'string', default: 'ctrl+shift+n for chats', notes: 'named on the new button' },
      { prop: 'emits', type: 'open, new, rename, duplicate, remove, export, import' },
    ]"
  />
</template>
