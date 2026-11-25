<script setup lang="ts">
import { ref } from 'vue'
import { HbAvatarCard } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const picked = ref('robot')
const code = `<HbAvatarCard name="robot" meta="cc0, 4.2 mb" :rig="{ ok: true, text: 'vrm 1.0, 54 bones' }" :selected="picked === 'robot'" @pick="picked = 'robot'" />`
</script>

<template>
  <DemoSection title="Avatar card" note="One avatar to pick: the thumbnail, the name, the licence and size line, and the rig check. A rig that misses bones says which, in red." :code="code">
    <div style="display: grid; gap: 12px; max-width: 360px">
      <HbAvatarCard name="robot" meta="cc0, 4.2 mb" :rig="{ ok: true, text: 'vrm 1.0, 54 bones' }" :selected="picked === 'robot'" @pick="picked = 'robot'" />
      <HbAvatarCard name="fox" meta="cc-by 4.0, 2.8 mb" :rig="{ ok: false, text: 'no left hand, no toes' }" :selected="picked === 'fox'" @pick="picked = 'fox'" />
    </div>
    <p class="hb-fixture"><b>fixture</b> names, sizes and rig lines are sample data.</p>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'name', type: 'string' },
      { prop: 'thumb', type: 'string', notes: 'image url; none shows the first letter' },
      { prop: 'meta', type: 'string', notes: 'licence and size' },
      { prop: 'rig', type: '{ ok, text }' },
      { prop: 'selected / @pick', type: 'boolean / event' },
    ]"
  />
</template>
