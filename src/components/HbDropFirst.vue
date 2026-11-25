<script setup lang="ts">
import { ref, useSlots } from 'vue'
import HbRack from './HbRack.vue'
import type { RackTab } from '../vanilla/layout'

interface Props {
  /** Rack tabs, three to five; the first is the live result. */
  tabs: RackTab[]
  rackLabel?: string
  /** No result yet: the subject is the drop zone. */
  empty?: boolean
  /** The drop zone's name, in Permanent Marker. */
  dropTitle?: string
  /** One note under it: what goes in, and that nothing leaves the machine. */
  dropNote?: string
  /** File types for the picker, as the accept attribute. */
  accept?: string
  multiple?: boolean
  /** The pick button's words; it is the pink action while the zone is empty. */
  pickLabel?: string
  /** A sample that works with no model; empty hides the button. */
  sampleLabel?: string
  verbsLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  rackLabel: 'rack',
  empty: true,
  dropTitle: 'drop a file',
  dropNote: '',
  accept: '',
  multiple: false,
  pickLabel: 'choose a file',
  sampleLabel: 'try a sample',
  verbsLabel: 'actions',
})

const tab = defineModel<string>('tab', { default: '' })
const emit = defineEmits<{ files: [files: File[]]; sample: [] }>()
const slots = useSlots()
const hot = ref(false)
const input = ref<HTMLInputElement | null>(null)

function take(list: FileList | null | undefined) {
  const files = list ? [...list] : []
  if (files.length) emit('files', props.multiple ? files : files.slice(0, 1))
}
function onDrop(e: DragEvent) {
  hot.value = false
  take(e.dataTransfer?.files)
}
function onPick(e: Event) {
  const el = e.target as HTMLInputElement
  take(el.files)
  el.value = ''
}
</script>

<template>
  <!-- Drop first (scribe): the subject is a drop zone that becomes the
       result. Engine and export live in the rack once a result exists. -->
  <div class="hb-lay hb is-drop-first" data-layout="drop-first">
    <div v-if="slots.bar" class="hb-lay-bar" data-ux="bar"><slot name="bar" /></div>
    <div class="hb-lay-body">
      <section class="hb-lay-stage">
        <div class="hb-lay-subject" data-ux="subject" @dragover.prevent="hot = props.empty" @dragleave="hot = false" @drop.prevent="onDrop">
          <div v-if="props.empty" class="hb-lay-drop" :class="{ 'is-hot': hot }">
            <div class="hb-lay-empty">
              <span class="hb-lay-empty-name">{{ props.dropTitle }}</span>
              <p v-if="props.dropNote" class="hb-lay-empty-note">{{ props.dropNote }}</p>
              <div class="hb-lay-empty-acts">
                <button type="button" class="hb-btn hb-btn-go" @click="input?.click()">{{ props.pickLabel }}</button>
                <button v-if="props.sampleLabel" type="button" class="hb-btn" @click="emit('sample')">{{ props.sampleLabel }}</button>
              </div>
              <input ref="input" type="file" hidden :accept="props.accept || undefined" :multiple="props.multiple" @change="onPick">
            </div>
          </div>
          <slot v-else />
        </div>
        <div v-if="slots.verbs && !props.empty" class="hb-lay-verbs" data-ux="verbs" role="toolbar" :aria-label="props.verbsLabel"><slot name="verbs" /></div>
      </section>
      <HbRack v-model:tab="tab" :tabs="props.tabs" :label="props.rackLabel">
        <template v-for="t in props.tabs" :key="t.id" #[t.id]><slot :name="`tab-${t.id}`" /></template>
        <template v-if="slots.detail" #detail><slot name="detail" /></template>
      </HbRack>
    </div>
  </div>
</template>
