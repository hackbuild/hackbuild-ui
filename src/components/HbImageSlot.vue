<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HbIcon from './HbIcon.vue'
import HbCameraTile from './HbCameraTile.vue'
import { accepts, dropRoutes, type DropRoutesHandle } from '../vanilla/drop'
import { cameraFault, captureFrame, closeCamera, openCamera, type ImageSource } from '../vanilla/media'

export interface HbImageValue {
  /** Show this: an object url the slot made, or the sample url. */
  url: string
  name: string
  from: ImageSource
  /** The file, the pasted image or the captured frame; none for a sample. */
  blob?: Blob
}

interface Props {
  /** Over the box: 'source face', 'photo'. */
  label?: string
  accept?: string
  /** The ways in, in button order. Drop always works. */
  sources?: Array<'upload' | 'camera' | 'paste' | 'sample'>
  /** The sample image, for the sample button. */
  sample?: { url: string; name: string } | null
  /** What the tool found: 'face detected', 'no face found'. */
  info?: string
  infoTone?: '' | 'ok' | 'warn' | 'err'
  facingMode?: 'user' | 'environment'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  accept: 'image/*',
  sources: () => ['upload', 'camera', 'paste'],
  sample: null,
  info: '',
  infoTone: '',
  facingMode: 'user',
  disabled: false,
})

const model = defineModel<HbImageValue | null>({ default: null })
const emit = defineEmits<{ rejected: [files: File[]] }>()

const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const over = ref(false)
const stream = ref<MediaStream | null>(null)
const box = ref<HTMLElement | null>(null)
const fault = ref('')
const denied = ref(false)
let made = ''

function set(v: HbImageValue | null) {
  if (made && made !== v?.url) { URL.revokeObjectURL(made); made = '' }
  model.value = v
}
function fromBlob(blob: Blob, name: string, from: ImageSource) {
  const url = URL.createObjectURL(blob)
  made = url
  set({ url, name, blob, from })
}
watch(model, (v) => { if (made && v?.url !== made) { URL.revokeObjectURL(made); made = '' } })

function take(files: File[], from: ImageSource) {
  fault.value = ''
  const f = files.find((x) => accepts(props.accept, x))
  if (!f) { fault.value = `not an image: ${files.map((x) => x.name).join(', ')}.`; emit('rejected', files); return }
  stop()
  fromBlob(f, f.name || 'pasted image', from)
}
function onPick() {
  const fs = [...(input.value?.files ?? [])]
  if (input.value) input.value.value = ''
  if (fs.length) take(fs, 'upload')
}

async function camera() {
  fault.value = ''
  denied.value = false
  try {
    stream.value = await openCamera({ facingMode: props.facingMode, width: { ideal: 640 }, height: { ideal: 640 } })
  } catch (e) {
    const f = cameraFault(e)
    denied.value = f.kind === 'denied'
    fault.value = f.text
  }
}
async function capture() {
  const v = box.value?.querySelector('video')
  if (!v) return
  try {
    const b = await captureFrame(v)
    stop()
    fromBlob(b, 'camera frame.png', 'camera')
  } catch { fault.value = 'capture failed. try again, or upload a file.' }
}
function stop() { closeCamera(stream.value); stream.value = null }

async function paste() {
  fault.value = ''
  try {
    const items = await navigator.clipboard.read()
    for (const it of items) {
      const type = it.types.find((t) => t.startsWith('image/'))
      if (type) { fromBlob(await it.getType(type), 'pasted image', 'paste'); stop(); return }
    }
    fault.value = 'no image on the clipboard. copy one first.'
  } catch {
    fault.value = 'the browser blocked the clipboard. press ctrl v or cmd v here instead.'
  }
}
function sample() {
  if (!props.sample) return
  stop()
  fault.value = ''
  set({ url: props.sample.url, name: props.sample.name, from: 'sample' })
}
function clear() { stop(); fault.value = ''; set(null) }

let handle: DropRoutesHandle | null = null
onMounted(() => {
  if (!root.value) return
  handle = dropRoutes(root.value, [{ name: 'image', accept: props.accept, on: (fs, e) => take(fs, e.type === 'paste' ? 'paste' : 'drop') }], {
    paste: true,
    folders: false,
    enabled: () => !props.disabled,
    onState: (s) => { over.value = s.over },
    onReject: (fs) => { fault.value = `not an image: ${fs.map((x) => x.name).join(', ')}.`; emit('rejected', fs) },
  })
})
onBeforeUnmount(() => { handle?.dispose(); stop(); if (made) URL.revokeObjectURL(made) })

const line = computed(() => fault.value || props.info)
const lineTone = computed(() => (fault.value ? 'err' : props.infoTone))
const has = (s: string) => (props.sources as string[]).includes(s)
</script>

<template>
  <!-- One image input: the box shows the picture, the live camera or the
       empty well; upload, camera then capture, paste and sample under it;
       one info line names what the tool found or what failed. Drop and
       ctrl v work on the whole slot. -->
  <section
    ref="root"
    class="hb-islot"
    :class="{ 'is-over': over, 'is-live': !!stream, 'is-filled': !!model && !stream }"
    tabindex="0"
    :aria-label="`${props.label || 'image'}: drop, paste or pick an image`"
  >
    <header v-if="props.label" class="hb-islot-hd">{{ props.label }}</header>
    <div ref="box" class="hb-islot-box">
      <HbCameraTile v-if="stream || denied" :stream="stream" :denied="denied" :tags="{ br: stream ? 'live' : '' }" />
      <img v-else-if="model" class="hb-islot-img" :src="model.url" :alt="model.name">
      <div v-else class="hb-islot-empty">
        <HbIcon name="image" :size="22" />
        <span>drop, paste or pick an image</span>
      </div>
    </div>
    <div class="hb-acts hb-islot-acts">
      <label v-if="has('upload')" class="hb-btn hb-btn-sm" :class="[model || stream ? 'hb-btn-2' : '', { 'is-disabled': props.disabled }]">
        <HbIcon name="upload" :size="12" />upload
        <input ref="input" type="file" class="hb-islot-file" :accept="props.accept" :disabled="props.disabled" @change="onPick">
      </label>
      <button v-if="has('camera') && !stream" type="button" class="hb-btn hb-btn-2 hb-btn-sm" :disabled="props.disabled" @click="camera">
        <HbIcon name="camera" :size="12" />camera
      </button>
      <button v-if="stream" type="button" class="hb-btn hb-btn-sm" @click="capture"><HbIcon name="record" :size="12" />capture</button>
      <button v-if="stream" type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="stop">stop camera</button>
      <button v-if="has('paste') && !stream" type="button" class="hb-btn hb-btn-2 hb-btn-sm" :disabled="props.disabled" @click="paste">
        <HbIcon name="copy" :size="12" />paste
      </button>
      <button v-if="has('sample') && props.sample && !stream" type="button" class="hb-btn hb-btn-2 hb-btn-sm" :disabled="props.disabled" @click="sample">sample</button>
      <button v-if="model && !stream" type="button" class="hb-btn hb-btn-2 hb-btn-sm" :disabled="props.disabled" @click="clear">clear</button>
    </div>
    <p v-if="line" class="hb-hint hb-islot-info" :class="lineTone ? `is-${lineTone}` : ''" :role="fault ? 'alert' : 'status'">{{ line }}</p>
  </section>
</template>
