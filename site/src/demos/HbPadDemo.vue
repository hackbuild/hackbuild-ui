<script setup lang="ts">
import { computed, ref } from 'vue'
import { HbPad, HbSeg, HbTag, HbViewport, type PadMode, type PadVector } from '@hackbuild/ui'
import { dirWord } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const v = ref<PadVector>({ x: 0, y: 0 })
const mode = ref<PadMode>('stick')
const acts = ref(0)
const read = computed(() => `x ${v.value.x.toFixed(2)}  y ${v.value.y.toFixed(2)}${dirWord(v.value) ? '  ' + dirWord(v.value) : ''}`)
const code = `<HbViewport>
  <canvas />
  <template #pad><HbPad v-model="move" action="act" keys @action="act" /></template>
</HbViewport>`
</script>

<template>
  <DemoSection title="Pad" note="A stick or d-pad and one action button for moving a body on a phone. It shows on a touch screen only; always shows it here. The base holds the finger by pointer capture. With keys on, the arrow keys and WASD move and e acts, except while typing. Screen axes: forward is y below zero." :code="code">
    <div class="demo-col">
      <HbSeg v-model="mode" :options="[{ label: 'stick', value: 'stick' }, { label: 'd-pad', value: 'dpad' }]" />
      <HbViewport label="pad test" aspect="16/9">
        <template #tl><HbTag>{{ read }}</HbTag><HbTag>act {{ acts }}</HbTag></template>
        <template #pad><HbPad v-model="v" :mode="mode" action="act" always keys @action="acts++" /></template>
      </HbViewport>
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'v-model', type: '{x, y}', notes: '-1 to 1, y down' },
      { prop: 'mode', type: `'stick' | 'dpad'`, default: 'stick' },
      { prop: 'action', type: 'string', notes: 'button label; empty hides it' },
      { prop: 'always', type: 'boolean', default: 'false', notes: 'show on a fine pointer' },
      { prop: 'keys / actionKey', type: 'boolean / string', default: `false / 'e'` },
      { prop: 'dead / label', type: 'number / string', default: `0.12 / 'move'` },
      { prop: 'emits', type: 'update:modelValue, action' },
    ]"
  />
</template>
