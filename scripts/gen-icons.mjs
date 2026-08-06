/**
 * Generates src/icons/index.ts from Font Awesome Free path data.
 * Run with: npm run gen:icons
 *
 * The system's icon language has always been Font Awesome 6 solid; this
 * bakes the real glyphs in so nothing depends on a CDN at runtime.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as solid from '@fortawesome/free-solid-svg-icons'
import * as brands from '@fortawesome/free-brands-svg-icons'

// our name -> FA export. Names stay stable even if FA renames.
const SOLID = {
  // arrows and movement
  'arrow-right': solid.faArrowRight,
  'arrow-left': solid.faArrowLeft,
  'arrow-up': solid.faArrowUp,
  'arrow-down': solid.faArrowDown,
  external: solid.faArrowUpRightFromSquare,
  link: solid.faLink,

  // actions
  plus: solid.faPlus,
  minus: solid.faMinus,
  x: solid.faXmark,
  check: solid.faCheck,
  search: solid.faMagnifyingGlass,
  copy: solid.faCopy,
  trash: solid.faTrash,
  pen: solid.faPen,
  download: solid.faDownload,
  upload: solid.faUpload,
  filter: solid.faFilter,
  refresh: solid.faArrowsRotate,
  power: solid.faPowerOff,
  grip: solid.faGripVertical,
  share: solid.faShareNodes,

  // state
  eye: solid.faEye,
  heart: solid.faHeart,
  star: solid.faStar,
  bookmark: solid.faBookmark,
  lock: solid.faLock,
  warning: solid.faTriangleExclamation,
  info: solid.faCircleInfo,
  question: solid.faCircleQuestion,
  bell: solid.faBell,

  // people and talk
  user: solid.faUser,
  users: solid.faUsers,
  comment: solid.faComment,
  envelope: solid.faEnvelope,

  // things
  wrench: solid.faWrench,
  'screwdriver-wrench': solid.faScrewdriverWrench,
  hammer: solid.faHammer,
  gear: solid.faGear,
  bolt: solid.faBolt,
  cube: solid.faCube,
  microchip: solid.faMicrochip,
  robot: solid.faRobot,
  plug: solid.faPlug,
  folder: solid.faFolder,
  book: solid.faBook,
  newspaper: solid.faNewspaper,
  image: solid.faImage,
  video: solid.faVideo,
  display: solid.faDisplay,
  printer: solid.faPrint,
  lightbulb: solid.faLightbulb,
  flame: solid.faFire,
  rocket: solid.faRocket,
  gamepad: solid.faGamepad,
  palette: solid.faPalette,
  'layer-group': solid.faLayerGroup,

  // recognition
  trophy: solid.faTrophy,
  medal: solid.faMedal,
  certificate: solid.faCertificate,
  'graduation-cap': solid.faGraduationCap,

  // instruments and code
  code: solid.faCode,
  terminal: solid.faTerminal,
  wave: solid.faWaveSquare,
  signal: solid.faSignal,
  globe: solid.faGlobe,
  play: solid.faPlay,
  'circle-play': solid.faCirclePlay,
  pause: solid.faPause,
  record: solid.faCircleDot,
  backward: solid.faBackward,
  forward: solid.faForward,
  repeat: solid.faRepeat,
  rss: solid.faRss,
  'list-check': solid.faListCheck,

  // time and place
  clock: solid.faClock,
  calendar: solid.faCalendar,
  pin: solid.faLocationDot,
  menu: solid.faBars,
  sun: solid.faSun,
  wand: solid.faWandMagicSparkles,
}

const BRANDS = {
  github: brands.faGithub,
  youtube: brands.faYoutube,
  'x-twitter': brands.faXTwitter,
  mastodon: brands.faMastodon,
  bluesky: brands.faBluesky,
  discord: brands.faDiscord,
  instagram: brands.faInstagram,
  linkedin: brands.faLinkedin,
  twitch: brands.faTwitch,
  dev: brands.faDev,
}

function entry(name, def) {
  const [width, height, , , path] = def.icon
  const paths = Array.isArray(path) ? path : [path]
  return `  '${name}': { w: ${width}, h: ${height}, p: ${JSON.stringify(paths)} },`
}

const solidEntries = Object.entries(SOLID).map(([n, d]) => entry(n, d)).join('\n')
const brandEntries = Object.entries(BRANDS).map(([n, d]) => entry(n, d)).join('\n')

const out = `/**
 * GENERATED FILE, do not edit by hand. Run: npm run gen:icons
 *
 * Glyph data from Font Awesome Free (fontawesome.com).
 * Icons: CC BY 4.0. Code: MIT. https://fontawesome.com/license/free
 * Baked in so the system's icon language, Font Awesome solid, works with
 * no CDN and no runtime dependency. Never emoji, and never an icon where
 * a two-word label is clearer.
 */
export interface IconDef {
  /** viewBox width */
  w: number
  /** viewBox height */
  h: number
  /** fill paths */
  p: string[]
}

export const icons = {
${solidEntries}
} as const satisfies Record<string, IconDef>

export const brandIcons = {
${brandEntries}
} as const satisfies Record<string, IconDef>

export type SolidIconName = keyof typeof icons
export type BrandIconName = keyof typeof brandIcons
export type IconName = SolidIconName | BrandIconName

export const iconNames = Object.keys(icons) as SolidIconName[]
export const brandIconNames = Object.keys(brandIcons) as BrandIconName[]

export function iconDef(name: IconName): IconDef | undefined {
  return (icons as Record<string, IconDef>)[name] ?? (brandIcons as Record<string, IconDef>)[name]
}
`

const target = fileURLToPath(new URL('../src/icons/index.ts', import.meta.url))
writeFileSync(target, out)
console.log('wrote', target, Object.keys(SOLID).length, 'solid,', Object.keys(BRANDS).length, 'brands')
