<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { palette, type PaletteHandle } from '../vanilla/palette'
import { sharedHotkeys } from '../composables/useHotkeys'

export interface HbPaletteItem {
  key: string
  label: string
  /** Quiet text after the label: the group, a size, a state. */
  hint?: string
  /** A combo that also runs it: 'ctrl+s'. Printed, not bound here. */
  kbd?: string
  /** Extra words the search matches. */
  words?: string
}

export interface HbPaletteSection {
  label: string
  items: HbPaletteItem[]
}

interface Props {
  sections: HbPaletteSection[]
  /** Open on / and ctrl+k through the shared hotkey registry. */
  keys?: boolean
  placeholder?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  keys: true,
  placeholder: 'type a tool, a model or a command',
  label: 'commands',
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  run: [key: string]
}>()

const root = ref<HTMLElement | null>(null)
let handle: PaletteHandle | null = null
const format = (combo: string) => sharedHotkeys().format(combo)

onMounted(() => {
  if (!root.value) return
  handle = palette(root.value, {
    registry: props.keys ? sharedHotkeys() : undefined,
    onOpen: () => { open.value = true },
    onClose: () => { open.value = false },
    onRun: (key) => emit('run', key),
  })
  if (open.value) handle.open()
})
watch(open, (v) => {
  if (!handle || handle.isOpen === v) return
  if (v) handle.open()
  else handle.close('api')
})
watch(() => props.sections, () => handle?.search?.refresh(), { deep: true, flush: 'post' })
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <Teleport to="body">
    <div ref="root" class="hb-modal hb-palette hb" role="dialog" aria-modal="true" :aria-label="props.label" hidden>
      <div class="hb-panel" tabindex="-1">
        <div class="hb-palette-field">
          <span class="hb-palette-prompt" aria-hidden="true">&gt;</span>
          <input class="hb-palette-input" type="text" :placeholder="props.placeholder" :aria-label="props.label" />
        </div>
        <div class="hb-palette-list" role="listbox" :aria-label="props.label">
          <div v-for="s in props.sections" :key="s.label" role="group" :aria-label="s.label">
            <span class="hb-palette-head" aria-hidden="true">{{ s.label }}</span>
            <button
              v-for="it in s.items"
              :key="it.key"
              type="button"
              class="hb-palette-item"
              role="option"
              tabindex="-1"
              :data-key="it.key"
              :data-search="`${s.label} ${it.label} ${it.hint ?? ''} ${it.words ?? ''}`"
            >
              <span class="hb-palette-label">{{ it.label }}</span>
              <span v-if="it.hint" class="hb-palette-hint">{{ it.hint }}</span>
              <span v-if="it.kbd" class="hb-palette-kbd"><template v-for="(k, j) in format(it.kbd)" :key="j"><span v-if="j">+</span><kbd class="hb-kbd">{{ k }}</kbd></template></span>
            </button>
          </div>
        </div>
        <p class="hb-palette-empty" hidden>nothing matches that.</p>
        <p class="hb-palette-foot">up and down move, enter runs, esc closes.</p>
      </div>
    </div>
  </Teleport>
</template>
