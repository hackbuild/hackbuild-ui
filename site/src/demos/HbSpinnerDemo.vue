<script setup lang="ts">
import { HbButton, HbSpinner } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'

const code = `<HbSpinner />
<HbButton loading>saving</HbButton>`
</script>

<template>
  <DemoSection
    title="Spinner"
    note="Three meter segments blinking in order. Hard edges; no circles in this system. HbButton shows it automatically while loading."
    :code="code"
  >
    <div class="demo-row" style="gap: 24px">
      <HbSpinner />
      <HbButton loading>saving</HbButton>
      <span style="background: var(--hb-void); padding: 12px; display: inline-flex">
        <HbSpinner />
      </span>
    </div>
  </DemoSection>
</template>
