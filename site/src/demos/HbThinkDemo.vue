<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { HbButton, HbThink } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const FULL = 'the person asked for a pinout. the board is a pico. gp0 and gp1 are uart0 by default, so i should say that before listing the rest.'
const text = ref(FULL)
const streaming = ref(false)
let t = 0
function run() {
  clearInterval(t)
  text.value = ''
  streaming.value = true
  t = window.setInterval(() => {
    text.value = FULL.slice(0, text.value.length + 4)
    if (text.value.length >= FULL.length) { clearInterval(t); streaming.value = false }
  }, 40)
}
onBeforeUnmount(() => clearInterval(t))
const code = `<HbThink :text="think" :streaming="!answer" />
<HbThink :text="plan" tone="plan" label="planning" done-label="plan" />`
</script>

<template>
  <DemoSection
    title="Think fold"
    note="Open while the think text streams, summary thinking; closed after, summary reasoning with its length. Think text never leaks into the answer: a stream tag splitter in the chat package feeds it. Plan and working memory tags use the same fold in their own tone."
    :code="code"
  >
    <div class="demo-col" style="max-width: 640px">
      <HbButton variant="secondary" size="sm" @click="run">stream it</HbButton>
      <HbThink :text="text" :streaming="streaming" />
      <HbThink text="1. read the board id. 2. list the uart pins. 3. say which are free." tone="plan" label="planning" done-label="plan" />
      <HbThink text="the person uses a pico w, not a pico 2." tone="memory" label="noting" done-label="working memory" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'text', type: 'string' },
      { prop: 'streaming', type: 'boolean', notes: 'open while true' },
      { prop: 'label / doneLabel', type: 'string', default: `'thinking' / 'reasoning'` },
      { prop: 'tone', type: `'think' | 'plan' | 'memory'` },
    ]"
  />
</template>
