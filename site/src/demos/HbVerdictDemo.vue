<script setup lang="ts">
import { HbVerdict } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbVerdict status="fail" text="fail, 62 deg" />`
</script>

<template>
  <DemoSection title="Verdict" note="The tag a check ends in. not run is its own state, never folded into pass or fail." :code="code">
    <div class="demo-row">
      <HbVerdict status="pass" />
      <HbVerdict status="fail" text="fail, 62 deg" />
      <HbVerdict status="warn" />
      <HbVerdict status="not run" />
      <HbVerdict status="running" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'status', type: `'pass' | 'fail' | 'not run' | 'running' | 'warn'` },
      { prop: 'text', type: 'string', notes: 'defaults to the status' },
    ]"
  />
</template>
