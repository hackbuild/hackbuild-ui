<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import HbIcon from './HbIcon.vue'
import { useLiveAnnounce } from '../composables/useLiveAnnounce'
import type { HbIconName as IconName } from '../icons/stroke'
import { EVENT_KINDS, kindOf, type EventKind } from '../vanilla/log'

export type HbCausalKind =
  | 'sense' | 'choice' | 'act' | 'model' | 'reward' | 'cue'
  | 'you' | 'me' | 'fail' | 'eye' | 'note' | 'think' | 'load'
type Id = string | number

export interface HbCausalEvent {
  id: Id
  /** Seconds on the sim clock. */
  t: number
  /** Who: 'dog', 'moheeb'. */
  agent: string
  kind: HbCausalKind | string
  /** 'saw squirrel at 6.1 m', 'chase, prey drive 0.81, react in 230 ms'. */
  text: string
  /** The event that led to this one. */
  cause?: Id
  /** Replaces the kind icon: 'wind' for a scent, 'ear-listen' for a sound. */
  icon?: IconName
  /** A row replaced in place while it runs: a download, a thinking line.
      Keep the id and swap the event; live rows sit above the rest, are
      never announced or pinned, and drop the flag when done. */
  live?: boolean
  /** 0 to 1 draws the bar on a live row; leave it out when the total is unknown. */
  fraction?: number
}

interface Props {
  events: HbCausalEvent[]
  /** Agent filter chips, in this order; defaults to the agents in the events. */
  agents?: string[]
  /** Kind filter chips; defaults to the kinds in the events. */
  kinds?: string[]
  /** One section per agent instead of one list. */
  group?: boolean
  /** Links of the cause chain shown under an event. */
  depth?: number
  /** Rows shown, newest first, after the pins. */
  limit?: number
  label?: string
  /** 't' in seconds to the stamp; defaults to m:ss.s. */
  formatTime?: (t: number) => string
  /** Announce the newest shown event in a polite live region. */
  announce?: boolean
  announceGap?: number
  /** Tag and tone per kind, over the defaults: you, me, act, fail, eye,
      note, think and load carry the tones of the line log. */
  tones?: Record<string, EventKind>
}

const props = withDefaults(defineProps<Props>(), {
  group: false,
  depth: 3,
  limit: 60,
  label: 'cause timeline',
  announce: true,
  announceGap: 8000,
  tones: () => ({}),
})

/** Ids kept at the top. */
const pinned = defineModel<Id[]>('pinned', { default: () => [] })

const KIND_ORDER = ['you', 'me', 'sense', 'eye', 'choice', 'act', 'fail', 'model', 'think', 'reward', 'cue', 'note', 'load']
const KIND_ICON: Record<string, IconName> = {
  sense: 'eye', choice: 'code-branch', act: 'paw', model: 'brain', reward: 'heart', cue: 'comment',
  you: 'arrow-right', me: 'comment', fail: 'warning', eye: 'eye', note: 'pen', think: 'circle-nodes', load: 'download',
}
/** The causal kinds keep their own words; the line log kinds bring tag and tone. */
const CAUSAL_KINDS: Record<string, EventKind> = {
  sense: { tag: 'sense', tone: 'dim' }, choice: { tag: 'choice' }, model: { tag: 'model' }, reward: { tag: 'reward' }, cue: { tag: 'cue' },
}
const kindMap = computed(() => ({ ...EVENT_KINDS, ...CAUSAL_KINDS, ...props.tones }))
const look = (k: string) => kindOf(kindMap.value, k)
const pct = (f: number) => `${Math.round(Math.max(0, Math.min(1, f)) * 100)}%`
const iconOf = (e: HbCausalEvent): IconName => e.icon ?? KIND_ICON[e.kind] ?? 'circle-nodes'

function stamp(t: number) {
  if (props.formatTime) return props.formatTime(t)
  const m = Math.floor(t / 60)
  const s = t - m * 60
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`
}

const agentList = computed(() => props.agents ?? [...new Set(props.events.map((e) => e.agent))])
const kindList = computed(() => {
  if (props.kinds) return props.kinds
  const seen = new Set(props.events.map((e) => String(e.kind)))
  return [...KIND_ORDER.filter((k) => seen.has(k)), ...[...seen].filter((k) => !KIND_ORDER.includes(k))]
})

const hidden = reactive({ agents: new Set<string>(), kinds: new Set<string>() })
function flip(set: Set<string>, key: string) {
  if (set.has(key)) set.delete(key)
  else set.add(key)
}

const byId = computed(() => new Map(props.events.map((e) => [e.id, e])))
const pinSet = computed(() => new Set(pinned.value))

function chain(e: HbCausalEvent) {
  const out: HbCausalEvent[] = []
  const seen = new Set<Id>([e.id])
  let c = e.cause
  while (c !== undefined && out.length < props.depth && !seen.has(c)) {
    const p = byId.value.get(c)
    if (!p) break
    out.unshift(p)
    seen.add(c)
    c = p.cause
  }
  return out
}

const sorted = computed(() => [...props.events].sort((a, b) => b.t - a.t))
const visible = (e: HbCausalEvent) => !hidden.agents.has(e.agent) && !hidden.kinds.has(String(e.kind))
const shown = computed(() => [
  ...sorted.value.filter((e) => e.live && visible(e)),
  ...sorted.value.filter((e) => !e.live && !pinSet.value.has(e.id) && visible(e)).slice(0, props.limit),
])
const pins = computed(() => sorted.value.filter((e) => !e.live && pinSet.value.has(e.id)))
const groups = computed(() => {
  const out: Array<{ key: string; title: string; items: HbCausalEvent[] }> = []
  if (pins.value.length) out.push({ key: '#pinned', title: `pinned, ${pins.value.length}`, items: pins.value })
  if (props.group) {
    for (const a of agentList.value) {
      const items = shown.value.filter((e) => e.agent === a)
      if (items.length) out.push({ key: a, title: a, items })
    }
  } else if (shown.value.length) {
    out.push({ key: '#all', title: pins.value.length ? 'newest first' : '', items: shown.value })
  }
  return out
})

function togglePin(id: Id) {
  pinned.value = pinSet.value.has(id) ? pinned.value.filter((p) => p !== id) : [...pinned.value, id]
}

function words(e: HbCausalEvent) {
  const c = chain(e)
  const why = c.length ? `, after ${c.map((p) => p.text).join(', then ')}` : ''
  const run = e.live ? (e.fraction !== undefined ? `, running, ${pct(e.fraction)}` : ', running') : ''
  return `${stamp(e.t)}, ${e.agent}, ${look(String(e.kind)).tag}: ${e.text}${run}${why}`
}

const live = useLiveAnnounce(props.announceGap)
const newest = computed(() => shown.value.find((e) => !e.live))
watch(() => newest.value?.id, (id, before) => {
  if (!props.announce || id === undefined || before === undefined) return
  const e = newest.value!
  live.say(`${e.agent} ${look(String(e.kind)).tag}: ${e.text}`)
})
</script>

<template>
  <div class="hb-causal">
    <div v-if="agentList.length > 1" class="hb-causal-filters" role="group" aria-label="show agents">
      <span class="hb-causal-flabel" aria-hidden="true">agents</span>
      <button
        v-for="a in agentList"
        :key="a"
        type="button"
        class="hb-chip is-toggle"
        :class="{ 'is-on': !hidden.agents.has(a) }"
        :aria-pressed="!hidden.agents.has(a)"
        @click="flip(hidden.agents, a)"
      >{{ a }}</button>
    </div>
    <div v-if="kindList.length > 1" class="hb-causal-filters" role="group" aria-label="show kinds">
      <span class="hb-causal-flabel" aria-hidden="true">kinds</span>
      <button
        v-for="k in kindList"
        :key="k"
        type="button"
        class="hb-chip is-toggle"
        :class="{ 'is-on': !hidden.kinds.has(k) }"
        :aria-pressed="!hidden.kinds.has(k)"
        @click="flip(hidden.kinds, k)"
      ><HbIcon :name="KIND_ICON[k] ?? 'circle-nodes'" :size="14" />{{ look(k).tag }}</button>
    </div>
    <div class="hb-causal-list" role="region" :aria-label="props.label" tabindex="0">
      <template v-for="g in groups" :key="g.key">
        <h4 v-if="g.title" class="hb-causal-group">{{ g.title }}</h4>
        <ol :aria-label="g.title || props.label">
          <li
            v-for="e in g.items"
            :key="e.id"
            class="hb-cev"
            :class="[look(String(e.kind)).tone ? `is-${look(String(e.kind)).tone}` : '', { 'is-pinned': pinSet.has(e.id), 'is-live': e.live }]"
            :data-kind="e.kind"
          >
            <span class="hb-sr">{{ words(e) }}</span>
            <div class="hb-cev-hd" aria-hidden="true">
              <span class="hb-cev-t">{{ stamp(e.t) }}</span>
              <span class="hb-cev-agent">{{ e.agent }}</span>
              <span class="hb-cev-kind"><HbIcon :name="iconOf(e)" :size="14" />{{ look(String(e.kind)).tag }}</span>
            </div>
            <p class="hb-cev-text" aria-hidden="true">{{ e.text }}</p>
            <span v-if="e.live && e.fraction !== undefined" class="hb-cev-bar" aria-hidden="true"><i :style="{ width: pct(e.fraction) }" /></span>
            <ol v-if="e.cause !== undefined && chain(e).length" class="hb-cev-chain" aria-hidden="true">
              <li v-for="p in chain(e)" :key="p.id">
                <HbIcon :name="iconOf(p)" :size="14" />
                <span class="hb-cev-t">{{ stamp(p.t) }}</span>
                <span>{{ p.agent === e.agent ? '' : p.agent + ': ' }}{{ p.text }}</span>
              </li>
            </ol>
            <button
              v-if="!e.live"
              type="button"
              class="hb-cev-pin"
              :aria-pressed="pinSet.has(e.id)"
              :aria-label="(pinSet.has(e.id) ? 'unpin ' : 'pin ') + e.text"
              @click="togglePin(e.id)"
            >
              <HbIcon name="thumbtack" :size="14" />
            </button>
          </li>
        </ol>
      </template>
      <p v-if="!groups.length" class="hb-causal-empty">
        {{ props.events.length ? 'every event is filtered out. turn an agent or a kind back on.' : 'nothing has happened yet.' }}
      </p>
    </div>
    <p v-if="props.announce" class="hb-sr" role="status" aria-live="polite">{{ live.text.value }}</p>
  </div>
</template>
