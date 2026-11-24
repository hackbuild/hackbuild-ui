<script setup lang="ts">
import { HbKeyMap } from '@hackbuild/ui'
import { hotkeys } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

// A registry of its own, so the demo prints the suite table of design 2.7
// without binding those keys on this page.
const reg = hotkeys([], { target: new EventTarget() })
const noop = () => {}
reg.add([
  { keys: ['/', 'ctrl+k'], label: 'commands', group: 'shell', run: noop },
  { keys: ['alt+1'], label: 'first group, to alt+7', group: 'shell', run: noop },
  { keys: ['[', ']'], label: 'previous and next tool', group: 'shell', run: noop },
  { keys: 'm', label: 'model manager', group: 'shell', run: noop },
  { keys: ',', label: 'settings', group: 'shell', run: noop },
  { keys: 'shift+?', label: 'this key map', group: 'shell', run: noop },
  { keys: 'ctrl+s', label: 'save now', group: 'workspace', run: noop },
  { keys: 'ctrl+o', label: 'open or import', group: 'workspace', run: noop },
  { keys: 'ctrl+shift+e', label: 'export panel', group: 'workspace', run: noop },
  { keys: 'ctrl+z', label: 'undo', group: 'workspace', run: noop },
  { keys: 'ctrl+shift+z', label: 'redo', group: 'workspace', run: noop },
  { keys: 'ctrl+enter', label: 'run the primary action', group: 'tool', run: noop },
  { keys: 'space', label: 'play or pause', group: 'tool', run: noop },
  { keys: 'esc', label: 'close the top overlay, else stop', group: 'tool', run: noop },
])

const code = `useHotkeys([{ keys: 'ctrl+s', label: 'save now', group: 'workspace', run: save }])

<HbKeyMap />  <!-- the shared registry, kept current -->`
</script>

<template>
  <DemoSection
    title="The key map"
    note="Printed from the same table that binds the keys, so a hint never drifts from the binding. ctrl prints as cmd on a Mac. Pass scopes to show one tool's keys with the shell's."
    :code="code"
  >
    <HbKeyMap :registry="reg" />
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'registry', type: 'HotkeyRegistry', notes: 'default: the shared one useHotkeys fills' },
      { prop: 'groups', type: 'KeyMapGroup[]', notes: 'print these instead' },
      { prop: 'scopes', type: 'string[]', notes: 'only these scopes and global' },
    ]"
  />
</template>
