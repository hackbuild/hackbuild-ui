/**
 * The component registry. One entry per component, grouped by category.
 * Demo pages live in ./demos/<Name>Demo.vue and are resolved by name.
 */
export interface RegistryEntry {
  /** Component name, also the route param. */
  name: string
  /** One line for the sidebar and page head. */
  blurb: string
}

export interface RegistryGroup {
  category: string
  entries: RegistryEntry[]
}

export const registry: RegistryGroup[] = [
  {
    category: 'brand',
    entries: [
      { name: 'HbMark', blurb: 'the canonical two-path mark' },
      { name: 'HbWordmark', blurb: 'hack in ink, dot and build in pink' },
      { name: 'HbIcon', blurb: 'font awesome solid, baked in' },
    ],
  },
  {
    category: 'page sections',
    entries: [
      { name: 'HbNav', blurb: 'page nav with drawer collapse' },
      { name: 'HbHero', blurb: 'kicker, marker headline, one pink action' },
      { name: 'HbSectionHead', blurb: 'kicker, title, quiet link right' },
      { name: 'HbMediaCard', blurb: 'media plate, tags, quiet links' },
      { name: 'HbCover', blurb: 'seeded placeholder for empty plates' },
      { name: 'HbVideoFrame', blurb: 'pink framed embed on the void' },
      { name: 'HbPlaylist', blurb: 'player beside a numbered track list' },
      { name: 'HbPlaque', blurb: 'award plaque with a pinned diamond' },
      { name: 'HbTimeline', blurb: 'left rule entries: jobs, releases' },
      { name: 'HbCta', blurb: 'closing ink band, caution stripes' },
      { name: 'HbFooter', blurb: 'ink footer with columns and stamp' },
    ],
  },
  {
    category: 'chrome',
    entries: [
      { name: 'HbHeader', blurb: 'ink bar, identity and state, no verbs' },
      { name: 'HbTabs', blurb: 'destinations under the header' },
      { name: 'HbToolbar', blurb: 'verbs and global settings' },
      { name: 'HbStatusBar', blurb: 'figures strip, never a control' },
      { name: 'HbAppShell', blurb: 'the full height tool layout' },
      { name: 'HbShell', blurb: 'centered content column' },
    ],
  },
  {
    category: 'surfaces',
    entries: [
      { name: 'HbPanel', blurb: 'raised paper with the block shadow' },
      { name: 'HbCard', blurb: 'panel that lifts when interactive' },
      { name: 'HbStage', blurb: 'the void, where the machine draws' },
      { name: 'HbCallout', blurb: 'pink left rule, one or two per page' },
      { name: 'HbFold', blurb: 'disclosure for fiddly controls' },
      { name: 'HbSticker', blurb: 'rotated hand lettered tag' },
      { name: 'HbNum', blurb: 'circular section badge' },
    ],
  },
  {
    category: 'controls',
    entries: [
      { name: 'HbButton', blurb: 'ink fill, pink on hover, presses down' },
      { name: 'HbChip', blurb: 'filter and multi select toggle' },
      { name: 'HbSeg', blurb: 'segmented mode switch' },
      { name: 'HbInput', blurb: 'text input on raised paper' },
      { name: 'HbTextarea', blurb: 'multiline input' },
      { name: 'HbSelect', blurb: 'native select, system dressed' },
      { name: 'HbCheckbox', blurb: 'native check, pink accent' },
      { name: 'HbRadio', blurb: 'native radio, pink accent' },
      { name: 'HbSwitch', blurb: 'rectangular toggle, knob slides' },
      { name: 'HbField', blurb: 'label, control, hint or error' },
      { name: 'HbSlider', blurb: 'label, track, live value' },
      { name: 'HbDropdown', blurb: 'action menu under a trigger' },
    ],
  },
  {
    category: 'data',
    entries: [
      { name: 'HbTag', blurb: 'static VT323 tag on a plate' },
      { name: 'HbKv', blurb: 'label left, readout right' },
      { name: 'HbTable', blurb: 'ink head, stripes, pink wash on hover' },
      { name: 'HbList', blurb: 'bordered stack of rows' },
      { name: 'HbRow', blurb: 'list row, fills pink when active' },
      { name: 'HbPill', blurb: 'status with a leading dot' },
      { name: 'HbMeter', blurb: 'pink fill on an ink track' },
      { name: 'HbSegMeter', blurb: 'segmented signal meter' },
      { name: 'HbConsole', blurb: 'void, VT323, newest line first' },
      { name: 'HbDial', blurb: 'the one giant readout per tool' },
      { name: 'HbTile', blurb: 'preset tap target, 96 px minimum' },
      { name: 'HbAvatar', blurb: 'square, with seeded critter faces' },
      { name: 'HbVerified', blurb: 'pink check next to a name' },
      { name: 'HbStat', blurb: 'the big VT323 figure with a label' },
      { name: 'HbDots', blurb: 'square pips: difficulty, skill' },
      { name: 'HbCountdown', blurb: 'ticking blocks on ink plates' },
      { name: 'HbKbd', blurb: 'keyboard hint' },
    ],
  },
  {
    category: 'feedback',
    entries: [
      { name: 'HbModal', blurb: 'centered panel over a scrim' },
      { name: 'HbDrawer', blurb: 'panel sliding from an edge' },
      { name: 'HbToaster', blurb: 'one toast, gone in about a second' },
      { name: 'HbSpinner', blurb: 'three segments blinking in order' },
      { name: 'HbSkeleton', blurb: 'breathing block while loading' },
      { name: 'HbEmptyState', blurb: 'dashed well that says what to do' },
      { name: 'HbPagination', blurb: 'page chips, current one pink' },
    ],
  },
]

export const allEntries: RegistryEntry[] = registry.flatMap((group) => group.entries)

const demoModules = import.meta.glob('./demos/*.vue')

export function demoLoader(name: string) {
  return demoModules[`./demos/${name}Demo.vue`]
}
