<script setup lang="ts">
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = "<HbDropFirst :tabs=\"tabs\" :empty=\"!result\" drop-title=\"drop audio or video\" @files=\"run\" @sample=\"sample\">\n  <HbTranscript :segments=\"segments\" />\n</HbDropFirst>"
</script>

<template>
  <DemoSection title="Drop first" note="After scribe: the subject is a drop zone with one pink pick button and a sample, until a result exists; then the default slot is the subject." :code="code">
    <p><a href="#/layouts/drop-first">open the live demo</a>, or look at it below at 900 by 560.</p>
    <iframe src="#/layouts/drop-first" title="drop first demo" width="900" height="560" style="max-width:100%;border:var(--hb-border) solid var(--hb-ink)" loading="lazy" />
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'tabs', type: 'RackTab[]' },
      { prop: 'empty', type: 'boolean', default: 'true' },
      { prop: 'dropTitle', type: 'string', default: 'drop a file' },
      { prop: 'dropNote', type: 'string' },
      { prop: 'accept', type: 'string' },
      { prop: 'multiple', type: 'boolean', default: 'false' },
      { prop: 'pickLabel', type: 'string', default: 'choose a file' },
      { prop: 'sampleLabel', type: 'string', default: 'try a sample' },
      { prop: '@files', type: 'File[]' },
      { prop: '@sample', type: '' },
      { prop: 'slots', type: 'bar, default, verbs, tab-<id>, detail' },
    ]"
  />
</template>
