import { hashSeed } from './critter'

/**
 * The plate palette: identity colors for media plates, avatars and
 * category coding, the way the magazine and resume cards use them.
 * Amber and green flip to ink foregrounds; paper on those fills was one
 * of the readability problems in the originals.
 */
export interface Plate {
  bg: string
  fg: string
}

export const plates = {
  ink: { bg: 'var(--hb-ink)', fg: 'var(--hb-paper)' },
  pink: { bg: 'var(--hb-pink)', fg: 'var(--hb-paper)' },
  teal: { bg: 'var(--hb-plate-teal)', fg: 'var(--hb-paper)' },
  purple: { bg: 'var(--hb-plate-purple)', fg: 'var(--hb-paper)' },
  blue: { bg: 'var(--hb-plate-blue)', fg: 'var(--hb-paper)' },
  amber: { bg: 'var(--hb-plate-amber)', fg: 'var(--hb-ink)' },
  green: { bg: 'var(--hb-plate-green)', fg: 'var(--hb-ink)' },
} as const satisfies Record<string, Plate>

export type PlateName = keyof typeof plates

/** The rotation a seed picks from. Ink stays out; it is the ghost style. */
export const seededPlateNames: PlateName[] = ['teal', 'purple', 'blue', 'amber', 'green', 'pink']

export function plateFromSeed(seed: string): PlateName {
  return seededPlateNames[hashSeed(seed) % seededPlateNames.length]
}
