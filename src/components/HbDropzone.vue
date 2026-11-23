<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { cx } from '../utils/cx'

interface Props {
  /** The words in the zone: 'or drop a .vrm, .glb or .fbx here'. */
  hint?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  /** Cover a whole viewport: hidden until a file hovers its parent. */
  cover?: boolean
  /** Words on the pick button, which is also the input's name. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  hint: 'drop a file here, or pick one',
  accept: '',
  multiple: false,
  disabled: false,
  cover: false,
  label: 'pick a file',
})

const emit = defineEmits<{
  /** The dropped or picked files, at least one. */
  files: [files: File[]]
}>()

const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const over = ref(false)
let depth = 0

const classes = computed(() => cx('hb-dropzone', { 'is-over': over.value, 'is-cover': props.cover }))

function hasFiles(e: DragEvent): boolean {
  return [...(e.dataTransfer?.types ?? [])].includes('Files')
}
function onEnter(e: DragEvent) {
  if (props.disabled || !hasFiles(e)) return
  e.preventDefault()
  depth++
  over.value = true
}
function onOver(e: DragEvent) {
  if (props.disabled || !hasFiles(e)) return
  e.preventDefault()
}
function onLeave() {
  depth = Math.max(0, depth - 1)
  if (depth === 0) over.value = false
}
function onDrop(e: DragEvent) {
  if (props.disabled) return
  e.preventDefault()
  depth = 0
  over.value = false
  const files = [...(e.dataTransfer?.files ?? [])]
  if (files.length) emit('files', props.multiple ? files : files.slice(0, 1))
}
function onPick() {
  const files = [...(input.value?.files ?? [])]
  if (files.length) emit('files', files)
  if (input.value) input.value.value = ''
}

// A cover zone is hidden until a file hovers, so it listens on its parent.
let target: HTMLElement | null = null
onMounted(() => {
  target = props.cover ? root.value?.parentElement ?? null : root.value
  if (!target) return
  target.addEventListener('dragenter', onEnter)
  target.addEventListener('dragover', onOver)
  target.addEventListener('dragleave', onLeave)
  target.addEventListener('drop', onDrop)
})
onBeforeUnmount(() => {
  if (!target) return
  target.removeEventListener('dragenter', onEnter)
  target.removeEventListener('dragover', onOver)
  target.removeEventListener('dragleave', onLeave)
  target.removeEventListener('drop', onDrop)
})
</script>

<template>
  <div ref="root" :class="classes">
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
  </div>
</template>
