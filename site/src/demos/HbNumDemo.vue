<script setup lang="ts">
import { HbNum } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'

const code = `<HbNum>01</HbNum>`
</script>

<template>
  <DemoSection
    title="Section badge"
    note="One of only two places a border radius is allowed in the whole system. The other is nav dots."
    :code="code"
  >
    <div class="demo-row" style="align-items: center; gap: 18px">
      <span style="display: inline-flex; align-items: center; gap: 10px"><HbNum>01</HbNum> <h3 style="margin: 0">the rules</h3></span>
      <span style="display: inline-flex; align-items: center; gap: 10px"><HbNum>02</HbNum> <h3 style="margin: 0">the mark</h3></span>
    </div>
  </DemoSection>
</template>
