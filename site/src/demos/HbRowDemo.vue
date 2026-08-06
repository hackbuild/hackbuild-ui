<script setup lang="ts">
import { ref } from 'vue'
import { HbList, HbPill, HbRow } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const active = ref('rtl')

const code = `<HbRow :active="active" @click="pick">
  rtl2832u
  <span class="hb-spacer" />
  <HbPill status="ok">adopted</HbPill>
</HbRow>`
</script>

<template>
  <DemoSection
    title="Rows"
    note="A row is a button by default; pass as='a' with href for navigation. Anything slots in; push trailing content right with .hb-spacer."
    :code="code"
  >
    <HbList style="max-width: 420px">
      <HbRow :active="active === 'rtl'" @click="active = 'rtl'">
        rtl2832u
        <span class="hb-spacer" />
        <HbPill status="ok">adopted</HbPill>
      </HbRow>
      <HbRow :active="active === 'hackrf'" @click="active = 'hackrf'">
        hackrf one
        <span class="hb-spacer" />
        <HbPill>idle</HbPill>
      </HbRow>
      <HbRow as="a" href="#/components/HbList">
        a link row
        <span class="hb-spacer" />
        <span class="hb-label">opens HbList</span>
      </HbRow>
    </HbList>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'active', type: 'boolean', default: 'false', notes: 'fills pink' },
      { prop: 'as', type: 'string', default: `'button'` },
    ]"
  />
</template>
