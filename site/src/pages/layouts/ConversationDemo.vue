<script setup lang="ts">
// conversation, after clevis: the chat list rail at the left, the
// conversation fills with its empty state, the composer centred under it.
// No rack: clevis has none until persona or memory exist. Under 901 px the
// chat list opens as a drawer from the bar. The reply is scripted.
import { ref } from 'vue'
import { HbBarPage, HbButton, HbConversationLayout, HbIcon, HbMessage } from '@hackbuild/ui'
import DemoBar from './DemoBar.vue'
import { useFakeLoad } from './useFakeLoad'
import { chatRows } from '../../fixtures/picker'

const { rows, load } = useFakeLoad(chatRows)
const chosen = ref('steady')
const listOpen = ref(false)
const draft = ref('')
const msgs = ref<Array<{ id: number; who: 'user' | 'assistant'; text: string }>>([])
const chats = ref<string[]>([])
function send() {
  const text = draft.value.trim()
  if (!text) return
  if (!msgs.value.length) chats.value = [text.slice(0, 40), ...chats.value]
  msgs.value = [...msgs.value, { id: msgs.value.length + 1, who: 'user', text }, { id: msgs.value.length + 2, who: 'assistant', text: 'this needs a model. press the chip in the bar to pick one.' }]
  draft.value = ''
}
function fresh() {
  msgs.value = []
}
</script>

<template>
  <HbBarPage>
    <template #bar>
      <DemoBar v-model="chosen" title="chat" :rows="rows" @load="load">
        <button type="button" class="hb-iconbtn hb-lay-listbtn" aria-label="chats" @click="listOpen = true"><HbIcon name="menu" :size="16" /></button>
      </DemoBar>
    </template>
    <HbConversationLayout v-model:list-open="listOpen" :empty="!msgs.length" empty-name="what are we working on?" empty-note="say what you need. the chat stays in this browser and nothing is sent to a server.">
      <template #list-head><button type="button" class="hb-iconbtn" aria-label="new chat" @click="fresh"><HbIcon name="plus" :size="14" /></button></template>
      <template #list>
        <div style="padding:10px;display:flex;flex-direction:column;gap:8px">
          <p v-if="!chats.length" class="hb-lay-empty-note" style="margin:6px 2px">no chats yet.</p>
          <HbButton v-for="(c, i) in chats" :key="i" block>{{ c }}</HbButton>
        </div>
      </template>
      <HbMessage v-for="m in msgs" :key="m.id" :who="m.who" :text="m.text" :actions="[]" />
      <template #composer>
        <form class="hb-convbox" @submit.prevent="send">
          <textarea v-model="draft" rows="1" aria-label="message" placeholder="say something" @keydown.enter.exact.prevent="send" />
          <button type="submit" class="hb-btn hb-btn-go">send</button>
        </form>
      </template>
    </HbConversationLayout>
  </HbBarPage>
</template>
