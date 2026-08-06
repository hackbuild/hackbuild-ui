<script setup lang="ts">
import { HbKbd } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'

const code = `press <HbKbd>ctrl</HbKbd> <HbKbd>k</HbKbd> to search`
</script>

<template>
  <DemoSection title="Keyboard hints" :code="code">
    <p style="margin: 0">
      press <HbKbd>ctrl</HbKbd> <HbKbd>k</HbKbd> to search,
      <HbKbd>space</HbKbd> to mute, and
      <HbKbd>shift</HbKbd> <HbKbd>?</HbKbd> for the full map.
    </p>
  </DemoSection>
</template>
