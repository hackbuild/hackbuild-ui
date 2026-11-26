<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import HbIcon from './HbIcon.vue'
import { scoreText } from '../vanilla/memory'

interface Props {
  text: string
  kind: string
  title?: string
  entity?: string | string[]
  /** Recall score for the current query; shown in the kind chip. */
  score?: number | null
  /** 'nov 3 added', 'chat'. */
  when?: string
  /** Fed to the last reply. */
  used?: boolean
  /** No edit, no forget. */
  readonly?: boolean
  /** Kept in every prompt, never ranked out. Shows the pin and the on state. */
  pinned?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  entity: undefined,
  score: null,
  when: '',
  used: false,
  readonly: false,
  pinned: false,
})

const emit = defineEmits<{
  forget: []
  edit: [text: string]
  pin: [pinned: boolean]
}>()

const ents = computed(() => (Array.isArray(props.entity) ? props.entity : props.entity ? [props.entity] : []))
const editing = ref(false)
const draft = ref('')
const box = ref<HTMLTextAreaElement | null>(null)
const editBtn = ref<HTMLButtonElement | null>(null)

function edit() {
  draft.value = props.text
  editing.value = true
  nextTick(() => box.value?.focus())
}
function done(save: boolean) {
  if (save && draft.value.trim() && draft.value.trim() !== props.text) emit('edit', draft.value.trim())
  editing.value = false
  nextTick(() => editBtn.value?.focus())
}
function key(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.preventDefault(); done(false) }
  else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); done(true) }
}

const armed = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
function forget() {
  if (!armed.value) {
    armed.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { armed.value = false }, 3000)
    return
  }
  clearTimeout(timer)
  armed.value = false
  emit('forget')
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <!-- Kind chip carries the score; title, text, entity chips; edit and a
       ghost forget that asks once in place. -->
  <div class="hb-mem" :class="{ 'is-used': props.used, 'is-pinned': props.pinned }">
    <div class="hb-mem-body">
      <span v-if="props.pinned" class="hb-mem-pin"><HbIcon name="thumbtack" :size="14" />pinned</span>
      <span class="hb-mem-kind">{{ props.kind }}<b v-if="scoreText(props.score)" class="hb-mem-score">{{ scoreText(props.score) }}</b></span>
      <b v-if="props.title" class="hb-mem-title">{{ props.title }}</b>
      <span v-if="!editing" class="hb-mem-text">{{ props.text }}</span>
      <span v-for="e in ents" :key="e" class="hb-mem-ent">{{ e }}</span>
      <span v-if="props.when || props.used" class="hb-mem-when">{{ [props.used ? 'used last reply' : '', props.when].filter(Boolean).join(', ') }}</span>
      <div v-if="editing" class="hb-mem-edit">
        <textarea ref="box" v-model="draft" class="hb-textarea" rows="3" aria-label="edit memory" @keydown="key" />
        <div class="hb-mem-edit-acts">
          <button type="button" class="hb-btn hb-btn-sm" @click="done(true)">save</button>
          <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="done(false)">cancel</button>
        </div>
      </div>
    </div>
    <div v-if="!props.readonly && !editing" class="hb-mem-acts">
      <button
        type="button"
        class="hb-mem-act"
        :class="{ 'is-on': props.pinned }"
        :aria-pressed="props.pinned"
        :aria-label="props.pinned ? 'unpin memory' : 'pin memory'"
        :title="props.pinned ? 'unpin' : 'pin'"
        @click="emit('pin', !props.pinned)"
      ><HbIcon name="thumbtack" :size="14" /></button>
      <button ref="editBtn" type="button" class="hb-mem-act" aria-label="edit memory" title="edit" @click="edit"><HbIcon name="pen" :size="14" /></button>
      <button
        type="button"
        class="hb-mem-act is-forget"
        :class="{ 'is-armed': armed }"
        :aria-label="armed ? 'press again to forget' : 'forget'"
        @click="forget"
      >{{ armed ? 'forget?' : 'forget' }}</button>
    </div>
  </div>
</template>
