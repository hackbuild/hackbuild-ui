<script setup lang="ts">
import { ref } from 'vue'
import { HbDropzone, HbStage, type DropRoute } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const got = ref('nothing yet')
const routed = ref('nothing yet')
const routes: DropRoute[] = [
  { name: 'image', accept: 'image/*', on: (fs) => { routed.value = `image: ${fs.map((f) => f.name).join(', ')}` } },
  { name: 'model', accept: '.glb,.vrm', on: (fs) => { routed.value = `model: ${fs.map((f) => f.name).join(', ')}` } },
]

const code = `<HbDropzone accept=".glb,.vrm" hint="or drop a .glb or .vrm here"
  @files="load" @rejected="warn" />

<HbStage>
  <HbDropzone cover paste :routes="[
    { name: 'image', accept: 'image/*', on: setImage },
    { name: 'model', accept: '.glb,.vrm', on: loadModel },
  ]" hint="drop an image or a model" />
</HbStage>`
</script>

<template>
  <DemoSection
    title="Drop zone"
    note="Drop a file, pick one, or press anywhere in the zone to open the picker. A dropped folder is walked. A file that does not pass accept is refused by name, with the types the zone takes."
    :code="code"
  >
    <HbDropzone accept=".glb,.vrm" hint="or drop a .glb or .vrm here" multiple @files="got = $event.map((f) => f.name).join(', ')" />
    <p style="margin: 8px 0 0">
      took: <span class="hb-readout" style="font-size: 16px">{{ got }}</span>
    </p>
  </DemoSection>

  <DemoSection
    title="Cover, routed by type"
    note="A cover zone hides until a file hovers the stage, then says where the file will go, or that nothing takes it. Routes hand each type to its own handler; paste takes pasted images too."
  >
    <HbStage style="min-height: 160px">
      <HbDropzone cover paste :routes="routes" hint="drop an image or a model" />
    </HbStage>
    <p style="margin: 8px 0 0">
      routed: <span class="hb-readout" style="font-size: 16px">{{ routed }}</span>
    </p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'hint', type: 'string' },
      { prop: 'accept', type: 'string', notes: 'checked on drop, paste and pick' },
      { prop: 'multiple', type: 'boolean', default: 'false' },
      { prop: 'cover', type: 'boolean', default: 'false', notes: 'hidden until a file hovers the parent' },
      { prop: 'window', type: 'boolean', default: 'false', notes: 'listen on the window' },
      { prop: 'routes', type: 'DropRoute[]', notes: 'route by type instead of one files emit' },
      { prop: 'folders', type: 'boolean', default: 'true', notes: 'walk dropped folders' },
      { prop: 'paste', type: 'boolean', default: 'false' },
      { prop: 'error', type: 'string', notes: 'or the error slot' },
      { prop: '@files', type: 'emit', notes: 'File[]' },
      { prop: '@rejected', type: 'emit', notes: 'File[] nothing took' },
    ]"
  />
</template>
