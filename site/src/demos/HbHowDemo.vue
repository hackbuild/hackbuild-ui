<script setup lang="ts">
import { ref } from 'vue'
import { HbHow } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const open = ref(true)
const how = `import { createChat } from '@hackbuild/chat'
import { stubEngine } from '@hackbuild/chat/stub'

const chat = createChat({ engine: stubEngine() })
const reply = await chat.reply('hello')`
const code = `<HbHow
  :packages="['@hackbuild/chat']"
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

  <PropsTable
    :rows="[
      { prop: 'packages', type: 'string[]' },
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
