<script setup lang="ts">
import { computed } from 'vue'
import HbParamRow from './HbParamRow.vue'
import {
  LEVELS, changedKeys, resetValues, sectionsOf, shownAt,
  type SettingDef, type SettingLevel, type SettingValue, type SettingValues,
} from '../vanilla/settings'

export interface HbSettingsSection {
  key: string
  label: string
  /** One line under the heading. */
  note?: string
}

interface Props {
  schema: SettingDef[]
  /** Section order and headings. Sections the schema names but this
      leaves out follow, headed by their key. */
  sections?: HbSettingsSection[]
  /** Disclosure level: rows above it are hidden and counted. */
  level?: SettingLevel
}

const props = withDefaults(defineProps<Props>(), {
  sections: () => [],
  level: 'expert',
})

const model = defineModel<SettingValues>({ required: true })

const emit = defineEmits<{
  /** One value settled. */
  commit: [key: string, value: SettingValue]
  /** A section, or every section with '', went back to its defaults. */
  reset: [section: string]
}>()

const heads = computed(() => new Map(props.sections.map((s) => [s.key, s])))
const groups = computed(() =>
  sectionsOf(props.schema, props.sections.map((s) => s.key)).map((g) => {
    const shown = g.rows.filter((r) => shownAt(r, props.level))
    const above = g.rows.length - shown.length
    const next = LEVELS.find((l) => g.rows.some((r) => !shownAt(r, props.level) && (r.level ?? 'guided') === l))
    return { ...g, head: heads.value.get(g.key), shown, above, next, changed: changedKeys(model.value, g.rows).length }
  }),
)

const value = (d: SettingDef): SettingValue => (d.key in model.value ? model.value[d.key] : d.default)
function set(key: string, v: SettingValue) {
  model.value = { ...model.value, [key]: v }
}
function commit(key: string, v: SettingValue) {
  set(key, v)
  emit('commit', key, v)
}
function resetSection(key: string) {
  const rows = props.schema.filter((d) => (d.section ?? '') === key)
  model.value = resetValues(model.value, rows)
  emit('reset', key)
}
const anyChanged = computed(() => changedKeys(model.value, props.schema).length > 0)
function resetAll() {
  model.value = resetValues(model.value, props.schema)
  emit('reset', '')
}
</script>

<template>
  <!-- Settings from a schema: every control says what it does, when it
       applies, and goes back to its default on its own or with its section. -->
  <div class="hb-setform">
    <section v-for="g in groups" :key="g.key" class="hb-setform-sec" :aria-label="g.head?.label ?? g.key">
      <h3 v-if="g.head?.label || g.key" class="hb-setform-head">{{ g.head?.label ?? g.key }}</h3>
      <p v-if="g.head?.note" class="hb-setform-note">{{ g.head.note }}</p>
      <slot :name="`before-${g.key}`" />
      <HbParamRow
        v-for="d in g.shown"
        :key="d.key"
        :model-value="value(d)"
        :label="d.label"
        :type="d.type"
        :min="d.min"
        :max="d.max"
        :step="d.step"
        :unit="d.unit"
        :options="d.options"
        :default-value="d.default"
        :help="d.why"
        :tag="d.tag"
        :applies="d.applies"
        @update:model-value="(v) => set(d.key, v)"
        @commit="(v) => commit(d.key, v)"
      />
      <slot :name="`after-${g.key}`" />
      <div class="hb-setform-foot">
        <span v-if="g.above" class="hb-setform-more">{{ g.above }} more from {{ g.next }} up</span>
        <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" :disabled="!g.changed" @click="resetSection(g.key)">reset this section</button>
      </div>
    </section>
    <div class="hb-setform-end">
      <slot name="foot" />
      <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" :disabled="!anyChanged" @click="resetAll">reset all to defaults</button>
    </div>
  </div>
</template>
