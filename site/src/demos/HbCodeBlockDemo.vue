<script setup lang="ts">
import { HbCodeBlock } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const sample = `import { createChat } from '@hackbuild/chat'

const chat = createChat({ provider: 'stub', system: 'you answer briefly, and you say when you do not know something.' })
for await (const part of chat.send('what is a relief map')) console.log(part.text)`
const code = `<HbCodeBlock :code="sample" lang="ts" />`
</script>

<template>
  <DemoSection
    title="Code block"
    note="Plain text on ink, no highlighter. Copy says copied or copy failed; wrap folds long lines instead of scrolling them. The block takes focus so arrow keys scroll it."
    :code="code"
  >
    <HbCodeBlock :code="sample" lang="ts" />
    <div style="margin-top: 12px">
      <HbCodeBlock code="npm i @hackbuild/chat" lang="sh" :wrap-toggle="false" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'code', type: 'string' },
      { prop: 'lang', type: 'string', notes: 'printed in the head only' },
      { prop: 'copy', type: 'boolean', default: 'true' },
      { prop: 'wrapToggle', type: 'boolean', default: 'true' },
      { prop: 'v-model:wrap', type: 'boolean', default: 'false' },
    ]"
  />
</template>
