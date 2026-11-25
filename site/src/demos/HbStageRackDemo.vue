<script setup lang="ts">
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = "<HbStageRack :tabs=\"tabs\" v-model:tab=\"tab\">\n  <template #bar><HbHeader title=\"yard\" accent=\".\" /></template>\n  <canvas />\n  <template #inset>eye view</template>\n  <template #verbs><HbButton variant=\"go\">throw</HbButton><HbButton>treat</HbButton></template>\n  <template #tab-mind>...</template>\n  <template #detail>numbers and their source words</template>\n</HbStageRack>"
</script>

<template>
  <DemoSection title="Stage and rack" note="After hackle: the stage fills, insets and the verb row sit on it, the 380 px rack of three to five tabs beside it. Under 901 px the stage takes 62 percent of the screen and the rack follows." :code="code">
    <p><a href="#/layouts/stage-rack">open the live demo</a>, or look at it below at 900 by 560.</p>
    <iframe src="#/layouts/stage-rack" title="stage and rack demo" width="900" height="560" style="max-width:100%;border:var(--hb-border) solid var(--hb-ink)" loading="lazy" />
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'tabs', type: 'RackTab[]' },
      { prop: 'v-model:tab', type: 'string' },
      { prop: 'rackLabel', type: 'string', default: 'rack' },
      { prop: 'verbsLabel', type: 'string', default: 'actions' },
      { prop: 'slots', type: 'bar, default (subject), inset, verbs, tab-<id>, detail' },
    ]"
  />
</template>
