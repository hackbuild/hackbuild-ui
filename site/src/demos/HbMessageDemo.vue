<script setup lang="ts">
import { ref } from 'vue'
import { HbMessage, useToast } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const { toast } = useToast()
const kept = ref(false)
const persona = 'yo.\n\nvirtual me, running in your browser. nothing leaves this tab.\n\nask me anything.'
const code = `<HbMessage who="assistant" name="moheeb*" :text="reply" split :stats="{ tokPerSec: 31.2, firstMs: 640, tokens: 44 }"
  :recalled="hits" seen="a person at a desk, one hand raised" @speak="speak" @retry="redo" @recall="openMemory" />`
</script>

<template>
  <DemoSection
    title="Anatomy"
    note="Who line with the stats strip and its source word, the reply split into short boxes for a persona, seen, memory used with scores that open the memory tool, and the action row."
    :code="code"
  >
    <div class="demo-col" style="max-width: 640px">
      <HbMessage who="user" text="who are you" @edit="(t) => toast(`edited: ${t}`)" />
      <HbMessage
        who="assistant"
        name="persona"
        :text="persona"
        split
        :stats="{ tokPerSec: 31.2, firstMs: 640, tokens: 44 }"
        seen="a person at a desk, one hand raised"
        :recalled="[{ title: 'bio: who i am', score: 0.91 }, { title: 'projects: the hackerspace', score: 0.74 }]"
        :actions="['speak', 'retry', 'remember', 'copy', 'remove']"
        :remembered="kept"
        @remember="kept = !kept"
        @speak="toast('speak')"
        @retry="toast('redo')"
        @recall="(r) => toast(`open ${r.title} in memory`)"
      />
    </div>
  </DemoSection>

  <DemoSection title="Waiting, streaming, failed" note="The pending line says what the turn waits on. Think text is open while it streams. A failure sits where the reply would be and carries the fix.">
    <div class="demo-col" style="max-width: 640px">
      <HbMessage who="assistant" pending="loading the model into memory" streaming />
      <HbMessage who="assistant" think="the user asked for three items, one line each. rain gear first." streaming />
      <HbMessage who="assistant" text="a hooded rain shell." streaming />
      <HbMessage who="assistant" text="" error="reply stopped: the engine closed. press redo." :actions="['retry']" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'who / name', type: `'user' | 'assistant' | 'system' / string` },
      { prop: 'text / split / cap', type: 'string / boolean / number', default: 'cap 5' },
      { prop: 'streaming / pending', type: 'boolean / string' },
      { prop: 'error / note', type: 'string' },
      { prop: 'stats', type: '{tokPerSec, firstMs, tokens, source}' },
      { prop: 'think / tools / recalled / seen', type: 'string / HbToolCallData[] / {title, score, ref}[] / string' },
      { prop: 'actions', type: `('speak' | 'retry' | 'remember' | 'copy' | 'remove' | 'edit')[]`, notes: 'default by speaker; [] hides; remember is opt in' },
      { prop: 'remembered', type: 'boolean', notes: 'remember reads in memory' },
      { prop: 'slots', type: 'think, tools, recalled, default' },
      { prop: 'emits', type: 'speak, retry, remember, copy, remove, edit, recall' },
    ]"
  />
</template>
