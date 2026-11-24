<script setup lang="ts">
import { HbHash } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const hex = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
const code = `<HbHash :hex="hex" :expected="known" copy />`
</script>

<template>
  <DemoSection title="Hash" note="The sha-256 of the bytes against the known hash, with the verdict. copy adds a mark after the hex once it is known." :code="code">
    <div class="demo-col" style="max-width: 520px">
      <HbHash :hex="hex" :expected="hex" copy />
      <HbHash :hex="hex" expected="0000" copy />
      <HbHash :hex="hex" copy />
      <HbHash checking />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'hex / expected', type: 'string' },
      { prop: 'checking', type: 'boolean' },
      { prop: 'copy', type: 'boolean', default: 'false' },
    ]"
  />
</template>
