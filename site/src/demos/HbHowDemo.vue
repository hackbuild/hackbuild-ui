<script setup lang="ts">
import { ref } from 'vue'
import { HbHow, type HbHowDoc } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const open = ref(true)
const open2 = ref(true)
const how = `import { createChat } from '@hackbuild/chat'
import { stubEngine } from '@hackbuild/chat/stub'

const chat = createChat({ engine: stubEngine() })
const reply = await chat.reply('hello')`
const doc: HbHowDoc = {
  packages: ['@hackbuild/chat'],
  what: 'a chat loop over any engine: one reply call, a stub for tests.',
  how: [
    'the engine is a function from messages to tokens. `createChat` holds the turns and streams each reply into them.',
    'the stub answers from a script, so a page runs with no model and no download.',
  ],
  install: 'npm i @hackbuild/chat',
  today: 'npm i ./packages/chat/hackbuild-chat-0.1.0.tgz',
  code: how,
  links: { page: '#/components/HbHow' },
}
const code = `<HbHow
  :packages="['@hackbuild/chat']"
  what="a chat loop over any engine."
  :how="['the engine is a function from messages to tokens.']"
  install="npm i @hackbuild/chat"
  today="npm i ./packages/chat/hackbuild-chat-0.1.0.tgz"
  :code="how"
  :links="{ page: '#/chat', source: 'https://github.com/hackbuild' }"
/>`
</script>

<template>
  <DemoSection
    title="How this works"
    note="The same fold at the foot of every tool: packages, the install line, and while nothing is on npm a second line that works today, the least code that does what the page did, copy, and links."
    :code="code"
  >
    <HbHow
      v-model="open"
      :packages="['@hackbuild/chat', '@hackbuild/memory']"
      install="npm i @hackbuild/chat @hackbuild/memory"
      today="npm i ./packages/chat/hackbuild-chat-0.1.0.tgz"
      :code="how"
      :links="{ page: '#/components/HbHow', source: '#/components/HbHow' }"
    />
  </DemoSection>

  <DemoSection
    title="With the package prose"
    note="A library's how.ts binds whole with v-bind: what the package is, then how it works, over the install and code. Backtick spans in the prose render as code. The prose slot replaces both."
    :code="'<HbHow v-bind=&quot;doc&quot; />'"
  >
    <p class="hb-fixture is-strip"><b>fixture</b> sample doc: the package and its lines are made up.</p>
    <HbHow v-bind="doc" v-model="open2" summary="how chat works" />
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'packages', type: 'string[]' },
      { prop: 'what', type: 'string', notes: 'one or two sentences, in ink' },
      { prop: 'how', type: 'string[]', notes: 'paragraphs; backtick spans render as code' },
      { prop: 'slot prose', type: 'slot', notes: 'replaces what and how' },
      { prop: 'install', type: 'string', notes: 'the npm line' },
      { prop: 'today', type: 'string', notes: 'the line that works today, shown second' },
      { prop: 'published', type: 'boolean', default: 'false', notes: 'drops the second line' },
      { prop: 'code', type: 'string' },
      { prop: 'lang', type: 'string', default: `'ts'` },
      { prop: 'links', type: '{page, source}' },
      { prop: 'summary', type: 'string', default: `'how this works'` },
      { prop: 'v-model', type: 'boolean', notes: 'open' },
    ]"
  />
</template>
