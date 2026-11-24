// Real rows copied as data from the browser-ai models catalogue (CATALOG,
// 2026-11-24): sizes measured by HEAD requests there, vram vendor. The fit
// results are what fitOf returns for one sample machine: webgpu with
// shader-f16, 8 gb memory or more, no prompt api, 9.2 GB of storage free.
// The kit never imports the library; these are plain records.
import type { HbModelFit, HbModelRecord, HbReasonRow } from '@hackbuild/ui'

export const catalogue: HbModelRecord[] = [
  {
    id: 'gemini-nano', label: 'chrome built in model', censorship: 'stock', tags: ['built in'],
    note: "the browser's own model. chrome downloads and keeps it.", group: 'no download', badge: 'built in',
    provider: 'prompt-api', sizeMB: null, sizeSource: 'unknown',
    licence: 'Chrome built in AI terms and the Google Generative AI Prohibited Use Policy', commercial: 'unknown',
    notes: ['chrome downloads the model on first use; it needs 22 GB free disk (vendor).'],
  },
  {
    id: 'hermes-3-llama-3.2-3b-mlc', label: 'Hermes 3 Llama 3.2 3B', params: '3B', quant: 'q4f16_1', vramMB: 2200, vramSource: 'vendor',
    censorship: 'uncensored', tier: 'medium', tags: ['tools', 'low vram'], note: 'small, steerable, few refusals. native tool calls.',
    group: 'start here', badge: 'default', provider: 'webllm', sizeMB: 1733, sizeSource: 'measured', ctx: 4096,
    licence: 'Llama 3.2 Community License', commercial: true,
    notes: ['the f16 aware default of the model picker build.'],
  },
  {
    id: 'qwen2.5-1.5b-instruct-mlc', label: 'Qwen2.5 1.5B Instruct', params: '1.5B', quant: 'q4f16_1', vramMB: 1600, vramSource: 'vendor',
    censorship: 'stock', tier: 'small', tags: ['low vram'], note: 'small but neat with structure.', group: 'start here', badge: 'good, small',
    provider: 'webllm', sizeMB: 828, sizeSource: 'measured', ctx: 4096, licence: 'Apache-2.0 (inferred, unverified)', commercial: 'unknown',
  },
  {
    id: 'llama-3.2-1b-instruct-mlc', label: 'Llama 3.2 1B Instruct', params: '1B', quant: 'q4f16_1', vramMB: 879, vramSource: 'vendor',
    censorship: 'stock', tier: 'small', tags: ['low vram'], note: 'fastest and smallest on a gpu. keep prompts simple.', group: 'start here',
    badge: 'smallest on gpu', provider: 'webllm', sizeMB: 663, sizeSource: 'measured', ctx: 4096,
    licence: 'Llama 3.2 Community License (inferred, unverified)', commercial: 'unknown',
  },
  {
    id: 'smollm2-360m-instruct', params: '360M', quant: 'q4', censorship: 'stock', tier: 'tiny', tags: ['no gpu'],
    note: 'the no gpu default. questions, summaries, light reasoning.', group: 'start here', badge: 'default with no gpu',
    provider: 'tjs', sizeMB: 370, sizeSource: 'measured', ctx: 2048, licence: 'Apache-2.0', commercial: true,
  },
  {
    id: 'gemma-4-e4b-abliterated-gguf', label: 'Gemma 4 E4B abliterated', params: 'E4B', quant: 'Q4_K_M', censorship: 'abliterated', tier: 'large',
    note: "an uncensored gemma 4 brain. the earlier clone chat's default; it warns with no webgpu.", group: 'uncensored', badge: 'best',
    provider: 'wllama', sizeMB: 5057, sizeSource: 'measured', licence: 'apache-2.0 (model card field, unverified)', commercial: 'unknown',
  },
  {
    id: 'qwen3.5-2b-abliterated-gguf', label: 'Qwen3.5 2B abliterated', params: '2B', quant: 'Q4_K_M', censorship: 'abliterated', tier: 'small',
    tags: ['no gpu'], note: "the earlier room's default with no webgpu. thin for long chats.", group: 'uncensored', badge: 'faster',
    provider: 'wllama', sizeMB: 1212, sizeSource: 'measured', licence: 'apache-2.0 (model card field, unverified)', commercial: 'unknown',
  },
  {
    id: 'qwen3-0.6b', label: 'Qwen3 0.6B', params: '0.6B', quant: 'q4f16', censorship: 'stock', tier: 'small', tags: ['think'],
    note: 'tiny reasoner with a think trace.', group: 'reasoning', badge: 'think trace, small', provider: 'tjs',
    sizeMB: 552, sizeSource: 'measured', licence: 'Apache-2.0 (inferred, unverified)', commercial: 'unknown',
  },
  {
    id: 'smollm2-135m-instruct', params: '135M', quant: 'q4', censorship: 'stock', tier: 'tiny', tags: ['no gpu'],
    note: 'smallest. autocomplete tier chat with short, simple replies.', group: 'tiny', badge: 'smallest',
    provider: 'tjs', sizeMB: 174, sizeSource: 'measured', ctx: 2048, licence: 'Apache-2.0', commercial: true,
  },
]

export const groupOrder = ['no download', 'start here', 'good', 'uncensored', 'reasoning', 'tiny']

export const fits: Record<string, HbModelFit> = {
  'gemini-nano': { fit: 'cannot run here', ok: false, reason: 'this browser has no prompt api.' },
  'hermes-3-llama-3.2-3b-mlc': { fit: 'fits', ok: true, reason: 'runs on webgpu, 2.1 gb of 3.6 gb.' },
  'qwen2.5-1.5b-instruct-mlc': { fit: 'fits', ok: true, reason: 'runs on webgpu, 1.6 gb of 3.6 gb.' },
  'llama-3.2-1b-instruct-mlc': { fit: 'fits', ok: true, reason: 'runs on webgpu, 879 mb of 3.6 gb.' },
  'smollm2-360m-instruct': { fit: 'fits', ok: true, reason: 'runs on webgpu, 370 mb of 3.6 gb.' },
  'gemma-4-e4b-abliterated-gguf': { fit: 'over memory', ok: false, reason: 'needs 4.9 gb (measured). this machine gives a model 3.6 gb (8 gb memory or more, webgpu).' },
  'qwen3.5-2b-abliterated-gguf': { fit: 'fits', ok: true, reason: 'runs on webgpu, 1.2 gb of 3.6 gb.' },
  'qwen3-0.6b': { fit: 'fits', ok: true, reason: 'runs on webgpu, 552 mb of 3.6 gb.' },
  'smollm2-135m-instruct': { fit: 'fits', ok: true, reason: 'runs on webgpu, 174 mb of 3.6 gb.' },
}

/** The no gpu machine: the same rows through fitOf with webgpu off. */
export const fitsNoGpu: Record<string, HbModelFit> = {
  ...fits,
  'hermes-3-llama-3.2-3b-mlc': { fit: 'needs webgpu', ok: false, reason: 'no webgpu adapter here.' },
  'qwen2.5-1.5b-instruct-mlc': { fit: 'needs webgpu', ok: false, reason: 'no webgpu adapter here.' },
  'llama-3.2-1b-instruct-mlc': { fit: 'needs webgpu', ok: false, reason: 'no webgpu adapter here.' },
  'smollm2-360m-instruct': { fit: 'fits on cpu, slow', ok: true, reason: 'no webgpu adapter. it runs on cpu, slower.' },
  'qwen3.5-2b-abliterated-gguf': { fit: 'fits on cpu, slow', ok: true, reason: 'no webgpu adapter. it runs on cpu, slower.' },
}

export const machine = 'webgpu, apple metal-3, shader-f16, 8 gb memory or more, 10 threads, cross origin isolated'

/** suggestDefaults rows for the sample machine. */
export const reasons: HbReasonRow[] = [
  { key: 'model', label: 'model', value: 'nothing stored yet', why: 'nothing stored. Hermes 3 Llama 3.2 3B fits, 1.7 GB (measured), 8 gb memory or more, webgpu.', speed: 'fast' },
  { key: 'device', label: 'device', value: 'webgpu', why: 'an adapter with shader-f16 answered the probe.', speed: 'fast' },
  { key: 'threads', label: 'threads', value: '4', why: 'cross origin isolated, 10 cores; four leave room for the page.' },
  { key: 'budget', label: 'budget', value: '3.6 GB', why: '45 percent of 8 gb memory, proposed until a browser run measures one.', edit: false },
]
