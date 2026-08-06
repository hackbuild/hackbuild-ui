<script setup lang="ts">
import { ref } from 'vue'
import { HbPagination } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const page = ref(3)

const code = `<HbPagination v-model="page" :pages="12" />`
</script>

<template>
  <DemoSection
    title="Pagination"
    note="Chips in a row, the current page filled pink, gaps collapse to dots."
    :code="code"
  >
    <HbPagination v-model="page" :pages="12" />
    <p style="margin: 12px 0 0">
      page: <span class="hb-readout" style="font-size: 16px">{{ page }}</span>
    </p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'number', notes: 'current page, from 1' },
      { prop: 'pages', type: 'number', notes: 'required, total' },
      { prop: 'window', type: 'number', default: '1', notes: 'pages shown around the current' },
    ]"
  />
</template>
