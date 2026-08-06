<script setup lang="ts">
import { HbCountdown, useToast } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const { toast } = useToast()

const target = new Date(Date.now() + 2 * 86400e3 + 3 * 3600e3 + 21 * 60e3)

const code = `<HbCountdown :until="contest.deadline" @done="onDeadline" />`
</script>

<template>
  <DemoSection
    title="Countdown"
    note="Contest deadlines, drop timers. VT323 blocks on ink plates, ticking once a second, done fires at zero."
    :code="code"
  >
    <HbCountdown :until="target" @done="toast('deadline hit')" />
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'until', type: 'Date | number | string', notes: 'required, the target time' },
      { prop: '@done', type: 'emit', notes: 'fires once at zero' },
    ]"
  />
</template>
