# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-05-27

### Added

- **Multi-step engine** (`behavior="steps"`) — instead of a single on/off
  toggle, the blink advances through `N` discrete steps across one cycle, and
  each step is its own CSS state (colour, transform, outline, glow — anything).
  A plain blink is simply the 2-step case. The `steps` attribute sets the count
  (min 2). Driven by a `requestAnimationFrame` loop that freezes when paused/
  off-screen/tab-hidden and rests at step 0 under `prefers-reduced-motion`.
  Authors style their own steps with `blink-wc[data-step='K'] .blink-content`.
- **`--blink-step-ease`** — controls the transition _between_ steps: `0s`
  (default) is a hard cut (true blink); a non-zero value morphs smoothly.
- **Four step-based preset modes:**
  - `extrude` — an isometric 3D block that punches toward you on-beat (a growing
    stack of offset text-shadows plus a scale).
  - `collapse` — the text squashes flat, then pops back up.
  - `outline` — alternates between a solid fill and a hollow `-webkit-text-stroke`.
  - `morph` — a 4-step showcase, each step its own colour and transform.
- `steps` getter and `'steps'` added to the `BlinkBehavior` type; the new modes
  added to `BlinkMode`.

## [1.0.0] — 2026-05-27

### Added

- Initial release of `<blink-wc>` (class `BlinkWc`) — the deprecated `<blink>`
  element reborn for 2026: light DOM, CSS-driven, themeable, and accessible.
- **Three core behaviors:** `blink` (classic hard on/off), `pulse` (a soft
  breathing fade), and `flicker` (irregular, mostly-on flutter).
- **Configuration attributes:** `rate` (CSS time per cycle), `min-opacity` (the
  "off" opacity), `count` (finite blinks then stop), `pause-on-hover`,
  `play-state`, and `reduced-motion`.
- **Surface themes** (`mode`): `neon`, `crt`, `terminal` (blinking block
  cursor), `warning`, `alert`, `police` (alternating red/blue), and `vegas`.
- **Per-unit motion modes:** `wave`, `twinkle`, `sparkle`, `rainbow`, `chase`,
  `glitch`, `cascade`, and `typewriter` — they split the text into per-character
  spans (or whole words with `unit="word"`) and animate each with a staggered
  delay.
- **`morse` mode** — blinks the text out as International Morse code, driven by a
  small `requestAnimationFrame` loop that freezes when paused/off-screen/
  tab-hidden, and shows the dot/dash transcription as a caption.
- **Accessibility-first defaults.** Blinking content is a genuine hazard, so all
  animation stops under `prefers-reduced-motion: reduce` (text shown fully)
  unless you set `reduced-motion="ignore"`; everything is pausable; and blinks
  pause when the element is off-screen (IntersectionObserver) or the tab is
  hidden (Page Visibility).
- **Legacy-compatible API:** `start()`, `stop()`, `toggle()`, plus `refresh()`.
- **Custom events:** `blink-start`, `blink-pause`, and `blink-cycle`.
- **Vanilla Breeze theme awareness.** Themed variants read VB design tokens
  (`--color-accent`, `--color-error`, `--color-warning`, `--color-success`,
  `--font-mono`, `--font-sans`, `--radius-m`, …) through layered `var()`
  fallbacks. A `--blink-*` override always wins; pages without VB render
  identically via built-in defaults.
- **Project tooling** matching the sibling vanilla web components: Vite build
  (ES module output), ESLint, Prettier, Playwright tests, and a Custom Elements
  Manifest.
- **TypeScript declarations** (`blink-wc.d.ts`) for attributes, getters,
  methods, and the custom event map.
- **GitHub Pages documentation site** under `docs/` (home, demos, API). It loads
  Vanilla Breeze and its `<theme-picker>` from a CDN so visitors can switch
  themes and watch every themed blink re-skin live.

### Notes

- Component renders in the light DOM; its stylesheet (`dist/blink-wc.css`) must
  be present on the page.
