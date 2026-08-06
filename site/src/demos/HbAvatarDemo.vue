<script setup lang="ts">
import { HbAvatar } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const seeds = ['virgilvox', 'jonahkaye', 'sarahbuilds', 'bengineer', 'alice', 'bob', 'carol', 'dave']

const code = `<HbAvatar seed="virgilvox" />                    <!-- the little person -->
<HbAvatar seed="virgilvox" variant="critter" />  <!-- offline pixel robot -->
<HbAvatar initials="mz" />
<HbAvatar size="lg" src="/portrait.jpg" alt="workshop portrait" />`
</script>

<template>
  <DemoSection
    title="Little people"
    note="Pass a seed, usually the username, and the avatar draws the same DiceBear avataaars person hack-build seeds its users with, on a plate color picked from the same seed. Same seed, same face, same color, forever."
    :code="code"
  >
    <div class="demo-row" style="gap: 14px">
      <div v-for="seed in seeds" :key="seed" style="display: flex; flex-direction: column; align-items: center; gap: 4px">
        <HbAvatar size="lg" :seed="seed" />
        <span style="font-family: var(--hb-utility); font-size: 9.5px; color: var(--hb-ink-3)">{{ seed }}</span>
      </div>
    </div>
  </DemoSection>

  <DemoSection
    title="Critters"
    note="The offline variant: a local pixel robot from the same seed, no third party, no network. Also the automatic fallback when the person generator cannot be reached."
  >
    <div class="demo-row" style="gap: 14px">
      <div v-for="seed in seeds" :key="seed" style="display: flex; flex-direction: column; align-items: center; gap: 4px">
        <HbAvatar size="lg" :seed="seed" variant="critter" />
        <span style="font-family: var(--hb-utility); font-size: 9.5px; color: var(--hb-ink-3)">{{ seed }}</span>
      </div>
    </div>
  </DemoSection>

  <DemoSection title="Fallback order" note="Image, then the little person, then the critter, then marker initials on a seeded plate. A square with an ink border; this system does not crop people into circles.">
    <div class="demo-row" style="align-items: flex-end; gap: 18px">
      <HbAvatar size="sm" seed="virgilvox" />
      <HbAvatar seed="virgilvox" />
      <HbAvatar size="lg" seed="virgilvox" />
      <HbAvatar size="lg" initials="mz" />
      <HbAvatar size="lg" initials="jk" plate="purple" />
      <HbAvatar size="lg" src="/favicon.svg" alt="the mark as a stand in" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'src', type: 'string' },
      { prop: 'alt', type: 'string' },
      { prop: 'seed', type: 'string', notes: 'generates the face and picks the plate' },
      { prop: 'variant', type: `'person' | 'critter'`, default: `'person'`, notes: 'dicebear avataaars, or the offline pixel robot' },
      { prop: 'initials', type: 'string', notes: 'two characters at most' },
      { prop: 'plate', type: 'PlateName', notes: 'explicit plate color' },
      { prop: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'` },
    ]"
  />
</template>
