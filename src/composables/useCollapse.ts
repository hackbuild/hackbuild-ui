import { nextTick, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * The strip measure shared by HbSteps and HbTabs: `collapsed` turns true
 * when the strip or one of its buttons would clip, and false again once
 * the host is wider than it was when it collapsed. `host` wraps the strip
 * and stays in the page while the strip is swapped for a select.
 */
export function useCollapse(
  host: Ref<HTMLElement | null>,
  strip: Ref<HTMLElement | null>,
  buttons: Ref<HTMLElement[]>,
  enabled: () => boolean = () => true,
) {
  /** Width the strip needed when it collapsed; it expands again past it. */
  const needed = ref(0)
  const collapsed = ref(false)
  let observer: ResizeObserver | undefined

  function overflowing(): boolean {
    const el = strip.value
    if (!el) return false
    if (el.scrollWidth > el.clientWidth + 1) return true
    return buttons.value.some((b) => b.scrollWidth > b.clientWidth + 1)
  }

  async function measure() {
    if (!host.value) return
    if (!enabled()) { collapsed.value = false; return }
    const width = host.value.clientWidth
    if (collapsed.value) {
      if (width > needed.value) {
        collapsed.value = false
        await nextTick()
        if (overflowing()) collapsed.value = true
      }
      return
    }
    if (overflowing()) {
      needed.value = width
      collapsed.value = true
    }
  }

  onMounted(() => {
    measure()
    if (typeof ResizeObserver !== 'undefined' && host.value) {
      observer = new ResizeObserver(() => { measure() })
      observer.observe(host.value)
    }
  })
  onBeforeUnmount(() => observer?.disconnect())

  return { collapsed, measure }
}
