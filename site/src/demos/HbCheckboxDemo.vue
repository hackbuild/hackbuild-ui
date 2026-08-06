<script setup lang="ts">
import { ref } from 'vue'
import { HbCheckbox } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const log = ref(true)
const raw = ref(false)

const code = `<HbCheckbox v-model="log">log to disk</HbCheckbox>`
</script>

<template>
  <DemoSection title="Checkbox" note="Native control carrying the pink accent." :code="code">
    <div class="demo-row" style="gap: 24px">
      <HbCheckbox v-model="log">log to disk</HbCheckbox>
      <HbCheckbox v-model="raw">keep raw iq</HbCheckbox>
      <HbCheckbox disabled>cloud sync</HbCheckbox>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'boolean' },
      { prop: 'disabled', type: 'boolean', default: 'false' },
    ]"
  />
</template>
