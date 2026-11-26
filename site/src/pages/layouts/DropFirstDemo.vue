<script setup lang="ts">
// drop first, after scribe: the drop zone is the page until a file is in
// it; then the transcript is. Engine and capture live in the rack.
import { ref } from 'vue'
import { HbBarPage, HbButton, HbDropFirst, HbKv, HbModelSelect, HbPanel, HbTranscript } from '@hackbuild/ui'
import DemoBar from './DemoBar.vue'
import { useFakeLoad } from './useFakeLoad'
import { speechRows } from '../../fixtures/picker'
import { segments } from '../../fixtures/transcript'

const { rows, load } = useFakeLoad(speechRows)
const chosen = ref('ears-s')
const tabs = [{ id: 'text', label: 'transcript' }, { id: 'engine', label: 'engine' }, { id: 'capture', label: 'capture' }]
const empty = ref(true)
</script>

<template>
  <HbBarPage>
    <template #bar>
      <DemoBar v-model="chosen" title="transcribe" :rows="rows" @load="load" />
    </template>
    <HbDropFirst
      :tabs="tabs"
      rack-label="transcribe"
      :empty="empty"
      drop-title="drop audio or video"
      drop-note="any length. the words are worked out on this machine and the file never leaves it."
      accept="audio/*,video/*"
      @files="empty = false"
      @sample="empty = false"
    >
      <div style="height:100%;overflow:auto;padding:12px;background:var(--hb-paper)"><HbTranscript :segments="segments" label="transcript" /></div>
      <template #verbs><HbButton>export</HbButton><HbButton @click="empty = true">clear</HbButton></template>
      <template #tab-text>
        <HbPanel heading="transcript" head="instrument">
          <p v-if="empty" class="hb-lay-empty-note">nothing yet. drop a file or try the sample.</p>
          <HbKv v-else label="words" value="64" />
        </HbPanel>
      </template>
      <template #tab-engine><HbPanel heading="engine" head="instrument"><HbModelSelect v-model="chosen" :rows="rows" :go="false" title="pick the ears" /></HbPanel></template>
      <template #tab-capture><HbPanel heading="capture" head="instrument"><HbKv label="input" value="none" /></HbPanel></template>
      <template #detail><p class="hb-fixture">fixture: the sample transcript is made up; no model runs here.</p></template>
    </HbDropFirst>
  </HbBarPage>
</template>
