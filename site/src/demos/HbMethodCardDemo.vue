<script setup lang="ts">
import { ref } from 'vue'
import { HbMethodCard } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const pick = ref('system')
const code = `<div class="hb-methods" role="radiogroup" aria-label="voice engine">
  <HbMethodCard label="system voice" trade="web speech, streams as words arrive" time="instant" :quality="1" :size-m-b="0"
    :active="engine === 'system'" @pick="engine = 'system'" />
  <HbMethodCard label="kokoro" trade="neural, in the browser, speaks after the full reply" time="~2 s a line" :quality="3"
    :size-m-b="92" state="failed" notice="load failed: out of gpu memory. the system voice is used instead." />
</div>`
</script>

<template>
  <DemoSection title="Method cards" note="A badge, the name over what you gain and lose, the time and three quality squares, the size it costs. A failed method names why and which one answers instead. Arrow keys move through a .hb-methods group." :code="code">
    <div class="hb-methods" role="radiogroup" aria-label="voice engine" style="max-width: 560px">
      <HbMethodCard label="system voice" trade="web speech, streams as words arrive" time="instant" :quality="1" :size-m-b="0" :active="pick === 'system'" @pick="pick = 'system'" />
      <HbMethodCard label="piper" trade="neural, one voice per file, fast on a cpu" time="~1 s a line" :quality="2" :size-m-b="63" state="stored" :active="pick === 'piper'" @pick="pick = 'piper'" />
      <HbMethodCard label="kokoro" trade="neural, in the browser, speaks after the full reply" time="~2 s a line" :quality="3" :size-m-b="92" state="failed" notice="load failed: out of gpu memory. the system voice is used instead." :active="pick === 'kokoro'" @pick="pick = 'kokoro'" />
      <HbMethodCard label="clone" badge="c" trade="your voice from 10 s of audio" time="~6 s a line" :quality="3" :size-m-b="310" state="unsupported" notice="needs webgpu with shader-f16." />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'label / trade / badge', type: 'string' },
      { prop: 'time', type: 'string', notes: `'~15 s', 'instant'` },
      { prop: 'quality', type: 'number | null', notes: '0 to 3 squares' },
      { prop: 'sizeMB', type: 'number | null', notes: '0 reads no download' },
      { prop: 'state', type: `'ready' | 'stored' | 'download' | 'loading' | 'failed' | 'unsupported'` },
      { prop: 'active / notice', type: 'boolean / string' },
      { prop: 'emits', type: 'pick' },
    ]"
  />
</template>
