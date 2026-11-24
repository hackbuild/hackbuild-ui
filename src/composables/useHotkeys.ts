import { shallowRef, type ShallowRef } from 'vue'
import { hotkeys, type Hotkey, type HotkeyRegistry, type KeyMapGroup } from '../vanilla/hotkeys'
import { onEnd } from './scope'

let shared: HotkeyRegistry | null = null

/** The registry every `useHotkeys` call shares unless given another, so
    one key map lists the shell and the tool together. */
export function sharedHotkeys(): HotkeyRegistry {
  shared ??= hotkeys()
  return shared
}

export interface UseHotkeys {
  registry: HotkeyRegistry
  /** The key map, kept current. */
  map: Readonly<ShallowRef<KeyMapGroup[]>>
  /** Make a scope current until the caller ends or the returned function runs. */
  scope: (name: string) => () => void
}

/**
 * Add keys to the shared registry (or `registry`) for the life of the
 * calling component. Typing in fields is ignored unless a key says
 * `inFields`. Over `hotkeys` from the vanilla entry.
 */
export function useHotkeys(table: Hotkey[] = [], options: { registry?: HotkeyRegistry } = {}): UseHotkeys {
  const registry = options.registry ?? sharedHotkeys()
  const map = shallowRef<KeyMapGroup[]>([])
  const remove = registry.add(table)
  map.value = registry.list()
  const off = registry.subscribe(() => { map.value = registry.list() })
  const ends: (() => void)[] = []
  onEnd(() => {
    remove()
    off()
    for (const e of ends) e()
  })
  return {
    registry,
    map,
    scope(name) {
      const end = registry.pushScope(name)
      ends.push(end)
      return end
    },
  }
}
