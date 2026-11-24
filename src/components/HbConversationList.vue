<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { relTime } from '../vanilla/chat'
import HbIcon from './HbIcon.vue'

export interface HbConversation {
  id: string
  title: string
  /** ms since epoch, or an ISO string. */
  updated: number | string
  /** Messages in it. */
  count: number
}

interface Props {
  items: HbConversation[]
  current?: string | null
  /** A reply streams: switching waits. */
  busy?: boolean
  title?: string
  /** Where the chats live, said at the foot. */
  note?: string
  /** Show export at the foot. */
  exportable?: boolean
  /** For relative times in tests and fixtures. */
  now?: number
}

const props = withDefaults(defineProps<Props>(), {
  current: null,
  busy: false,
  title: 'chats',
  note: 'chats are stored in this browser only.',
  exportable: true,
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
const when = (c: HbConversation) => `${relTime(c.updated, props.now ?? Date.now())}, ${c.count} msg`

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

// Up and Down move between chats; the row buttons stay in the tab order.
const list = ref<HTMLElement | null>(null)
function onKey(e: KeyboardEvent) {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
  const opens = [...(list.value?.querySelectorAll<HTMLElement>('.hb-convs-open') ?? [])]
  const at = opens.indexOf(e.target as HTMLElement)
  if (at < 0) return
  e.preventDefault()
  opens[(at + (e.key === 'ArrowDown' ? 1 : opens.length - 1)) % opens.length]?.focus()
}
</script>

<template>
  <nav class="hb-convs" :aria-label="props.title">
    <div class="hb-convs-hd">
      <span>{{ props.title }}</span>
      <button type="button" class="hb-convs-new" :disabled="props.busy" aria-label="new chat" title="new chat (ctrl+shift+n)" @click="emit('new')"><HbIcon name="plus" :size="14" /></button>
    </div>
    <ul ref="list" class="hb-convs-list" @keydown="onKey">
      <li v-if="!sorted.length" class="hb-convs-empty">no chats yet.</li>
      <li v-for="c in sorted" :key="c.id" class="hb-convs-item" :aria-current="c.id === props.current ? 'true' : undefined">
        <form v-if="renaming === c.id" class="hb-convs-rename" @submit.prevent="saveRename">
          <input ref="nameBox" v-model="name" class="hb-input" aria-label="chat name" @keydown.escape.prevent="renaming = null" @blur="saveRename">
        </form>
        <button v-else type="button" class="hb-convs-open" :disabled="props.busy && c.id !== props.current" @click="emit('open', c.id)">
          <span class="hb-convs-title">{{ c.title }}</span>
          <span class="hb-convs-meta">{{ when(c) }}</span>
        </button>
        <span class="hb-convs-acts">
          <button type="button" class="hb-convs-act" :aria-label="`rename ${c.title}`" title="rename" @click="startRename(c)"><HbIcon name="pen" :size="13" /></button>
          <button type="button" class="hb-convs-act" :aria-label="`duplicate ${c.title}`" title="duplicate" @click="emit('duplicate', c.id)"><HbIcon name="copy" :size="13" /></button>
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
    <div class="hb-convs-foot">
      <div class="hb-convs-foot-acts">
        <button v-if="props.exportable" type="button" class="hb-btn hb-btn-2 hb-btn-sm" :disabled="!props.current" @click="emit('export')">export</button>
        <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('import')">import</button>
      </div>
      <p class="hb-convs-note">{{ props.note }}</p>
    </div>
  </nav>
</template>
