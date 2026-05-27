/**
 * <blink-wc> — the deprecated <blink> element, reborn for 2026. A modern,
 * accessible, themeable web component for blinking content. Light DOM,
 * CSS-driven, and Vanilla Breeze design-token aware.
 */

export type BlinkBehavior = 'blink' | 'pulse' | 'flicker' | 'steps';
export type BlinkPlayState = 'running' | 'paused';
export type BlinkReducedMotion = 'respect' | 'ignore';

/**
 * Visual/motion preset. Surface themes style the container; letter modes split
 * the text and animate each unit; `morse` blinks the text out in code; the
 * step modes (`extrude`, `collapse`, `outline`, `morph`) ride the multi-step
 * engine, giving each step of the cycle its own style.
 */
export type BlinkMode =
  | ''
  | 'neon'
  | 'crt'
  | 'terminal'
  | 'warning'
  | 'alert'
  | 'police'
  | 'vegas'
  | 'morse'
  | 'wave'
  | 'twinkle'
  | 'sparkle'
  | 'rainbow'
  | 'chase'
  | 'glitch'
  | 'cascade'
  | 'typewriter'
  | 'zoom'
  | 'flip3d'
  | 'swing'
  | 'shake'
  | 'heartbeat'
  | 'decode'
  | 'extrude'
  | 'collapse'
  | 'outline'
  | 'morph'
  | 'depth'
  | 'revolve';

/** Granularity for the per-unit motion modes. */
export type BlinkUnit = 'letter' | 'word';

export interface BlinkWcEventMap {
  'blink-start': CustomEvent<void>;
  'blink-pause': CustomEvent<void>;
  'blink-cycle': CustomEvent<void>;
}

export declare class BlinkWc extends HTMLElement {
  static get observedAttributes(): string[];

  /** Duration of one blink cycle, as a CSS time. Attribute: `rate`. Default `1s`. */
  get rate(): string;
  /** Blink style. Attribute: `behavior`. Default `blink`. */
  get behavior(): BlinkBehavior;
  /** Opacity of the "off" phase (0–1), or `null` when unset. Attribute: `min-opacity`. */
  get minOpacity(): string | null;
  /** Iteration count, or `infinite`. Attribute: `count`. Default `infinite`. */
  get count(): string;
  /** Number of steps in the multi-step engine (min 2). Attribute: `steps`. */
  get steps(): number;
  /** Playback state. Attribute: `play-state`. Default `running`. */
  get playState(): BlinkPlayState;
  /** Active visual/motion preset. Attribute: `mode`. Default `''` (none). */
  get mode(): BlinkMode;
  /** Granularity for the motion modes. Attribute: `unit`. Default `letter`. */
  get unit(): BlinkUnit;

  /** Start blinking (sets `play-state="running"`). */
  start(): void;
  /** Stop blinking (sets `play-state="paused"`). */
  stop(): void;
  /** Toggle between running and paused. */
  toggle(): void;
  /** Re-render content and recompute (call after dynamic content changes). */
  refresh(): void;

  connectedCallback(): void;
  disconnectedCallback(): void;
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;

  addEventListener<K extends keyof BlinkWcEventMap>(
    type: K,
    listener: (this: BlinkWc, ev: BlinkWcEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'blink-wc': BlinkWc;
  }
}
