<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import HbDrawer from './HbDrawer.vue'
import { uid } from '../utils/uid'
import {
  MODEL_FILTERS_DEFAULT, OWN_FORMS, canLoad, filterModelRows, groupModelRows, loadLabel, ownReady, rowSub, stateWord,
  type ModelFilters, type ModelRow, type OwnKind,
} from '../vanilla/modelpick'

interface Props {
  /** Display ready rows for the one job this tool needs. */
  rows: ModelRow[]
  /** Sheet heading, also its accessible name. */
  title?: string
  /** Show the "your own" forms. */
  own?: boolean
  /** Starting filters; "fits this machine" is on by default. */
  filters?: Partial<ModelFilters>
}

const props = withDefaults(defineProps<Props>(), {
  title: 'pick a model',
  own: true,
  filters: () => ({}),
})

/** Open state. A 520 px sheet from 641 px, full height under it. */
const open = defineModel<boolean>('open', { default: false })
/** The chosen row's id. */
const chosen = defineModel<string>('chosen', { default: '' })

const emit = defineEmits<{
  /** A row was pressed. */
  choose: [id: string]
  /** The pink button: fetch and start the chosen row. */
  load: [id: string]
  /** Stop a load in progress. */
  cancel: [id: string]
  /** Delete a stored model from this machine. */
  remove: [id: string]
  /** One of the chosen row's options changed. */
  option: [id: string, key: string, value: string]
  /** A "your own" form was sent. */
  custom: [kind: OwnKind, values: Record<string, string>]
}>()

const f = reactive<ModelFilters>({ ...MODEL_FILTERS_DEFAULT, ...props.filters })
const shown = computed(() => filterModelRows(props.rows, f))
const groups = computed(() => groupModelRows(shown.value))
const hidden = computed(() => props.rows.length - shown.value.length)
const row = computed(() => props.rows.find((r) => r.id === chosen.value))
const openDetail = ref<string>('')
const base = uid('hb-msheet')

function choose(r: ModelRow) {
  if (r.unfit) return
  chosen.value = r.id
  emit('choose', r.id)
}
function toggle(id: string) {
  openDetail.value = openDetail.value === id ? '' : id
}
function sub(r: ModelRow) { return rowSub(r) }

const ownKind = ref<OwnKind>('gguf')
const ownValues = reactive<Record<string, string>>({})
const ownForm = computed(() => OWN_FORMS.find((x) => x.kind === ownKind.value)!)
watch(ownKind, () => { for (const k of Object.keys(ownValues)) delete ownValues[k] })
function sendOwn() {
  if (!ownReady(ownKind.value, ownValues)) return
  emit('custom', ownKind.value, { ...ownValues })
}
</script>

<template>
  <HbDrawer v-model="open" side="auto" :breakpoint="641" :title="props.title">
    <div class="hb-msheet">
      <div class="hb-msheet-find">
        <input v-model="f.query" class="hb-input" type="search" :aria-label="`search ${props.title}`" placeholder="search by name or word">
        <div class="hb-msheet-filters" role="group" aria-label="filters">
          <button type="button" class="hb-chip is-toggle" :class="{ 'is-on': f.fits }" :aria-pressed="f.fits" @click="f.fits = !f.fits">fits this machine</button>
          <button type="button" class="hb-chip is-toggle" :class="{ 'is-on': f.uncensored }" :aria-pressed="f.uncensored" @click="f.uncensored = !f.uncensored">uncensored</button>
          <button type="button" class="hb-chip is-toggle" :class="{ 'is-on': f.nodownload }" :aria-pressed="f.nodownload" @click="f.nodownload = !f.nodownload">no download</button>
        </div>
      </div>

      <div class="hb-msheet-list" role="listbox" :aria-label="props.title" :aria-activedescendant="row ? `${base}-${row.id}` : undefined">
        <template v-for="g in groups" :key="g.id">
          <div class="hb-msheet-gh" role="presentation">{{ g.label }}</div>
          <ul class="hb-msheet-group" role="presentation">
            <li
              v-for="r in g.rows"
              :id="`${base}-${r.id}`"
              :key="r.id"
              class="hb-mrow"
              :class="{ 'is-chosen': r.id === chosen, 'is-unfit': !!r.unfit }"
              role="option"
              :aria-selected="r.id === chosen"
              :aria-disabled="!!r.unfit || undefined"
            >
              <div class="hb-mrow-line">
                <component :is="r.unfit ? 'div' : 'button'" :type="r.unfit ? undefined : 'button'" class="hb-mrow-pick" :class="{ 'is-off': !!r.unfit }" @click="choose(r)">
                  <span class="hb-mrow-name">{{ r.name }}<i v-if="r.uncensored" title="uncensored">u</i><i v-if="r.noncommercial" title="not for commercial use">nc</i></span>
                  <span v-if="sub(r).unfit" class="hb-mrow-sub"><b>{{ sub(r).lead }}</b><template v-if="sub(r).facts">, {{ sub(r).facts }}</template></span>
                  <span v-else class="hb-mrow-sub"><span v-if="r.backend" class="hb-mrow-chip">{{ r.backend }}</span>{{ sub(r).facts }}<template v-if="sub(r).facts && sub(r).lead">, </template><b>{{ sub(r).lead }}</b></span>
                  <span class="hb-mrow-state" :class="r.state ? `is-${r.state}` : ''">{{ stateWord(r) }}</span>
                </component>
                <button
                  v-if="r.detail?.length || r.state === 'stored'"
                  type="button"
                  class="hb-mrow-more"
                  :aria-expanded="openDetail === r.id"
                  :aria-controls="`${base}-${r.id}-d`"
                  :aria-label="`about ${r.name}`"
                  @click="toggle(r.id)"
                />
              </div>
              <div v-if="r.state === 'loading'" class="hb-mrow-bar" aria-hidden="true"><i :style="{ width: `${Math.round((r.progress ?? 0) * 100)}%` }" /></div>
              <div v-if="openDetail === r.id" :id="`${base}-${r.id}-d`" class="hb-mrow-detail" data-ux="detail">
                <dl v-if="r.detail?.length">
                  <template v-for="d in r.detail" :key="d.label"><dt>{{ d.label }}</dt><dd>{{ d.value }}</dd></template>
                </dl>
                <button v-if="r.state === 'stored'" type="button" class="hb-btn hb-btn-sm hb-btn-danger" @click="emit('remove', r.id)">remove from this machine</button>
              </div>
            </li>
          </ul>
        </template>
        <p v-if="!groups.length" class="hb-msheet-none">nothing matches. turn a filter off or clear the search.</p>
        <p v-else-if="hidden > 0 && f.fits" class="hb-msheet-none">{{ hidden }} more do not fit this machine or the filters.</p>
      </div>

      <div v-if="row?.options?.length" class="hb-msheet-opts">
        <label v-for="o in row.options" :key="o.key" class="hb-field">
          <span class="hb-label">{{ o.label }}</span>
          <select class="hb-select" :value="o.value" @change="emit('option', row.id, o.key, ($event.target as HTMLSelectElement).value)">
            <option v-for="c in o.choices" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </label>
      </div>

      <details v-if="props.own" class="hb-msheet-own">
        <summary>your own</summary>
        <form @submit.prevent="sendOwn">
          <div class="hb-seg" role="group" aria-label="kind">
            <button v-for="k in OWN_FORMS" :key="k.kind" type="button" :class="{ 'is-on': ownKind === k.kind }" :aria-pressed="ownKind === k.kind" @click="ownKind = k.kind">{{ k.label }}</button>
          </div>
          <label v-for="fd in ownForm.fields" :key="`${ownKind}-${fd.key}`" class="hb-field">
            <span class="hb-label">{{ fd.label }}</span>
            <input v-model="ownValues[fd.key]" class="hb-input" :type="fd.secret ? 'password' : 'text'" :placeholder="fd.placeholder" autocomplete="off" spellcheck="false">
          </label>
          <button v-if="ownReady(ownKind, ownValues)" type="submit" class="hb-btn">add</button>
        </form>
      </details>

      <div class="hb-msheet-foot">
        <button v-if="row && canLoad(row)" type="button" class="hb-btn hb-btn-go" @click="emit('load', row.id)">{{ loadLabel(row) }}</button>
        <template v-else-if="row?.state === 'loading'">
          <span class="hb-msel-state" role="status">{{ loadLabel(row) }}</span>
          <button type="button" class="hb-btn" @click="emit('cancel', row.id)">cancel</button>
        </template>
        <span v-else-if="row?.state === 'loaded'" class="hb-msel-state is-loaded">{{ row.name }}, ready</span>
        <span v-else class="hb-msel-state">pick a row</span>
      </div>
    </div>
  </HbDrawer>
</template>
