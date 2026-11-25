<script setup lang="ts">
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = "<HbFormFrame :tabs=\"tabs\">\n  <img :src=\"out\" />\n  <template #tab-make><HbTextarea v-model=\"prompt\" /><HbButton variant=\"go\" block>generate</HbButton></template>\n</HbFormFrame>"
</script>

<template>
  <DemoSection title="Form and frame" note="After grommet: the form column is the rack, at the left; the output frame fills the rest. Under 901 px the frame comes first." :code="code">
    <p><a href="#/layouts/form-frame">open the live demo</a>, or look at it below at 900 by 560.</p>
    <iframe src="#/layouts/form-frame" title="form and frame demo" width="900" height="560" style="max-width:100%;border:var(--hb-border) solid var(--hb-ink)" loading="lazy" />
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'tabs', type: 'RackTab[]' },
      { prop: 'slots', type: 'bar, default, inset, verbs, tab-<id>, detail' },
    ]"
  />
</template>
