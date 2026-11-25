/**
 * The component registry. One entry per component, grouped by the layout that uses them
 * (rebuild plan section 3); shared shelves follow, then the parts on their way out.
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
    category: 'stage and rack',
    entries: [
      { name: 'HbStageRack', blurb: 'stage fills, verbs on it, the 380 px rack' },
      { name: 'HbRack', blurb: 'three to five tabs, the first live' },
      { name: 'HbBubble', blurb: 'speech over a point, clamped, reading time' },
      { name: 'HbCausalLog', blurb: 'events with their chain of causes' },
      { name: 'HbChoiceBars', blurb: 'every option weighed, the chosen one lit' },
      { name: 'HbContextMenu', blurb: 'right click, long press or menu key; sends sentences' },
      { name: 'HbEventLog', blurb: 'tagged line log, live rows, follow' },
      { name: 'HbGauges', blurb: 'a bar per row, one pink' },
      { name: 'HbGuide', blurb: 'step, goal and the bench verbs' },
      { name: 'HbHudStat', blurb: 'small lit figure for a stage corner' },
      { name: 'HbInset', blurb: 'a derived view: collapsible, view modes, one line head' },
      { name: 'HbAvatarCard', blurb: 'thumbnail, name, licence and size, rig check' },
      { name: 'HbClipStrip', blurb: 'clips in a row, the playing one marked' },
      { name: 'HbMaterials', blurb: 'print slots: swatch, material, parts' },
      { name: 'HbNameHud', blurb: 'the name and one state word, privacy chips' },
      { name: 'HbPad', blurb: 'touch stick or d-pad and one action, keys too' },
      { name: 'HbParamRow', blurb: 'label, control, number, unit, help' },
      { name: 'HbSparkRows', blurb: 'history, threshold and trend per row' },
      { name: 'HbStageCaption', blurb: 'what you said and the reply, on the stage' },
      { name: 'HbSteps', blurb: 'numbered steps, a select when narrow' },
      { name: 'HbTabs', blurb: 'destinations under the header' },
      { name: 'HbTransport', blurb: 'play, chapters, scrub, speed and loop for a clip' },
      { name: 'HbTree', blurb: 'a rig tree: open, close, pick by key; scrolls past a cap' },
      { name: 'HbViewport', blurb: 'the scene, overlays, verbs, cover' },
      { name: 'HbWelcome', blurb: 'steps that tick from live state, three starts' },
    ],
  },
  {
    category: 'canvas and rail',
    entries: [
      { name: 'HbCanvasRail', blurb: 'tool rail, canvas, rack' },
      { name: 'HbArtboard', blurb: 'pan and zoom a board, place layers, erase by brush, host a part' },
      { name: 'HbCameraTile', blurb: 'the feed with corner tags and a denied state' },
      { name: 'HbImageSlot', blurb: 'upload, camera then capture, paste or sample, one info line' },
      { name: 'HbInstanceList', blurb: 'one row per mask: colour, score, hide, delete, merge' },
      { name: 'HbMaskEditor', blurb: 'wand, brush and lasso masks by hand, undo, alpha out' },
      { name: 'HbMonitorDock', blurb: 'raw feed and model views side by side, each folds' },
      { name: 'HbPromptCanvas', blurb: 'keep and leave out points and boxes on an image, by touch or keys' },
      { name: 'HbRange2', blurb: 'two thumbs on one track for a near and far window' },
      { name: 'HbSplit', blurb: 'a compare wipe between two views of one image' },
      { name: 'HbToolRail', blurb: 'tools with their key letters' },
    ],
  },
  {
    category: 'drop first',
    entries: [
      { name: 'HbDropFirst', blurb: 'a drop zone that becomes the result' },
      { name: 'HbConsole', blurb: 'void, VT323, newest line first' },
      { name: 'HbDropzone', blurb: 'drop, paste or pick files, routed by type' },
      { name: 'HbLevelRail', blurb: 'speech kept and cut, floor and gate, seek' },
      { name: 'HbQueueStrip', blurb: 'one strip per file: status, wave, measured line' },
      { name: 'HbTranscript', blurb: 'timed segments: dropped lines, search, edit, seek' },
      { name: 'HbWave', blurb: 'waveform or level rail with floor, gate and seek' },
    ],
  },
  {
    category: 'conversation',
    entries: [
      { name: 'HbConversationLayout', blurb: 'messages, composer, chat list, rack' },
      { name: 'HbChat', blurb: 'transcript, actions, one primary that reads stop' },
      { name: 'HbContextMeter', blurb: 'what fills the context, the full banner' },
      { name: 'HbConversationList', blurb: 'the chats or documents rail' },
      { name: 'HbMemoryItem', blurb: 'kind, score, entity, edit and forget' },
      { name: 'HbMemoryPanel', blurb: 'add, search, inspect, move and erase in one place' },
      { name: 'HbMessage', blurb: 'every hidden input one fold away' },
      { name: 'HbMicButton', blurb: 'mic toggle or push to talk, blocked says what to do' },
      { name: 'HbPersonaEditor', blurb: 'name, templated prompt and its cost, presets, file' },
      { name: 'HbPromptInspector', blurb: 'the last prompt, reply, plan and cost' },
      { name: 'HbRecallTrace', blurb: 'why a memory won, and what lost' },
      { name: 'HbSpokenText', blurb: 'the line lit word by word as it is spoken' },
      { name: 'HbStepCard', blurb: 'one agent step beside the frame it saw' },
      { name: 'HbThink', blurb: 'think text, open while it streams' },
      { name: 'HbToolCall', blurb: 'one line when done, open while running' },
    ],
  },
  {
    category: 'gate',
    entries: [
      { name: 'HbGate', blurb: 'one card, one select, one pink button' },
      { name: 'HbGateCheck', blurb: 'one part readying: label, bar, note' },
      { name: 'HbModelSelect', blurb: 'one line or a bar chip, one pink load' },
      { name: 'HbModelSheet', blurb: 'search, filters, groups, rows, your own' },
      { name: 'HbApiKey', blurb: 'masked key that is never saved' },
      { name: 'HbPermission', blurb: 'a permission, the way around, what still works' },
      { name: 'HbStatusList', blurb: 'one line per subsystem, in words' },
    ],
  },
  {
    category: 'form and frame',
    entries: [
      { name: 'HbFormFrame', blurb: 'the form column beside the frame' },
      { name: 'HbExportPanel', blurb: 'formats, file name, readout, checks' },
      { name: 'HbHistoryStrip', blurb: 'recent runs, a press restores the settings' },
      { name: 'HbSeed', blurb: 'seed with dice and a lock' },
    ],
  },
  {
    category: 'shared: bar and shell',
    entries: [
      { name: 'HbAppShell', blurb: 'the full height tool layout' },
      { name: 'HbHeader', blurb: 'light 52 px bar; ink for brand pages' },
      { name: 'HbActivity', blurb: 'what the app waits on, a 2 px line' },
      { name: 'HbPills', blurb: 'one status pill per subsystem' },
      { name: 'HbSuiteNav', blurb: 'groups and tools, a sheet on a phone' },
      { name: 'HbWorkspaceMenu', blurb: 'workspace actions and the level' },
      { name: 'HbSettingsForm', blurb: 'sections from a schema, reset, levels' },
      { name: 'HbPalette', blurb: 'commands on / and ctrl+k' },
      { name: 'HbKeyMap', blurb: 'the hotkey table, printed' },
      { name: 'HbToolbar', blurb: 'verbs and global settings' },
      { name: 'HbHow', blurb: 'packages, install, code, links in a fold' },
    ],
  },
  {
    category: 'shared: controls',
    entries: [
      { name: 'HbButton', blurb: 'ink fill, pink on hover, presses down' },
      { name: 'HbCheckbox', blurb: 'native check, pink accent' },
      { name: 'HbChip', blurb: 'filter and multi select toggle' },
      { name: 'HbChipGroup', blurb: 'one or several on, a distinct off' },
      { name: 'HbDial', blurb: 'the one giant readout per tool' },
      { name: 'HbDropdown', blurb: 'action menu under a trigger' },
      { name: 'HbField', blurb: 'label, control, hint or error' },
      { name: 'HbInput', blurb: 'text input on raised paper' },
      { name: 'HbRadio', blurb: 'native radio, or a card with a trade line' },
      { name: 'HbSeg', blurb: 'segmented mode switch' },
      { name: 'HbSelect', blurb: 'native select, system dressed' },
      { name: 'HbSendTo', blurb: 'send a result to another tool, with reasons' },
      { name: 'HbSlider', blurb: 'label, track, live value' },
      { name: 'HbSwitch', blurb: 'rectangular toggle, knob slides' },
      { name: 'HbTextarea', blurb: 'multiline input' },
      { name: 'HbToggleRow', blurb: 'label, why and switch as one target' },
      { name: 'HbTile', blurb: 'preset tap target, 96 px minimum' },
      { name: 'HbTiles', blurb: 'a grid of tiles, one chosen' },
    ],
  },
  {
    category: 'shared: surfaces, data and feedback',
    entries: [
      { name: 'HbPanel', blurb: 'raised paper with the block shadow' },
      { name: 'HbStage', blurb: 'the void, where the machine draws' },
      { name: 'HbFold', blurb: 'disclosure for fiddly controls' },
      { name: 'HbCallout', blurb: 'pink left rule, one or two per page' },
      { name: 'HbEmptyState', blurb: 'dashed well that says what to do' },
      { name: 'HbKv', blurb: 'label left, readout right' },
      { name: 'HbList', blurb: 'bordered stack of rows' },
      { name: 'HbRow', blurb: 'list row, fills pink when active' },
      { name: 'HbTable', blurb: 'ink head, stripes, pink wash on hover' },
      { name: 'HbTag', blurb: 'static VT323 tag on a plate' },
      { name: 'HbPill', blurb: 'status with a leading dot' },
      { name: 'HbMeter', blurb: 'pink fill on an ink track' },
      { name: 'HbProgress', blurb: 'summed bar, phase words, file rows' },
      { name: 'HbLicence', blurb: 'licence as recorded, optional' },
      { name: 'HbStatusLine', blurb: 'one sentence, the failure named' },
      { name: 'HbVerdict', blurb: 'pass, fail, warn, not run, running' },
      { name: 'HbChecks', blurb: 'checks with verdict, figure and reason' },
      { name: 'HbCodeBlock', blurb: 'code on ink with copy and wrap' },
      { name: 'HbKbd', blurb: 'keyboard hint' },
      { name: 'HbIcon', blurb: 'font awesome solid, baked in' },
      { name: 'HbDrawer', blurb: 'panel sliding from an edge' },
      { name: 'HbModal', blurb: 'centered panel over a scrim' },
      { name: 'HbToaster', blurb: 'one toast at a time, errors held' },
      { name: 'HbSpinner', blurb: 'three segments blinking in order' },
      { name: 'HbSkeleton', blurb: 'breathing block while loading' },
      { name: 'HbPagination', blurb: 'page chips, current one pink' },
    ],
  },
  {
    category: 'shared: brand pages',
    entries: [
      { name: 'HbMark', blurb: 'the canonical two-path mark' },
      { name: 'HbWordmark', blurb: 'hack in ink, dot and build in pink' },
      { name: 'HbShell', blurb: 'centered content column' },
      { name: 'HbNav', blurb: 'page nav with drawer collapse' },
      { name: 'HbHero', blurb: 'kicker, marker headline, one pink action' },
      { name: 'HbSectionHead', blurb: 'kicker, title, quiet link right' },
      { name: 'HbFooter', blurb: 'ink footer with columns and stamp' },
      { name: 'HbCta', blurb: 'closing ink band, caution stripes' },
      { name: 'HbCover', blurb: 'seeded placeholder for empty plates' },
      { name: 'HbMediaCard', blurb: 'media plate, tags, quiet links' },
      { name: 'HbVideoFrame', blurb: 'pink framed embed on the void' },
      { name: 'HbPlaylist', blurb: 'player beside a numbered track list' },
      { name: 'HbPlaque', blurb: 'award plaque with a pinned diamond' },
      { name: 'HbTimeline', blurb: 'left rule entries: jobs, releases' },
      { name: 'HbTimelineItem', blurb: 'title, sub line, period, body' },
      { name: 'HbStat', blurb: 'the big VT323 figure with a label' },
      { name: 'HbSticker', blurb: 'rotated hand lettered tag' },
      { name: 'HbCountdown', blurb: 'ticking blocks on ink plates' },
      { name: 'HbVerified', blurb: 'pink check next to a name' },
      { name: 'HbAvatar', blurb: 'seeded little people on plates' },
      { name: 'HbDots', blurb: 'square pips: difficulty, skill' },
    ],
  },
  {
    category: 'deprecated in 0.10.0, gone in 0.11.0',
    entries: [
      { name: 'HbActions', blurb: 'a row of verbs that wraps' },
      { name: 'HbCard', blurb: 'panel that lifts when interactive' },
      { name: 'HbCustomModelForm', blurb: 'your own weights, checked before fetch' },
      { name: 'HbEngineBar', blurb: 'the picker shrunk to one line' },
      { name: 'HbHash', blurb: 'sha-256 against the known hash, copy mark' },
      { name: 'HbLoader', blurb: 'load panel that names the size' },
      { name: 'HbMethodCard', blurb: 'a method with its trade, time, quality, size and fallback' },
      { name: 'HbModelList', blurb: 'grouped catalogue, fit chip, row state' },
      { name: 'HbModelRack', blurb: 'slots by job, presets with their total' },
      { name: 'HbModelSlot', blurb: 'one organ: select, load, bar, status' },
      { name: 'HbPresetChips', blurb: 'one press sets every dial' },
      { name: 'HbReadouts', blurb: 'label to figure rows, source in the label' },
      { name: 'HbReasons', blurb: 'defaults with the reason for each' },
      { name: 'HbSegMeter', blurb: 'segmented signal meter' },
      { name: 'HbStageOverlay', blurb: 'the stage with four corners and a centre' },
      { name: 'HbWakeGate', blurb: 'one row per subsystem, wake and no voice' },
      { name: 'HbCapabilities', blurb: 'what this machine can turn on, and how fast' },
      { name: 'HbModelManager', blurb: 'the drawer: machine, rack, catalogue, stored' },
      { name: 'HbNum', blurb: 'circular section badge' },
      { name: 'HbStatusBar', blurb: 'figures strip, priority cells, one button form' },
      { name: 'HbTierCards', blurb: 'engine tiers by cost and privacy' },
    ],
  },
]

export const allEntries: RegistryEntry[] = registry.flatMap((group) => group.entries)

const demoModules = import.meta.glob('./demos/*.vue')

export function demoLoader(name: string) {
  return demoModules[`./demos/${name}Demo.vue`]
}
