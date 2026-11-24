import type { HbSettingsSection, SettingDef, SettingPreset } from '@hackbuild/ui'

export const sections: HbSettingsSection[] = [
  { key: 'suite', label: 'suite', note: 'applies to every tool' },
  { key: 'brain', label: 'brain', note: 'sampling for the chat model' },
  { key: 'voice', label: 'voice' },
]

export const schema: SettingDef[] = [
  { key: 'hints', section: 'suite', type: 'switch', label: 'key hints', why: 'print the key beside each action. off hides them; the keys still work.', default: true },
  { key: 'motion', section: 'suite', type: 'seg', label: 'motion', why: 'reduced stops the stage camera drifting and the bars sliding.', default: 'system', options: ['system', 'full', 'reduced'] },
  { key: 'temp', section: 'brain', type: 'range', label: 'temperature', why: 'lower answers the same way each time. for code, try 0.2 to 0.4.', default: 0.7, min: 0, max: 1.5, step: 0.05 },
  { key: 'topP', section: 'brain', type: 'range', label: 'top p', why: 'nucleus cutoff. 0.9 is a safe default.', default: 0.9, min: 0.1, max: 1, step: 0.05, level: 'standard' },
  { key: 'repeat', section: 'brain', type: 'range', label: 'repeat penalty', why: '1.05 to 1.10 stops loops. higher garbles the reply.', default: 1, min: 1, max: 1.5, step: 0.01, level: 'expert' },
  { key: 'context', section: 'brain', type: 'select', label: 'context', why: 'tokens the model keeps in view. more costs memory on the gpu.', default: '4096', options: ['2048', '4096', '8192'], applies: 'next load', level: 'standard' },
  { key: 'json', section: 'brain', type: 'switch', label: 'force json', why: 'constrains the reply to valid json for tool calls. slower on small models.', default: false, tag: 'experimental', level: 'expert' },
  { key: 'rate', section: 'voice', type: 'range', label: 'rate', why: 'speech speed. 1 is the voice as recorded.', default: 1, min: 0.5, max: 2, step: 0.1, unit: 'x' },
  { key: 'kokoro', section: 'voice', type: 'switch', label: 'kokoro', why: 'a neural voice, downloaded once and stored. off uses the browser voice.', default: false, tag: 'recommended', applies: 'next reply' },
]

export const presets: SettingPreset[] = [
  { label: 'precise', values: { temp: 0.2, topP: 0.8, repeat: 1 }, hint: 'the same answer each time. for code and facts.' },
  { label: 'balanced', values: { temp: 0.7, topP: 0.9, repeat: 1 }, hint: 'the default. steady, with some variety.' },
  { label: 'creative', values: { temp: 1.1, topP: 0.95, repeat: 1.05 }, hint: 'more variety. for stories and names.' },
]
