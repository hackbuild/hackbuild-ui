// hack.build UI. Import a stylesheet alongside these components:
//   import '@hackbuild/ui/styles.css'
// Optionally the fonts and the Tailwind v4 bridge:
//   import '@hackbuild/ui/fonts.css'
//   @import '@hackbuild/ui/theme.css'  (in the app css, after tailwindcss)

// brand
export { default as HbMark } from './components/HbMark.vue'
export { default as HbWordmark } from './components/HbWordmark.vue'
export * from './brand/mark'

// chrome
export { default as HbHeader } from './components/HbHeader.vue'
export { default as HbTabs } from './components/HbTabs.vue'
export { default as HbToolbar } from './components/HbToolbar.vue'
export { default as HbStatusBar } from './components/HbStatusBar.vue'
export { default as HbAppShell } from './components/HbAppShell.vue'
export { default as HbShell } from './components/HbShell.vue'

// surfaces
export { default as HbPanel } from './components/HbPanel.vue'
export { default as HbCard } from './components/HbCard.vue'
export { default as HbStage } from './components/HbStage.vue'
export { default as HbCallout } from './components/HbCallout.vue'
export { default as HbFold } from './components/HbFold.vue'
export { default as HbSticker } from './components/HbSticker.vue'
export { default as HbNum } from './components/HbNum.vue'

// controls
export { default as HbButton } from './components/HbButton.vue'
export { default as HbChip } from './components/HbChip.vue'
export { default as HbSeg } from './components/HbSeg.vue'
export { default as HbInput } from './components/HbInput.vue'
export { default as HbTextarea } from './components/HbTextarea.vue'
export { default as HbSelect } from './components/HbSelect.vue'
export { default as HbCheckbox } from './components/HbCheckbox.vue'
export { default as HbRadio } from './components/HbRadio.vue'
export { default as HbSwitch } from './components/HbSwitch.vue'
export { default as HbField } from './components/HbField.vue'
export { default as HbSlider } from './components/HbSlider.vue'
export { default as HbDropdown } from './components/HbDropdown.vue'

// data
export { default as HbKv } from './components/HbKv.vue'
export { default as HbTable } from './components/HbTable.vue'
export { default as HbList } from './components/HbList.vue'
export { default as HbRow } from './components/HbRow.vue'
export { default as HbPill } from './components/HbPill.vue'
export { default as HbMeter } from './components/HbMeter.vue'
export { default as HbSegMeter } from './components/HbSegMeter.vue'
export { default as HbConsole } from './components/HbConsole.vue'
export { default as HbDial } from './components/HbDial.vue'
export { default as HbTiles } from './components/HbTiles.vue'
export { default as HbTile } from './components/HbTile.vue'
export { default as HbAvatar } from './components/HbAvatar.vue'
export { default as HbKbd } from './components/HbKbd.vue'

// feedback
export { default as HbModal } from './components/HbModal.vue'
export { default as HbDrawer } from './components/HbDrawer.vue'
export { default as HbToaster } from './components/HbToaster.vue'
export { default as HbSpinner } from './components/HbSpinner.vue'
export { default as HbSkeleton } from './components/HbSkeleton.vue'
export { default as HbEmptyState } from './components/HbEmptyState.vue'
export { default as HbPagination } from './components/HbPagination.vue'

// composables and utilities
export { useToast } from './composables/useToast'
export { cx } from './utils/cx'

// types
export type { ClassValue } from './utils/cx'
export type { ToastState } from './composables/useToast'
export type { HbSelectOption } from './components/HbSelect.vue'
export type { HbSegOption } from './components/HbSeg.vue'
export type { HbTabOption } from './components/HbTabs.vue'
export type { HbDropdownItem } from './components/HbDropdown.vue'
export type { HbTableColumn } from './components/HbTable.vue'
export type { HbConsoleLine } from './components/HbConsole.vue'
