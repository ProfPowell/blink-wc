const y = [
  "wave",
  "twinkle",
  "sparkle",
  "rainbow",
  "chase",
  "glitch",
  "cascade",
  "typewriter",
  "zoom",
  "flip3d",
  "swing",
  "shake",
  "heartbeat",
  "decode"
], A = ["extrude", "collapse", "outline", "morph", "depth", "revolve"], k = { morph: 4, revolve: 4 }, g = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=?<>/~^|", b = {
  a: ".-",
  b: "-...",
  c: "-.-.",
  d: "-..",
  e: ".",
  f: "..-.",
  g: "--.",
  h: "....",
  i: "..",
  j: ".---",
  k: "-.-",
  l: ".-..",
  m: "--",
  n: "-.",
  o: "---",
  p: ".--.",
  q: "--.-",
  r: ".-.",
  s: "...",
  t: "-",
  u: "..-",
  v: "...-",
  w: ".--",
  x: "-..-",
  y: "-.--",
  z: "--..",
  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  "@": ".--.-."
};
class v extends HTMLElement {
  static get observedAttributes() {
    return [
      "rate",
      "behavior",
      "min-opacity",
      "count",
      "steps",
      "step-durations",
      "play-state",
      "pause-on-hover",
      "reduced-motion",
      "mode",
      "unit"
    ];
  }
  // ── Functional core: pure getters ──────────────────────────────────────
  get rate() {
    return this.getAttribute("rate") || "1s";
  }
  get behavior() {
    const t = this.getAttribute("behavior");
    return ["pulse", "flicker", "steps"].includes(t) ? t : "blink";
  }
  get minOpacity() {
    const t = this.getAttribute("min-opacity");
    return t == null || t === "" ? null : t;
  }
  get count() {
    return this.getAttribute("count") || "infinite";
  }
  get steps() {
    const t = parseInt(this.getAttribute("steps"), 10);
    return Number.isFinite(t) && t >= 2 ? t : k[this.mode] || 2;
  }
  get stepDurations() {
    return this.getAttribute("step-durations") || null;
  }
  get playState() {
    return this.getAttribute("play-state") || "running";
  }
  get mode() {
    return this.getAttribute("mode") || "";
  }
  get unit() {
    return this.getAttribute("unit") === "word" ? "word" : "letter";
  }
  // ── Imperative shell ───────────────────────────────────────────────────
  connectedCallback() {
    this._built || (this._build(), this._observe(), this._update(), this._built = !0, this._dispatch("blink-start"));
  }
  disconnectedCallback() {
    var t, e;
    (t = this._intersectionObserver) == null || t.disconnect(), (e = this._content) == null || e.removeEventListener("animationiteration", this._onIteration), document.removeEventListener("visibilitychange", this._onVisibility), this._stopMorse(), this._stopSteps(), this._stopDecode();
  }
  attributeChangedCallback(t, e, s) {
    e === s || !this._built || ((t === "mode" || t === "unit") && this._renderContent(), this._update(), t === "play-state" && this._dispatch(s === "paused" ? "blink-pause" : "blink-start"));
  }
  // ── Public API (legacy <blink> compat) ──────────────────────────────────
  start() {
    this.setAttribute("play-state", "running");
  }
  stop() {
    this.setAttribute("play-state", "paused");
  }
  toggle() {
    this.playState === "paused" ? this.start() : this.stop();
  }
  refresh() {
    this._renderContent(), this._update();
  }
  // ── Private ────────────────────────────────────────────────────────────
  _build() {
    const t = [...this.childNodes];
    this.textContent = "";
    const e = document.createElement("span");
    e.className = "blink-content", t.forEach((s) => e.appendChild(s)), this.appendChild(e), this._content = e, this._sourceHTML = e.innerHTML, this._renderContent();
  }
  // Restore authored markup, then split into letters if the mode needs it.
  _renderContent() {
    this._sourceHTML != null && (this._content.innerHTML = this._sourceHTML, y.includes(this.mode) ? (this._splitLetters(), this.dataset.split = "") : delete this.dataset.split);
  }
  // Wrap each character in a <span class="blink-char"> with a stagger index, so
  // CSS can animate units individually (wave, twinkle, sparkle, chase, …).
  _splitLetters() {
    const t = document.createTreeWalker(this._content, NodeFilter.SHOW_TEXT), e = [];
    for (; t.nextNode(); ) e.push(t.currentNode);
    const s = this.unit === "word", r = this.mode === "twinkle" || this.mode === "sparkle", h = this.mode === "decode", u = (n) => n.trim() === "";
    let p = 0;
    for (const n of e) {
      const d = document.createDocumentFragment(), l = s ? this._tokenizeWords(n.textContent) : [...n.textContent];
      for (const i of l) {
        if (i === "") continue;
        const c = u(i), o = document.createElement("span");
        o.className = "blink-char", o.style.setProperty("--i", p++), r && (o.style.setProperty("--rate", `${(0.4 + Math.random() * 1.6).toFixed(2)}s`), o.style.setProperty("--delay", `${Math.random().toFixed(2)}s`)), c ? (o.classList.add("blink-space"), o.textContent = " ") : (o.textContent = i, h && (o.dataset.ch = i)), d.appendChild(o);
      }
      n.replaceWith(d);
    }
    this._content.style.setProperty("--n", p);
  }
  // Split text into word and whitespace-run tokens (no regex escapes needed).
  _tokenizeWords(t) {
    const e = [];
    let s = "", r = null;
    for (const h of t) {
      const u = h.trim() === "";
      s !== "" && u !== r && (e.push(s), s = ""), s += h, r = u;
    }
    return s !== "" && e.push(s), e;
  }
  // Whether playback is currently paused (state, off-screen, tab-hidden, or hover).
  _isPaused() {
    return this.hasAttribute("pause-on-hover") && this.matches(":hover, :focus-within") ? !0 : this.playState === "paused" || this.dataset.visible === "false" || this.dataset.tabVisible === "false";
  }
  _stopMorse() {
    this._morseRAF && cancelAnimationFrame(this._morseRAF), this._morseRAF = null;
  }
  // morse mode: blink the text out as Morse code. CSS keys off data-lit to light
  // the text; we also expose the dot/dash string via data-morse for a caption.
  _syncMorse() {
    var l;
    if (this._stopMorse(), this.mode !== "morse") {
      delete this.dataset.lit, delete this.dataset.morse;
      return;
    }
    const t = (((l = this._content) == null ? void 0 : l.textContent) || "").trim();
    if (this.dataset.morse = this._toMorse(t), this.getAttribute("reduced-motion") !== "ignore" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.dataset.lit = "true";
      return;
    }
    const s = this._morseSegments(t);
    if (s.length === 0) {
      this.dataset.lit = "true";
      return;
    }
    const r = parseFloat(getComputedStyle(this).getPropertyValue("--blink-dot")), h = Number.isFinite(r) && r > 0 ? r : 170, u = s.reduce((i, c) => i + c.dur, 0) + 7;
    let p = 0, n = null;
    const d = (i) => {
      this._morseRAF = requestAnimationFrame(d), n == null && (n = i);
      const c = i - n;
      if (n = i, this._isPaused()) return;
      p += c;
      const o = p / h % u;
      let a = 0, m = !1;
      for (const f of s) {
        if (o < a + f.dur) {
          m = f.lit;
          break;
        }
        a += f.dur;
      }
      const _ = m ? "true" : "false";
      this.dataset.lit !== _ && (this.dataset.lit = _);
    };
    this.dataset.lit = "false", this._morseRAF = requestAnimationFrame(d);
  }
  // Build an on/off timeline (durations in Morse "units") for a string.
  _morseSegments(t) {
    const e = [], s = t.toLowerCase().split(/\s+/).filter(Boolean);
    return s.forEach((r, h) => {
      const u = [...r].filter((p) => b[p]);
      u.forEach((p, n) => {
        const d = b[p];
        [...d].forEach((l, i) => {
          e.push({ lit: !0, dur: l === "-" ? 3 : 1 }), i < d.length - 1 && e.push({ lit: !1, dur: 1 });
        }), n < u.length - 1 && e.push({ lit: !1, dur: 3 });
      }), h < s.length - 1 && e.push({ lit: !1, dur: 7 });
    }), e;
  }
  // Human-readable dot/dash string, words separated by " / ".
  _toMorse(t) {
    return t.toLowerCase().split(/\s+/).filter(Boolean).map(
      (e) => [...e].map((s) => b[s] || "").filter(Boolean).join(" ")
    ).filter(Boolean).join(" / ");
  }
  _observe() {
    this._intersectionObserver = new IntersectionObserver(
      (t) => t.forEach((e) => {
        this.dataset.visible = String(e.isIntersecting);
      }),
      { rootMargin: "100px" }
    ), this._intersectionObserver.observe(this), this._onVisibility = () => {
      this.dataset.tabVisible = String(!document.hidden);
    }, document.addEventListener("visibilitychange", this._onVisibility), this.dataset.tabVisible = String(!document.hidden), this._onIteration = () => this._dispatch("blink-cycle"), this._content.addEventListener("animationiteration", this._onIteration);
  }
  _update() {
    !this._built && !this._content || (this.dataset.behavior = this.behavior, this.dataset.state = this.playState, this.dataset.ready = "", this.style.setProperty("--blink-rate", this.rate), this.minOpacity != null ? this.style.setProperty("--blink-min-opacity", this.minOpacity) : this.style.removeProperty("--blink-min-opacity"), this.count !== "infinite" ? this.style.setProperty("--blink-count", this.count) : this.style.removeProperty("--blink-count"), this._syncMorse(), this._syncSteps(), this._syncDecode());
  }
  _stopDecode() {
    this._decodeRAF && cancelAnimationFrame(this._decodeRAF), this._decodeRAF = null;
  }
  // decode mode: each unit flickers through random glyphs, then locks onto its
  // real character (stored in data-ch), staggered left-to-right, then
  // re-scrambles on a loop. Monospace keeps the width stable as glyphs change.
  // Freezes when paused; shows the plain text under reduced motion.
  _syncDecode() {
    if (this._stopDecode(), this.mode !== "decode") return;
    const t = [...this.querySelectorAll(".blink-char")].filter(
      (a) => !a.classList.contains("blink-space") && a.dataset.ch != null
    );
    if (t.length === 0) return;
    if (this.getAttribute("reduced-motion") !== "ignore" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const a of t) a.textContent = a.dataset.ch;
      return;
    }
    const s = () => g[Math.random() * g.length | 0], r = 650, h = 45, u = 1800, p = 55;
    let n = 0;
    const d = t.map((a) => {
      const m = Number(a.style.getPropertyValue("--i")) || 0, _ = r + m * h;
      return _ > n && (n = _), { s: a, settleAt: _, target: a.dataset.ch };
    });
    let l = 0, i = null, c = 0;
    const o = (a) => {
      this._decodeRAF = requestAnimationFrame(o), i == null && (i = a);
      const m = a - i;
      if (i = a, this._isPaused()) return;
      l += m;
      const _ = l - c >= p;
      _ && (c = l);
      for (const f of d)
        l >= f.settleAt ? f.s.textContent !== f.target && (f.s.textContent = f.target) : _ && (f.s.textContent = s());
      l > n + u && (l = 0, c = 0);
    };
    this._decodeRAF = requestAnimationFrame(o);
  }
  // Whether the multi-step engine should drive this element.
  _usesSteps() {
    return this.behavior === "steps" || A.includes(this.mode);
  }
  // Parse a CSS time (e.g. "1s", "800ms", or a bare number of seconds) to ms.
  _parseTime(t) {
    const e = String(t).trim();
    let s;
    return e.endsWith("ms") ? s = parseFloat(e) : (e.endsWith("s"), s = parseFloat(e) * 1e3), Number.isFinite(s) && s > 0 ? s : 1e3;
  }
  _stopSteps() {
    this._stepRAF && cancelAnimationFrame(this._stepRAF), this._stepRAF = null;
  }
  // Parse `step-durations` into per-step weights, one per step. Accepts a
  // space- or comma-separated list (e.g. "3 1 1" or "2,1"); the list is cycled
  // or truncated to fit the step count. Absent/invalid → equal weights.
  _stepWeights(t) {
    const e = this.stepDurations;
    if (!e) return Array(t).fill(1);
    const s = e.split(/[\s,]+/).map(Number).filter((r) => Number.isFinite(r) && r > 0);
    return s.length === 0 ? Array(t).fill(1) : Array.from({ length: t }, (r, h) => s[h % s.length]);
  }
  // Multi-step engine: advance data-step="0..N-1" across one cycle (`rate`). Each
  // step holds for a slice of the cycle — equal by default, or weighted by
  // `step-durations`. CSS styles each step (colour, transform, outline, …) and
  // can give each step its own transition timing (--blink-step-ease /
  // --blink-step-timing); a plain blink is the 2-step case. Freezes when
  // paused/off-screen/tab-hidden; rests at step 0 under reduced motion.
  _syncSteps() {
    if (this._stopSteps(), !this._usesSteps()) {
      delete this.dataset.step;
      return;
    }
    const t = this.steps;
    if (this.getAttribute("reduced-motion") !== "ignore" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.dataset.step = "0";
      return;
    }
    const s = this._stepWeights(t), r = s.reduce((c, o) => c + o, 0), h = this._parseTime(this.rate), u = [];
    let p = 0;
    for (const c of s)
      p += c, u.push(p / r * h);
    let n = 0, d = null, l = 0;
    this.dataset.step = "0";
    const i = (c) => {
      this._stepRAF = requestAnimationFrame(i), d == null && (d = c);
      const o = c - d;
      if (d = c, this._isPaused()) return;
      n += o;
      const a = n % h;
      let m = 0;
      for (; m < t - 1 && a >= u[m]; ) m++;
      m !== l && (this.dataset.step = String(m), m < l && this._dispatch("blink-cycle"), l = m);
    };
    this._stepRAF = requestAnimationFrame(i);
  }
  _dispatch(t) {
    this.dispatchEvent(new CustomEvent(t, { bubbles: !0 }));
  }
}
customElements.define("blink-wc", v);
export {
  v as BlinkWc
};
//# sourceMappingURL=blink-wc.js.map
