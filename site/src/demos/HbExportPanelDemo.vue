<script setup lang="ts">
import { ref } from 'vue'
import { HbExportPanel, HbToggleRow, useToast, type HbExportRequest } from '@hackbuild/ui'
import { exportName } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const { toast } = useToast()
const format = ref('srt')
const busy = ref(false)
const formats = [
  { key: 'txt', label: 'txt', ext: '.txt', note: 'the words, one line per segment', copy: true },
  { key: 'srt', label: 'srt', ext: '.srt', note: 'numbered cues with times, for video players', copy: true },
  { key: 'vtt', label: 'vtt', ext: '.vtt', note: 'web captions', copy: true },
  { key: 'json', label: 'json', ext: '.json', note: 'segments, words, model and language' },
  { key: 'zip', label: 'all, zip', ext: '.zip', note: 'four files per channel and a manifest.json with the measured levels' },
]
const name = exportName(['transcribe', 'whisper-base', 'en'], { at: new Date(2026, 10, 24, 1, 3, 44) })
function onExport(r: HbExportRequest) {
  toast(`would save ${r.filename}${r.includeLocal ? ' with local files' : ''}`)
}
const code = `<HbExportPanel
  v-model:format="format"
  :formats="formats"
  :name="exportName(['transcribe', model, lang])"
  :local-only="['interview.wav']"
  :readout="[{ label: 'segments', value: 48 }]"
  :checks="[{ tone: 'ok', text: 'every segment has a time' }]"
  @export="(r) => saveFile(r.filename, bytes(r.format))"
/>`
</script>

<template>
  <DemoSection
    title="Export panel"
    note="Format chips, the file name with its extension, export and copy, then a readout and checks tagged ok, warn and err. Local only files stay out unless ticked, and are named either way. Busy refuses with the reason."
    :code="code"
  >
    <div style="max-width: 420px">
      <HbExportPanel
        v-model:format="format"
        :formats="formats"
        :name="name"
        :local-only="['interview.wav', 'notes.m4a']"
        :readout="[{ label: 'segments', value: 48 }, { label: 'words', value: 612 }, { label: 'length', value: '4:12' }, { label: 'model', value: 'base (stub)' }]"
        :checks="[{ tone: 'ok', text: 'every segment has a time' }, { tone: 'warn', text: '3 segments dropped as silence, kept in json' }, { tone: 'err', text: 'channel 2 is empty' }]"
        :busy="busy ? 'a transcription is running. stop it or wait, then export.' : ''"
        @export="onExport"
        @copy="(k) => toast(`would copy ${k}`)"
      />
      <div style="margin-top: 12px"><HbToggleRow v-model="busy" label="a job is running" description="export refuses with the reason" /></div>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'formats', type: 'HbExportFormat[]', notes: '{key, label, ext, note, copy}' },
      { prop: 'v-model:format', type: 'string' },
      { prop: 'name', type: 'string', notes: 'without the extension; exportName() builds one that carries the run' },
      { prop: 'localOnly', type: 'string[]', notes: 'left out unless ticked' },
      { prop: 'readout', type: '{label, value}[]', notes: 'or slot #readout' },
      { prop: 'checks', type: '{tone, text}[]', notes: 'or slot #checks' },
      { prop: 'busy', type: 'string', notes: 'the reason export is refused' },
      { prop: '@export', type: '{format, filename, includeLocal}' },
      { prop: '@copy', type: 'format key' },
    ]"
  />
</template>
