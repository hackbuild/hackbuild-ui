# Icons

App chrome and tool panels draw the square cap stroke set: lines on a 24
grid, `stroke: currentColor`, square caps, mitre joins, one width from
`--hb-border`. Sixteen drawings are FERRULE's and ARBOR's own. Marketing
and prose surfaces keep Font Awesome 6 solid, baked in as path data, with
no CDN and no runtime dependency. Every icon is on the docs page `#/icons`.

```vue
<HbIcon name="trash" />                <!-- stroke set -->
<HbIcon name="trophy" set="solid" />   <!-- Font Awesome solid -->
<HbIcon name="fa-solid fa-house" />    <!-- a Font Awesome class still renders -->
```

```js
import { strokeIcon, strokeIconEl } from '@virgilvox/hackbuild-ui/vanilla'
button.innerHTML = strokeIcon('gear', { size: 16 }) + 'settings'
button.prepend(strokeIconEl('x', { label: 'close' }))
```

`set` is `auto` by default: the stroke drawing when the set has the name,
else the solid glyph. `stroke` draws the stroke drawing or nothing; `solid`
keeps Font Awesome. A class string draws the baked solid glyph when there is
one, else an `<i>` with those classes for the page's own Font Awesome.

One rule above all: never emoji, and never an icon where a two-word label
is clearer.

## HbIcon

```vue
<HbIcon name="wrench" />
<HbIcon name="bolt" :size="24" />
<HbIcon name="github" />
<HbIcon name="record" label="recording" />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `HbIconName \| string` | | required: a stroke, solid or brand name, or a Font Awesome class string |
| `set` | `'auto' \| 'stroke' \| 'solid'` | `'auto'` | which set draws the name |
| `size` | `number \| string` | `16` | height; width follows the glyph aspect |
| `label` | `string` | | accessible name. Without it the icon is `aria-hidden` |

## The shipped names

Solid, by group:

| Group | Names |
|---|---|
| arrows | arrow-right, arrow-left, arrow-up, arrow-down, external, link |
| actions | plus, minus, x, check, search, copy, trash, pen, download, upload, filter, refresh, power, grip, share |
| bench verbs | undo, redo, folder-open, floppy-disk |
| state | eye, heart, star, bookmark, lock, warning, info, question, bell |
| people | user, users, comment, envelope |
| things | wrench, screwdriver-wrench, hammer, gear, bolt, cube, microchip, robot, plug, folder, book, newspaper, image, video, video-slash, camera, microphone, microphone-slash, file-arrow-up, paper-plane, shield-halved, fingerprint, display, printer, lightbulb, flame, rocket, gamepad, palette, layer-group |
| minds | paw, brain, code-branch, thumbtack, wind |
| recognition | trophy, medal, certificate, graduation-cap |
| instruments | code, terminal, wave, signal, globe, play, circle-play, pause, record, backward, forward, repeat, rss, list-check |
| time and place | clock, calendar, pin, menu, sun, wand |

Brands: github, youtube, x-twitter, mastodon, bluesky, discord, instagram,
linkedin, twitch, dev.

The registry exports `icons`, `brandIcons`, `iconNames`, `brandIconNames`
and `iconDef(name)` for building galleries and pickers.

## Usage patterns

The patterns every shipped page converged on:

- Icons lead labels in buttons: `<HbButton><template #icon><HbIcon name="plug" /></template>connect</HbButton>`.
- Icon-only actions use the square icon button, `.hb-iconbtn`, and always
  carry an `aria-label`. On ink surfaces and in footers it goes ghost
  automatically.
- Footers and contact rows use the brand glyphs.
- Decorative icons pass no `label` so they stay out of the accessibility
  tree.
- No icons in running prose.

## Growing the set

The registry is generated, never edited by hand:

```sh
npm run gen:icons
```

Add a mapping in `scripts/gen-icons.mjs` (our stable name to the Font
Awesome export) and regenerate. The Font Awesome packages are dev
dependencies only; nothing ships at runtime except the baked path data.

License: icons are Font Awesome Free, CC BY 4.0, fontawesome.com/license/free.
The generated file carries the attribution header.
