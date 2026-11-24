// Fixtures for the vision demos: a drawn desk scene, one alpha mask per
// object, a drawn depth map, and a stub decoder that finds the object
// under a point. No model runs here.

export const SCENE_W = 640
export const SCENE_H = 420

interface Shape { key: string; label: string; svg: string; hit: (x: number, y: number) => boolean; score: number }

const shapes: Shape[] = [
  {
    key: 'mug',
    label: 'mug',
    svg: '<rect x="90" y="170" width="110" height="140"/><rect x="196" y="200" width="34" height="70"/>',
    hit: (x, y) => x >= 90 && x <= 230 && y >= 170 && y <= 310,
    score: 0.94,
  },
  {
    key: 'box',
    label: 'parts box',
    svg: '<rect x="260" y="130" width="170" height="180"/>',
    hit: (x, y) => x >= 260 && x <= 430 && y >= 130 && y <= 310,
    score: 0.88,
  },
  {
    key: 'ball',
    label: 'ball',
    svg: '<circle cx="520" cy="250" r="60"/>',
    hit: (x, y) => (x - 520) ** 2 + (y - 250) ** 2 <= 3600,
    score: 1.01,
  },
]

const url = (body: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SCENE_W} ${SCENE_H}" width="${SCENE_W}" height="${SCENE_H}">${body}</svg>`)}`

export const sceneUrl = url(
  '<rect width="640" height="420" fill="#e9e2d3"/><rect y="300" width="640" height="120" fill="#6b6459"/>' +
  '<rect x="90" y="170" width="110" height="140" fill="#c3251f"/><rect x="196" y="200" width="34" height="70" fill="none" stroke="#c3251f" stroke-width="14"/>' +
  '<rect x="260" y="130" width="170" height="180" fill="#d9b45a"/><rect x="260" y="130" width="170" height="30" fill="#b8963f"/>' +
  '<circle cx="520" cy="250" r="60" fill="#2b6cb0"/><circle cx="500" cy="228" r="14" fill="#58a6ff"/>',
)

export const depthUrl = url(
  '<rect width="640" height="420" fill="#141414"/><rect y="300" width="640" height="120" fill="#5a5a5a"/>' +
  '<rect x="90" y="170" width="140" height="140" fill="#e6e6e6"/><rect x="260" y="130" width="170" height="180" fill="#9c9c9c"/>' +
  '<circle cx="520" cy="250" r="60" fill="#c8c8c8"/>',
)

/** Alpha mask for an object: white keeps, clear drops. */
export function maskUrl(key: string): string {
  const s = shapes.find((x) => x.key === key)
  return s ? url(`<g fill="#fff">${s.svg}</g>`) : ''
}

/** Stub decoder: the object under a point, or null. The ball scores 1.01
    on purpose: the list must clamp it to 100 percent. */
export function decodeAt(x: number, y: number): { key: string; label: string; score: number } | null {
  const s = shapes.find((v) => v.hit(x, y))
  return s ? { key: s.key, label: s.label, score: s.score } : null
}
