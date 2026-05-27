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

| Attribute        | Type    | Default    | Description                                                        |
| ---------------- | ------- | ---------- | ------------------------------------------------------------------ |
| `rate`           | time    | `1s`       | CSS time for one blink cycle                                       |
| `behavior`       | string  | `blink`    | `blink` \| `pulse` \| `flicker` \| `steps`                         |
| `min-opacity`    | number  | per-mode   | Opacity of the "off" phase (0–1)                                   |
| `count`          | number  | `infinite` | Number of blinks, then stop                                        |
| `steps`          | number  | `2`        | Step count for the multi-step engine (min 2)                       |
| `step-durations` | list    | equal      | Per-step hold weights, e.g. `3 1 1`                                |
| `step-by`        | string  | `element`  | `element` \| `letter` \| `word` — step the whole text or each unit |
| `pause-on-hover` | boolean | —          | Also pauses on `:focus-within`                                     |
| `play-state`     | string  | `running`  | `running` \| `paused`                                              |
| `reduced-motion` | string  | `respect`  | `respect` \| `ignore`                                              |
| `mode`           | string  | —          | A visual/motion preset (see Modes below)                           |
| `unit`           | string  | `letter`   | `letter` \| `word` — granularity for the motion modes              |

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
| `zoom`       | Each letter swells toward you and fades, in a staggered ripple |
| `flip3d`     | Split-flap board — each letter tumbles a full turn on X        |
| `swing`      | Letters dangle and swing like pendulums                        |
| `shake`      | A nervous jitter with a blink, slightly out of phase           |
| `heartbeat`  | A double-thump scale pulse rippling across the letters         |

### Morse &amp; decode

These are JS-driven (a small `requestAnimationFrame` loop); both freeze when
paused/off-screen/tab-hidden and fall back to plain text under reduced motion.

| Mode     | Description                                                              |
| -------- | ------------------------------------------------------------------------ |
| `morse`  | Blinks the text out as International Morse code, with a dot/dash caption |
| `decode` | Units flicker through random glyphs, then lock onto the real text        |

### Step modes

These ride the multi-step engine (see below). Each step of the cycle is its own
style state, and `--blink-step-ease` morphs smoothly between them.

| Mode       | Description                                                   |
| ---------- | ------------------------------------------------------------- |
| `extrude`  | An isometric 3D block that punches toward you on-beat         |
| `collapse` | The text squashes flat, then pops back up                     |
| `outline`  | Alternates between a solid fill and a hollow outline          |
| `morph`    | A 4-step showcase — each step its own colour and transform    |
| `depth`    | A true-3D `translateZ` punch toward the viewer                |
| `revolve`  | A 4-step turn on the Y axis that flips to the back and around |

## The multi-step engine

A blink doesn't have to be a single on/off toggle. With `behavior="steps"` (or
any step mode above), the component advances through `N` discrete **steps**
across one `rate` cycle, setting `data-step="0"`…`data-step="N-1"` in turn. Each
step is just a CSS state, so it can change colour, transform, outline, glow —
anything. A plain blink is simply the 2-step case.

```html
<link rel="stylesheet" href="blink-wc.css" />
<script type="module" src="blink-wc.js"></script>

<style>
  /* a custom 3-step traffic light */
  blink-wc.light {
    --blink-step-ease: 0.15s;
  }
  blink-wc.light[data-step='0'] .blink-content {
    color: oklch(62% 0.2 25);
  }
  blink-wc.light[data-step='1'] .blink-content {
    color: oklch(80% 0.16 85);
  }
  blink-wc.light[data-step='2'] .blink-content {
    color: oklch(70% 0.18 145);
  }
</style>

<!-- green holds 6×, yellow 1×, red 4× of the 11s cycle -->
<blink-wc class="light" behavior="steps" steps="3" step-durations="6 1 4" rate="11s">●</blink-wc>
```

### Timing per step

- **`step-durations`** sets how long each step _holds_, as a list of weights
  (`"6 1 4"`); they're normalized across the `rate` cycle. Omit it for equal
  slices. The list is cycled/truncated to fit the step count.
- **`--blink-step-ease`** is the transition _duration_ between steps: `0s`
  (default) is a hard cut — a true blink; non-zero morphs smoothly.
- **`--blink-step-timing`** is the transition _timing-function_ (default `ease`).

`--blink-step-ease` and `--blink-step-timing` are read from the **incoming**
step's computed style, so each step can carry its own duration and easing. The
stepped element carries `data-step` (the `.blink-content`, or each `.blink-char`
when stepping per unit), so target your steps with
`blink-wc :is(.blink-content, .blink-char)[data-step='K']`:

```css
/* step 2 eases in slowly with a bounce; the others snap */
blink-wc.light :is(.blink-content, .blink-char)[data-step='2'] {
  --blink-step-ease: 0.5s;
  --blink-step-timing: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Per-letter sequences

By default the whole text steps together. Set **`step-by="letter"`** (or
`"word"`) and every unit runs the sequence offset by its index (by
`--blink-stagger`), so the states **ripple** across the text — a wave of colour,
depth, or transform. It works with the built-in step modes and your own:

```html
<blink-wc mode="depth" step-by="letter" rate="0.6s">RIPPLE</blink-wc>
```

The step driver freezes when paused, off-screen, or in a hidden tab, and rests
at step 0 under `prefers-reduced-motion`.

## API

```javascript
const el = document.querySelector('blink-wc');

el.start(); // play-state="running"
el.stop(); // play-state="paused"
el.toggle(); // flip between the two
el.refresh(); // re-render content after a dynamic change

el.rate; // '1s'  (readonly)
el.behavior; // 'blink' | 'pulse' | 'flicker' | 'steps'  (readonly)
el.steps; // number of steps in the multi-step engine  (readonly)
el.playState; // 'running' | 'paused'  (readonly)
el.mode; // active mode preset, e.g. 'neon' | 'morse' | 'extrude' | ''  (readonly)
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
  --blink-step-ease: 0s; /* transition between steps (0 = hard cut) */
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
