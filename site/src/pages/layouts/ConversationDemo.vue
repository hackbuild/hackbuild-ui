<script setup lang="ts">
// conversation, after clevis: the messages fill, the composer sits under
// them, chats, persona and memory are rack tabs. With no model loaded the
// reply is a card that says so.
import { ref } from 'vue'
import { HbConversationLayout, HbKv, HbMessage, HbPanel } from '@hackbuild/ui'
import DemoBar from './DemoBar.vue'
import { useFakeLoad } from './useFakeLoad'
import { chatRows } from '../../fixtures/picker'

const { rows, load } = useFakeLoad(chatRows)
const chosen = ref('steady')
const tabs = [{ id: 'chats', label: 'chats' }, { id: 'persona', label: 'persona' }, { id: 'memory', label: 'memory' }]
const draft = ref('')
const msgs = ref([
  { id: 1, who: 'user' as const, text: 'what can you do here' },
  { id: 2, who: 'assistant' as const, text: 'talk, remember what you tell me, and keep it on this machine. pick a model in the bar to start.' },
])
function send() {
  const text = draft.value.trim()
  if (!text) return
  msgs.value = [...msgs.value, { id: msgs.value.length + 1, who: 'user', text }, { id: msgs.value.length + 2, who: 'assistant', text: 'this needs a model. press the chip in the bar to pick one.' }]
  draft.value = ''
}
</script>

<template>
  <HbConversationLayout :tabs="tabs" rack-label="chat">
    <template #bar><DemoBar v-model="chosen" title="chat" :rows="rows" @load="load" /></template>
    <div style="display:flex;flex-direction:column;gap:12px;padding:16px;max-width:760px;margin:0 auto">
      <HbMessage v-for="m in msgs" :key="m.id" :who="m.who" :text="m.text" :actions="[]" />
    </div>
    <template #composer>
      <form class="hb-composer" style="border:0;padding:0;background:none" @submit.prevent="send">
        <textarea v-model="draft" class="hb-textarea" rows="1" aria-label="message" placeholder="say something" @keydown.enter.exact.prevent="send" />
        <button type="submit" class="hb-btn hb-btn-go">send</button>
      </form>
    </template>
    <template #tab-chats><HbPanel heading="chats" head="instrument"><HbKv label="today" value="what can you do here" /></HbPanel></template>
    <template #tab-persona><HbPanel heading="persona" head="instrument"><HbKv label="name" value="helper" /></HbPanel></template>
    <template #tab-memory><HbPanel heading="memory" head="instrument"><p class="hb-lay-empty-note">nothing kept yet.</p></HbPanel></template>
    <template #detail><p class="hb-fixture">fixture: the replies are scripted and no model loads here.</p></template>
  </HbConversationLayout>
</template>
