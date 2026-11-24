<script setup lang="ts">
import { nextTick, ref } from 'vue'
import {
  HbAppShell, HbButton, HbHeader, HbPill, HbSeg, HbStatusBar, HbToolbar,
  HbViewport, usePersisted, type HbAppMode,
} from '@hackbuild/ui'

// Transcript (P-PHONE-1, P-CHAT-11): a short stage over the conversation,
// the composer pinned above the status strip so it never scrolls away.
// Fixture replies only, no model runs.
const mode = usePersisted<HbAppMode>('site-demo-transcript-mode', 'split')
const lines = ref([
  { who: 'you', user: true, text: 'what do you see?' },
  { who: 'dog', user: false, text: 'a red ball by the fence, and you.' },
  { who: 'you', user: true, text: 'go get it.' },
  { who: 'dog', user: false, text: 'on my way. the grass is wet.' },
])
const draft = ref('')
const log = ref<HTMLElement | null>(null)
const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches

async function send() {
  const text = draft.value.trim()
  if (!text) return
  lines.value.push({ who: 'you', user: true, text }, { who: 'dog', user: false, text: 'a fixture reply. no model runs here.' })
  draft.value = ''
  await nextTick()
  log.value?.scrollTo({ top: log.value.scrollHeight })
}
// Enter sends on a fine pointer; on a touch screen enter is a new line.
function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !coarse) { e.preventDefault(); send() }
}
</script>

<template>
  <HbAppShell v-model:mode="mode" recipe="transcript">
    <template #header>
      <HbHeader title="talk" accent="." tagline="a character you can talk to" tagline-kind="tool">
        <a class="hb-link" href="#/demos">exit demo</a>
        <HbPill status="ok">voice</HbPill>
      </HbHeader>
      <p class="hb-fixture is-strip"><b>fixture</b> sample data: states, names and numbers are made up. no model loads here.</p>
    </template>
    <template #toolbar>
      <HbToolbar>
        <HbSeg v-model="mode" :options="['stage', 'split', 'chat']" />
        <span class="hb-spacer" />
        <HbButton size="sm" variant="secondary" @click="lines = []">clear</HbButton>
      </HbToolbar>
    </template>

    <HbViewport label="the character" cover-title="fixture stage" cover-note="no avatar runs in this demo." />

    <template #rail>
      <section class="hb-chat" aria-label="conversation">
        <div ref="log" class="hb-chat-log" role="log" aria-live="polite" tabindex="0">
          <div v-for="(line, i) in lines" :key="i" class="hb-msg" :class="{ 'is-user': line.user }">
            <span class="hb-msg-who">{{ line.who }}</span>
            <div class="hb-msg-text">{{ line.text }}</div>
          </div>
          <div v-if="!lines.length" class="hb-msg is-system"><div class="hb-msg-text">say something to start.</div></div>
        </div>
      </section>
    </template>

    <template #dock>
      <form class="hb-composer" @submit.prevent="send">
        <textarea v-model="draft" class="hb-textarea" rows="1" aria-label="message" placeholder="say something" @keydown="onKey" />
        <div class="hb-composer-acts">
          <button type="submit" class="hb-btn" :disabled="!draft.trim()">send</button>
        </div>
      </form>
    </template>

    <template #statusbar>
      <HbStatusBar>
        <span>job <b>idle</b></span>
        <span>device <b>webgpu</b></span>
        <span>tok/s <b>0</b></span>
      </HbStatusBar>
    </template>
  </HbAppShell>
</template>
