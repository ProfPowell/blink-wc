# &lt;blink-wc&gt;

The `<blink>` tag reborn for 2026. A modern, accessible, themeable web component
for blinking content — from a buzzing neon sign to a green CRT terminal, a
flashing alert, a string blinked out in Morse code, or (yes) an annoying retro
web effect.

**[Live demo &amp; docs →](https://profpowell.github.io/blink-wc/)** — open the theme
picker and watch the themed blinks re-skin with Vanilla Breeze in real time.

> **A note on accessibility.** Blinking and flashing content is a genuine
> accessibility hazard (and the original `<blink>` was deprecated for good
> reason). `<blink-wc>` takes this seriously: it **stops entirely** under
> `prefers-reduced-motion`, is always pausable, and pauses when off-screen or in
> a hidden tab. Use it tastefully — and never for fast, full-screen strobing.

## Features

- Zero dependencies — pure vanilla JavaScript, light DOM
- CSS-driven blink with three behaviors (`blink`, `pulse`, `flicker`)
- Configurable `rate`, `min-opacity`, and `count` (finite blinks then stop)
- Surface themes and per-unit motion modes (see Modes below)
- A `morse` mode that blinks the text out in International Morse code
- Pauses when offscreen (IntersectionObserver) and when the tab is hidden (Page Visibility)
- Respects `prefers-reduced-motion` — stops, and shows the text fully
- Legacy-compatible API: `start()`, `stop()`, `toggle()`
- Custom events: `blink-start`, `blink-pause`, `blink-cycle`
- Built-in themes and full CSS custom property theming
- Vanilla Breeze design-token aware
- TypeScript definitions included

## Installation

```bash
npm install @profpowell/blink-wc
```

Or use via CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/@profpowell/blink-wc/dist/blink-wc.css" />
<script type="module" src="https://unpkg.com/@profpowell/blink-wc/dist/blink-wc.js"></script>
```

The component renders in the light DOM, so its stylesheet must be present on the
page (link the CSS, or `import '@profpowell/blink-wc/style.css'` in a bundler).

## Usage

```html
<link rel="stylesheet" href="dist/blink-wc.css" />
<script type="module" src="dist/blink-wc.js"></script>

<blink-wc>Now you see me…</blink-wc>
```

## Attributes

| Attribute        | Type    | Default    | Description                                           |
| ---------------- | ------- | ---------- | ----------------------------------------------------- |
| `rate`           | time    | `1s`       | CSS time for one blink cycle                          |
| `behavior`       | string  | `blink`    | `blink` \| `pulse` \| `flicker`                       |
| `min-opacity`    | number  | per-mode   | Opacity of the "off" phase (0–1)                      |
| `count`          | number  | `infinite` | Number of blinks, then stop                           |
| `pause-on-hover` | boolean | —          | Also pauses on `:focus-within`                        |
| `play-state`     | string  | `running`  | `running` \| `paused`                                 |
| `reduced-motion` | string  | `respect`  | `respect` \| `ignore`                                 |
| `mode`           | string  | —          | A visual/motion preset (see Modes below)              |
| `unit`           | string  | `letter`   | `letter` \| `word` — granularity for the motion modes |

## Modes

The `mode` attribute selects a preset. **Surface themes** style the container;
**per-unit motion modes** animate each letter (or word, with `unit="word"`); and
`morse` blinks the text out as code.

### Surface themes

| Mode       | Description                                              |
| ---------- | -------------------------------------------------------- |
| `neon`     | A buzzing neon sign that flickers on with a colored glow |
| `crt`      | Green phosphor terminal glow over faint scanlines        |
| `terminal` | Steady text with a blinking block cursor                 |
| `warning`  | Amber hazard panel that blinks for attention             |
| `alert`    | A flashing red error banner                              |
| `police`   | Alternating red/blue light bar                           |
| `vegas`    | A glowing gold marquee sign                              |

### Per-unit motion modes

These split the text into per-unit spans and animate each one with a staggered
delay, so the effect ripples across the text. With `unit="word"` the units are
whole words. They honor `prefers-reduced-motion`.

| Mode         | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| `wave`       | A hard blink that travels across the units, one after another  |
| `twinkle`    | Every unit blinks on its own random clock, like stars          |
| `sparkle`    | Twinkle with a glinting scale + glow                           |
| `rainbow`    | Each unit a hue of the spectrum, blinking as the colors cycle  |
| `chase`      | A single lit unit sweeps along, theater-marquee style          |
| `glitch`     | Units blink while jittering with a chromatic-aberration shadow |
| `cascade`    | A soft fade pulse rippling unit-to-unit                        |
| `typewriter` | Units appear one by one, with a blinking caret at the end      |

### Morse

| Mode    | Description                                                              |
| ------- | ------------------------------------------------------------------------ |
| `morse` | Blinks the text out as International Morse code, with a dot/dash caption |

## API

```javascript
const el = document.querySelector('blink-wc');

el.start(); // play-state="running"
el.stop(); // play-state="paused"
el.toggle(); // flip between the two
el.refresh(); // re-render content after a dynamic change

el.rate; // '1s'  (readonly)
el.behavior; // 'blink' | 'pulse' | 'flicker'  (readonly)
el.playState; // 'running' | 'paused'  (readonly)
el.mode; // active mode preset, e.g. 'neon' | 'morse' | ''  (readonly)
```

Set attributes to change configuration (`el.setAttribute('rate', '0.5s')`); the
component reacts to attribute changes automatically.

## Events

```javascript
el.addEventListener('blink-start', () => console.log('running'));
el.addEventListener('blink-pause', () => console.log('paused'));
el.addEventListener('blink-cycle', () => console.log('one blink completed'));
```

All events bubble.

## CSS Custom Properties

```css
blink-wc {
  --blink-rate: 1s; /* duration of one cycle (also set via the `rate` attr) */
  --blink-min-opacity: 0; /* opacity of the "off" phase */
  --blink-stagger: 0.08s; /* per-unit delay step for letter modes */
  --blink-dot: 170; /* Morse dot unit, in ms */
  --blink-bg: …; /* themed-variant background */
  --blink-fg: …; /* themed-variant foreground */
}
```

## Using with Vanilla Breeze

`<blink-wc>` reads Vanilla Breeze design tokens (`--color-accent`,
`--color-error`, `--color-warning`, `--color-success`, `--font-mono`,
`--font-sans`, `--radius-m`, …) through layered `var()` fallbacks. A `--blink-*`
override always wins; absent that, a VB token is used; absent that, a built-in
default applies. Apply a VB theme to the page and the themed variants inherit it
automatically:

```html
<html data-theme="…">
  <blink-wc mode="neon">Reads --color-accent</blink-wc>
</html>
```

No configuration is required, and pages without Vanilla Breeze render via the
built-in fallbacks.

## Accessibility

- `prefers-reduced-motion: reduce` halts all animation and shows the text fully,
  unless you explicitly set `reduced-motion="ignore"`.
- The blink pauses when off-screen and when the tab is hidden.
- `pause-on-hover` also pauses on keyboard focus (`:focus-within`).
- Avoid fast, large-area blinking, which can trigger photosensitive seizures
  (keep flashes below ~3 Hz and small).

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (open /demo.html or /test/test-page.html)
npm run build        # Build dist/ (ES module + CSS)
npm run test         # Run Playwright tests
npm run lint         # Lint src/
npm run format       # Format with Prettier
npm run analyze      # Regenerate custom-elements.json
```

The documentation site lives in `docs/` (served via GitHub Pages). It loads
Vanilla Breeze and its `<theme-picker>` from a CDN to demonstrate the theme
integration live. `npm run build` refreshes the component copy in `docs/`.

## License

MIT
