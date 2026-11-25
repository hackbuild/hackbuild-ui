<script setup lang="ts">
import { useSlots } from 'vue'
import HbRack from './HbRack.vue'
import type { RackTab } from '../vanilla/layout'

interface Props {
  /** Rack tabs, three to five; the first is the live result. */
  tabs: RackTab[]
  /** Accessible name of the rack. */
  rackLabel?: string
  /** Accessible name of the verb row. */
  verbsLabel?: string
  /** Show the chat list rail (the list slot) from 901 px. */
  list?: boolean
}

const props = withDefaults(defineProps<Props>(), { rackLabel: 'rack', verbsLabel: 'actions', list: false })
/** The selected rack tab. */
const tab = defineModel<string>('tab', { default: '' })
const slots = useSlots()
</script>

<template>
  <!-- Conversation (clevis, chatbot-forge): the chat list rail when open, the messages, the composer under them, persona and memory in the rack. On a phone the composer stays on the first screen. -->
  <div class="hb-lay hb is-conversation" :class="{ 'has-list': !!slots.list && props.list }" data-layout="conversation">
    <div v-if="slots.bar" class="hb-lay-bar" data-ux="bar"><slot name="bar" /></div>
    <div class="hb-lay-body">
      <nav v-if="slots.list && props.list" class="hb-lay-list" aria-label="chats"><slot name="list" /></nav>
      <section class="hb-lay-stage">
        <div class="hb-lay-subject" data-ux="subject" role="log" aria-live="polite"><slot /></div>
        <div v-if="slots.verbs" class="hb-lay-verbs" data-ux="verbs" role="toolbar" :aria-label="props.verbsLabel"><slot name="verbs" /></div>
        <div v-if="slots.composer" class="hb-lay-composer"><slot name="composer" /></div>
      </section>
    <HbRack v-model:tab="tab" :tabs="props.tabs" :label="props.rackLabel">
      <template v-for="t in props.tabs" :key="t.id" #[t.id]><slot :name="`tab-${t.id}`" /></template>
      <template v-if="slots.detail" #detail><slot name="detail" /></template>
    </HbRack>
    </div>
  </div>
</template>
