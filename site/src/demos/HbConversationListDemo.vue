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

  <PropsTable
    :rows="[
      { prop: 'items', type: '{id, title, updated, count}[]' },
      { prop: 'current / busy', type: 'string | null / boolean' },
      { prop: 'title / note / exportable', type: 'string / string / boolean' },
      { prop: 'emits', type: 'open, new, rename, duplicate, remove, export, import' },
    ]"
  />
</template>
