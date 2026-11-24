<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import {
  HbAppShell, HbChat, HbHeader, HbHudStat, HbNameHud, HbPad, HbPill, HbSendTo, HbViewport,
  useToast, type HbChatLine, type HbSendTarget, type HudState,
} from '@hackbuild/ui'
import { REPLIES, TALK } from '../fixtures/room'
import { CHAR_NAME } from '../fixtures/stage'

// Stage left, chat right (FERRULE). .hb-toolpage.is-split.is-stage puts
// the side column of 340 to 520 px on the right from 1024 px; under it the
// stage comes first at --hb-stage-h-sm (38dvh) and chat follows. The pad
// shows on touch; held sideways the telemetry moves to the right corner.
// A still picture stands in for the 3D scene. Fixture replies only.
const { toast } = useToast()
const lines = ref<HbChatLine[]>([...TALK])
const hud = ref<HudState>('idle')
const move = ref({ x: 0, y: 0 })
const targets: HbSendTarget[] = [
  { id: 'room', label: 'room', icon: 'cube' },
  { id: 'image', label: 'image', icon: 'image', reason: 'no image model loaded' },
  { id: 'notes', label: 'notes', icon: 'book' },
]

let timer: ReturnType<typeof setTimeout> | undefined
function send(text: string) {
  lines.value.push({ role: 'user', text }, { role: 'assistant', text: REPLIES[lines.value.length % REPLIES.length]! })
  hud.value = 'talking'
  clearTimeout(timer)
  timer = setTimeout(() => { hud.value = 'idle' }, 2400)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <HbAppShell>
    <template #header>
      <HbHeader title="character" accent="." tagline="stage left, chat right" tagline-kind="tool">
        <a class="hb-link" href="#/demos">exit demo</a>
        <HbPill status="ok">brain</HbPill>
      </HbHeader>
      <p class="hb-fixture is-strip"><b>fixture</b> sample data: states, names and numbers are made up. no model loads here.</p>
    </template>

    <div class="hb-toolpage is-split is-stage">
      <HbViewport label="the character">
        <svg class="hb-viewport-media" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g fill="none" stroke="var(--hb-lit-dim)" stroke-width="1">
            <path d="M0 200 H400 M0 230 H400 M0 270 H400" />
            <path d="M200 200 L0 300 M200 200 L100 300 M200 200 L200 300 M200 200 L300 300 M200 200 L400 300" />
          </g>
          <rect x="186" y="120" width="28" height="70" fill="var(--hb-paper)" />
          <rect x="190" y="100" width="20" height="18" fill="var(--hb-paper)" />
        </svg>
        <template #tl><HbNameHud :name="CHAR_NAME" :state="hud" /></template>
        <template #tr><HbHudStat label="fps" :value="59.9" /></template>
        <template #telemetry><HbHudStat label="goal" value="red block" /><HbHudStat label="turn" :value="4" :digits="0" /></template>
        <template #pad><HbPad v-model="move" action="act" /></template>
      </HbViewport>

      <div class="is-side">
        <HbChat class="is-grow" :lines="lines" :placeholder="`talk to ${CHAR_NAME}`" label="talk" user-name="you" :assistant-name="CHAR_NAME" @send="send" />
        <div class="hb-acts is-end">
          <HbSendTo :targets="targets" align="right" label="send last reply" @send="toast('sent to ' + $event)" />
        </div>
      </div>
    </div>
  </HbAppShell>
</template>
