<script setup lang="ts">
import { ref } from 'vue'
import { HbInset } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const open = ref(true)
const mode = ref('depth')
const code = `<HbInset title="depth" aux="relative, 0 to 9" :modes="['depth', 'mask', 'cutout']" v-model:mode="mode" collapsible v-model:open="open">
  <canvas ref="view" />
</HbInset>`
</script>

<template>
  <DemoSection title="Inset" note="A derived view beside the main one. The head stays one line: the title and aux cut first. Modes check the same data three ways; collapsible hides the media from the head." :code="code">
    <div class="demo-row" style="container-type: inline-size; align-items: flex-start">
      <HbInset v-model:open="open" v-model:mode="mode" title="depth anything" aux="relative, near is bright" :modes="['depth', 'mask', 'cutout']" collapsible>
        <div :class="`demo-inset-fill is-${mode}`" />
      </HbInset>
      <HbInset title="source" aux="640 x 480">
        <div class="demo-inset-fill" />
      </HbInset>
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'title / aux', type: 'string' },
      { prop: 'ratio', type: 'string', default: `'4/3'` },
      { prop: 'collapsible + v-model:open', type: 'boolean', default: 'false / true' },
      { prop: 'modes + v-model:mode', type: 'string[] / string', notes: 'first mode until one is picked' },
      { prop: 'slot head', type: 'replaces aux' },
    ]"
  />
</template>
