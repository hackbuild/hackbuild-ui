<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  HbAppShell, HbButton, HbChat, HbGauges, HbHeader, HbHudStat, HbKv, HbMemoryPanel,
  HbNameHud, HbPad, HbPanel, HbPill, HbSeg, HbSelect, HbStageCaption, HbStatusBar,
  HbSwitch, HbTabs, HbViewport, usePersisted, type HbAppMode, type HbChatLine, type HudState,
} from '@hackbuild/ui'
import { DRIVES, MEMORY, ORDERS, RACK_TABS, REPLIES, TALK } from '../fixtures/room'
import { CHAR_NAME } from '../fixtures/stage'

// Phone layout for stage plus rack (P-SHELL-3 with P-PHONE-1, P-PHONE-3,
// P-PHONE-10). The shell fits the dynamic viewport and the stage takes
// the height left over the docked composer. Under 641 px the rack is a
// bottom sheet over the stage with its seven tabs as a select; the
// composer stays in reach and the stage keeps one caption line. A still
// picture stands in for the 3D scene. Fixture replies only.
const mode = usePersisted<HbAppMode>('site-demo-phone-rack-mode', 'split')
const rack = ref(false)
const tab = ref<string | number>('talk')
const lines = ref<HbChatLine[]>([...TALK])
const hud = ref<HudState>('idle')
const move = ref({ x: 0, y: 0 })
const brain = ref('in tab')
const inset = ref('depth')
const captions = ref(true)
const engine = ref('browser speech')
const speak = ref(true)

const lastUser = computed(() => [...lines.value].reverse().find((l) => l.role === 'user'))
const lastReply = computed(() => [...lines.value].reverse().find((l) => l.role === 'assistant'))

let timer: ReturnType<typeof setTimeout> | undefined
function send(text: string) {
  lines.value.push({ role: 'user', text }, { role: 'assistant', text: REPLIES[lines.value.length % REPLIES.length]! })
  hud.value = 'talking'
  clearTimeout(timer)
  timer = setTimeout(() => { hud.value = 'idle' }, 2400)
}
function act() {
  lines.value.push({ role: 'system', text: 'act: picked up the red block.' })
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <HbAppShell v-model:mode="mode" v-model:rail-open="rack" recipe="rack" rail-label="rack" fit>
    <template #header>
      <HbHeader title="room" accent="." tagline="stage plus rack on a phone" tagline-kind="tool">
        <a class="hb-link" href="#/demos">exit demo</a>
        <HbPill status="ok">brain</HbPill>
        <HbPill status="warn">eyes</HbPill>
      </HbHeader>
      <p class="hb-fixture is-strip"><b>fixture</b> sample data: states, names and numbers are made up. no model loads here.</p>
    </template>

    <HbViewport aspect="fill" label="the room">
      <svg class="hb-viewport-media" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="var(--hb-lit-dim)" stroke-width="1">
          <path d="M0 150 H400" />
          <path d="M200 150 L-200 300 M200 150 L0 300 M200 150 L100 300 M200 150 L200 300 M200 150 L300 300 M200 150 L400 300 M200 150 L600 300" />
          <path d="M0 175 H400 M0 210 H400 M0 255 H400" />
        </g>
        <rect x="250" y="160" width="90" height="22" fill="var(--hb-ink-border)" />
        <rect x="262" y="150" width="12" height="10" fill="var(--hb-lit-err)" />
        <rect x="150" y="190" width="28" height="44" fill="var(--hb-paper)" />
        <rect x="156" y="178" width="16" height="12" fill="var(--hb-paper)" />
      </svg>
      <template #tl><HbNameHud :name="CHAR_NAME" :state="hud" /></template>
      <template #telemetry><HbHudStat label="goal" value="red block" /></template>
      <template #hint><span>drag to orbit, arrows to walk</span></template>
      <template #caption>
        <HbStageCaption :echo="lastUser ? `you: ${lastUser.text}` : ''" :line="lastReply?.text ?? ''" :who="CHAR_NAME" :max-chars="160" />
      </template>
      <template #pad><HbPad v-model="move" action="act" @action="act" /></template>
    </HbViewport>

    <template #rail>
      <HbTabs v-model="tab" :tabs="RACK_TABS" label="rack" persist-key="site-demo-phone-rack" overflow="collapse">
        <template #default="{ value }">
          <HbPanel v-if="value === 'talk'" heading="talk" sunk>
            <HbChat :lines="lines" :composer="false" :actions="false" label="talk" user-name="you" :assistant-name="CHAR_NAME" />
            <div class="hb-acts">
              <button v-for="o in ORDERS" :key="o" type="button" class="hb-chip" @click="send(o)">{{ o }}</button>
            </div>
          </HbPanel>
          <HbPanel v-else-if="value === 'mind'" heading="drives" sunk>
            <HbKv label="state" value="walking" />
            <HbKv label="goal" value="red block" />
            <HbGauges :rows="DRIVES" :max="1" label="drives" />
          </HbPanel>
          <HbPanel v-else-if="value === 'eyes'" heading="inset" sunk>
            <HbSeg v-model="inset" :options="['off', 'depth', 'labels']" />
            <label class="hb-check"><HbSwitch v-model="captions" label="captions" /> captions</label>
            <HbKv label="sense cost" value="18 ms a look" />
          </HbPanel>
          <HbMemoryPanel v-else-if="value === 'memory'" :items="MEMORY" readonly />
          <HbPanel v-else-if="value === 'body'" heading="body" sunk>
            <HbKv label="model" value="mannequin" />
            <HbKv label="hands" value="on" />
            <HbButton variant="secondary">drop a model</HbButton>
          </HbPanel>
          <HbPanel v-else-if="value === 'brain'" heading="who decides" sunk>
            <HbSeg v-model="brain" :options="['reflex only', 'in tab', 'your endpoint']" />
            <HbKv label="applies" value="next turn" />
          </HbPanel>
          <HbPanel v-else heading="voice" sunk>
            <HbSelect v-model="engine" label="engine" :options="['browser speech', 'none']" />
            <label class="hb-check"><HbSwitch v-model="speak" label="speak replies" /> speak replies</label>
          </HbPanel>
        </template>
      </HbTabs>
    </template>

    <template #dock="{ sheet }">
      <HbSeg v-if="!sheet" v-model="mode" :options="['stage', 'split']" />
      <HbChat :lines="lines" :log="false" :placeholder="`talk to ${CHAR_NAME}`" label="talk to the agent" @send="send">
        <template #composer-start>
          <HbButton v-if="sheet" variant="secondary" :aria-expanded="rack" @click="rack = !rack">rack</HbButton>
        </template>
      </HbChat>
    </template>

    <template #statusbar>
      <HbStatusBar>
        <span>job <b>idle</b></span>
        <span>device <b>webgpu</b></span>
      </HbStatusBar>
    </template>
  </HbAppShell>
</template>
