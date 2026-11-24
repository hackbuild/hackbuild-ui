<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { listMeta, listRowKey } from '../vanilla/chat'
import HbIcon from './HbIcon.vue'

export interface HbConversation {
  id: string
  title: string
  /** ms since epoch, or an ISO string. */
  updated: number | string
  /** Messages in it. Left out of the row when absent. */
  count?: number
  /** What it is, shown first in the meta line: a tool or a file kind. */
  kind?: string
}

interface Props {
  items: HbConversation[]
  current?: string | null
  /** A reply streams: switching waits. */
  busy?: boolean
  /** What one row is: chat, document, sketch. Every label reads from it. */
  noun?: string
  /** Plural of noun. Default noun plus s. */
  nouns?: string
  /** Head label. Default the plural noun. */
  title?: string
  /** Where they live, said at the foot. */
  note?: string
  /** Show new at the head. */
  creatable?: boolean
  /** Show duplicate on each row. */
  duplicable?: boolean
  /** Show export at the foot. */
  exportable?: boolean
  /** Show import at the foot. */
  importable?: boolean
  /** Shortcut named on the new button. Default ctrl+shift+n for chats. */
  newKey?: string
  /** For relative times in tests and fixtures. */
  now?: number
}

const props = withDefaults(defineProps<Props>(), {
  current: null,
  busy: false,
  noun: 'chat',
  nouns: undefined,
  title: undefined,
  note: undefined,
  creatable: true,
  duplicable: true,
  exportable: true,
  importable: true,
  newKey: undefined,
  now: undefined,
})

const emit = defineEmits<{
  open: [id: string]
  new: []
  rename: [id: string, title: string]
  duplicate: [id: string]
  remove: [id: string]
  export: []
  import: []
}>()

const sorted = computed(() => [...props.items].sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()))
const when = (c: HbConversation) => listMeta(c, props.now ?? Date.now())
const many = computed(() => props.nouns ?? `${props.noun}s`)
const head = computed(() => props.title ?? many.value)
const foot = computed(() => props.note ?? `${many.value} are stored in this browser only.`)
const newKey = computed(() => props.newKey ?? (props.noun === 'chat' ? 'ctrl+shift+n' : ''))

const armed = ref<string | null>(null)
let armTimer: ReturnType<typeof setTimeout> | undefined
function onRemove(id: string) {
  if (armed.value !== id) {
    armed.value = id
    clearTimeout(armTimer)
    armTimer = setTimeout(() => { armed.value = null }, 3000)
    return
  }
  clearTimeout(armTimer)
  armed.value = null
  emit('remove', id)
}
onBeforeUnmount(() => clearTimeout(armTimer))

const renaming = ref<string | null>(null)
const name = ref('')
const nameBox = ref<HTMLInputElement[] | null>(null)
async function startRename(c: HbConversation) {
  renaming.value = c.id
  name.value = c.title
  await nextTick()
  nameBox.value?.[0]?.select()
}
function saveRename() {
  const id = renaming.value
  const t = name.value.trim()
  renaming.value = null
  if (id && t) emit('rename', id, t)
}

// Up and Down move between rows, F2 renames, Delete arms then deletes.
// The row buttons stay in the tab order and are always drawn.
const list = ref<HTMLElement | null>(null)
function onKey(e: KeyboardEvent, c: HbConversation) {
  const act = listRowKey(e)
  if (!act) return
  const opens = [...(list.value?.querySelectorAll<HTMLElement>('.hb-convs-open') ?? [])]
  const at = opens.indexOf(e.target as HTMLElement)
  if (at < 0) return
  e.preventDefault()
  if (act === 'rename') void startRename(c)
  else if (act === 'remove') { if (!(props.busy && c.id === props.current)) onRemove(c.id) }
  else opens[(at + (act === 'next' ? 1 : opens.length - 1)) % opens.length]?.focus()
}
</script>

<template>
  <nav class="hb-convs" :aria-label="head">
    <div class="hb-convs-hd">
      <span>{{ head }}</span>
      <button v-if="props.creatable" type="button" class="hb-convs-new" :disabled="props.busy" :aria-label="`new ${props.noun}`" :title="newKey ? `new ${props.noun} (${newKey})` : `new ${props.noun}`" @click="emit('new')"><HbIcon name="plus" :size="14" /></button>
    </div>
    <ul ref="list" class="hb-convs-list">
      <li v-if="!sorted.length" class="hb-convs-empty">no {{ many }} yet.</li>
      <li v-for="c in sorted" :key="c.id" class="hb-convs-item" :aria-current="c.id === props.current ? 'true' : undefined" @keydown="onKey($event, c)">
        <form v-if="renaming === c.id" class="hb-convs-rename" @submit.prevent="saveRename">
          <input ref="nameBox" v-model="name" class="hb-input" :aria-label="`${props.noun} name`" @keydown.escape.prevent="renaming = null" @blur="saveRename">
        </form>
        <button v-else type="button" class="hb-convs-open" :disabled="props.busy && c.id !== props.current" aria-keyshortcuts="F2 Delete" @click="emit('open', c.id)">
          <span class="hb-convs-title">{{ c.title }}</span>
          <span class="hb-convs-meta">{{ when(c) }}</span>
        </button>
        <span class="hb-convs-acts">
          <button type="button" class="hb-convs-act" :aria-label="`rename ${c.title}`" title="rename" @click="startRename(c)"><HbIcon name="pen" :size="13" /></button>
          <button v-if="props.duplicable" type="button" class="hb-convs-act" :aria-label="`duplicate ${c.title}`" title="duplicate" @click="emit('duplicate', c.id)"><HbIcon name="copy" :size="13" /></button>
          <button
            type="button"
            class="hb-convs-act is-del"
            :class="{ 'is-armed': armed === c.id }"
            :aria-label="armed === c.id ? `press again to delete ${c.title}` : `delete ${c.title}`"
            :disabled="props.busy && c.id === props.current"
            @click="onRemove(c.id)"
          ><template v-if="armed === c.id">delete?</template><HbIcon v-else name="trash" :size="13" /></button>
        </span>
      </li>
    </ul>
    <div v-if="props.exportable || props.importable || foot" class="hb-convs-foot">
      <div v-if="props.exportable || props.importable" class="hb-convs-foot-acts">
        <button v-if="props.exportable" type="button" class="hb-btn hb-btn-2 hb-btn-sm" :disabled="!props.current" @click="emit('export')">export</button>
        <button v-if="props.importable" type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('import')">import</button>
      </div>
      <p v-if="foot" class="hb-convs-note">{{ foot }}</p>
    </div>
  </nav>
</template>
