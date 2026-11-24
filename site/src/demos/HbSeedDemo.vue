<script setup lang="ts">
import { ref } from 'vue'
import { HbSeed } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const seed = ref(12345)
const locked = ref(true)
const code = `<HbSeed v-model="seed" v-model:locked="locked" />
// before each run: seed.value = nextSeed(seed.value, locked.value)`
</script>

<template>
  <DemoSection title="Seed" note="A whole number, the dice for a new one, and the lock: kept runs repeat, unlocked runs roll a new seed each time (nextSeed). A typed value that is not a whole number in range is refused in place." :code="code">
    <div style="max-width: 420px">
      <HbSeed v-model="seed" v-model:locked="locked" />
    </div>
    <p class="hb-hint" style="margin-top: 8px">seed {{ seed }}, {{ locked ? 'kept for the next run' : 'rolls every run' }}</p>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'number', default: '12345' },
      { prop: 'v-model:locked', type: 'boolean', default: 'true' },
      { prop: 'label / disabled', type: 'string / boolean' },
      { prop: 'emits', type: 'reroll' },
    ]"
  />
</template>
