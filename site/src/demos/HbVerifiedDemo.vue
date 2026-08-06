<script setup lang="ts">
import { HbAvatar, HbVerified } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'

const code = `<span>Moheeb Zara <HbVerified /></span>`
</script>

<template>
  <DemoSection
    title="Verified badge"
    note="A small pink check next to a display name. Small enough that the pink reads as a mark, not a fill."
    :code="code"
  >
    <div style="display: flex; align-items: center; gap: 10px">
      <HbAvatar seed="virgilvox" />
      <div>
        <div style="font-family: var(--hb-utility); font-size: 13px; font-weight: 600">
          Moheeb Zara <HbVerified />
        </div>
        <div class="hb-label">@virgilvox · 2h ago</div>
      </div>
    </div>
  </DemoSection>
</template>
