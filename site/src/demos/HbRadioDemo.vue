<script setup lang="ts">
import { ref } from 'vue'
import { HbRadio } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const polarity = ref<string | number>('pos')
const who = ref<string | number>('hints')

const WHO = [
  { value: 'model', title: 'the model', desc: 'it reads the room, picks every action, sees each result and goes again.', trade: 'one model call per step' },
  { value: 'hints', title: 'the model, with hints', desc: 'same loop, and every prompt carries a suggested next step.', trade: 'longer prompts. best for the smallest models' },
  { value: 'reflex', title: 'reflexes first', desc: 'plain orders run with no model call. the model gets what the rules cannot parse.', trade: '' },
]

const code = `<HbRadio v-model="polarity" value="pos" name="pol">positive</HbRadio>
<HbRadio v-model="polarity" value="neg" name="pol">negative</HbRadio>`

const cardCode = `<div class="hb-rcards" role="radiogroup" aria-label="who decides">
  <HbRadio v-model="who" name="who" value="model" title="the model"
    desc="it reads the room, picks every action, sees each result and goes again."
    trade="one model call per step" />
  <HbRadio v-model="who" name="who" value="reflex" title="reflexes first"
    desc="plain orders run with no model call." />
</div>`
</script>

<template>
  <DemoSection title="Radio group" :code="code">
    <div class="demo-row" style="gap: 24px">
      <HbRadio v-model="polarity" value="pos" name="demo-pol">positive</HbRadio>
      <HbRadio v-model="polarity" value="neg" name="demo-pol">negative</HbRadio>
      <HbRadio v-model="polarity" value="alt" name="demo-pol" disabled>alternating</HbRadio>
    </div>
    <p style="margin: 12px 0 0">
      value: <span class="hb-readout" style="font-size: 16px">{{ polarity }}</span>
    </p>
  </DemoSection>

  <DemoSection title="Card form: who decides" :code="cardCode">
    <div class="hb-rcards" role="radiogroup" aria-label="who decides" style="max-width: 520px">
      <HbRadio v-for="o in WHO" :key="o.value" v-model="who" name="demo-who" :value="o.value" :title="o.title" :desc="o.desc" :trade="o.trade" />
    </div>
    <p style="margin: 12px 0 0">
      value: <span class="hb-readout" style="font-size: 16px">{{ who }}</span>
    </p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'value', type: 'string | number', notes: 'required, the value this radio selects' },
      { prop: 'v-model', type: 'string | number' },
      { prop: 'name', type: 'string', notes: 'one per group; the card form needs it for the arrow keys' },
      { prop: 'disabled', type: 'boolean', default: 'false' },
      { prop: 'title', type: 'string', default: `''`, notes: 'set it for the card form: the option name' },
      { prop: 'desc', type: 'string', default: `''`, notes: 'card form: one line of what it means' },
      { prop: 'trade', type: 'string', default: `''`, notes: 'card form: what it costs, a quieter line' },
    ]"
  />
</template>
