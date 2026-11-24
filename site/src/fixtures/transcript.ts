// A made up 24 s take for the transcript demos: speech band level per
// 10 ms frame (dBFS), the kept mask, floor and gate, and the segments the
// filter kept and dropped. No audio and no model behind it.
import type { HbTranscriptDropped, HbTranscriptSegment } from '@hackbuild/ui'

export const duration = 24
export const noiseDb = -58
export const thrDb = -46

export const segments: HbTranscriptSegment[] = [
  { start: 0.6, end: 3.4, text: 'pixel, sit. good dog.', speaker: 'mo' },
  { start: 4.2, end: 8.1, text: 'now the red ball, the one under the bench.', speaker: 'mo' },
  { start: 9.6, end: 13.0, text: 'he goes left every time, so the gate is fine there.' },
  { start: 14.4, end: 18.8, text: 'drop it. drop it. good.', speaker: 'mo', edited: true },
  { start: 20.1, end: 22.6, text: 'that is the whole take.' },
]

export const dropped: HbTranscriptDropped[] = [
  { start: 13.2, end: 14.1, text: 'you', why: 'phantom' },
  { start: 23.0, end: 23.9, text: 'thanks for watching', why: 'outro' },
]

const frames = duration * 100
export const env = new Float32Array(frames)
export const open = new Uint8Array(frames)
let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
for (let i = 0; i < frames; i++) {
  const t = i / 100
  const seg = segments.find((s) => t >= s.start && t < s.end)
  const syll = 0.5 + 0.5 * Math.sin(t * 19 + Math.sin(t * 3) * 2)
  env[i] = seg ? -34 + syll * 22 + rnd() * 4 : noiseDb + rnd() * 6 + (t > 13.2 && t < 14.1 ? 8 : 0)
  open[i] = seg ? 1 : 0
}
