<script setup lang="ts">
import { ref } from 'vue'
import { HbApiKey, HbIcon, HbTierCards, type HbTier } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const engines: HbTier[] = [
  { key: 'none', label: 'no model', sub: 'scripted replies', size: 'none', cost: 'free, no download', privacy: 'runs anywhere', note: 'answers from a script so you can see the shape.' },
  { key: 'tab', label: 'in this tab', sub: 'hermes 3 llama 3.2 3b', size: '2.2 GB (vendor)', cost: 'free, runs on your gpu', privacy: 'nothing leaves this machine' },
  { key: 'browser', label: 'browser built in', sub: 'gemini nano', size: 'browser managed', cost: 'free', privacy: 'stays in the browser', disabled: true, reason: 'the probe found no prompt api in this browser.' },
  { key: 'endpoint', label: 'your endpoint', sub: 'any openai style server', size: 'none', cost: 'your server, your cost', privacy: 'words go to the url you set' },
]
const engine = ref('tab')

const persona: HbTier[] = [
  { key: 'cloud', label: 'cloud', sub: 'anthropic messages, your key', size: 'api', note: 'the richest persona. your key is used from this browser only.', bar: 0.05 },
  { key: 'haunted', label: 'haunted', sub: 'hermes 3 llama 3.1 8b', size: '4.8 GB (vendor)', note: 'strongest local choice. best action tag compliance.', bar: 0.95 },
  { key: 'lurking', label: 'lurking', sub: 'qwen2.5 3b', size: '2.4 GB (vendor)', note: 'balanced. strong at structured output for its size.', bar: 0.45 },
  { key: 'echo', label: 'echo', sub: 'qwen2.5 1.5b', size: '1.6 GB (vendor)', note: 'barely there. often misses action tags. last resort.', bar: 0.15 },
]
const tier = ref('')
const key = ref('')
const keyOk = ref(false)
const ICON: Record<string, string> = { cloud: 'globe', haunted: 'ghost', lurking: 'eye', echo: 'wave' }

const code = `<HbTierCards v-model="tier" :tiers="tiers" start :can-start="tier !== 'cloud' || keyOk" @start="load">
  <template #icon="{ tier }"><HbIcon :name="icons[tier.key]" /></template>
  <template #body="{ tier }"><HbApiKey v-if="tier.key === 'cloud'" v-model="key" v-model:valid="keyOk" :pattern="/^sk-ant-/" /></template>
</HbTierCards>`
</script>

<template>
  <DemoSection
    title="Engine tiers"
    note="Where the words go and who pays, stated before any model name. A tier this machine cannot run is off with the reason. Arrows move between tiers."
    :code="code"
  >
    <div style="max-width: 560px">
      <HbTierCards v-model="engine" :tiers="engines" label="engine">
        <template #body="{ tier: t }">
          <p v-if="t.key === 'endpoint'" class="hb-hint" style="margin: 0">set the url and model in the custom form.</p>
        </template>
      </HbTierCards>
    </div>
  </DemoSection>

  <DemoSection
    title="Persona tiers"
    note="Model quality told in the character's own terms, with a capability bar. The remote tier reveals the key field; start stays off until a tier is picked and, for that tier, the key looks valid."
  >
    <div style="max-width: 560px">
      <HbTierCards v-model="tier" :tiers="persona" label="brain" start start-label="start" :can-start="tier !== 'cloud' || keyOk">
        <template #icon="{ tier: t }"><HbIcon :name="(ICON[t.key] as never)" :size="28" /></template>
        <template #body="{ tier: t }">
          <HbApiKey v-if="t.key === 'cloud'" v-model="key" v-model:valid="keyOk" label="anthropic api key" pattern="^sk-ant-" placeholder="sk-ant-api03-..." />
        </template>
      </HbTierCards>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'tiers', type: '{key, label, sub, size, cost, privacy, note, bar, disabled, reason}[]' },
      { prop: 'v-model', type: 'string', notes: 'the picked key' },
      { prop: 'start / startLabel / canStart', type: 'boolean / string / boolean' },
      { prop: 'foot', type: 'string', notes: 'default echoes the pick' },
      { prop: 'slots', type: 'icon, body, foot (scoped by tier)' },
      { prop: 'emits', type: 'start(key)' },
    ]"
  />
</template>
