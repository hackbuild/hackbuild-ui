<script setup lang="ts">
import { HbButton, useToast } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'

const { toast } = useToast()

const code = `// render <HbToaster /> once near the app root
const { toast } = useToast()

toast('bookmark saved')       // default 1400 ms
toast('capture armed', 3000)  // longer`
</script>

<template>
  <DemoSection
    title="Toast"
    note="One toast at a time, bottom center, ink plate, pink rule, gone in about a second. This site renders the toaster already, so these fire for real."
    :code="code"
  >
    <div class="demo-row">
      <HbButton variant="secondary" @click="toast('bookmark saved')">short toast</HbButton>
      <HbButton variant="secondary" @click="toast('capture armed, 30 seconds', 3000)">longer toast</HbButton>
    </div>
  </DemoSection>
</template>
