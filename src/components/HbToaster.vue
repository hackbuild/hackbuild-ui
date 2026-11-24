<script setup lang="ts">
import { useToast } from '../composables/useToast'
import type { ToastItem } from '../vanilla/toast'

const { state, dismiss } = useToast()

function act(t: ToastItem) {
  t.action?.run()
  dismiss(t.id)
}
</script>

<template>
  <Teleport to="body">
    <div class="hb-toasts">
      <div
        v-for="t in state.held"
        :key="t.id"
        class="hb-toast is-on is-held"
        :class="`is-${t.kind}`"
        role="alert"
      >
        <span class="hb-toast-msg">{{ t.message }}</span>
        <button v-if="t.action" type="button" class="hb-toast-act" @click="act(t)">{{ t.action.label }}</button>
        <button type="button" class="hb-toast-act" aria-label="dismiss" @click="dismiss(t.id)">ok</button>
      </div>
      <div
        class="hb-toast"
        :class="[{ 'is-on': state.visible }, state.current ? `is-${state.current.kind}` : '']"
        role="status"
        aria-live="polite"
      >
        <span class="hb-toast-msg">{{ state.message }}</span>
        <button v-if="state.current?.action" type="button" class="hb-toast-act" @click="act(state.current!)">{{ state.current.action.label }}</button>
      </div>
    </div>
  </Teleport>
</template>
