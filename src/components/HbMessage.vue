<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { useCopy } from '../composables/useCopy'
import { splitParts, statsText, autosize, type MessageStats } from '../vanilla/chat'
import HbThink from './HbThink.vue'
import HbToolCall from './HbToolCall.vue'
import HbIcon from './HbIcon.vue'
import type { IconName } from '../icons'
import type { ToolState } from '../vanilla/chat'

export type HbMessageAction = 'speak' | 'retry' | 'remember' | 'copy' | 'remove' | 'edit'

export interface HbRecalled {
  title: string
  /** Retrieval score, 0 to 1. */
  score?: number | null
  /** Where the memory tool shows it. */
  ref?: string
}

export interface HbToolCallData {
  id?: string
  name: string
  args?: unknown
  result?: unknown
  error?: string
  state?: ToolState
  ms?: number | null
  restored?: boolean
}

interface Props {
  who?: 'user' | 'assistant' | 'system'
  /** Speaker name on the who line. */
  name?: string
  text?: string
  /** Split the reply on blank lines into short boxes. Off for tools. */
  split?: boolean
  /** Box cap when split. */
  cap?: number
  /** The reply streams: a block cursor ends the last box. */
  streaming?: boolean
  /** Before the first token: what it waits on, 'loading the model', 'thinking'. */
  pending?: string
  /** The failure in the turn, with its fix: 'reply stopped: the engine closed. press redo.' */
  error?: string
  /** 'stopped.', 'cut at the token limit.' */
  note?: string
  stats?: MessageStats | null
  /** Think text, folded; open while streaming and no answer yet. */
  think?: string
  tools?: HbToolCallData[]
  /** Memory that shaped this reply: 'memory used (n)'. */
  recalled?: HbRecalled[]
  /** What the camera showed the model. */
  seen?: string
  /** Actions in order. Default by speaker. Empty array hides the row. */
  actions?: HbMessageAction[] | null
  /** Already saved to memory: the remember action reads 'in memory'. */
  remembered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  who: 'assistant',
  name: '',
  text: '',
  split: false,
  cap: 5,
  streaming: false,
  pending: '',
  error: '',
  note: '',
  stats: null,
  think: '',
  tools: () => [],
  recalled: () => [],
  seen: '',
  actions: null,
  remembered: false,
})

const emit = defineEmits<{
  speak: []
  retry: []
  remember: []
  copy: [text: string]
  remove: []
  edit: [text: string]
  recall: [item: HbRecalled]
}>()

const parts = computed(() => {
  if (!props.text) return []
  return props.split && props.who === 'assistant' ? splitParts(props.text, props.cap) : [props.text]
})
const acts = computed<HbMessageAction[]>(() => {
  if (props.actions) return props.actions
  if (props.who === 'system') return []
  return props.who === 'user' ? ['edit', 'copy', 'remove'] : ['speak', 'retry', 'copy', 'remove']
})
const busy = computed(() => props.streaming || !!props.pending)
const stat = computed(() => statsText(props.stats))
const whoName = computed(() => props.name || (props.who === 'user' ? 'you' : props.who === 'assistant' ? 'model' : 'note'))

const { state: copyState, copy } = useCopy()
async function onCopy() {
  await copy(props.text)
  emit('copy', props.text)
}

// Delete asks twice in place: the first press arms, three seconds or a
// press elsewhere backs out.
const armed = ref(false)
let armTimer: ReturnType<typeof setTimeout> | undefined
function onRemove() {
  if (!armed.value) {
    armed.value = true
    armTimer = setTimeout(() => { armed.value = false }, 3000)
    return
  }
  clearTimeout(armTimer)
  armed.value = false
  emit('remove')
}
onBeforeUnmount(() => clearTimeout(armTimer))

const editing = ref(false)
const draft = ref('')
const editBox = ref<HTMLTextAreaElement | null>(null)
async function startEdit() {
  draft.value = props.text
  editing.value = true
  await nextTick()
  if (editBox.value) { autosize(editBox.value); editBox.value.focus() }
}
function saveEdit() {
  const t = draft.value.trim()
  editing.value = false
  if (t && t !== props.text) emit('edit', t)
}
function onEditKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.preventDefault(); editing.value = false }
  else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveEdit() }
}
defineExpose({ startEdit })

const ICON: Record<HbMessageAction, IconName> = { speak: 'wave', retry: 'redo', remember: 'brain', copy: 'copy', remove: 'trash', edit: 'pen' }
function label(a: HbMessageAction): string {
  if (a === 'copy') return copyState.value === 'copied' ? 'copied' : copyState.value === 'failed' ? 'copy failed' : 'copy'
  if (a === 'remove') return armed.value ? 'delete?' : 'delete'
  if (a === 'retry') return 'redo'
  if (a === 'remember') return props.remembered ? 'in memory' : 'remember'
  return a
}
function run(a: HbMessageAction) {
  if (a === 'speak') emit('speak')
  else if (a === 'retry') emit('retry')
  else if (a === 'remember') emit('remember')
  else if (a === 'copy') onCopy()
  else if (a === 'remove') onRemove()
  else startEdit()
}
</script>

<template>
  <div
    class="hb-msg"
    :class="{ 'is-user': props.who === 'user', 'is-system': props.who === 'system', 'is-streaming': props.streaming, 'is-split': parts.length > 1, 'has-err': !!props.error }"
  >
    <span class="hb-msg-who">
      <span class="hb-msg-name">{{ whoName }}</span>
      <span v-if="stat" class="hb-msg-stats">{{ stat }}</span>
    </span>
    <slot name="think"><HbThink v-if="props.think" :text="props.think" :streaming="props.streaming && !props.text" /></slot>
    <span v-if="props.pending && !props.text" class="hb-msg-pending" role="status">{{ props.pending }}</span>
    <slot name="tools">
      <div v-if="props.tools.length" class="hb-msg-tools">
        <HbToolCall v-for="(t, i) in props.tools" :key="t.id ?? i" v-bind="t" />
      </div>
    </slot>
    <div v-if="editing" class="hb-msg-edit">
      <textarea ref="editBox" v-model="draft" class="hb-textarea" aria-label="edit your message" @input="autosize($event.target as HTMLTextAreaElement)" @keydown="onEditKey" />
      <div class="hb-msg-edit-acts">
        <button type="button" class="hb-btn hb-btn-sm" @click="saveEdit">send edit</button>
        <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="editing = false">cancel</button>
      </div>
    </div>
    <div v-else-if="parts.length" class="hb-msg-parts">
      <div v-for="(p, i) in parts" :key="i" class="hb-msg-text">{{ p }}</div>
    </div>
    <slot />
    <p v-if="props.error" class="hb-msg-err" role="alert">{{ props.error }}</p>
    <span v-if="props.note" class="hb-msg-note">{{ props.note }}</span>
    <span v-if="props.seen" class="hb-msg-seen">seen: {{ props.seen }}</span>
    <slot name="recalled">
      <details v-if="props.recalled.length" class="hb-msg-used">
        <summary>memory used ({{ props.recalled.length }})</summary>
        <ul>
          <li v-for="(r, i) in props.recalled" :key="i">
            <button type="button" class="hb-msg-used-item" @click="emit('recall', r)">{{ r.title }}</button>
            <span v-if="r.score !== undefined && r.score !== null" class="hb-msg-used-score">{{ r.score.toFixed(2) }}</span>
          </li>
        </ul>
      </details>
    </slot>
    <div v-if="acts.length && !busy && !editing" class="hb-msg-acts" role="group" :aria-label="`${whoName} message actions`">
      <button
        v-for="a in acts"
        :key="a"
        type="button"
        class="hb-msg-act"
        :class="{ 'is-armed': a === 'remove' && armed, 'is-on': a === 'remember' && props.remembered }"
        :aria-pressed="a === 'remember' ? props.remembered : undefined"
        @click="run(a)"
        @blur="a === 'remove' && armed ? (armed = false) : undefined"
      >
        <HbIcon :name="ICON[a]" :size="12" />{{ label(a) }}
      </button>
    </div>
  </div>
</template>
