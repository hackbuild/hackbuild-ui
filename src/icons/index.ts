/**
 * The shipped icon set. Hand-drawn 24 px stroke icons: currentColor, no
 * fills, square caps to match the hard-edge system. Sized for 14 to 24 px.
 *
 * This set covers the verbs and nouns the hack.build tools actually use.
 * Brand and social glyphs (github, youtube, mastodon) are not here on
 * purpose: those come from Font Awesome 6 brands, see docs/icons.md.
 * Never emoji, and never an icon where a two-word label is clearer.
 */
export const icons = {
  // arrows and movement
  'arrow-right': ['M4 12h15', 'M13 6l6 6-6 6'],
  'arrow-left': ['M20 12H5', 'M11 6l-6 6 6 6'],
  'arrow-up': ['M12 20V5', 'M6 11l6-6 6 6'],
  'arrow-down': ['M12 4v15', 'M18 13l-6 6-6-6'],
  external: ['M9 5H5v14h14v-4', 'M13 4h7v7', 'M20 4L11 13'],
  link: [
    'M9.5 14.5l5-5',
    'M7.5 12l-2.3 2.3a3.4 3.4 0 0 0 4.8 4.8L12.3 16.8',
    'M16.5 12l2.3-2.3a3.4 3.4 0 0 0-4.8-4.8L11.7 7.2',
  ],

  // actions
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  x: ['M6 6l12 12', 'M18 6L6 18'],
  check: ['M4 13l5 5L20 7'],
  search: ['M10.5 5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z', 'M15 15l5 5'],
  copy: ['M9 9h11v11H9z', 'M5 15H4V4h11v1'],
  trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 14h10l1-14'],
  pen: ['M4 20l1-4L16 5l3 3L8 19l-4 1z', 'M13 8l3 3'],
  download: ['M12 4v11', 'M7 10l5 5 5-5', 'M4 20h16'],
  upload: ['M12 15V4', 'M7 9l5-5 5 5', 'M4 20h16'],
  filter: ['M4 5h16l-6 7v6l-4 2v-8z'],
  refresh: ['M20 12a8 8 0 1 1-2.3-5.6', 'M20 3v4h-4'],
  power: ['M12 3v8', 'M6.6 6.6a8 8 0 1 0 10.8 0'],
  grip: ['M8.5 6h.01', 'M15.5 6h.01', 'M8.5 12h.01', 'M15.5 12h.01', 'M8.5 18h.01', 'M15.5 18h.01'],

  // state
  eye: ['M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  heart: ['M12 20S4 15 4 9a4.4 4.4 0 0 1 8-2.5A4.4 4.4 0 0 1 20 9c0 6-8 11-8 11z'],
  star: ['M12 3l2.7 5.9 6.3.7-4.7 4.3 1.3 6.1-5.6-3.2-5.6 3.2 1.3-6.1L3 9.6l6.3-.7z'],
  bookmark: ['M7 3h10v18l-5-4-5 4z'],
  lock: ['M6 11h12v9H6z', 'M9 11V7a3 3 0 0 1 6 0v4'],
  warning: ['M12 3L1.5 21h21L12 3z', 'M12 10v5', 'M12 17.5v1'],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 11v5', 'M12 7.5v1'],
  question: [
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    'M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.7.3-1 .8-1 1.7',
    'M12 16.5v1',
  ],

  // people and talk
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 20c0-3.8 3.6-6 8-6s8 2.2 8 6'],
  users: [
    'M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
    'M2.5 20c0-3.3 2.9-5.2 6.5-5.2s6.5 1.9 6.5 5.2',
    'M15.5 5.4a3.5 3.5 0 0 1 0 6.2',
    'M18.5 15.4c1.8.8 3 2.3 3 4.6',
  ],
  comment: ['M4 5h16v11H11l-5 4v-4H4z'],

  // things
  wrench: [
    'M13.7 6.3a4.6 4.6 0 0 1 5.9-4.1L16.5 5.3l2.2 2.2 3.1-3.1a4.6 4.6 0 0 1-6.1 5.9L8 18a2.1 2.1 0 1 1-3-3z',
  ],
  gear: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3',
    'M4.9 4.9L7 7', 'M17 17l2.1 2.1', 'M19.1 4.9L17 7', 'M7 17l-2.1 2.1',
  ],
  bolt: ['M13 2L5 13h6l-1 9 8-11h-6l1-9z'],
  cube: ['M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z', 'M12 12l8-4.5', 'M12 12L4 7.5', 'M12 12v9'],
  microchip: [
    'M6 6h12v12H6z', 'M10 10h4v4h-4z',
    'M9 3v3', 'M15 3v3', 'M9 18v3', 'M15 18v3',
    'M3 9h3', 'M3 15h3', 'M18 9h3', 'M18 15h3',
  ],
  plug: ['M9 3v5', 'M15 3v5', 'M6 8h12l-1.2 5a5 5 0 0 1-9.6 0z', 'M12 18v3'],
  folder: ['M3 6h6l2 2h10v11H3z'],
  book: [
    'M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z',
    'M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z',
  ],
  image: ['M4 5h16v14H4z', 'M4 15l5-5 4 4 3-3 4 4', 'M9 9.5h.01'],
  video: ['M3 7h12v10H3z', 'M15 10.5l6-3.5v10l-6-3.5'],
  printer: ['M7 8V4h10v4', 'M4 8h16v7h-3v-2H7v2H4z', 'M7 13h10v8H7z'],
  lightbulb: [
    'M12 3a6 6 0 0 1 3.5 10.9c-.8.6-1.5 1.3-1.5 2.1h-4c0-.8-.7-1.5-1.5-2.1A6 6 0 0 1 12 3z',
    'M9.5 19h5', 'M10.5 22h3',
  ],
  flame: ['M12 3c3.5 3.5 6 7 6 11a6 6 0 0 1-12 0c0-2.4 1-4.4 2.4-6C9.5 9.5 12 8 12 3z'],
  rocket: [
    'M12 2c4 2 6 6 6 10l-3 3H9l-3-3c0-4 2-8 6-10z',
    'M12 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    'M9 15l-2 5', 'M15 15l2 5', 'M12 15v6',
  ],
  trophy: [
    'M8 4h8v6a4 4 0 0 1-8 0V4z',
    'M8 5H4.5C4.5 8.5 6 10 8 10',
    'M16 5h3.5C19.5 8.5 18 10 16 10',
    'M12 14v4', 'M8 18h8v3H8z',
  ],

  // instruments and code
  code: ['M8 7l-5 5 5 5', 'M16 7l5 5-5 5'],
  terminal: ['M4 5h16v14H4z', 'M7 9l3 3-3 3', 'M12 15h5'],
  wave: ['M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0'],
  signal: ['M4 19v-3', 'M9 19v-7', 'M14 19V7', 'M19 19V3'],
  globe: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M3 12h18', 'M12 3c3 3.5 3 14.5 0 18', 'M12 3c-3 3.5-3 14.5 0 18'],
  play: ['M8 5l12 7-12 7z'],
  pause: ['M8 5v14', 'M16 5v14'],
  record: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  rss: ['M5 18.5h.01', 'M5 12a7 7 0 0 1 7 7', 'M5 5a14 14 0 0 1 14 14'],

  // time and place
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v5l3 3'],
  calendar: ['M4 6h16v14H4z', 'M4 10h16', 'M9 3.5V7', 'M15 3.5V7'],
  pin: ['M12 21s-6-6.2-6-10.5a6 6 0 0 1 12 0C18 14.8 12 21 12 21z', 'M12 8.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  sun: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'M12 2v2.5', 'M12 19.5V22', 'M2 12h2.5', 'M19.5 12H22',
    'M4.6 4.6l1.8 1.8', 'M17.6 17.6l1.8 1.8', 'M19.4 4.6l-1.8 1.8', 'M6.4 17.6l-1.8 1.8',
  ],
} as const

export type IconName = keyof typeof icons

export const iconNames = Object.keys(icons) as IconName[]
