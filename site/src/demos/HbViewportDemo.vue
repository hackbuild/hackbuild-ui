<script setup lang="ts">
import { ref } from 'vue'
import { HbButton, HbHudStat, HbNameHud, HbPad, HbProgress, HbStageCaption, HbTag, HbViewport, type PadVector } from '@hackbuild/ui'
import { CHAR_NAME, ECHO, REPLY } from '../fixtures/stage'

const move = ref<PadVector>({ x: 0, y: 0 })
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbViewport label="scene" aspect="16/9">
  <canvas />
  <template #tl><HbTag>orbit</HbTag></template>
  <template #b><HbButton>throw the ball</HbButton></template>
</HbViewport>`
</script>

<template>
  <DemoSection title="Character stage" note="The 0.7.1 slots on one stage: name hud with a privacy chip top left, telemetry under it, then at the foot a hint, the caption, the verb band and the pad. The pad shows on a touch screen only. On a phone this stage asks for 3/4 through --hb-vp-ratio-sm.">
    <HbViewport label="character stage" style="--hb-vp-ratio-sm: 3/4">
      <template #tl><HbNameHud :name="CHAR_NAME" state="talking"><HbTag>camera on</HbTag></HbNameHud></template>
      <template #telemetry><HbHudStat label="goal" value="red block" /><HbHudStat label="turn" :value="4" :digits="0" /></template>
      <template #tr><HbHudStat label="fps" :value="59.9" /></template>
      <template #hint><span>drag to orbit, arrows to walk</span></template>
      <template #caption><HbStageCaption :echo="ECHO" :line="REPLY" :who="CHAR_NAME" :max-chars="160" /></template>
      <template #b><HbButton>wave</HbButton><HbButton>sit</HbButton></template>
      <template #pad><HbPad v-model="move" action="act" /></template>
    </HbViewport>
  </DemoSection>
  <DemoSection title="Viewport" note="The scene a tool draws in, with corner overlays and a bottom band of verbs. Under 640 px it goes square." :code="code">
    <HbViewport label="scene">
      <template #tl><HbTag>orbit</HbTag></template>
      <template #tr><HbHudStat label="fps" :value="59.9" /></template>
      <template #b><HbButton>throw the ball</HbButton></template>
    </HbViewport>
  </DemoSection>
  <DemoSection title="Cover" note="While the scene cannot show, the cover says what is happening. coverError lights the note as a failure.">
    <div class="demo-grid">
      <HbViewport label="loading" quiet cover-title="loading the gait wasm" cover-note="1.2 of 3.4 mb">
        <template #cover><HbProgress :loaded="1200000" :total="3400000" /></template>
      </HbViewport>
      <HbViewport label="failed" quiet cover-title="no webgl" cover-note="this browser has webgl turned off. turn it on in settings, then reload." cover-error />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'aspect', type: 'string', default: '16/9', notes: `'fill' takes the parent height` },
      { prop: 'quiet', type: 'boolean', default: 'false' },
      { prop: 'label', type: 'string' },
      { prop: 'coverTitle / coverNote', type: 'string' },
      { prop: 'coverError', type: 'boolean', default: 'false' },
      { prop: 'slots', type: 'default, tl, tr, bl, br, b, center, cover; telemetry, hint, caption, pad' },
    ]"
  />
</template>
