<script setup lang="ts">
import { HbButton } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbButton>connect</HbButton>
<HbButton variant="secondary">export</HbButton>
<HbButton variant="danger">arm laser</HbButton>
<HbButton loading>saving</HbButton>
<HbButton as="a" href="/docs">read the docs</HbButton>`
</script>

<template>
  <DemoSection
    title="Variants"
    note="Ink fill by default, pink on hover, shadow collapses on press so the thing physically goes down. The danger pink fill is the armed state: one per view at most. Ghost is for inside stages."
    :code="code"
  >
    <div class="demo-row">
      <HbButton>primary</HbButton>
      <HbButton variant="secondary">secondary</HbButton>
      <HbButton variant="danger">arm laser</HbButton>
      <HbButton disabled>disabled</HbButton>
      <HbButton loading>saving</HbButton>
      <span style="background: var(--hb-void); padding: 12px; display: inline-flex">
        <HbButton variant="ghost">ghost on void</HbButton>
      </span>
    </div>
  </DemoSection>

  <DemoSection title="Sizes and block">
    <div class="demo-row">
      <HbButton size="sm">small</HbButton>
      <HbButton>medium</HbButton>
      <HbButton size="lg">large</HbButton>
    </div>
    <div style="margin-top: 12px; max-width: 320px">
      <HbButton block variant="secondary">block button</HbButton>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'variant', type: `'primary' | 'secondary' | 'danger' | 'ghost'`, default: `'primary'` },
      { prop: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'` },
      { prop: 'block', type: 'boolean', default: 'false', notes: 'full width' },
      { prop: 'disabled', type: 'boolean', default: 'false' },
      { prop: 'loading', type: 'boolean', default: 'false', notes: 'spinner replaces the icon slot' },
      { prop: 'type', type: `'button' | 'submit' | 'reset'`, default: `'button'` },
      { prop: 'as', type: 'string', default: `'button'`, notes: `'a' with href for links` },
    ]"
  />
</template>
