<script setup lang="ts">
import { brandIconNames, HbButton, HbCallout, HbIcon, iconNames } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbIcon name="wrench" />
<HbIcon name="bolt" :size="24" />
<HbIcon name="github" />                <!-- brands ship too -->
<HbIcon name="record" label="recording" />  <!-- labeled, not decorative -->

<HbButton><template #icon><HbIcon name="plug" /></template>connect</HbButton>`
</script>

<template>
  <DemoSection
    title="The set"
    note="Font Awesome 6 solid, the icon language every hack.build page already speaks, baked in as path data: no CDN, no runtime dependency, currentColor fills. Never emoji, and never an icon where a two-word label is clearer."
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

  <DemoSection title="Brands" note="For footers, contact rows and press links. From Font Awesome brands, same baked-in treatment.">
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 10px">
      <div
        v-for="name in brandIconNames"
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
      <button class="hb-iconbtn" type="button" aria-label="settings"><HbIcon name="gear" :size="16" /></button>
      <button class="hb-iconbtn" type="button" aria-label="search"><HbIcon name="search" :size="16" /></button>
      <span style="background: var(--hb-ink); padding: 10px; display: inline-flex; gap: 8px">
        <a class="hb-iconbtn" href="#" aria-label="github"><HbIcon name="github" :size="16" /></a>
        <a class="hb-iconbtn" href="#" aria-label="youtube"><HbIcon name="youtube" :size="16" /></a>
      </span>
    </div>
  </DemoSection>

  <HbCallout style="margin-top: 4px">
    The registry is generated from the Font Awesome packages by
    npm run gen:icons; add a mapping there when a tool needs a glyph this
    set does not carry. Icons are CC BY 4.0 by Font Awesome.
  </HbCallout>

  <PropsTable
    :rows="[
      { prop: 'name', type: 'IconName', notes: 'required, solid or brand name' },
      { prop: 'size', type: 'number | string', default: '16', notes: 'height; width follows the glyph aspect' },
      { prop: 'label', type: 'string', notes: 'accessible name; without it the icon is decorative' },
    ]"
  />
</template>
