<script setup lang="ts">
import { computed } from 'vue'
import HbDropdown from './HbDropdown.vue'
import HbIcon from './HbIcon.vue'
import type { HbIconName as IconName } from '../icons/stroke'

export interface HbSendTarget {
  /** Emitted on send: a tool id or route. */
  id: string
  /** The tool's name: 'room', 'image', 'notes'. */
  label: string
  /** An HbIcon name for what the tool takes: 'image', 'cube', 'comment'. */
  icon?: IconName
  /** Why it cannot take this now: 'no image model loaded'. A reason
      disables the target and shows beside its name. */
  reason?: string
}

interface Props {
  targets?: HbSendTarget[]
  /** Trigger text. */
  label?: string
  align?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  targets: () => [],
  label: 'send to',
  align: 'left',
})

const emit = defineEmits<{ send: [id: string] }>()

// HbDropdown owns keys, focus and outside press; its default slot renders
// the rows so each can carry an icon and a reason.
const items = computed(() => props.targets.map((t) => ({ label: t.label, value: t.id, disabled: !!t.reason })))
</script>

<template>
  <HbDropdown class="hb-sendto" :label="props.label" :items="items" :align="props.align" @select="emit('send', String($event))">
    <button
      v-for="(t, index) in props.targets"
      :key="t.id"
      type="button"
      class="hb-menu-item"
      role="menuitem"
      tabindex="-1"
      :data-index="index"
      :disabled="!!t.reason"
      :title="t.reason || undefined"
    >
      <HbIcon v-if="t.icon" :name="t.icon" :size="14" />
      <span class="hb-sendto-name">{{ t.label }}</span>
      <small v-if="t.reason" class="hb-sendto-reason">{{ t.reason }}</small>
    </button>
  </HbDropdown>
</template>
