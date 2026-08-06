/**
 * Critter avatars. A deterministic little character drawn from a seed
 * string: same seed, same face, no server, no image. Pixel rects on a
 * 24 unit grid, monochrome so identity never fights the one-accent rule.
 */
export interface Critter {
  /** Head outline, stroked. [x, y, w, h] */
  head: [number, number, number, number]
  /** Filled feature rects. */
  rects: Array<[number, number, number, number]>
}

const EYES: Array<Array<[number, number, number, number]>> = [
  [[8, 12, 2, 2], [14, 12, 2, 2]],
  [[8, 11, 2, 3], [14, 11, 2, 3]],
  [[7, 12, 3, 2], [14, 12, 3, 2]],
  [[8, 13, 2, 1], [14, 13, 2, 1]],
  [[8, 12, 1, 2], [10, 12, 1, 1], [14, 12, 1, 2], [16, 12, 1, 1]],
]

const MOUTHS: Array<Array<[number, number, number, number]>> = [
  [[9, 17, 6, 1]],
  [[8, 16, 2, 1], [10, 17, 4, 1], [14, 16, 2, 1]],
  [[11, 16, 2, 2]],
  [[8, 17, 2, 1], [11, 16, 2, 1], [14, 17, 2, 1]],
  [[10, 17, 4, 2]],
]

const ACCESSORIES: Array<Array<[number, number, number, number]>> = [
  [[11, 2, 2, 2], [11, 4, 2, 3]],
  [[6, 4, 2, 3], [16, 4, 2, 3]],
  [[2, 12, 3, 3], [19, 12, 3, 3]],
  [[7, 4, 10, 2]],
  [],
]

export function hashSeed(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function critterFromSeed(seed: string): Critter {
  const hash = hashSeed(seed)
  return {
    head: [5, 7, 14, 13],
    rects: [
      ...EYES[hash % EYES.length],
      ...MOUTHS[Math.floor(hash / 7) % MOUTHS.length],
      ...ACCESSORIES[Math.floor(hash / 41) % ACCESSORIES.length],
    ],
  }
}
