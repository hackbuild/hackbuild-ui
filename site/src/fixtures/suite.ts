// Fixtures for the suite shell demos: the 7 groups and 22 tools of the
// suite design, and the six subsystems the header reports on.
import type { HbStatusItem, HbSuiteGroup } from '@hackbuild/ui'

export const suiteGroups: HbSuiteGroup[] = [
  { key: 'chat', label: 'chat', tools: [{ key: 'chat', label: 'chat' }, { key: 'memory', label: 'memory' }] },
  { key: 'voice', label: 'voice', tools: [{ key: 'transcription', label: 'transcription' }, { key: 'speech', label: 'speech' }] },
  {
    key: 'image',
    label: 'image',
    tools: [
      { key: 'vision', label: 'vision', needs: ['camera'] },
      { key: 'segmentation', label: 'segmentation' },
      { key: 'depth', label: 'depth and relief' },
      { key: 'imagegen', label: 'image generation', needs: ['webgpu'] },
    ],
  },
  { key: 'character', label: 'character', tools: [{ key: 'character', label: 'character and agent' }] },
  { key: 'rooms', label: 'rooms', tools: [{ key: 'room', label: 'room', needs: ['webgl'] }] },
  {
    key: 'motion',
    label: 'motion',
    tools: ['avatar', 'retarget', 'ik', 'gait', 'lipsync', 'motion-match', 'motion-net'].map((k) => ({ key: k, label: k })),
  },
  {
    key: 'agents',
    label: 'agents',
    tools: ['senses', 'drives', 'cameras', 'mover', 'scenario'].map((k) => ({ key: k, label: k })),
  },
]

export const suiteStatus: HbStatusItem[] = [
  { key: 'brain', label: 'brain', state: 'ok', title: 'qwen 2.5 0.5b on webgpu', goto: 'models' },
  { key: 'voice', label: 'voice', state: 'load', title: 'kokoro loading, 41 percent' },
  { key: 'ears', label: 'ears', state: 'off', title: 'whisper not loaded' },
  { key: 'eyes', label: 'eyes', state: 'warn', title: 'no webgpu, running on wasm' },
  { key: 'memory', label: 'memory', state: 'ok', title: '212 items stored here' },
  { key: 'gpu', label: 'gpu', state: 'err', title: 'adapter lost, falling back to wasm' },
]
