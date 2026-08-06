<script setup lang="ts">
import { HbNav } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const links = [
  { label: 'projects', href: '#', active: true },
  { label: 'zine', href: '#' },
  { label: 'videos', href: '#' },
  { label: 'contact', href: '#', cta: true },
]

const code = `<HbNav :links="[
  { label: 'projects', href: '/projects', active: true },
  { label: 'zine', href: '/zine' },
  { label: 'contact', href: '/contact', cta: true },
]" />`
</script>

<template>
  <DemoSection
    title="Page nav"
    note="Ink bar, mark plus wordmark left, links right, one pink call to action at most. Below 760 px the links collapse into a drawer behind the menu button. Tool shells use HbHeader instead of this."
    :code="code"
  >
    <div style="margin: -16px">
      <HbNav :links="links" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'links', type: 'Array<{label, href, active?, cta?}>' },
      { prop: 'homeHref', type: 'string', default: `'/'`, notes: 'brand link target' },
      { prop: '#brand', type: 'slot', notes: 'replaces mark plus wordmark' },
      { prop: '#default / #drawer', type: 'slots', notes: 'custom link markup' },
    ]"
  />
</template>
