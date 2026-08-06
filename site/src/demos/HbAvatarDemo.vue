<script setup lang="ts">
import { HbAvatar } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const seeds = ['virgilvox', 'jonahkaye', 'sarahbuilds', 'bengineer', 'kerf', 'detent', 'burr', 'staff']

const code = `<HbAvatar seed="virgilvox" />          <!-- a little character, same every time -->
<HbAvatar initials="mz" />
<HbAvatar size="lg" src="/portrait.jpg" alt="workshop portrait" />`
</script>

<template>
  <DemoSection
    title="Critters"
    note="Pass a seed, usually the username, and the avatar draws a deterministic little character: same seed, same face, no server, no image. Monochrome ink so identity never competes with the accent."
    :code="code"
  >
    <div class="demo-row" style="gap: 14px">
      <div v-for="seed in seeds" :key="seed" style="display: flex; flex-direction: column; align-items: center; gap: 4px">
        <HbAvatar size="lg" :seed="seed" />
        <span style="font-family: var(--hb-utility); font-size: 9.5px; color: var(--hb-ink-3)">{{ seed }}</span>
      </div>
    </div>
  </DemoSection>

  <DemoSection title="Fallback order" note="Image first, then the critter when a seed is set, then initials. A square with an ink border; this system does not crop people into circles.">
    <div class="demo-row" style="align-items: flex-end; gap: 18px">
      <HbAvatar size="sm" seed="virgilvox" />
      <HbAvatar seed="virgilvox" />
      <HbAvatar size="lg" seed="virgilvox" />
      <HbAvatar size="lg" initials="mz" />
      <HbAvatar size="lg" src="/favicon.svg" alt="the mark as a stand in" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'src', type: 'string' },
      { prop: 'alt', type: 'string' },
      { prop: 'seed', type: 'string', notes: 'draws the deterministic critter' },
      { prop: 'initials', type: 'string', notes: 'two characters at most' },
      { prop: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'` },
    ]"
  />
</template>
