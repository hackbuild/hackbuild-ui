<script setup lang="ts">
import HbToolbar from './HbToolbar.vue'
import HbIcon from './HbIcon.vue'
import type { IconName } from '../icons'

export interface HbGuideVerb {
  /** Emitted with the verb event. */
  id: string
  /** Lowercase, shown beside the icon and used as the accessible name. */
  label: string
  icon: IconName
  disabled?: boolean
  /** Keyboard hint or the reason the verb is disabled. */
  title?: string
}

interface Props {
  /** One-based step number. */
  step: number
  /** Step name, shown uppercase in VT323 after STEP N. */
  name: string
  /** One goal sentence in Special Elite. */
  goal?: string
  /** The verbs at the right end. Defaults to undo, redo, open, save, guide. */
  verbs?: HbGuideVerb[]
}

const props = withDefaults(defineProps<Props>(), {
  goal: '',
  verbs: () => [
    { id: 'undo', label: 'undo', icon: 'undo', title: 'ctrl z' },
    { id: 'redo', label: 'redo', icon: 'redo', title: 'ctrl shift z' },
    { id: 'open', label: 'open', icon: 'folder-open' },
    { id: 'save', label: 'save', icon: 'floppy-disk' },
    { id: 'guide', label: 'guide', icon: 'question' },
  ],
})

const emit = defineEmits<{
  verb: [id: string]
}>()
</script>

<template>
  <!-- The toolbar strip of a bench. Step name, goal, then the verbs pushed
       right. Never a second bar under it. -->
  <HbToolbar class="hb-guide">
    <span class="hb-guide-step">step {{ props.step }} {{ props.name }}</span>
    <span v-if="props.goal" class="hb-guide-goal">{{ props.goal }}</span>
    <slot />
    <div class="hb-guide-verbs" role="group" aria-label="design">
      <button
        v-for="verb in props.verbs"
        :key="verb.id"
        type="button"
        class="hb-btn hb-btn-2 hb-btn-sm"
        :aria-label="verb.label"
        :title="verb.title"
        :disabled="verb.disabled"
        @click="emit('verb', verb.id)"
      >
        <HbIcon :name="verb.icon" :size="12" />
        <span class="hb-guide-verb-label">{{ verb.label }}</span>
      </button>
    </div>
  </HbToolbar>
</template>
