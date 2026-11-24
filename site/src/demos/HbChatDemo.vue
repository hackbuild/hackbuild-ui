<script setup lang="ts">
import { ref } from 'vue'
import { HbChat, HbContextMeter, useToast, type HbChatLine } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const { toast } = useToast()
const lines = ref<HbChatLine[]>([
  { id: 1, role: 'user', text: 'what is a ferrule, in one line' },
  {
    id: 2, role: 'assistant', done: true,
    think: 'the user wants one line. a ferrule is the metal sleeve on a pencil or a crimped wire end.',
    text: 'a metal sleeve that holds or protects an end: the band on a pencil, or the crimp on a stranded wire.',
    stats: { tokPerSec: 41.3, firstMs: 420, tokens: 38 },
    recalled: [{ title: 'notes: crimping 22 awg wire', score: 0.82 }, { title: 'glossary: shop words', score: 0.61 }],
  },
  {
    id: 3, role: 'user', text: 'and what is the weather where i am',
  },
  {
    id: 4, role: 'assistant', done: true, text: 'no location tool is on, so i cannot say. turn on the location tool, or tell me the city.',
    tools: [{ name: 'get_location', args: {}, error: 'permission denied: location is blocked for this site.', state: 'error', ms: 12 }],
    stats: { tokPerSec: 38.9, firstMs: 610, tokens: 27 },
  },
])
const streaming = ref(false)
const draft = ref('')
let id = 10
let timer = 0
const REPLY = 'a scripted reply, so you can see the shape.\n\nthe second box arrives after a blank line.\n\npick a model to talk for real.'

function send(text: string) {
  lines.value.push({ id: ++id, role: 'user', text })
  reply()
}
function reply() {
  const line: HbChatLine = { id: ++id, role: 'assistant', text: '', done: false, pending: 'thinking' }
  lines.value.push(line)
  streaming.value = true
  const at = lines.value.length - 1
  let n = 0
  const t0 = performance.now()
  timer = window.setInterval(() => {
    n += 3
    const cur = lines.value[at]!
    lines.value[at] = { ...cur, text: REPLY.slice(0, n) }
    if (n >= REPLY.length) finish(at, t0)
  }, 30)
}
function finish(at: number, t0: number, note = '') {
  clearInterval(timer)
  streaming.value = false
  const cur = lines.value[at]!
  const ms = performance.now() - t0
  lines.value[at] = { ...cur, done: true, note, stats: { tokPerSec: (cur.text.length / 4) / (ms / 1000), firstMs: 30, tokens: Math.round(cur.text.length / 4), source: 'measured' } }
}
function stop() { finish(lines.value.length - 1, performance.now() - 1000, 'stopped.') }
function retry(i: number) { lines.value.splice(i); reply() }
function edit(i: number, text: string) { lines.value.splice(i); send(text) }

const code = `<HbChat v-model:draft="draft" :lines="lines" :streaming="busy" header title="chat" assistant-name="hermes 3"
  :examples="['say hi', 'tell me a fact']" @send="send" @stop="engine.abort()"
  @retry="redo" @edit="editTurn" @remove="(i) => lines.splice(i, 1)" @speak="speak" @export="exportChat">
  <template #above><HbContextMeter :segments="ctx" :budget="4096" /></template>
</HbChat>`
</script>

<template>
  <DemoSection
    title="Chat"
    note="Header with clear, export and import. Every hidden input is one fold away: thinking, tool calls, memory used, stats. Under a reply: speak, redo, copy, delete (press twice); edit on your own turns. One primary button reads stop while a reply streams, and escape stops it. Enter sends with a mouse; on a phone enter adds a line and the button sends. Up in an empty composer edits your last turn. The replies here come from a script."
    :code="code"
  >
    <div style="max-width: 720px">
      <HbChat
        v-model:draft="draft"
        :lines="lines"
        :streaming="streaming"
        header
        title="chat // scripted"
        assistant-name="scripted"
        @send="send"
        @stop="stop"
        @retry="retry"
        @edit="edit"
        @remove="(i) => lines.splice(i, 1)"
        @speak="toast('speaking with the browser voice')"
        @clear="lines = []"
        @export="toast('chat exported as .hbchat.json', { kind: 'ok' })"
        @import="toast('drop a .hbchat.json file, or press ctrl+o')"
      >
        <template #above>
          <HbContextMeter :segments="[{ key: 'sys', label: 'instructions', tokens: 412 }, { key: 'mem', label: 'memory', tokens: 268 }, { key: 'turns', label: 'recent turns', tokens: 60 * lines.length }]" :budget="4096" />
        </template>
      </HbChat>
    </div>
  </DemoSection>

  <DemoSection title="Empty, no model" note="The transcript area holds example chips that answer through the scripted engine.">
    <div style="max-width: 720px">
      <HbChat :lines="[]" :examples="['say hi', 'what can you do here', 'tell me a fact about solder']" @send="(t) => toast(`sent: ${t}`)" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'lines', type: 'HbChatLine[]', notes: 'role, text, think, done, pending, note, error, stats, tools, recalled, seen, actions' },
      { prop: 'streaming / disabled', type: 'boolean' },
      { prop: 'actions / split', type: 'boolean', notes: 'split: persona boxes, cap 5' },
      { prop: 'examples', type: 'string[]', notes: 'chips in the empty state' },
      { prop: 'header / title', type: 'boolean / string', notes: 'clear, export, import' },
      { prop: 'keyField / keyPattern', type: 'boolean / RegExp | string', notes: 'HbApiKey above the log' },
      { prop: 'v-model:draft / v-model:apiKey', type: 'string' },
      { prop: 'slots', type: 'header, header-extra, message, empty, above, composer-start, composer-end' },
      { prop: 'emits', type: 'send, stop, speak, retry, copy, remove, edit, recall, clear, export, import' },
    ]"
  />
</template>
