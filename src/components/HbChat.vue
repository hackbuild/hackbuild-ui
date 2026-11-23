<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

export interface HbChatLine {
  role: 'user' | 'assistant' | 'system'
  text: string
  /** Think text, kept folded. */
  think?: string
  /** false while the reply streams. */
  done?: boolean
  /** 'stopped.', 'cut at the token limit.', or the failure. */
  note?: string
  /** The note names a failure. */
  error?: boolean
}

interface Props {
  lines: HbChatLine[]
  /** A reply is streaming: the stop button shows and send waits. */
  streaming?: boolean
  /** No model loaded: the composer says so and send is off. */
  disabled?: boolean
  placeholder?: string
  /** Show the api key field for a remote endpoint. */
  keyField?: boolean
  /** Names for the speakers. */
  userName?: string
  assistantName?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  streaming: false,
  disabled: false,
  placeholder: 'type a message. enter sends, shift enter adds a line.',
  keyField: false,
  userName: 'you',
  assistantName: 'model',
  label: 'chat',
})

const draft = defineModel<string>('draft', { default: '' })
const apiKey = defineModel<string>('apiKey', { default: '' })

const emit = defineEmits<{ send: [text: string]; stop: [] }>()

const log = ref<HTMLElement | null>(null)

function masked(k: string): string {
  if (k.length <= 8) return '*'.repeat(k.length)
  return `${k.slice(0, 4)}...${k.slice(-4)}`
}
function send() {
  const t = draft.value.trim()
  if (!t || props.streaming || props.disabled) return
  emit('send', t)
  draft.value = ''
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    send()
  }
}
function who(role: HbChatLine['role']): string {
  return role === 'user' ? props.userName : role === 'assistant' ? props.assistantName : 'note'
}

// Follow the newest line unless the reader scrolled up.
watch(
  () => [props.lines.length, props.lines[props.lines.length - 1]?.text.length],
  async () => {
    const el = log.value
    if (!el) return
    const atEnd = el.scrollHeight - el.scrollTop - el.clientHeight < 48
    await nextTick()
    if (atEnd) el.scrollTop = el.scrollHeight
  },
)
</script>

<template>
  <section class="hb-chat" :aria-label="props.label">
    <div v-if="props.keyField" class="hb-chat-key">
      <label class="hb-ctl">api key
        <input v-model="apiKey" class="hb-input" type="password" autocomplete="off" placeholder="stays in this tab, never stored">
      </label>
      <span v-if="apiKey" class="hb-readout">{{ masked(apiKey) }}</span>
    </div>
    <div ref="log" class="hb-chat-log" role="log" aria-live="polite" tabindex="0">
      <div
        v-for="(line, i) in props.lines"
        :key="i"
        class="hb-msg"
        :class="{ 'is-user': line.role === 'user', 'is-system': line.role === 'system', 'is-streaming': line.role === 'assistant' && line.done === false }"
      >
        <span class="hb-msg-who">{{ who(line.role) }}</span>
        <details v-if="line.think" class="hb-think"><summary>thinking</summary><pre>{{ line.think }}</pre></details>
        <div class="hb-msg-text">{{ line.text }}</div>
        <span v-if="line.note" class="hb-msg-note" :class="{ 'is-err': line.error }">{{ line.note }}</span>
      </div>
      <slot name="empty"><div v-if="!props.lines.length" class="hb-msg is-system"><div class="hb-msg-text">{{ props.disabled ? 'no model loaded. pick one first.' : 'no messages yet.' }}</div></div></slot>
    </div>
    <form class="hb-composer" @submit.prevent="send">
      <textarea
        v-model="draft"
        class="hb-textarea"
        rows="2"
        aria-label="message"
        :placeholder="props.disabled ? 'no model loaded' : props.placeholder"
        :disabled="props.disabled"
        @keydown="onKey"
      />
      <div class="hb-composer-acts">
        <button v-if="props.streaming" type="button" class="hb-btn hb-btn-2" @click="emit('stop')">stop</button>
        <button type="submit" class="hb-btn" :disabled="props.disabled || props.streaming || !draft.trim()">send</button>
      </div>
    </form>
  </section>
</template>
