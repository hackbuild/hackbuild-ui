<script setup lang="ts">
import { ref } from 'vue'
import { HbButton, HbField, HbInput, HbModal } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const open = ref(false)

const code = `<HbModal v-model="open" title="Save session">
  <HbField label="session name" for="name">
    <HbInput id="name" />
  </HbField>
  <template #footer>
    <HbButton variant="secondary" @click="open = false">cancel</HbButton>
    <HbButton @click="save">save</HbButton>
  </template>
</HbModal>`
</script>

<template>
  <DemoSection
    title="Modal"
    note="Centered panel over a scrim. Focus is trapped, escape closes, body scroll locks, and focus returns to the trigger on close. Escape acts on the newest overlay only: a modal over a drawer closes first, and a modal with closeOnEscape off holds the key so the drawer beneath stays open."
    :code="code"
  >
    <HbButton @click="open = true">open modal</HbButton>
    <HbModal v-model="open" title="Save session">
      <HbField label="session name" for="md-name">
        <HbInput id="md-name" placeholder="tuesday night scan" />
      </HbField>
      <template #footer>
        <HbButton variant="secondary" @click="open = false">cancel</HbButton>
        <HbButton @click="open = false">save</HbButton>
      </template>
    </HbModal>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'boolean' },
      { prop: 'title', type: 'string' },
      { prop: 'size', type: `'sm' | 'md' | 'lg'`, default: 'md', notes: '520, 640 or 880 px, a class' },
      { prop: 'width', type: 'number', notes: 'older px width, mapped to the nearest size' },
      { prop: 'closable', type: 'boolean', default: 'true' },
      { prop: 'closeOnBackdrop', type: 'boolean', default: 'true' },
      { prop: 'closeOnEscape', type: 'boolean', default: 'true' },
      { prop: '#footer', type: 'slot', notes: 'right aligned actions' },
      { prop: '@close', type: 'emit', notes: `'escape' | 'scrim' | 'button' | 'api'` },
    ]"
  />
</template>
