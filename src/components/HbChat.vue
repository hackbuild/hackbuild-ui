<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { autosize, coarsePointer, composerKey, pinned, type MessageStats } from '../vanilla/chat'
import HbMessage, { type HbMessageAction, type HbRecalled, type HbToolCallData } from './HbMessage.vue'
import HbApiKey from './HbApiKey.vue'

export interface HbChatLine {
  /** Stable key when lines are removed or edited. */
  id?: string | number
  role: 'user' | 'assistant' | 'system'
  text: string
  /** Think text, open while the reply has not started. */
  think?: string
  /** false while the reply streams. */
  done?: boolean
  /** What the turn waits on before the first token: 'loading the model', 'thinking'. */
  pending?: string
  /** 'stopped.', 'cut at the token limit.', or the failure. */
  note?: string
  /** The note names a failure: it shows as the error card in the turn. */
  error?: boolean
  stats?: MessageStats | null
  tools?: HbToolCallData[]
  recalled?: HbRecalled[]
  seen?: string
  /** Override the actions for this line. */
  actions?: HbMessageAction[]
  /** Saved to memory: the remember action reads 'in memory'. */
  remembered?: boolean
}

interface Props {
  lines: HbChatLine[]
  /** A reply is streaming: the primary button reads stop. */
  streaming?: boolean
  /** No model and no scripted engine: the composer says so and send is off. */
  disabled?: boolean
  placeholder?: string
  /** Show the api key field for a remote endpoint. */
  keyField?: boolean
  /** The shape the key must match. */
  keyPattern?: RegExp | string | null
  /** Names for the speakers. */
  userName?: string
  assistantName?: string
  label?: string
  /** Actions under each message. false hides them. */
  actions?: boolean
  /** Split replies on blank lines into up to 5 boxes (a persona option). */
  split?: boolean
  /** Example prompts shown while the transcript is empty. */
  examples?: string[]
  /** The header row with clear, export and import. */
  header?: boolean
  /** The title in the header row. */
  title?: string
  /** Show the transcript. false leaves the composer alone, to dock it in
      HbAppShell while the lines show elsewhere, such as a rack tab. */
  log?: boolean
  /** Show the composer. false leaves a read only transcript. */
  composer?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  streaming: false,
  disabled: false,
  placeholder: '',
  keyField: false,
  keyPattern: null,
  userName: 'you',
  assistantName: 'model',
  label: 'chat',
  actions: true,
  split: false,
  examples: () => [],
  header: false,
  title: '',
  log: true,
  composer: true,
})

const draft = defineModel<string>('draft', { default: '' })
const apiKey = defineModel<string>('apiKey', { default: '' })

const emit = defineEmits<{
  send: [text: string]
  stop: []
  speak: [index: number]
  retry: [index: number]
  remember: [index: number]
  copy: [index: number]
  remove: [index: number]
  edit: [index: number, text: string]
  recall: [index: number, item: HbRecalled]
  clear: []
  export: []
  import: []
}>()

const log = ref<HTMLElement | null>(null)
const box = ref<HTMLTextAreaElement | null>(null)
const msgs = ref<Array<InstanceType<typeof HbMessage> | null>>([])
const coarse = ref(false)
onMounted(() => {
  coarse.value = coarsePointer()
  if (box.value) autosize(box.value)
})

const hint = computed(() => {
  if (props.placeholder) return props.placeholder
  if (props.disabled) return 'no model loaded. pick one to chat.'
  return coarse.value ? 'type a message. the button sends.' : 'type a message. enter sends, shift enter adds a line.'
})

function send() {
  const t = draft.value.trim()
  if (!t || props.streaming || props.disabled) return
  stick = true
  emit('send', t)
  draft.value = ''
  nextTick(() => box.value && autosize(box.value))
}
function primary() {
  if (props.streaming) emit('stop')
  else send()
}
function lastUser(): number {
  for (let i = props.lines.length - 1; i >= 0; i--) if (props.lines[i]!.role === 'user') return i
  return -1
}
function onKey(e: KeyboardEvent) {
  const a = composerKey(e, { busy: props.streaming, empty: !draft.value, coarse: coarse.value })
  if (!a) return
  e.preventDefault()
  if (a === 'send') send()
  else if (a === 'stop') emit('stop')
  else {
    const i = lastUser()
    if (i >= 0) msgs.value[i]?.startEdit()
  }
}
function onInput(e: Event) {
  autosize(e.target as HTMLTextAreaElement)
}
function example(t: string) {
  if (props.disabled || props.streaming) return
  stick = true
  emit('send', t)
}
function actsFor(line: HbChatLine): HbMessageAction[] | null {
  if (!props.actions) return []
  return line.actions ?? null
}

// Follow the newest text only while the reader is at the bottom, and
// always after the person sends.
let stick = false
watch(
  () => [props.lines.length, props.lines[props.lines.length - 1]?.text.length, props.lines[props.lines.length - 1]?.think?.length],
  async () => {
    const el = log.value
    if (!el) return
    const atEnd = stick || pinned(el, 80)
    stick = false
    await nextTick()
    if (atEnd) el.scrollTop = el.scrollHeight
  },
)
watch(draft, () => nextTick(() => box.value && autosize(box.value)))
</script>

<template>
  <section class="hb-chat" :class="{ 'is-composer': !props.log }" :aria-label="props.label">
    <div v-if="props.header || $slots.header" class="hb-chat-hd">
      <slot name="header">
        <span class="hb-chat-title">{{ props.title || props.label }}</span>
        <span class="hb-chat-hd-acts">
          <slot name="header-extra" />
          <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" :disabled="!props.lines.length || props.streaming" @click="emit('clear')">clear</button>
          <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" :disabled="!props.lines.length" @click="emit('export')">export</button>
          <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" :disabled="props.streaming" @click="emit('import')">import</button>
        </span>
      </slot>
    </div>
    <div v-if="props.keyField" class="hb-chat-key">
      <HbApiKey v-model="apiKey" :pattern="props.keyPattern" />
    </div>
    <div v-if="props.log" ref="log" class="hb-chat-log" role="log" aria-live="polite" tabindex="0">
      <template v-for="(line, i) in props.lines" :key="line.id ?? i">
        <slot name="message" :line="line" :index="i">
          <HbMessage
            :ref="(c) => (msgs[i] = c as InstanceType<typeof HbMessage> | null)"
            :who="line.role"
            :name="line.role === 'user' ? props.userName : line.role === 'assistant' ? props.assistantName : 'note'"
            :text="line.text"
            :split="props.split"
            :streaming="line.role === 'assistant' && line.done === false"
            :pending="line.done === false ? line.pending : ''"
            :think="line.think"
            :error="line.error ? line.note : ''"
            :note="line.error ? '' : line.note"
            :stats="line.stats"
            :tools="line.tools"
            :recalled="line.recalled"
            :seen="line.seen"
            :actions="actsFor(line)"
            :remembered="line.remembered"
            @speak="emit('speak', i)"
            @retry="emit('retry', i)"
            @remember="emit('remember', i)"
            @copy="emit('copy', i)"
            @remove="emit('remove', i)"
            @edit="(t: string) => emit('edit', i, t)"
            @recall="(r: HbRecalled) => emit('recall', i, r)"
          />
        </slot>
      </template>
      <slot name="empty">
        <div v-if="!props.lines.length" class="hb-chat-empty">
          <p class="hb-chat-empty-text">{{ props.disabled ? 'no model loaded. pick one first.' : 'no messages yet.' }}</p>
          <div v-if="props.examples.length" class="hb-chat-examples">
            <button v-for="ex in props.examples" :key="ex" type="button" class="hb-chip" :disabled="props.disabled" @click="example(ex)">{{ ex }}</button>
          </div>
        </div>
      </slot>
    </div>
    <slot name="above" />
    <div v-if="$slots.note" class="hb-chat-note"><slot name="note" /></div>
    <form v-if="props.composer" class="hb-composer" @submit.prevent="primary">
      <slot name="composer-start" />
      <textarea
        ref="box"
        v-model="draft"
        class="hb-textarea"
        rows="1"
        aria-label="message"
        :enterkeyhint="coarse ? 'enter' : 'send'"
        :placeholder="hint"
        :disabled="props.disabled"
        @keydown="onKey"
        @input="onInput"
      />
      <div class="hb-composer-acts">
        <slot name="composer-end" />
        <button
          type="submit"
          class="hb-btn"
          :class="{ 'hb-btn-2': props.streaming }"
          :disabled="!props.streaming && (props.disabled || !draft.trim())"
          :aria-keyshortcuts="props.streaming ? 'Escape' : 'Enter'"
        >{{ props.streaming ? 'stop' : 'send' }}</button>
      </div>
    </form>
  </section>
</template>
