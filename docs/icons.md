# Icons

The icon language is Font Awesome 6 solid. It always has been: the resume,
the mockups and the app all speak it. The library bakes the real glyphs in
as path data, so `HbIcon` renders the exact same chunky filled icons with
no CDN and no runtime dependency.

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
| `name` | `IconName` | | required, solid or brand name |
| `size` | `number \| string` | `16` | height; width follows the glyph aspect |
| `label` | `string` | | accessible name. Without it the icon is `aria-hidden` |

## The shipped names

Solid, by group:

| Group | Names |
|---|---|
| arrows | arrow-right, arrow-left, arrow-up, arrow-down, external, link |
| actions | plus, minus, x, check, search, copy, trash, pen, download, upload, filter, refresh, power, grip, share |
| state | eye, heart, star, bookmark, lock, warning, info, question, bell |
| people | user, users, comment, envelope |
| things | wrench, screwdriver-wrench, hammer, gear, bolt, cube, microchip, robot, plug, folder, book, newspaper, image, video, display, printer, lightbulb, flame, rocket, gamepad, palette, layer-group |
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
