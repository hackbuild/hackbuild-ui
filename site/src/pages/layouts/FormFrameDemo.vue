<script setup lang="ts">
// form and frame, after grommet: the form column at the left, the frame
// fills. generate is the one pink action; a sample works with no model.
import { ref } from 'vue'
import { HbButton, HbField, HbFormFrame, HbKv, HbPanel, HbTextarea } from '@hackbuild/ui'
import DemoBar from './DemoBar.vue'
import { useFakeLoad } from './useFakeLoad'
import { imageRows } from '../../fixtures/picker'

const { rows, load } = useFakeLoad(imageRows)
const chosen = ref('paint-t')
const tabs = [{ id: 'make', label: 'make' }, { id: 'history', label: 'history' }, { id: 'more', label: 'more' }]
const prompt = ref('a red bicycle against a paper wall')
const made = ref(false)
</script>

<template>
  <HbFormFrame :tabs="tabs" rack-label="make an image">
    <template #bar><DemoBar v-model="chosen" title="make an image" :rows="rows" @load="load" /></template>
    <div v-if="!made" class="hb-lay-empty" style="color:var(--hb-paper)">
      <span class="hb-lay-empty-name">your picture shows here</span>
      <p class="hb-lay-empty-note" style="color:var(--hb-lit-label)">write what you want and press generate.</p>
      <div class="hb-lay-empty-acts"><HbButton @click="made = true">show a sample</HbButton></div>
    </div>
    <svg v-else viewBox="0 0 512 512" style="height:min(100%, 90vw);max-width:100%" role="img" aria-label="sample: a red bicycle on a paper wall">
      <rect width="512" height="512" fill="#f5f0e6" /><g stroke="#c3251f" stroke-width="10" fill="none"><circle cx="160" cy="330" r="70" /><circle cx="360" cy="330" r="70" /><path d="M160 330 L230 220 L320 220 L360 330 M230 220 L260 330 L320 220" /></g>
    </svg>
    <template #tab-make>
      <HbField label="what to make" for="ff-prompt"><HbTextarea id="ff-prompt" v-model="prompt" :rows="4" /></HbField>
      <HbButton variant="go" block @click="made = true">generate</HbButton>
    </template>
    <template #tab-history><HbPanel heading="history" head="instrument"><p class="hb-lay-empty-note">nothing made yet.</p></HbPanel></template>
    <template #tab-more><HbPanel heading="more" head="instrument"><HbKv label="size" value="512 x 512" /><HbKv label="steps" value="1" /></HbPanel></template>
    <template #detail><p class="hb-fixture">fixture: the sample is a drawing; no model loads here.</p></template>
  </HbFormFrame>
</template>
