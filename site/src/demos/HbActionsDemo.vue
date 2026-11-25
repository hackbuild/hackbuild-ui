<script setup lang="ts">
import { HbActions, HbButton, useToast } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const { toast } = useToast()
const code = `<HbActions label="actions for wiring.sketch">
  <HbButton variant="go">open</HbButton>
  <HbButton variant="secondary">rename</HbButton>
  <HbButton variant="secondary">duplicate</HbButton>
  <HbButton variant="danger">delete</HbButton>
</HbActions>`
</script>

<template>
  <DemoSection
    title="Button row"
    note="Verbs for a picked row, a form or a card. Wraps on a phone, 44 px tall on a touch screen. A toolbar holds global settings on sunk paper; this holds the verbs of one thing. Class .hb-acts, with is-end and is-fill."
    :code="code"
  >
    <HbActions label="actions for wiring.sketch">
      <HbButton variant="go" @click="toast('opened wiring.sketch', { kind: 'ok' })">open</HbButton>
      <HbButton variant="secondary">rename</HbButton>
      <HbButton variant="secondary">duplicate</HbButton>
      <HbButton variant="danger">delete</HbButton>
    </HbActions>
  </DemoSection>

  <DemoSection title="Right aligned and filled" note="is-end for a dialog foot, is-fill when two choices share the width.">
    <HbActions end label="dialog actions">
      <HbButton variant="secondary">cancel</HbButton>
      <HbButton variant="go">save</HbButton>
    </HbActions>
    <div style="height: 16px" />
    <HbActions fill label="choose one">
      <HbButton variant="secondary">keep</HbButton>
      <HbButton variant="danger">discard</HbButton>
    </HbActions>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'end', type: 'boolean', default: 'false', notes: 'push the row right' },
      { prop: 'fill', type: 'boolean', default: 'false', notes: 'buttons share the width' },
      { prop: 'label', type: 'string', notes: 'names the group' },
    ]"
  />
</template>
