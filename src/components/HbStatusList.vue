<script setup lang="ts">
export type HbStatusState = 'off' | 'load' | 'ok' | 'warn' | 'err'

export interface HbStatusItem {
  key: string
  label: string
  state: HbStatusState
  /** What the state means now: the model, the fallback in use, the error. */
  title?: string
  /** Where a press goes: a tab, a drawer. The row becomes a button. */
  goto?: string
}

interface Props {
  items: HbStatusItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  goto: [target: string, key: string]
}>()

const WORD: Record<HbStatusState, string> = { off: 'off', load: 'loading', ok: 'ready', warn: 'degraded', err: 'failed' }
</script>

<template>
  <!-- One line per subsystem: the state in words and what it means. -->
  <ul class="hb-statuslist">
    <li v-for="it in props.items" :key="it.key" :class="`is-${it.state}`">
      <component
        :is="it.goto ? 'button' : 'div'"
        :type="it.goto ? 'button' : undefined"
        class="hb-statuslist-row"
        @click="it.goto && emit('goto', it.goto, it.key)"
      >
        <i class="hb-dot" aria-hidden="true" />
        <span class="hb-statuslist-name">{{ it.label }}</span>
        <span class="hb-statuslist-state">{{ WORD[it.state] }}</span>
        <span v-if="it.title" class="hb-statuslist-note">{{ it.title }}</span>
      </component>
    </li>
  </ul>
</template>
