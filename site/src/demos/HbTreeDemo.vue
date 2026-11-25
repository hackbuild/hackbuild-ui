<script setup lang="ts">
import { ref } from 'vue'
import { HbTree, type HbTreeNode } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const leg = (side: string): HbTreeNode => ({
  id: `${side}upleg`, label: `${side}UpLeg`, sub: 'bone', children: [
    { id: `${side}leg`, label: `${side}Leg`, sub: 'bone', children: [
      { id: `${side}foot`, label: `${side}Foot`, sub: 'bone', children: [{ id: `${side}toe`, label: `${side}ToeBase`, sub: 'bone' }] },
    ] },
  ],
})
const arm = (side: string): HbTreeNode => ({
  id: `${side}shoulder`, label: `${side}Shoulder`, sub: 'bone', children: [
    { id: `${side}arm`, label: `${side}Arm`, sub: 'bone', children: [
      { id: `${side}forearm`, label: `${side}ForeArm`, sub: 'bone', children: [{ id: `${side}hand`, label: `${side}Hand`, sub: '15 children' }] },
    ] },
  ],
})
const rig: HbTreeNode[] = [
  { id: 'armature', label: 'Armature', sub: 'object', children: [
    { id: 'hips', label: 'Hips', sub: 'root bone', children: [
      { id: 'spine', label: 'Spine', sub: 'bone', children: [
        { id: 'spine1', label: 'Spine1', sub: 'bone', children: [
          { id: 'neck', label: 'Neck', sub: 'bone', children: [{ id: 'head', label: 'Head', sub: '52 morphs' }] },
          arm('Left'), arm('Right'),
        ] },
      ] },
      leg('Left'), leg('Right'),
    ] },
    { id: 'body', label: 'Body', sub: 'skinned mesh' },
  ] },
]
const picked = ref('head')
const open = ref(['armature', 'hips', 'spine', 'spine1', 'neck', 'Leftshoulder', 'Leftarm'])

const code = `<HbTree v-model="bone" v-model:expanded="open" :nodes="rig" label="rig" max-height="280px" />`
</script>

<template>
  <DemoSection
    title="Rig tree"
    note="The avatar inspector's bones. Up and down move through open rows, right opens or steps in, left closes or steps out, home and end jump, enter picks. The twist opens without picking. Past the cap the tree scrolls inside itself."
    :code="code"
  >
    <p class="hb-fixture is-strip"><b>fixture</b> sample rig: the names follow a common humanoid layout; no file loads.</p>
    <div style="max-width: 420px">
      <HbTree v-model="picked" v-model:expanded="open" :nodes="rig" label="rig" max-height="280px" />
      <p class="hb-hint">picked: {{ picked || 'none' }}</p>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'nodes', type: '{id, label, sub, children}[]' },
      { prop: 'v-model', type: 'string', notes: 'the picked id' },
      { prop: 'v-model:expanded', type: 'string[]', notes: 'open branch ids' },
      { prop: 'label', type: 'string', default: `'tree'`, notes: 'accessible name' },
      { prop: 'maxHeight', type: 'string', notes: 'sets --hb-tree-h, default 320px' },
    ]"
  />
</template>
