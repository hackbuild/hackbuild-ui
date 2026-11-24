<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { gateNote, wakeBar, wakeSummary, type WakeSystem } from '../vanilla/wake'
import type { SizeSource } from '../vanilla/models'

interface Props {
  /** One row per subsystem: brain, voice, memory, body. */
  systems: WakeSystem[]
  /** The head line on the ink bar: the tool and what it is. */
  tag?: string
  /** Right of the tag: a version or the capability. */
  ver?: string
  /** The big line. */
  title?: string
  /** The one paragraph: what wakes, where it runs, what is sent. */
  lede?: string
  /** Gate note inputs: download size, origin, quota, webgpu. */
  sizeMB?: number | null
  sizeSource?: SizeSource
  origin?: 'http' | 'file'
  quotaMB?: number | null
  webgpu?: boolean
  extras?: string
  /** Added after the built note. */
  note?: string
  /** The failure line, written when a required row fails. */
  error?: string
  /** A wake is running: both buttons wait. */
  busy?: boolean
  wakeLabel?: string
  /** The lite wake. Empty hides it. */
  liteLabel?: string
  liteTitle?: string
  /** Pin over the page with a scrim. Off: an inline card. */
  overlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'wake gate',
  ver: '',
  title: 'wake it up.',
  lede: '',
  sizeMB: null,
  sizeSource: 'unknown',
  origin: 'http',
  quotaMB: null,
  webgpu: true,
  extras: '',
  note: '',
  error: '',
  busy: false,
  wakeLabel: 'wake',
  liteLabel: 'no voice',
  liteTitle: 'skip the voice download',
  overlay: false,
})

const emit = defineEmits<{ wake: []; 'wake-lite': [] }>()

const built = computed(() =>
  gateNote({ sizeMB: props.sizeMB, sizeSource: props.sizeSource, origin: props.origin, quotaMB: props.quotaMB, webgpu: props.webgpu, extras: props.extras || undefined }),
)
const noteText = computed(() => [built.value.text, props.note].filter(Boolean).join(' '))
const summary = computed(() => wakeSummary(props.systems))
const waiting = computed(() => props.busy || (summary.value.busy && !props.error))

const STATE_WORD: Record<WakeSystem['state'], string> = { waiting: 'waiting', loading: 'loading', ready: 'ready', error: 'failed', off: 'off' }

const wakeBtn = ref<HTMLButtonElement | null>(null)
onMounted(() => { if (props.overlay) nextTick(() => wakeBtn.value?.focus()) })
</script>

<template>
  <div :class="props.overlay ? 'hb-wake-scrim' : undefined">
    <section class="hb-wake" :aria-label="props.tag" :aria-busy="waiting">
      <div class="hb-wake-head"><span>{{ props.tag }}</span><span v-if="props.ver">{{ props.ver }}</span></div>
      <div class="hb-wake-body">
        <h2 class="hb-wake-title">{{ props.title }}</h2>
        <p v-if="props.lede || $slots.default" class="hb-wake-lede"><slot>{{ props.lede }}</slot></p>
        <slot name="persona" />
        <ul class="hb-wake-rows" aria-label="subsystems">
          <li
            v-for="s in props.systems"
            :key="s.id"
            class="hb-wake-row"
            :class="[`is-${s.state}`, { 'is-required': s.required }]"
          >
            <b class="hb-wake-label">{{ s.label }}</b>
            <span
              class="hb-wake-bar"
              :class="{ 'is-busy': wakeBar(s) === null }"
              role="progressbar"
              :aria-label="s.label"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="wakeBar(s) ?? undefined"
              :aria-valuetext="s.note || STATE_WORD[s.state]"
            ><i :style="{ width: (wakeBar(s) ?? 30) + '%' }" /></span>
            <span class="hb-wake-note" :title="s.note">{{ s.note || STATE_WORD[s.state] }}</span>
          </li>
        </ul>
        <slot name="picker" />
        <p v-if="noteText" class="hb-wake-gnote" :class="{ 'is-warn': built.warn }">{{ noteText }}</p>
        <slot name="fallback" />
        <div class="hb-wake-acts">
          <button ref="wakeBtn" type="button" class="hb-btn hb-btn-lg" :disabled="waiting" @click="emit('wake')">{{ props.wakeLabel }}</button>
          <button v-if="props.liteLabel" type="button" class="hb-btn hb-btn-2" :title="props.liteTitle" :disabled="waiting" @click="emit('wake-lite')">{{ props.liteLabel }}</button>
        </div>
        <p v-if="props.error" class="hb-wake-err" role="alert">{{ props.error }}</p>
      </div>
    </section>
  </div>
</template>
