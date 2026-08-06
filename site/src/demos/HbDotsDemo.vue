<script setup lang="ts">
import { HbDots, HbKv } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbDots :value="3" label="difficulty" />
<HbDots :value="5" :max="5" />`
</script>

<template>
  <DemoSection
    title="Level dots"
    note="Square pips filled pink up to the level. Difficulty on a tutorial, skill on a profile. Squares, because the only circles in this system are the section badge, nav dots and the pill dot."
    :code="code"
  >
    <div style="max-width: 340px">
      <HbKv label="beginner"><HbDots :value="1" label="beginner difficulty" /></HbKv>
      <HbKv label="intermediate"><HbDots :value="3" label="intermediate difficulty" /></HbKv>
      <HbKv label="expert"><HbDots :value="5" label="expert difficulty" /></HbKv>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'value', type: 'number', notes: 'required, filled pips' },
      { prop: 'max', type: 'number', default: '5' },
      { prop: 'label', type: 'string', default: `'level'`, notes: 'accessible name' },
    ]"
  />
</template>
