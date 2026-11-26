<script setup lang="ts">
// form and frame, after grommet: the form column at the left, the frame
// fills. generate is the one pink action; a sample works with no model.
import { ref } from 'vue'
import { HbBarPage, HbButton, HbField, HbFormFrame, HbKv, HbPanel, HbTextarea } from '@hackbuild/ui'
import DemoBar from './DemoBar.vue'
import { useFakeLoad } from './useFakeLoad'
import { imageRows } from '../../fixtures/picker'

const { rows, load } = useFakeLoad(imageRows)
const chosen = ref('paint-t')
const tabs = [{ id: 'make', label: 'make' }, { id: 'history', label: 'history' }, { id: 'more', label: 'more' }]
const prompt = ref('a red bicycle against a paper wall')
const made = ref(false)
// a 16 by 9 drawing stands in for a made picture; the frame contains it at any width
const sample = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#f5f0e6"/><g stroke="#c3251f" stroke-width="18" fill="none"><circle cx="560" cy="580" r="170"/><circle cx="1040" cy="580" r="170"/><path d="M560 580 L730 330 L950 330 L1040 580 M730 330 L800 580 L950 330"/></g></svg>')
</script>

<template>
  <HbBarPage>
    <template #bar>
      <DemoBar v-model="chosen" title="make an image" :rows="rows" @load="load" />
    </template>
    <HbFormFrame :tabs="tabs" rack-label="make an image">
      <div v-if="!made" class="hb-lay-empty" style="color:var(--hb-paper)">
        <span class="hb-lay-empty-name">your picture shows here</span>
        <p class="hb-lay-empty-note" style="color:var(--hb-lit-label)">write what you want and press generate.</p>
        <div class="hb-lay-empty-acts"><HbButton @click="made = true">show a sample</HbButton></div>
      </div>
      <img v-else :src="sample" width="1600" height="900" alt="sample: a red bicycle on a paper wall" />
      <template #tab-make>
        <HbField label="what to make" for="ff-prompt"><HbTextarea id="ff-prompt" v-model="prompt" :rows="4" /></HbField>
        <HbButton variant="go" block @click="made = true">generate</HbButton>
      </template>
      <template #tab-history><HbPanel heading="history" head="instrument"><p class="hb-lay-empty-note">nothing made yet.</p></HbPanel></template>
      <template #tab-more><HbPanel heading="more" head="instrument"><HbKv label="size" value="512 x 512" /><HbKv label="steps" value="1" /></HbPanel></template>
      <template #detail><p class="hb-fixture">fixture: the sample is a drawing; no model loads here.</p></template>
    </HbFormFrame>
  </HbBarPage>
</template>
