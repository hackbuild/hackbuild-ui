<script setup lang="ts">
import { ref } from 'vue'
import { HbConsole, HbContextMenu, type HbConsoleLine, type HbContextItem, type HbContextRequest } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { thingItems } from '../fixtures/agent'

const title = ref('')
const items = ref<HbContextItem[]>([])
const log = ref<HbConsoleLine[]>([])
const things = [
  { id: 'mug', x: 62, y: 38 },
  { id: 'shelf', x: 58, y: 18 },
  { id: 'chair', x: 14, y: 52 },
  { id: 'red block', x: 34, y: 70 },
]

function onRequest(req: HbContextRequest) {
  const el = req.target.closest<HTMLElement>('[data-thing]')
  const thing = el?.dataset.thing ?? 'floor'
  title.value = thing
  items.value = thingItems(thing, 'red block')
}
function onPick(_item: HbContextItem, say: string) {
  log.value = [...log.value, { text: say, t: 'you' }]
}
const code = `<HbContextMenu :title="thing" :items="items" @request="fill" @pick="(item, say) => send(say)">
  <canvas />
</HbContextMenu>`
</script>

<template>
  <DemoSection title="Context menu" note="Right click a thing, hold it on a touch screen, or focus it and press the menu key or shift+f10. The menu is filled in request from what was pressed, stays inside the stage, and most entries send the sentence a user would type, so the log teaches the language. Escape or a pick hands focus back." :code="code">
    <div class="demo-col">
      <HbContextMenu :title="title" :items="items" @request="onRequest" @pick="onPick">
        <div class="hb-stage" style="height: 300px; padding: 0">
          <button
            v-for="t in things"
            :key="t.id"
            type="button"
            class="hb-chip"
            :data-thing="t.id"
            :style="{ position: 'absolute', left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }"
          >{{ t.id }}</button>
        </div>
      </HbContextMenu>
      <HbConsole :lines="log" height="120px" empty="picked sentences land here" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'title', type: 'string', notes: 'the thing pressed, on the ink bar' },
      { prop: 'items', type: 'HbContextItem[] { label, say?, disabled? }' },
      { prop: 'v-model:open', type: 'boolean' },
      { prop: 'v-model:at', type: '{ x, y }', notes: 'relative to the area' },
      { prop: 'longPress', type: 'number', default: '500', notes: 'ms' },
      { prop: '@request', type: '{ at, via, target }', notes: 'fill items here; none keeps it shut' },
      { prop: '@pick', type: '(item, say)', notes: 'say falls back to the label' },
    ]"
  />
</template>
