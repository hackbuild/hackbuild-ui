<script setup lang="ts">
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = "<HbGate :open=\"!ready\" name=\"wake the body\" :go-label=\"`wake, ${row.size}`\" :busy=\"loading\" @go=\"load\">\n  <canvas />\n  <template #card><HbModelSelect v-model=\"chosen\" :rows=\"rows\" :go=\"false\" /></template>\n</HbGate>"
</script>

<template>
  <DemoSection title="Gate" note="After ferrule and arbor: a centred card over the live subject with one select and one pink button. Not a modal; nothing is trapped. Put HbModelSelect with go off in the card slot so this button stays the one pink action." :code="code">
    <p><a href="#/layouts/gate">open the live demo</a>, or look at it below at 900 by 560.</p>
    <iframe src="#/layouts/gate" title="gate demo" width="900" height="560" style="max-width:100%;border:var(--hb-border) solid var(--hb-ink)" loading="lazy" />
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'open', type: 'boolean', default: 'true' },
      { prop: 'head', type: 'string' },
      { prop: 'headEnd', type: 'string' },
      { prop: 'name', type: 'string' },
      { prop: 'note', type: 'string' },
      { prop: 'goLabel', type: 'string', default: 'wake' },
      { prop: 'busy', type: 'boolean', default: 'false' },
      { prop: '@go', type: '' },
      { prop: 'slots', type: 'bar, default, card, acts, detail, verbs (after the gate)' },
    ]"
  />
</template>
