// Stage fixtures: a turn of talk, a clip with chapters. No model runs.
import type { Chapter } from '@hackbuild/ui'

export const CHAR_NAME = 'rook'
export const ECHO = 'you: walk to the bench and pick up the red block'
export const REPLY =
  'On it. The bench is three steps ahead and a little to the left. I can see the red block on the near corner, next to the clamp. Walking now; I will stop short of the edge so I do not knock the clamp off.'

export const CLIP_LEN = 94
export const CHAPTERS: Chapter[] = [
  { t: 0, label: 'arrive' },
  { t: 12, label: 'walk to bench' },
  { t: 38, label: 'reach' },
  { t: 61, label: 'grip' },
  { t: 80, label: 'return' },
]
