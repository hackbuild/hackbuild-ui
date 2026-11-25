<script setup lang="ts">
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = "<HbConversationLayout :empty=\"!msgs.length\">\n  <template #bar=\"{ openList }\">...</template>\n  <template #list>...</template>\n  <HbMessage v-for=\"m in msgs\" ... />\n  <template #composer><form class=\"hb-convbox\">...</form></template>\n</HbConversationLayout>"
</script>

<template>
  <DemoSection title="Conversation" note="After clevis: the chat list rail at the left, the conversation fills with its empty state in Permanent Marker, the composer centred under the thread at its width. A rack only when the tool has persona or memory. Under 901 px the chat list is a drawer opened from the bar." :code="code">
    <p><a href="#/layouts/conversation">open the live demo</a>, or look at it below at 900 by 560.</p>
    <iframe src="#/layouts/conversation" title="conversation demo" width="900" height="560" style="max-width:100%;border:var(--hb-border) solid var(--hb-ink)" loading="lazy" />
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'tabs', type: 'RackTab[]', default: '[] (no rack)' },
      { prop: 'empty', type: 'boolean', default: 'false' },
      { prop: 'emptyName', type: 'string', default: 'what are we working on?' },
      { prop: 'emptyNote', type: 'string' },
      { prop: 'v-model:listOpen', type: 'boolean' },
      { prop: 'slots', type: 'bar (openList, narrow), list, list-head, default, empty, verbs, composer, tab-<id>, detail' },
    ]"
  />
</template>
