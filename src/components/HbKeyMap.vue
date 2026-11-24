<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import type { HotkeyRegistry, KeyMapGroup } from '../vanilla/hotkeys'
import { sharedHotkeys } from '../composables/useHotkeys'

interface Props {
  /** Groups to print. Default: the registry's list, kept current. */
  groups?: KeyMapGroup[]
  /** Default: the shared registry every useHotkeys call fills. */
  registry?: HotkeyRegistry
  /** Only these scopes (and global). Default: every key. */
  scopes?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  groups: undefined,
  registry: undefined,
  scopes: undefined,
})

const reg = props.groups ? null : props.registry ?? sharedHotkeys()
const live = shallowRef<KeyMapGroup[]>(reg?.list() ?? [])
const off = reg?.subscribe(() => { live.value = reg.list() })
onBeforeUnmount(() => off?.())

const shown = computed(() => {
  const all = props.groups ?? live.value
  if (!props.scopes) return all
  const keep = new Set(['global', ...props.scopes])
  return all.map((g) => ({ ...g, items: g.items.filter((i) => keep.has(i.scope)) })).filter((g) => g.items.length)
})
</script>

<template>
  <!-- The keys printed from the same table that binds them. -->
  <div class="hb-keymap">
    <section v-for="g in shown" :key="g.group" class="hb-keymap-group">
      <h3 class="hb-keymap-head">{{ g.group }}</h3>
      <dl>
        <template v-for="(it, i) in g.items" :key="i">
          <dt>
            <template v-for="(combo, c) in it.keys" :key="c">
              <span v-if="c" class="hb-keymap-or">or</span>
              <template v-for="(k, j) in combo" :key="j"><span v-if="j" class="hb-keymap-plus">+</span><kbd class="hb-kbd">{{ k }}</kbd></template>
            </template>
          </dt>
          <dd>{{ it.label }}</dd>
        </template>
      </dl>
    </section>
    <p v-if="!shown.length" class="hb-keymap-empty">no keys bound here.</p>
  </div>
</template>
