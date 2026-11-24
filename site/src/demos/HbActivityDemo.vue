<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { HbActivity, HbButton, HbHeader } from '@hackbuild/ui'
import { activity } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

// A fixture store: two tasks start, one known and one unknown.
const store = activity()
let timer: ReturnType<typeof setInterval> | null = null
function start() {
  let f = 0.12
  store.set('weights', 'loading sample model', f, () => stop())
  store.set('index', 'indexing memory', null)
  timer ??= setInterval(() => {
    f = f >= 1 ? 0.12 : f + 0.08
    store.set('weights', 'loading sample model', Math.min(1, f))
  }, 700)
}
function stop() {
  if (timer) clearInterval(timer)
  timer = null
  store.end('weights')
}
function fail() {
  store.fail('weights', 'out of memory')
}
start()
onBeforeUnmount(() => { stop(); store.dispose() })

const code = `const store = activity()
store.set('weights', 'loading sample model', 0.4, cancel)

<HbHeader title="suite"><HbActivity :source="store" /></HbHeader>`
</script>

<template>
  <DemoSection
    title="The activity line"
    note="The oldest task with its percent and a count of the rest; a 2 px line on the header edge fills for a known fraction and slides for an unknown one. A press lists the tasks, with cancel where the task has one. Under 641 px only the spinner and percent show."
    :code="code"
  >
    <div style="margin: -16px">
      <HbHeader title="suite" accent=".">
        <span style="margin-left: auto" />
        <HbActivity :source="store" />
      </HbHeader>
    </div>
    <div class="demo-row" style="margin-top: 24px">
      <HbButton size="sm" variant="secondary" @click="start">start</HbButton>
      <HbButton size="sm" variant="secondary" @click="fail">fail</HbButton>
      <HbButton size="sm" variant="secondary" @click="store.end('index')">end index</HbButton>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'source', type: 'Activity', notes: 'an activity() store from the vanilla entry' },
      { prop: 'tasks', type: 'ActivityTask[]', notes: 'or pass the tasks, oldest first' },
      { prop: 'cancel', type: 'emit', notes: '(key); with a source the store cancels too' },
      { prop: 'default', type: 'slot', notes: 'the task list: { tasks }' },
    ]"
  />
</template>
