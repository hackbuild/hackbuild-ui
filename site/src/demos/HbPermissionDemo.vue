<script setup lang="ts">
import { HbPermission } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbPermission name="microphone" icon="microphone" state="denied"
  reason="the mic is blocked for this site. type instead, or allow it in the address bar."
  action="try again" alt="type instead" :still-works="['typing', 'speech out', 'memory']" @alt="focusComposer" />`
</script>

<template>
  <DemoSection
    title="Permission with the way around"
    note="Every denied permission names the working alternative in the same sentence, carries it as a button, and lists what still works without it."
    :code="code"
  >
    <div class="demo-col" style="max-width: 560px">
      <HbPermission name="microphone" icon="microphone" state="denied" reason="the mic is blocked for this site. type instead, or allow it in the address bar." action="try again" alt="type instead" :still-works="['typing', 'speech out', 'memory']" />
      <HbPermission name="webgpu adapter" icon="microchip" state="missing" reason="no webgpu adapter. chat runs on cpu with the small models. the larger rows are off." alt="show cpu models" :still-works="['smollm2 360m', 'qwen2.5 0.5b gguf', 'your endpoint']" />
      <HbPermission name="camera" icon="camera" state="ask" reason="asked on the first press of the camera chip." action="allow" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'name / icon / state', type: `string / IconName / 'checking' | 'ask' | 'ok' | 'denied' | 'missing'` },
      { prop: 'reason / stateText', type: 'string' },
      { prop: 'action', type: 'string', notes: 'the press that can change the state' },
      { prop: 'alt', type: 'string', notes: 'the working alternative, emits alt' },
      { prop: 'stillWorks', type: 'string[]', notes: 'or the still slot' },
      { prop: 'emits', type: 'act, alt' },
    ]"
  />
</template>
