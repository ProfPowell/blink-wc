const g = [
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
], A = ["extrude", "collapse", "outline", "morph", "depth", "revolve"], k = { morph: 4, revolve: 4 }, y = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=?<>/~^|", b = {
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
    this._sourceHTML != null && (this._content.innerHTML = this._sourceHTML, g.includes(this.mode) ? (this._splitLetters(), this.dataset.split = "") : delete this.dataset.split);
  }
  // Wrap each character in a <span class="blink-char"> with a stagger index, so
  // CSS can animate units individually (wave, twinkle, sparkle, chase, …).
  _splitLetters() {
    const t = document.createTreeWalker(this._content, NodeFilter.SHOW_TEXT), e = [];
    for (; t.nextNode(); ) e.push(t.currentNode);
    const s = this.unit === "word", a = this.mode === "twinkle" || this.mode === "sparkle", l = this.mode === "decode", c = (i) => i.trim() === "";
    let h = 0;
    for (const i of e) {
      const u = document.createDocumentFragment(), n = s ? this._tokenizeWords(i.textContent) : [...i.textContent];
      for (const r of n) {
        if (r === "") continue;
        const m = c(r), d = document.createElement("span");
        d.className = "blink-char", d.style.setProperty("--i", h++), a && (d.style.setProperty("--rate", `${(0.4 + Math.random() * 1.6).toFixed(2)}s`), d.style.setProperty("--delay", `${Math.random().toFixed(2)}s`)), m ? (d.classList.add("blink-space"), d.textContent = " ") : (d.textContent = r, l && (d.dataset.ch = r)), u.appendChild(d);
      }
      i.replaceWith(u);
    }
    this._content.style.setProperty("--n", h);
  }
  // Split text into word and whitespace-run tokens (no regex escapes needed).
  _tokenizeWords(t) {
    const e = [];
    let s = "", a = null;
    for (const l of t) {
      const c = l.trim() === "";
      s !== "" && c !== a && (e.push(s), s = ""), s += l, a = c;
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
    var n;
    if (this._stopMorse(), this.mode !== "morse") {
      delete this.dataset.lit, delete this.dataset.morse;
      return;
    }
    const t = (((n = this._content) == null ? void 0 : n.textContent) || "").trim();
    if (this.dataset.morse = this._toMorse(t), this.getAttribute("reduced-motion") !== "ignore" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.dataset.lit = "true";
      return;
    }
    const s = this._morseSegments(t);
    if (s.length === 0) {
      this.dataset.lit = "true";
      return;
    }
    const a = parseFloat(getComputedStyle(this).getPropertyValue("--blink-dot")), l = Number.isFinite(a) && a > 0 ? a : 170, c = s.reduce((r, m) => r + m.dur, 0) + 7;
    let h = 0, i = null;
    const u = (r) => {
      this._morseRAF = requestAnimationFrame(u), i == null && (i = r);
      const m = r - i;
      if (i = r, this._isPaused()) return;
      h += m;
      const d = h / l % c;
      let o = 0, _ = !1;
      for (const p of s) {
        if (d < o + p.dur) {
          _ = p.lit;
          break;
        }
        o += p.dur;
      }
      const f = _ ? "true" : "false";
      this.dataset.lit !== f && (this.dataset.lit = f);
    };
    this.dataset.lit = "false", this._morseRAF = requestAnimationFrame(u);
  }
  // Build an on/off timeline (durations in Morse "units") for a string.
  _morseSegments(t) {
    const e = [], s = t.toLowerCase().split(/\s+/).filter(Boolean);
    return s.forEach((a, l) => {
      const c = [...a].filter((h) => b[h]);
      c.forEach((h, i) => {
        const u = b[h];
        [...u].forEach((n, r) => {
          e.push({ lit: !0, dur: n === "-" ? 3 : 1 }), r < u.length - 1 && e.push({ lit: !1, dur: 1 });
        }), i < c.length - 1 && e.push({ lit: !1, dur: 3 });
      }), l < s.length - 1 && e.push({ lit: !1, dur: 7 });
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
      (o) => !o.classList.contains("blink-space") && o.dataset.ch != null
    );
    if (t.length === 0) return;
    if (this.getAttribute("reduced-motion") !== "ignore" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const o of t) o.textContent = o.dataset.ch;
      return;
    }
    const s = () => y[Math.random() * y.length | 0], a = 650, l = 45, c = 1800, h = 55;
    let i = 0;
    const u = t.map((o) => {
      const _ = Number(o.style.getPropertyValue("--i")) || 0, f = a + _ * l;
      return f > i && (i = f), { s: o, settleAt: f, target: o.dataset.ch };
    });
    let n = 0, r = null, m = 0;
    const d = (o) => {
      this._decodeRAF = requestAnimationFrame(d), r == null && (r = o);
      const _ = o - r;
      if (r = o, this._isPaused()) return;
      n += _;
      const f = n - m >= h;
      f && (m = n);
      for (const p of u)
        n >= p.settleAt ? p.s.textContent !== p.target && (p.s.textContent = p.target) : f && (p.s.textContent = s());
      n > i + c && (n = 0, m = 0);
    };
    this._decodeRAF = requestAnimationFrame(d);
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
  // Multi-step engine: advance data-step="0..N-1" across one cycle (`rate`),
  // holding each step for an equal slice. CSS styles each step, so a step can
  // change colour, transform, outline, etc. — a plain blink is the 2-step case.
  // Freezes when paused/off-screen/tab-hidden; rests at step 0 under reduced motion.
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
    const s = this._parseTime(this.rate) / t;
    let a = 0, l = null, c = 0;
    this.dataset.step = "0";
    const h = (i) => {
      this._stepRAF = requestAnimationFrame(h), l == null && (l = i);
      const u = i - l;
      if (l = i, this._isPaused()) return;
      a += u;
      const n = Math.floor(a / s) % t;
      n !== c && (this.dataset.step = String(n), n < c && this._dispatch("blink-cycle"), c = n);
    };
    this._stepRAF = requestAnimationFrame(h);
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
