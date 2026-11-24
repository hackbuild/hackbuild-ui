<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { pad, type PadHandle, type PadMode, type PadVector } from '../vanilla/pad'

interface Props {
  /** stick: any angle and length. dpad: eight directions at full length. */
  mode?: PadMode
  /** The action button label, such as 'act' or 'next'; empty hides it. */
  action?: string
  /** Show on a fine pointer too. By default the pad shows on touch only. */
  always?: boolean
  /** Read the arrow keys and WASD on the window, ignored while typing. */
  keys?: boolean
  /** Window key for the action when keys is on; '' for none. */
  actionKey?: string
  /** Dead zone as a share of the radius. */
  dead?: number
  /** Accessible name of the stick. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'stick', action: '', always: false, keys: false, actionKey: 'e', dead: 0.12, label: 'move',
})
const model = defineModel<PadVector>({ default: () => ({ x: 0, y: 0 }) })
const emit = defineEmits<{ action: [] }>()

const base = ref<HTMLElement | null>(null)
let h: PadHandle | null = null

function mount() {
  h?.dispose()
  if (!base.value) return
  h = pad(base.value, {
    mode: props.mode, dead: props.dead, keys: props.keys, actionKey: props.action ? props.actionKey : '',
    onMove: (v) => { model.value = v },
    onAction: () => emit('action'),
  })
}
onMounted(mount)
watch(() => [props.mode, props.keys, props.dead, props.action, props.actionKey], mount)
watch(model, (v) => { if (h && (v.x !== h.value().x || v.y !== h.value().y)) h.set(v) })
onBeforeUnmount(() => h?.dispose())
</script>

<template>
  <div class="hb-pad" :class="{ 'is-always': props.always, 'is-dpad': props.mode === 'dpad' }">
    <div
      ref="base"
      class="hb-pad-base"
      role="group"
      tabindex="0"
      :aria-label="`${props.label}: drag, or hold the arrow keys`"
    >
      <span class="hb-pad-arrow hb-pad-n" aria-hidden="true" />
      <span class="hb-pad-arrow hb-pad-s" aria-hidden="true" />
      <span class="hb-pad-arrow hb-pad-w" aria-hidden="true" />
      <span class="hb-pad-arrow hb-pad-e" aria-hidden="true" />
      <span class="hb-pad-knob" aria-hidden="true" />
    </div>
    <button v-if="props.action" type="button" class="hb-pad-act" @click="emit('action')">{{ props.action }}</button>
  </div>
</template>
