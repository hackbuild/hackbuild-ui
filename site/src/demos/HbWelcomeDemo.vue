<script setup lang="ts">
import { ref } from 'vue'
import { HbStage, HbWelcome } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const open = ref(true)
const installed = ref(0)
const picked = ref('')
const code = `<HbWelcome v-model:open="open" title="bail" suffix="bench" persist-key="bail.welcome"
  :steps="[{ name: 'model', text: 'depth runs in this tab.', done: installed > 0, count: installed ? \`\${installed} installed\` : '', action: 'pick a model' }, ...]"
  :starts="starts" @start="load" @step="route" />`
</script>

<template>
  <DemoSection title="Welcome" note="The empty state is the checklist: each step ticks from live state, shows its count, or carries the action that routes to its fix. Starts can carry a thumb. With persistKey a close is remembered." :code="code">
    <HbStage style="position: relative; min-height: 460px">
      <HbWelcome
        v-model:open="open"
        title="bail"
        suffix="bench"
        note="a relief from a photo. prints flat on the plate."
        :steps="[
          { name: 'model', text: 'depth runs in this tab.', done: installed > 0, count: installed ? `${installed} installed` : '', action: 'pick a model' },
          { name: 'image', text: 'drop a photo or start from a worked design.', action: 'drop a photo' },
        ]"
        :starts="[
          { id: 'blank', name: 'start blank', sub: 'empty bench' },
          { id: 'coin', name: 'coin', sub: 'worked example', primary: true },
          { id: 'tile', name: 'tile', sub: 'variant' },
        ]"
        @step="installed++"
        @start="picked = $event"
      />
      <button v-if="!open" type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="open = true">open welcome</button>
      <p v-if="picked" class="hb-label hb-stage-label">started: {{ picked }}</p>
    </HbStage>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'title / accent / suffix / note', type: 'string' },
      { prop: 'steps', type: '{name, text, done?, count?, action?}[]', notes: 'emits step(index)' },
      { prop: 'starts', type: '{id, name, sub?, primary?, thumb?}[]', notes: 'emits start(id)' },
      { prop: 'persistKey', type: 'string', notes: 'remember a close' },
      { prop: 'v-model:open', type: 'boolean', default: 'true' },
    ]"
  />
</template>
