<script setup lang="ts">
import { ref } from 'vue'
import { HbPresetChips, HbSeg, HbSettingsForm, useToast, type SettingLevel, type SettingValues } from '@hackbuild/ui'
import { defaultsOf } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { presets, schema, sections } from '../fixtures/settings'

const { toast } = useToast()
const level = ref<SettingLevel>('standard')
const values = ref<SettingValues>({ ...defaultsOf(schema), temp: 0.2 })
const code = `<HbSettingsForm v-model="values" :schema="schema" :sections="sections" :level="level">
  <template #before-brain><HbPresetChips v-model="values" :presets="presets" /></template>
</HbSettingsForm>

// schema row
{ key: 'context', section: 'brain', type: 'select', label: 'context',
  why: 'tokens the model keeps in view. more costs memory on the gpu.',
  default: '4096', options: ['2048', '4096', '8192'], applies: 'next load', level: 'standard' }`
</script>

<template>
  <DemoSection
    title="Settings from a schema"
    note="Every control has a sentence under it, a tag where one matters, and says when it applies. The reset mark returns a row; each section ends with its own reset. Rows above the disclosure level are hidden and counted."
    :code="code"
  >
    <div style="max-width: 520px">
      <HbSeg v-model="level" :options="['guided', 'standard', 'expert']" aria-label="disclosure level" />
      <div style="margin-top: 16px">
        <HbSettingsForm
          v-model="values"
          :schema="schema"
          :sections="sections"
          :level="level"
          @reset="(s) => toast(s ? `${s} back to defaults` : 'defaults restored')"
        >
          <template #before-brain><HbPresetChips v-model="values" :presets="presets" label="sampling presets" /></template>
        </HbSettingsForm>
      </div>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'schema', type: 'SettingDef[]', notes: '{key, type, label, why, tag, applies, default, level, section, min, max, step, unit, options}' },
      { prop: 'sections', type: '{key, label, note}[]', notes: 'order and headings' },
      { prop: 'v-model', type: 'Record<string, value>' },
      { prop: 'level', type: `'guided' | 'standard' | 'expert'`, default: `'expert'` },
      { prop: '@commit', type: '(key, value)', notes: 'a value settled' },
      { prop: '@reset', type: 'section key, empty for all' },
      { prop: '#before-<section>, #after-<section>, #foot', type: 'slots' },
    ]"
  />
</template>
