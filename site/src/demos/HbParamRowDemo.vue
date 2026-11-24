<script setup lang="ts">
import { ref } from 'vue'
import { HbParamRow } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const width = ref(42)
const preview = ref(42)
const built = ref(42)
const shape = ref<string | number | boolean>('oval')
const rim = ref<string | number | boolean>(true)
const name = ref<string | number | boolean>('bolo')
const code = `<HbParamRow v-model="width" label="width" unit="mm" :min="20" :max="90" :step="0.5"
  :default-value="42" help="outside width of the slide" @touch="preview" @commit="rebuild" />`
</script>

<template>
  <DemoSection
    title="Parameter rows"
    note="Label, control, paired number and unit, with a sentence under it. Dragging previews; releasing, a key, or a typed number commits. The reset mark shows once the value leaves its default. 44 px rows on a coarse pointer."
    :code="code"
  >
    <div style="max-width: 520px">
      <HbParamRow
        v-model="width"
        label="width"
        unit="mm"
        :min="20"
        :max="90"
        :step="0.5"
        :default-value="42"
        help="outside width of the slide. the tips follow it."
        @touch="(v) => (preview = Number(v))"
        @commit="(v) => (built = Number(v))"
      />
      <p class="hb-hint" style="margin: 0 0 8px">preview {{ preview }} mm, built at {{ built }} mm</p>
      <HbParamRow v-model="shape" type="seg" label="shape" :options="['oval', 'rect', 'shield']" default-value="oval" help="the outline of the slide." />
      <HbParamRow v-model="rim" type="switch" label="rim band" :default-value="true" help="a raised band round the edge that hides the seam." tag="recommended" />
      <HbParamRow v-model="name" type="text" label="name" default-value="bolo" help="printed on the print card." applies="next export" />
      <HbParamRow :model-value="0.24" label="inlay" unit="mm" :min="0.24" :max="2.4" :step="0.24" disabled reason="one colour print: there is no inlay to set." />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'label', type: 'string' },
      { prop: 'type', type: `'range' | 'select' | 'switch' | 'seg' | 'text'`, default: `'range'` },
      { prop: 'min, max, step, unit', type: 'number, string' },
      { prop: 'options', type: 'for select and seg' },
      { prop: 'defaultValue', type: 'value', notes: 'shows the reset mark once changed' },
      { prop: 'help', type: 'string', notes: 'what it does, what it costs' },
      { prop: 'tag', type: 'string', notes: 'experimental, recommended' },
      { prop: 'applies', type: 'string', notes: 'next load; live when empty' },
      { prop: 'disabled, reason', type: 'boolean, string' },
      { prop: '@touch', type: 'value', notes: 'drag in progress: preview' },
      { prop: '@commit', type: 'value', notes: 'settled: rebuild' },
    ]"
  />
</template>
