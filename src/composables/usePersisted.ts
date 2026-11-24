import { ref, watch, type Ref } from 'vue'
import { persisted, type PersistedOptions } from '../vanilla/persisted'
import { onEnd } from './scope'

/**
 * A ref kept in localStorage with a version key. Writes deep changes,
 * follows other tabs, falls back to the initial value on a bad or old
 * record. Over `persisted` from the vanilla entry.
 */
export function usePersisted<T>(key: string, initial: T, options: PersistedOptions<T> = {}): Ref<T> {
  const store = persisted(key, initial, options)
  const value = ref(store.get()) as Ref<T>
  let fromStore = false
  const off = store.subscribe((v) => {
    fromStore = true
    value.value = v
    fromStore = false
  })
  const stop = watch(
    value,
    (v) => {
      if (!fromStore) store.set(v)
    },
    { deep: true, flush: 'sync' },
  )
  onEnd(() => {
    stop()
    off()
    store.dispose()
  })
  return value
}
