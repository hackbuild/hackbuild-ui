<script setup lang="ts">
import { ref } from 'vue'
import { HbList, HbRow } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'

const active = ref(0)

const bookmarks = [
  { name: 'NOAA 1', freq: '162.550' },
  { name: 'ATC tower', freq: '124.400' },
  { name: '2m calling', freq: '146.520' },
]

const code = `<HbList>
  <HbRow v-for="(b, i) in bookmarks" :key="b.name"
    :active="i === active" @click="active = i">
    {{ b.name }}
    <span class="hb-spacer" />
    <span class="hb-readout">{{ b.freq }}</span>
  </HbRow>
</HbList>`
</script>

<template>
  <DemoSection
    title="List of rows"
    note="Bookmarks, device lists, capture sessions. The active row fills pink and its readout flips to paper."
    :code="code"
  >
    <HbList style="max-width: 380px">
      <HbRow
        v-for="(bookmark, index) in bookmarks"
        :key="bookmark.name"
        :active="index === active"
        @click="active = index"
      >
        {{ bookmark.name }}
        <span class="hb-spacer" />
        <span class="hb-readout" style="font-size: 15px">{{ bookmark.freq }}</span>
      </HbRow>
    </HbList>
  </DemoSection>
</template>
