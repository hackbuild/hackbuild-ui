// The custom model form: four ways in (an onnx repo id, mlc weights plus
// a wasm library, a gguf repo plus file, an openai style endpoint), each
// field naming the way it fails beside it, and a check before any fetch.

export type CustomMode = 'onnx' | 'mlc' | 'gguf' | 'endpoint'

export interface CustomField {
  key: string
  label: string
  placeholder?: string
  /** The way this field makes a custom build fail. */
  hint?: string
  type?: 'text' | 'url' | 'number' | 'check' | 'select'
  /** Shown only when another field holds this value. */
  when?: { key: string; is: string }
  optional?: boolean
}

export interface CustomModeDef {
  mode: CustomMode
  label: string
  runtime: string
  fields: CustomField[]
  /** The reality check for this mode, shown above its fields. */
  caveat?: string
}

export const CUSTOM_MODES: Record<CustomMode, CustomModeDef> = {
  onnx: {
    mode: 'onnx',
    label: 'onnx repo',
    runtime: 'transformers.js',
    fields: [
      { key: 'repo', label: 'repo id', placeholder: 'onnx-community/Qwen3-0.6B-ONNX', hint: 'owner/name on the hub. the repo needs an onnx folder, or the load stops at the first file.' },
      { key: 'dtype', label: 'quant', placeholder: 'q4', hint: 'q4, q4f16 or fp16. the repo must ship that file. on webgpu stay on q4.', optional: true },
    ],
  },
  mlc: {
    mode: 'mlc',
    label: 'mlc weights',
    runtime: 'webllm',
    caveat: 'webllm runs only mlc format weights with a matching .wasm. most uncensored and abliterated models ship as gguf: use the gguf mode for those.',
    fields: [
      { key: 'url', label: 'weights url', type: 'url', placeholder: 'https://huggingface.co/<user>/<model>-q4f16_1-MLC', hint: 'the hf repo of mlc weights, q4f16_1 or q4f32_1.' },
      { key: 'id', label: 'model id', placeholder: 'filled from the url', optional: true },
      { key: 'lib', label: 'wasm library', type: 'select', hint: 'reusing a base model\'s .wasm also matches it to this webllm build.' },
      { key: 'base', label: 'base model', type: 'select', when: { key: 'lib', is: 'base' }, hint: 'the same architecture as the weights. a wrong one crashes or prints gibberish.' },
      { key: 'wasm', label: '.wasm url', type: 'url', when: { key: 'lib', is: 'url' }, placeholder: 'https://.../model-webgpu.wasm', hint: 'compiled for this exact webllm runtime, or it throws a LinkError.' },
      { key: 'ctx', label: 'context', type: 'number', placeholder: '4096', optional: true, hint: 'leave empty for the model\'s own. 512 or more.' },
      { key: 'f16', label: 'needs shader-f16', type: 'check', hint: 'typical for q4f16_1. off on a gpu without f16, or the load fails.' },
    ],
  },
  gguf: {
    mode: 'gguf',
    label: 'gguf file',
    runtime: 'wllama',
    fields: [
      { key: 'repo', label: 'repo id', placeholder: 'owner/model-GGUF', hint: 'owner/name on the hub.' },
      { key: 'file', label: 'file', placeholder: 'model-Q4_K_M.gguf', hint: 'one .gguf in that repo. a split file names its first part.' },
      { key: 'ctx', label: 'context', type: 'number', placeholder: '4096', optional: true, hint: 'more context needs more memory. 512 or more.' },
    ],
  },
  endpoint: {
    mode: 'endpoint',
    label: 'your endpoint',
    runtime: 'remote',
    fields: [
      { key: 'url', label: 'base url', type: 'url', placeholder: 'http://localhost:11434/v1', hint: 'openai style. the server must allow this page (cors), or every request fails.' },
      { key: 'model', label: 'model', placeholder: 'gemma4:e4b', hint: 'the name the server knows it by.' },
    ],
  },
}

export type CustomValues = Record<string, string | boolean | undefined>

const REPO = /^[\w.-]+\/[\w.-]+$/
const HTTP = /^https?:\/\//

/** The model id from a weights url: the last path part. */
export function deriveId(url: string): string {
  const u = url.trim().replace(/\/+$/, '').replace(/\/resolve\/.*$/, '')
  const last = u.split('/').pop() ?? ''
  return HTTP.test(u) ? last : ''
}

/** Fields shown for a mode with these values. */
export function customFields(mode: CustomMode, values: CustomValues): CustomField[] {
  return CUSTOM_MODES[mode].fields.filter((f) => !f.when || String(values[f.when.key] ?? '') === f.when.is)
}

/** Field key to the failure, in words. Empty when the entry can be checked. */
export function customErrors(mode: CustomMode, values: CustomValues, taken: readonly string[] = []): Record<string, string> {
  const s = (k: string) => String(values[k] ?? '').trim()
  const e: Record<string, string> = {}
  if (mode === 'onnx' || mode === 'gguf') {
    if (!s('repo')) e.repo = 'needs a repo id.'
    else if (!REPO.test(s('repo'))) e.repo = 'owner/name, with one slash.'
  }
  if (mode === 'gguf') {
    if (!s('file')) e.file = 'needs a file name.'
    else if (!/\.gguf$/i.test(s('file'))) e.file = 'the file must end in .gguf.'
  }
  if (mode === 'mlc') {
    if (!HTTP.test(s('url'))) e.url = 'the url must start with https://'
    const lib = s('lib') || 'base'
    if (lib === 'base' && !s('base')) e.base = 'pick a base model.'
    if (lib === 'url' && !HTTP.test(s('wasm'))) e.wasm = 'the wasm url must start with https://'
  }
  if (mode === 'endpoint') {
    if (!HTTP.test(s('url'))) e.url = 'the url must start with http:// or https://'
    if (!s('model')) e.model = 'needs the model name.'
  }
  if (s('ctx') && !(Number(s('ctx')) >= 512)) e.ctx = '512 or more.'
  const id = customId(mode, values)
  if (id && taken.includes(id)) e[mode === 'mlc' ? 'id' : mode === 'endpoint' ? 'model' : 'repo'] = `${id} is already in the list.`
  return e
}

/** The id an entry is saved under. */
export function customId(mode: CustomMode, values: CustomValues): string {
  const s = (k: string) => String(values[k] ?? '').trim()
  if (mode === 'mlc') return s('id') || deriveId(s('url'))
  if (mode === 'gguf') return s('repo') && s('file') ? `${s('repo')}:${s('file')}` : ''
  if (mode === 'endpoint') return s('model')
  return s('repo')
}

export type CheckState = 'idle' | 'checking' | 'ok' | 'fail'

export interface CustomCheck {
  state: CheckState
  /** What the check found: file names, the size, or the failure. */
  lines?: string[]
  sizeMB?: number | null
}

/** The status word for a check. */
export function checkText(c: CustomCheck | null | undefined): string {
  if (!c || c.state === 'idle') return 'not checked. a check costs one request, not a download.'
  if (c.state === 'checking') return 'checking the repo...'
  if (c.state === 'ok') return 'found. add it, then load from the list.'
  return 'check failed. fix the field it names.'
}
