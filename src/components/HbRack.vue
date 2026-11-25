<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import { tabs as tabsBehaviour, type TabsHandle } from '../vanilla/tabs'
import { uid } from '../utils/uid'
import type { RackTab } from '../vanilla/layout'


interface Props {
  /** Three to five tabs. The first is the live result, never settings. */
  tabs: RackTab[]
  /** Accessible name of the rack. */
  label?: string
  /** Heading of the detail fold at the foot, when the detail slot is used. */
  detailLabel?: string
}

const props = withDefaults(defineProps<Props>(), { label: 'rack', detailLabel: 'detail' })

/** The selected tab's id. */
const tab = defineModel<string>('tab', { default: '' })

const slots = useSlots()
const strip = ref<HTMLElement | null>(null)
const base = uid('hb-rack')
let handle: TabsHandle | null = null

onMounted(() => {
  if (!tab.value) tab.value = props.tabs[0]?.id ?? ''
  if (strip.value) handle = tabsBehaviour(strip.value, { value: tab.value, onChange: (v) => { tab.value = v } })
})
watch(tab, (v) => { if (handle && handle.value !== v) handle.select(v) })
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <!-- The 380 px rack: tabs on a light strip, one pane each. Slots are
       named by tab id; the detail slot folds at the foot and is the one
       place internal words may appear. -->
  <aside class="hb-rack" :aria-label="props.label" data-ux="rack">
    <nav ref="strip" class="hb-tabs" role="tablist" :aria-label="`${props.label} tabs`">
      <button
        v-for="t in props.tabs"
        :id="`${base}-${t.id}-t`"
        :key="t.id"
        type="button"
        class="hb-tab"
        role="tab"
        :data-value="t.id"
        :aria-selected="(tab || props.tabs[0]?.id) === t.id"
        :aria-controls="`${base}-${t.id}`"
      >{{ t.label }}</button>
    </nav>
    <section
      v-for="t in props.tabs"
      :id="`${base}-${t.id}`"
      :key="t.id"
      class="hb-rack-pane"
      role="tabpanel"
      :aria-labelledby="`${base}-${t.id}-t`"
      :hidden="(tab || props.tabs[0]?.id) !== t.id"
    >
      <slot :name="t.id" />
    </section>
    <details v-if="slots.detail" class="hb-rack-detail" data-ux="detail">
      <summary>{{ props.detailLabel }}</summary>
      <div><slot name="detail" /></div>
    </details>
  </aside>
</template>
