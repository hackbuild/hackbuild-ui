<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { accepts, dropRoutes, type DropRoute, type DropRoutesHandle } from '../vanilla/drop'
import { cx } from '../utils/cx'

interface Props {
  /** The words in the zone: 'or drop a .vrm, .glb or .fbx here'. */
  hint?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  /** Cover a whole viewport: hidden until a file hovers its parent. */
  cover?: boolean
  /** Listen on the whole window; a cover zone then covers the window. */
  window?: boolean
  /** Route files by type instead of one `files` emit. */
  routes?: DropRoute[]
  /** Walk a dropped folder and take the files inside. */
  folders?: boolean
  /** Take files pasted while the page has focus (window) or the zone does. */
  paste?: boolean
  /** Words on the pick button, which is also the input's name. */
  label?: string
  /** A failure to show under the hint. Or use the error slot. */
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  hint: 'drop a file here, or pick one',
  accept: '',
  multiple: false,
  disabled: false,
  cover: false,
  window: false,
  routes: undefined,
  folders: true,
  paste: false,
  label: 'pick a file',
  error: '',
})

const emit = defineEmits<{
  /** The dropped, pasted or picked files that pass accept, at least one. */
  files: [files: File[]]
  /** Files no route or accept took. */
  rejected: [files: File[]]
}>()

const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const over = ref(false)
const refused = ref(false)
const rejectedText = ref('')

const classes = computed(() =>
  cx('hb-dropzone', {
    'is-over': over.value,
    'is-reject': refused.value,
    'is-cover': props.cover,
    'is-window': props.cover && props.window,
  }),
)
const message = computed(() => props.error || rejectedText.value)

function take(files: File[]) {
  rejectedText.value = ''
  emit('files', props.multiple ? files : files.slice(0, 1))
}
function refuse(files: File[]) {
  const names = files.map((f) => f.name).join(', ')
  rejectedText.value = `not taken here: ${names}.${props.accept ? ` use ${props.accept}.` : ''}`
  emit('rejected', files)
}

const routeList = (): DropRoute[] =>
  props.routes ?? [{ name: 'files', accept: props.accept || (() => true), on: (fs) => take(fs) }]

function onPick(event: Event) {
  const files = [...(input.value?.files ?? [])]
  if (input.value) input.value.value = ''
  if (!files.length) return
  let rest = files
  for (const r of routeList()) {
    const mine = rest.filter((f) => accepts(r.accept, f))
    if (mine.length) r.on(mine, event)
    rest = rest.filter((f) => !mine.includes(f))
  }
  if (rest.length) refuse(rest)
}

/** The zone is a button for the pointer: a press anywhere opens the picker. */
function onZone(e: MouseEvent) {
  if (props.cover || props.disabled) return
  if ((e.target as Element).closest('label,button,a,input')) return
  input.value?.click()
}

// Drag state, routing, folder walk and paste are the vanilla dropRoutes'.
// A cover zone is hidden until a file hovers, so it listens on its parent,
// or the window.
let handle: DropRoutesHandle | null = null
onMounted(() => {
  const target: Window | HTMLElement | null = props.window
    ? globalThis as unknown as Window
    : props.cover ? root.value?.parentElement ?? null : root.value
  if (!target) return
  handle = dropRoutes(target, routeList(), {
    folders: props.folders,
    paste: props.paste,
    enabled: () => !props.disabled,
    onState: (s) => {
      over.value = s.over
      refused.value = s.rejected
    },
    onReject: refuse,
  })
})
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <div ref="root" :class="classes" @click="onZone">
    <span>{{ props.hint }}</span>
    <label v-if="!props.cover" class="hb-btn hb-btn-2 hb-btn-sm hb-dropzone-pick" :class="{ 'is-disabled': props.disabled }">
      {{ props.label }}
      <input
        ref="input"
        type="file"
        :accept="props.accept || undefined"
        :multiple="props.multiple"
        :disabled="props.disabled"
        @change="onPick"
      >
    </label>
    <p v-if="$slots.error || message" class="hb-dropzone-err" role="alert">
      <slot name="error" :message="message">{{ message }}</slot>
    </p>
  </div>
</template>
