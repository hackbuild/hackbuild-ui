<script setup lang="ts">
import { ref } from 'vue'
import { HbRange2 } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const near = ref(0.25)
const far = ref(1)
const lo = ref(40)
const hi = ref(200)
const settled = ref('')
const code = `<HbRange2 label="depth window" v-model:lo="near" v-model:hi="far" :names="['keep near >=', 'keep far <=']"
  :format="(v) => v.toFixed(2)" hint="1.0 = nearest to camera, 0.0 = farthest." @commit="rebuild" />`
</script>

<template>
  <DemoSection title="Dual range" note="Two thumbs on one track. The moved thumb stops at the other; gap keeps them apart. Keys work as on any range. v-model follows the drag; commit fires on release." :code="code">
    <div class="demo-col" style="max-width: 420px">
      <HbRange2
        v-model:lo="near"
        v-model:hi="far"
        label="depth window"
        :names="['keep near >=', 'keep far <=']"
        :format="(v: number) => v.toFixed(2)"
        hint="1.0 = nearest to camera, 0.0 = farthest. trim the window so the turntable and background drop out."
        @commit="(a: number, b: number) => (settled = `rebuilt at ${a.toFixed(2)} to ${b.toFixed(2)}`)"
      />
      <HbRange2 v-model:lo="lo" v-model:hi="hi" label="level cut" :min="0" :max="255" :step="1" :gap="16" :names="['floor', 'ceiling']" />
      <HbRange2 :lo="0.2" :hi="0.6" label="disabled" disabled />
      <p class="hb-hint">{{ settled || 'release a thumb to rebuild' }}</p>
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'v-model:lo / v-model:hi', type: 'number' },
      { prop: 'label', type: 'string' },
      { prop: 'min / max / step / gap', type: 'number', default: '0 / 1 / 0.01 / 0' },
      { prop: 'names', type: '[string, string]', default: `['low', 'high']` },
      { prop: 'format / hint / disabled', type: '(v) => string / string / boolean' },
      { prop: 'emits', type: 'commit(lo, hi)' },
    ]"
  />
</template>
