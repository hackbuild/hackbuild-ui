// A fake load for the demos: progress in steps, then loaded. No weights.
import { ref, type Ref } from 'vue'
import type { ModelRow } from '@hackbuild/ui'

export function useFakeLoad(start: ModelRow[]): { rows: Ref<ModelRow[]>; load: (ids: string[]) => void } {
  const rows = ref<ModelRow[]>(start.map((r) => ({ ...r })))
  function set(id: string, patch: Partial<ModelRow>) {
    rows.value = rows.value.map((r) => (r.id === id ? { ...r, ...patch } : r))
  }
  function load(ids: string[]) {
    for (const id of ids) {
      let p = 0
      set(id, { state: 'loading', progress: 0 })
      const t = setInterval(() => {
        p += 0.25
        if (p >= 1) { clearInterval(t); set(id, { state: 'loaded', progress: 1 }) } else set(id, { progress: p })
      }, 250)
    }
  }
  return { rows, load }
}
