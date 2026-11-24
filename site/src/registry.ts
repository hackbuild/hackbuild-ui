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
      { name: 'HbTimelineItem', blurb: 'title, sub line, period, body' },
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
      { name: 'HbGuide', blurb: 'step, goal and the bench verbs' },
      { name: 'HbSteps', blurb: 'numbered steps, a select when narrow' },
      { name: 'HbStatusBar', blurb: 'figures strip, priority cells, one button form' },
      { name: 'HbStatusLine', blurb: 'one sentence, the failure named' },
      { name: 'HbAppShell', blurb: 'the full height tool layout' },
      { name: 'HbShell', blurb: 'centered content column' },
    ],
  },
  {
    category: 'suite shell',
    entries: [
      { name: 'HbSuiteNav', blurb: 'groups and tools, a sheet on a phone' },
      { name: 'HbWorkspaceMenu', blurb: 'workspace actions and the level' },
      { name: 'HbPills', blurb: 'one status pill per subsystem' },
      { name: 'HbStatusList', blurb: 'one line per subsystem, in words' },
      { name: 'HbActivity', blurb: 'what the app waits on, a 2 px line' },
      { name: 'HbPalette', blurb: 'commands on / and ctrl+k' },
      { name: 'HbKeyMap', blurb: 'the hotkey table, printed' },
      { name: 'HbToolRail', blurb: 'tools with their key letters' },
    ],
  },
  {
    category: 'models',
    entries: [
      { name: 'HbModelList', blurb: 'grouped catalogue, fit chip, row state' },
      { name: 'HbProgress', blurb: 'summed bar, phase words, file rows' },
      { name: 'HbCapabilities', blurb: 'what this machine can turn on, and how fast' },
      { name: 'HbReasons', blurb: 'defaults with the reason for each' },
      { name: 'HbLicence', blurb: 'licence as recorded, optional' },
      { name: 'HbLoader', blurb: 'load panel that names the size' },
      { name: 'HbModelManager', blurb: 'the drawer: machine, rack, catalogue, stored' },
      { name: 'HbModelRack', blurb: 'slots by job, presets with their total' },
      { name: 'HbModelSlot', blurb: 'one organ: select, load, bar, status' },
      { name: 'HbEngineBar', blurb: 'the picker shrunk to one line' },
      { name: 'HbWakeGate', blurb: 'one row per subsystem, wake and no voice' },
      { name: 'HbTierCards', blurb: 'engine tiers by cost and privacy' },
      { name: 'HbCustomModelForm', blurb: 'your own weights, checked before fetch' },
      { name: 'HbApiKey', blurb: 'masked key that is never saved' },
      { name: 'HbPermission', blurb: 'a permission, the way around, what still works' },
    ],
  },
  {
    category: 'chat',
    entries: [
      { name: 'HbChat', blurb: 'transcript, actions, one primary that reads stop' },
      { name: 'HbMessage', blurb: 'every hidden input one fold away' },
      { name: 'HbThink', blurb: 'think text, open while it streams' },
      { name: 'HbToolCall', blurb: 'one line when done, open while running' },
      { name: 'HbContextMeter', blurb: 'what fills the context, the full banner' },
      { name: 'HbConversationList', blurb: 'the chats or documents rail' },
    ],
  },
  {
    category: 'memory and voice',
    entries: [
      { name: 'HbMemoryPanel', blurb: 'add, search, inspect, move and erase in one place' },
      { name: 'HbMemoryItem', blurb: 'kind, score, entity, edit and forget' },
      { name: 'HbRecallTrace', blurb: 'why a memory won, and what lost' },
      { name: 'HbMicButton', blurb: 'mic toggle or push to talk, blocked says what to do' },
      { name: 'HbLevelRail', blurb: 'speech kept and cut, floor and gate, seek' },
      { name: 'HbQueueStrip', blurb: 'one strip per file: status, wave, measured line' },
    ],
  },
  {
    category: 'speech and image',
    entries: [
      { name: 'HbSpokenText', blurb: 'the line lit word by word as it is spoken' },
      { name: 'HbMethodCard', blurb: 'a method with its trade, time, quality, size and fallback' },
      { name: 'HbImageSlot', blurb: 'upload, camera then capture, paste or sample, one info line' },
      { name: 'HbCameraTile', blurb: 'the feed with corner tags and a denied state' },
      { name: 'HbHistoryStrip', blurb: 'recent runs, a press restores the settings' },
      { name: 'HbSeed', blurb: 'seed with dice and a lock' },
    ],
  },
  {
    category: 'surfaces',
    entries: [
      { name: 'HbPanel', blurb: 'raised paper with the block shadow' },
      { name: 'HbCard', blurb: 'panel that lifts when interactive' },
      { name: 'HbStage', blurb: 'the void, where the machine draws' },
      { name: 'HbStageOverlay', blurb: 'the stage with four corners and a centre' },
      { name: 'HbViewport', blurb: 'the scene, overlays, verbs, cover' },
      { name: 'HbInset', blurb: 'a derived view: collapsible, view modes, one line head' },
      { name: 'HbWave', blurb: 'waveform or level rail with floor, gate and seek' },
      { name: 'HbBubble', blurb: 'speech over a point, clamped, reading time' },
      { name: 'HbWelcome', blurb: 'steps that tick from live state, three starts' },
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
      { name: 'HbActions', blurb: 'a row of verbs that wraps' },
      { name: 'HbChip', blurb: 'filter and multi select toggle' },
      { name: 'HbChipGroup', blurb: 'one or several on, a distinct off' },
      { name: 'HbToggleRow', blurb: 'label, why and switch as one target' },
      { name: 'HbSeg', blurb: 'segmented mode switch' },
      { name: 'HbInput', blurb: 'text input on raised paper' },
      { name: 'HbTextarea', blurb: 'multiline input' },
      { name: 'HbSelect', blurb: 'native select, system dressed' },
      { name: 'HbCheckbox', blurb: 'native check, pink accent' },
      { name: 'HbRadio', blurb: 'native radio, pink accent' },
      { name: 'HbSwitch', blurb: 'rectangular toggle, knob slides' },
      { name: 'HbField', blurb: 'label, control, hint or error' },
      { name: 'HbSlider', blurb: 'label, track, live value' },
      { name: 'HbParamRow', blurb: 'label, control, number, unit, help' },
      { name: 'HbSettingsForm', blurb: 'sections from a schema, reset, levels' },
      { name: 'HbPresetChips', blurb: 'one press sets every dial' },
      { name: 'HbDropdown', blurb: 'action menu under a trigger' },
      { name: 'HbDropzone', blurb: 'drop, paste or pick files, routed by type' },
    ],
  },
  {
    category: 'data',
    entries: [
      { name: 'HbTag', blurb: 'static VT323 tag on a plate' },
      { name: 'HbKv', blurb: 'label left, readout right' },
      { name: 'HbReadouts', blurb: 'label to figure rows, source in the label' },
      { name: 'HbHudStat', blurb: 'small lit figure for a stage corner' },
      { name: 'HbGauges', blurb: 'a bar per row, one pink' },
      { name: 'HbSparkRows', blurb: 'history, threshold and trend per row' },
      { name: 'HbChoiceBars', blurb: 'every option weighed, the chosen one lit' },
      { name: 'HbCausalLog', blurb: 'events with their chain of causes' },
      { name: 'HbTranscript', blurb: 'timed segments: dropped lines, search, edit, seek' },
      { name: 'HbMaterials', blurb: 'print slots: swatch, material, parts' },
      { name: 'HbHash', blurb: 'sha-256 against the known hash, copy mark' },
      { name: 'HbTable', blurb: 'ink head, stripes, pink wash on hover' },
      { name: 'HbList', blurb: 'bordered stack of rows' },
      { name: 'HbRow', blurb: 'list row, fills pink when active' },
      { name: 'HbPill', blurb: 'status with a leading dot' },
      { name: 'HbMeter', blurb: 'pink fill on an ink track' },
      { name: 'HbSegMeter', blurb: 'segmented signal meter' },
      { name: 'HbConsole', blurb: 'void, VT323, newest line first' },
      { name: 'HbEventLog', blurb: 'tagged line log, live rows, follow' },
      { name: 'HbCodeBlock', blurb: 'code on ink with copy and wrap' },
      { name: 'HbHow', blurb: 'packages, install, code, links in a fold' },
      { name: 'HbExportPanel', blurb: 'formats, file name, readout, checks' },
      { name: 'HbDial', blurb: 'the one giant readout per tool' },
      { name: 'HbTile', blurb: 'preset tap target, 96 px minimum' },
      { name: 'HbAvatar', blurb: 'seeded little people on plates' },
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
      { name: 'HbToaster', blurb: 'one toast at a time, errors held' },
      { name: 'HbChecks', blurb: 'checks with verdict, figure and reason' },
      { name: 'HbVerdict', blurb: 'pass, fail, warn, not run, running' },
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
