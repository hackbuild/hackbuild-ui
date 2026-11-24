<script lang="ts">
let seq = 0
</script>

<script setup lang="ts">
import { nextTick, ref, watch, onBeforeUnmount, onMounted } from 'vue'
import { persisted } from '../vanilla/persisted'
import HbTiles from './HbTiles.vue'
import HbTile from './HbTile.vue'
import HbIcon from './HbIcon.vue'

export interface HbWelcomeStep {
  name: string
  text: string
  /** Ticked from live state: the step is done. */
  done?: boolean
  /** Live count or state in place of the action: '2 installed'. */
  count?: string
  /** Button words that route to the step's fix: 'pick a model'. */
  action?: string
}

export interface HbWelcomeStart {
  id: string
  name: string
  sub?: string
  /** The one focal start. It fills pink; at most one per card. */
  primary?: boolean
  /** Thumb drawn from the design: an image URL. */
  thumb?: string
}

export interface Props {
  /** The tool name. */
  title: string
  /** Pink trailing part of the title, usually the dot. */
  accent?: string
  /** Rendered after the accent in ink, usually bench. */
  suffix?: string
  /** Two lines in Special Elite: what the design is and what prints it. */
  note?: string
  steps?: HbWelcomeStep[]
  /** Three starts: start blank, a worked example, a variant example. */
  starts: HbWelcomeStart[]
  /** Remember a close under this storage key, so the card stays shut on
      the next visit. Starting from a tile does not count as a close. */
  persistKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  accent: '.',
  suffix: '',
  note: '',
  steps: () => [],
  persistKey: '',
})

const open = defineModel<boolean>('open', { default: true })

const emit = defineEmits<{
  start: [id: string]
  close: []
  step: [index: number]
}>()

const dismissed = props.persistKey && typeof window !== 'undefined' ? persisted<boolean>(props.persistKey, false) : null
if (dismissed?.get()) open.value = false

const card = ref<HTMLElement | null>(null)
seq += 1
const titleId = `hb-welcome-${seq}`

function close() {
  dismissed?.set(true)
  open.value = false
  emit('close')
}

function start(id: string) {
  emit('start', id)
  open.value = false
}

function focusCard() {
  nextTick(() => card.value?.focus())
}

onMounted(() => { if (open.value) focusCard() })
onBeforeUnmount(() => dismissed?.dispose())
watch(open, (value) => { if (value) focusCard() })
</script>

<template>
  <!-- Sits in the stage centre over HbStage, not over the page, so it is
       a non-modal dialog. Escape closes it. -->
  <div v-if="open" class="hb-welcome-scrim" @keydown.esc.stop="close">
    <section
      ref="card"
      class="hb-welcome"
      role="dialog"
      aria-modal="false"
      :aria-labelledby="titleId"
      tabindex="-1"
    >
      <button type="button" class="hb-iconbtn hb-welcome-close" aria-label="close" @click="close">
        <HbIcon name="x" :size="14" />
      </button>
      <h2 :id="titleId">{{ props.title }}<span v-if="props.accent">{{ props.accent }}</span><span v-if="props.suffix" class="hb-suffix">{{ props.suffix }}</span></h2>
      <p v-if="props.note" class="hb-welcome-note">{{ props.note }}</p>
      <ol v-if="props.steps.length" class="hb-welcome-steps">
        <li v-for="(step, index) in props.steps" :key="step.name" :class="{ 'is-done': step.done }">
          <b><span class="hb-welcome-n">{{ step.done ? 'ok' : index + 1 }}</span> {{ step.name }}</b>
          <p>{{ step.text }}</p>
          <span v-if="step.count" class="hb-welcome-count">{{ step.count }}</span>
          <button v-else-if="step.action && !step.done" type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('step', index)">{{ step.action }}</button>
        </li>
      </ol>
      <slot />
      <HbTiles role="group" aria-label="start">
        <HbTile
          v-for="item in props.starts"
          :key="item.id"
          :name="item.name"
          :sub="item.sub"
          :active="item.primary === true"
          @click="start(item.id)"
        ><template v-if="item.thumb" #media><img :src="item.thumb" alt="" /></template></HbTile>
      </HbTiles>
    </section>
  </div>
</template>
