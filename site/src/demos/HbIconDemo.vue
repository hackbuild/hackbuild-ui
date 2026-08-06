<script setup lang="ts">
import { HbButton, HbCallout, HbIcon, iconNames } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbIcon name="wrench" />
<HbIcon name="bolt" :size="24" />
<HbIcon name="record" label="recording" />  <!-- labeled, not decorative -->

<HbButton><template #icon><HbIcon name="plug" /></template>connect</HbButton>`
</script>

<template>
  <DemoSection
    title="The set"
    note="Hand-drawn stroke icons on a 24 px grid: currentColor, no fills, square caps. Sized for 14 to 24 px. Never emoji, and never an icon where a two-word label is clearer."
    :code="code"
  >
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 10px">
      <div
        v-for="name in iconNames"
        :key="name"
        style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px; background: var(--hb-paper-raised); border: 1px solid var(--hb-ink)"
      >
        <HbIcon :name="name" :size="20" />
        <span style="font-family: var(--hb-utility); font-size: 9.5px; color: var(--hb-ink-3)">{{ name }}</span>
      </div>
    </div>
  </DemoSection>

  <DemoSection title="In context" note="Icons lead labels in buttons. Icon-only actions use the square icon button and always carry an aria-label.">
    <div class="demo-row">
      <HbButton><template #icon><HbIcon name="plug" /></template>connect</HbButton>
      <HbButton variant="secondary"><template #icon><HbIcon name="download" /></template>export</HbButton>
      <HbButton variant="danger"><template #icon><HbIcon name="record" /></template>record</HbButton>
      <button class="hb-iconbtn" type="button" aria-label="settings"><HbIcon name="gear" :size="18" /></button>
      <button class="hb-iconbtn" type="button" aria-label="search"><HbIcon name="search" :size="18" /></button>
      <span style="background: var(--hb-ink); padding: 10px; display: inline-flex; gap: 8px">
        <button class="hb-iconbtn" type="button" aria-label="refresh"><HbIcon name="refresh" :size="18" /></button>
        <button class="hb-iconbtn" type="button" aria-label="close"><HbIcon name="x" :size="18" /></button>
      </span>
    </div>
  </DemoSection>

  <HbCallout style="margin-top: 4px">
    Brand and social glyphs are not in the set on purpose. Use Font Awesome 6
    brands for github, youtube and the rest, the way every shipped page does.
    See docs/icons.md.
  </HbCallout>

  <PropsTable
    :rows="[
      { prop: 'name', type: 'IconName', notes: 'required, from the shipped set' },
      { prop: 'size', type: 'number | string', default: '16' },
      { prop: 'strokeWidth', type: 'number', default: '2', notes: '1.5 to 2.4 per the system' },
      { prop: 'label', type: 'string', notes: 'accessible name; without it the icon is decorative' },
    ]"
  />
</template>
