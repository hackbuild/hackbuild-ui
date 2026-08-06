<script setup lang="ts">
import { HbStatusBar } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'

const code = `<HbStatusBar>
  <span>fps <b>60</b></span>
  <span>fft <b>4096</b></span>
  <span>dropped <b>0</b></span>
</HbStatusBar>`
</script>

<template>
  <DemoSection
    title="Status strip"
    note="Counts and rates only, VT323, pinned at the bottom of a tool. Never a control. Wrap key figures in b for the pink."
    :code="code"
  >
    <div style="margin: -16px">
      <HbStatusBar>
        <span>fps <b>60</b></span>
        <span>fft <b>4096</b></span>
        <span>audio <b>48k</b></span>
        <span>dropped <b>0</b></span>
      </HbStatusBar>
    </div>
  </DemoSection>
</template>
