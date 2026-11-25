<script setup lang="ts">
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = "<HbConversationLayout :tabs=\"tabs\">\n  <HbMessage v-for=\"m in msgs\" ... />\n  <template #composer><form class=\"hb-composer\">...</form></template>\n</HbConversationLayout>"
</script>

<template>
  <DemoSection title="Conversation" note="After clevis: the messages fill, the composer sits under them, the chat list rail shows when list is on, persona and memory are rack tabs. On a phone the composer stays on the first screen." :code="code">
    <p><a href="#/layouts/conversation">open the live demo</a>, or look at it below at 900 by 560.</p>
    <iframe src="#/layouts/conversation" title="conversation demo" width="900" height="560" style="max-width:100%;border:var(--hb-border) solid var(--hb-ink)" loading="lazy" />
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'tabs', type: 'RackTab[]' },
      { prop: 'list', type: 'boolean', default: 'false' },
      { prop: 'slots', type: 'bar, list, default, verbs, composer, tab-<id>, detail' },
    ]"
  />
</template>
