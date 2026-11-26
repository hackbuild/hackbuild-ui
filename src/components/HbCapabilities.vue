<script setup lang="ts">
import { computed, watch } from 'vue'
import HbIcon from './HbIcon.vue'
import HbVerdict, { type HbVerdictStatus } from './HbVerdict.vue'
import HbProgress from './HbProgress.vue'
import HbLicence from './HbLicence.vue'
import { useLiveAnnounce } from '../composables/useLiveAnnounce'
import { uid as makeUid } from '../utils/uid'
import type { HbSizeSource } from './HbLoader.vue'
import type { HbIconName as IconName } from '../icons/stroke'
import { noteOnce } from '../utils/note'

noteOnce('HbCapabilities', 'HbCapabilities is deprecated since 0.10.0 and goes in 0.11.0; use the fits this machine filter of HbModelSheet')

export type HbCapState = 'off' | 'loading' | 'on' | 'failed' | 'unavailable'
export type HbCapNeedKind = 'webgpu' | 'microphone' | 'camera' | 'model' | 'other'
export type HbCapVerb = 'enable' | 'cancel' | 'disable' | 'retry' | 'unload'
/** How fast it runs on this machine: a heads up, not a benchmark. */
export type HbCapSpeed = 'fast' | 'ok' | 'slow' | 'none'

export interface HbCapNeed {
  kind: HbCapNeedKind
  /** Words on the chip; defaults to the kind. */
  label?: string
  /** This device or page lacks it. */
  missing?: boolean
}

export interface HbCap {
  id: string
  name: string
  icon?: IconName
  state: HbCapState
  needs?: Array<HbCapNeedKind | HbCapNeed>
  /** '17.7 mb', 'about 3.3 gb'; empty when nothing downloads. */
  size?: string
  sizeSource?: HbSizeSource
  /** SPDX id or plain words. Empty hides the licence line. */
  licence?: string
  commercial?: boolean | null
  /** What the licence covers: 'weights', 'engine and models'. */
  licenceWhat?: string
  /** Id of a capability this one needs on first. */
  dependsOn?: string
  /** Why it cannot run here, or the error when it failed. */
  reason?: string
  /** What turning it on asks for, said before the browser asks. */
  ask?: string
  /** Button words while off: 'load and turn on', 'allow the microphone'. */
  action?: string
  /** Button words while on; empty means it cannot be turned off here. */
  offAction?: string
  /** Bytes so far and in all while loading. */
  loaded?: number
  total?: number | null
  /** Speed chip: fast, ok, slow, or none when it cannot run here. */
  speed?: HbCapSpeed
  /** The one this page uses now for its job: a 'current' mark. */
  current?: boolean
  /** Its weights are in the store: a 'stored' mark, and turning on skips the download. */
  stored?: boolean
  /** What still works without it: 'chat runs on cpu with the small models.' */
  without?: string
  /** While on, a second button that frees its memory and keeps the weights stored. */
  unload?: boolean
}

interface Props {
  caps: HbCap[]
  label?: string
  /** The `2 of 9 on` line above the rows. */
  summary?: boolean
  /** The machine in one line, from the probe: 'webgpu, apple metal-3, shader-f16, 8 gb memory or more'. */
  machine?: string
  /** Every download in paper, not pink: another value owns the view. */
  quiet?: boolean
  announce?: boolean
  announceGap?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'what you can turn on',
  summary: true,
  machine: '',
  quiet: false,
  announce: true,
  announceGap: 3000,
})

const emit = defineEmits<{ act: [id: string, verb: HbCapVerb] }>()

const uid = makeUid('hb-cap')
const NEED: Record<HbCapNeedKind, IconName> = {
  webgpu: 'microchip', microphone: 'microphone', camera: 'camera', model: 'brain', other: 'circle-nodes',
}
const VERDICT: Record<HbCapState, HbVerdictStatus> = {
  off: 'not run', loading: 'running', on: 'pass', failed: 'fail', unavailable: 'warn',
}

const SPEED: Record<HbCapSpeed, string> = { fast: 'fast', ok: 'ok', slow: 'slow', none: 'n/a' }

const byId = computed(() => new Map(props.caps.map((c) => [c.id, c])))
const onCount = computed(() => props.caps.filter((c) => c.state === 'on').length)
const firstLoading = computed(() => props.caps.find((c) => c.state === 'loading')?.id)

function pct(c: HbCap) {
  return c.total ? Math.floor(Math.min(1, (c.loaded ?? 0) / c.total) * 100) : null
}
function stateWords(c: HbCap) {
  if (c.state === 'loading') {
    const p = pct(c)
    return p === null ? 'loading' : `loading ${p} percent`
  }
  return c.state === 'unavailable' ? 'cannot run here' : c.state
}
function needs(c: HbCap) {
  return (c.needs ?? []).map((n) => (typeof n === 'string' ? { kind: n } as HbCapNeed : n))
}
function sizeWords(c: HbCap) {
  if (!c.size) return ''
  return c.sizeSource && c.sizeSource !== 'unknown' ? `${c.size} (${c.sizeSource})` : c.size
}
function dep(c: HbCap) {
  if (!c.dependsOn || c.state === 'on' || c.state === 'loading') return ''
  const p = byId.value.get(c.dependsOn)
  if (!p || p.state === 'on') return ''
  const size = p.size ? ` (${p.size})` : ''
  return c.state === 'unavailable'
    ? `needs ${p.name}, which cannot run here.`
    : `needs ${p.name}${size}. the button turns on both.`
}
function note(c: HbCap): { text: string; cls: string } | null {
  const why = c.state === 'unavailable' || c.state === 'failed' ? (c.reason ?? '') : ''
  const d = dep(c)
  if (!why && !d) return null
  return { text: [why, d].filter(Boolean).join(' '), cls: why ? 'hb-cap-why' : 'hb-cap-dep' }
}
function button(c: HbCap): { text: string; verb: HbCapVerb; disabled: boolean } | null {
  switch (c.state) {
    case 'off': return { text: c.action || (c.stored ? 'load and turn on' : 'turn on'), verb: 'enable', disabled: false }
    case 'loading': return { text: 'cancel', verb: 'cancel', disabled: false }
    case 'on': return c.offAction === '' ? null : { text: c.offAction || 'turn off', verb: 'disable', disabled: false }
    case 'failed': return { text: 'try again', verb: 'retry', disabled: false }
    default: return { text: c.action || 'turn on', verb: 'enable', disabled: true }
  }
}

const live = useLiveAnnounce(props.announceGap)
watch(
  () => props.caps.map((c) => `${c.id}:${c.state}`).join('|'),
  (_now, before) => {
    if (!props.announce || before === undefined) return
    const was = new Map(before.split('|').map((s) => s.split(':') as [string, string]))
    for (const c of props.caps) {
      const w = was.get(c.id)
      if (w === undefined || w === c.state) continue
      if (c.state === 'on') live.say(`${c.name} is on.`)
      else if (c.state === 'failed') live.say(`${c.name} failed. ${c.reason ?? ''}`.trim())
      else if (c.state === 'off' && w === 'loading') live.say(`${c.name} cancelled.`)
    }
  },
)
</script>

<template>
  <div class="hb-caps">
    <p v-if="props.machine" class="hb-caps-machine">{{ props.machine }}</p>
    <p v-if="props.summary" class="hb-caps-sum">{{ onCount }} of {{ props.caps.length }} on</p>
    <ul class="hb-caps-list" :aria-label="props.label">
      <li
        v-for="c in props.caps"
        :key="c.id"
        class="hb-cap"
        :class="`is-${c.state}`"
        :aria-labelledby="`${uid}-${c.id}-n`"
      >
        <div class="hb-cap-hd">
          <HbIcon v-if="c.icon" :name="c.icon" :size="16" />
          <span :id="`${uid}-${c.id}-n`" class="hb-cap-name">{{ c.name }}</span>
          <HbVerdict :status="VERDICT[c.state]" :text="stateWords(c)" />
          <span v-if="c.speed" class="hb-cap-speed" :class="`is-${c.speed}`"><span class="hb-sr">speed here: </span>{{ SPEED[c.speed] }}</span>
          <span v-if="c.current" class="hb-cap-mark">current</span>
          <span v-if="c.stored" class="hb-cap-mark is-stored">stored</span>
        </div>
        <button
          v-if="button(c)"
          type="button"
          class="hb-btn hb-btn-2 hb-btn-sm hb-cap-act"
          :disabled="button(c)!.disabled"
          :aria-describedby="note(c) ? `${uid}-${c.id}-w` : undefined"
          @click="emit('act', c.id, button(c)!.verb)"
        >{{ button(c)!.text }}<span class="hb-sr">, {{ c.name }}</span></button>
        <button
          v-if="c.unload && c.state === 'on'"
          type="button"
          class="hb-btn hb-btn-2 hb-btn-sm hb-cap-act2"
          @click="emit('act', c.id, 'unload')"
        >unload<span class="hb-sr">, {{ c.name }}. the weights stay stored</span></button>
        <ul v-if="needs(c).length || c.size" class="hb-cap-needs" aria-label="needs">
          <li v-for="n in needs(c)" :key="n.kind + (n.label ?? '')" class="hb-cap-need" :class="{ 'is-missing': n.missing }">
            <HbIcon :name="NEED[n.kind]" :size="14" />
            <span v-if="n.missing" class="hb-sr">missing: </span>{{ n.label ?? n.kind }}
          </li>
          <li v-if="c.size" class="hb-cap-need"><HbIcon name="download" :size="14" />{{ sizeWords(c) }}</li>
        </ul>
        <p v-if="note(c)" :id="`${uid}-${c.id}-w`" :class="note(c)!.cls">{{ note(c)!.text }}</p>
        <p v-if="c.ask && c.state === 'off'" class="hb-cap-ask">{{ c.ask }}</p>
        <p v-if="c.without && c.state !== 'on'" class="hb-cap-without">without it: {{ c.without }}</p>
        <HbProgress
          v-if="c.state === 'loading'"
          :loaded="c.loaded ?? 0"
          :total="c.total ?? null"
          state="running"
          :quiet="props.quiet || c.id !== firstLoading"
          :actions="false"
          :live="false"
          :label="c.name"
        />
        <HbLicence :licence="c.licence" :commercial="c.commercial ?? null" :what="c.licenceWhat ?? 'weights'" />
      </li>
    </ul>
    <p v-if="props.announce" class="hb-sr" role="status" aria-live="polite">{{ live.text.value }}</p>
  </div>
</template>
