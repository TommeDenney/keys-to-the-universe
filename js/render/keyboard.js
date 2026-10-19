import { rewardLook } from '../data/rewards.js';
// On-screen piano keyboard (DOM). Shows hints (next keys + fingers), echoes
// what the player pressed, and can be played by touch.

import { isBlack, noteName } from '../music/theory.js';

export class Keyboard {
  /**
   * @param {HTMLElement} el container
   * @param {{lo:number, hi:number, interactive?:boolean, labels?:'c'|'all'|'none', onKey?:(midi:number, down:boolean)=>void}} opts
   */
  constructor(el, opts) {
    this.el = el;
    this.opts = { labels: 'c', interactive: true, ...opts };
    this.keys = new Map();
    this.hints = new Map();
    this.build();
  }

  setRange(lo, hi) {
    this.opts.lo = lo;
    this.opts.hi = hi;
    this.build();
  }

  build() {
    let { lo, hi } = this.opts;
    if (isBlack(lo)) lo--;
    if (isBlack(hi)) hi++;
    this.el.innerHTML = '';
    this.el.classList.add('kb');
    // Cosmetics: demo keyboards in the Shop bring their own look; others follow what's equipped.
    if (/\bkbt-|\bpress-/.test(this.el.className)) this.el.dataset.fixedLook = '1';
    else this.el.classList.add(`kbt-${document.body.dataset.kbtheme || 'classic'}`, `press-${document.body.dataset.press || 'glow'}`);
    const whites = [];
    for (let m = lo; m <= hi; m++) if (!isBlack(m)) whites.push(m);
    const ww = 100 / whites.length;
    this.keys.clear();
    whites.forEach((m, i) => {
      const k = document.createElement('div');
      k.className = 'kb-key kb-white';
      k.style.left = `${i * ww}%`;
      k.style.width = `${ww}%`;
      k.dataset.midi = m;
      const lab = this.opts.labels;
      if (lab === 'all' || (lab === 'c' && m % 12 === 0)) {
        const t = document.createElement('span');
        t.className = 'kb-label';
        t.textContent = m % 12 === 0 ? `C${Math.floor(m / 12) - 1}` : noteName(m);
        if (m === 60) t.classList.add('kb-middle');
        k.appendChild(t);
      }
      this.el.appendChild(k);
      this.keys.set(m, k);
    });
    for (let m = lo; m <= hi; m++) {
      if (!isBlack(m)) continue;
      const wi = whites.indexOf(m - 1);
      if (wi < 0) continue;
      const k = document.createElement('div');
      k.className = 'kb-key kb-black';
      k.style.left = `${(wi + 1) * ww - ww * 0.31}%`;
      k.style.width = `${ww * 0.62}%`;
      k.dataset.midi = m;
      this.el.appendChild(k);
      this.keys.set(m, k);
    }
    if (this.opts.interactive) this.bindPointer();
    for (const [m, h] of this.hints) this.applyHint(m, h);
  }

  bindPointer() {
    if (this.bound) return;
    this.bound = true;
    const active = new Map(); // pointerId → midi
    const keyAt = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      return el && el.closest('.kb-key') && this.el.contains(el) ? parseInt(el.closest('.kb-key').dataset.midi, 10) : null;
    };
    const down = (e) => {
      const m = keyAt(e);
      if (m == null) return;
      e.preventDefault();
      active.set(e.pointerId, m);
      this.opts.onKey && this.opts.onKey(m, true);
    };
    const move = (e) => {
      if (!active.has(e.pointerId)) return;
      const m = keyAt(e);
      const prev = active.get(e.pointerId);
      if (m != null && m !== prev) {
        this.opts.onKey && this.opts.onKey(prev, false);
        active.set(e.pointerId, m);
        this.opts.onKey && this.opts.onKey(m, true);
      }
    };
    const up = (e) => {
      if (!active.has(e.pointerId)) return;
      this.opts.onKey && this.opts.onKey(active.get(e.pointerId), false);
      active.delete(e.pointerId);
    };
    this.el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    this.unbind = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }

  /** hints: Map midi → {hand:'R'|'L', finger?} */
  setHints(hints) {
    for (const m of this.hints.keys()) this.applyHint(m, null);
    this.hints = new Map(hints);
    for (const [m, h] of this.hints) this.applyHint(m, h);
  }

  applyHint(m, h) {
    const k = this.keys.get(m);
    if (!k) return;
    k.classList.toggle('hint', !!h);
    k.classList.toggle('hint-L', !!h && h.hand === 'L');
    let f = k.querySelector('.kb-finger');
    if (h && h.finger) {
      if (!f) {
        f = document.createElement('span');
        f.className = 'kb-finger';
        k.appendChild(f);
      }
      f.textContent = h.finger;
    } else if (f) f.remove();
  }

  /** Particle flourish for the equipped key-press effect. */
  pressFx(k, m) {
    const fx = (this.el.className.match(/\bpress-(\w+)/) || [])[1] || 'glow';
    k.style.setProperty('--hue', `${((m * 47) % 360)}deg`);
    const spawn = (cls, n, setup) => {
      for (let i = 0; i < n; i++) {
        const p = document.createElement('i');
        p.className = `kfx ${cls}`;
        setup(p, i);
        k.appendChild(p);
        setTimeout(() => p.remove(), 900);
      }
    };
    if (fx === 'sparks') spawn('spark', 7, (p) => { p.style.setProperty('--dx', `${(Math.random() - 0.5) * 60}px`); p.style.setProperty('--dy', `${-30 - Math.random() * 50}px`); });
    else if (fx === 'ripple') spawn('ripple', 1, () => {});
    else if (fx === 'stars') spawn('star', 4, (p, i) => { p.textContent = '\u2726'; p.style.setProperty('--dx', `${(i - 1.5) * 14 + (Math.random() - 0.5) * 8}px`); p.style.setProperty('--dy', `${-50 - Math.random() * 40}px`); });
    else if (fx === 'hearts') spawn('star heart', 3, (p, i) => { p.textContent = '\u2665'; p.style.setProperty('--dx', `${(i - 1) * 14}px`); p.style.setProperty('--dy', `${-45 - Math.random() * 35}px`); });
    else if (fx === 'notes') spawn('star note', 2, (p, i) => { p.textContent = ['\u266A', '\u266B', '\u2669'][Math.floor(Math.random() * 3)]; p.style.setProperty('--dx', `${(i ? 1 : -1) * (6 + Math.random() * 14)}px`); p.style.setProperty('--dy', `${-55 - Math.random() * 30}px`); });
    else if (fx === 'lightning') spawn('bolt', 1, () => {});
    else if (fx === 'fire') spawn('flame', 3, (p, i) => { p.style.setProperty('--dx', `${(i - 1) * 6}px`); p.style.animationDelay = `${i * 0.05}s`; });
    else {
      // Achievement key presses: glyph particles described in js/data/rewards.js.
      const L = rewardLook(`press-${fx}`);
      if (!L) return;
      spawn('star glyph', L.n || 3, (p, i) => {
        p.textContent = L.glyphs[Math.floor(Math.random() * L.glyphs.length)];
        const c = L.color === 'rainbow' ? `hsl(${Math.floor(Math.random() * 360)} 90% 65%)` : L.color;
        p.style.color = c;
        p.style.textShadow = `0 0 8px ${L.glow}`;
        p.style.fontSize = `${L.size || 14}px`;
        p.style.setProperty('--dx', `${((i + 0.5) / (L.n || 3) - 0.5) * 50 + (Math.random() - 0.5) * 14}px`);
        p.style.setProperty('--dy', `${-45 - Math.random() * 45}px`);
      });
    }
  }

  /** Flash a key: kind = 'good' | 'bad' | 'play' */
  flash(m, kind = 'good', ms = 260) {
    const k = this.keys.get(m);
    if (!k) return;
    if (kind === 'good' || kind === 'play') this.pressFx(k, m);
    const cls = `on-${kind}`;
    k.classList.remove('on-good', 'on-bad', 'on-play', 'on-soft');
    void k.offsetWidth; // restart animation
    k.classList.add(cls);
    clearTimeout(k._t);
    k._t = setTimeout(() => k.classList.remove(cls), ms);
  }

  press(m, kind = 'good') {
    const k = this.keys.get(m);
    if (k) {
      this.pressFx(k, m);
      clearTimeout(k._t);
      k.classList.remove('on-good', 'on-bad', 'on-play');
      k.classList.add(`on-${kind}`);
    }
  }

  release(m) {
    const k = this.keys.get(m);
    if (k) k.classList.remove('on-good', 'on-bad', 'on-play');
  }

  destroy() {
    if (this.unbind) this.unbind();
    this.el.innerHTML = '';
  }
}

/** Pick a nice keyboard range for a set of notes. */
export function rangeFor(minMidi, maxMidi, minKeys = 15) {
  let lo = Math.min(minMidi, maxMidi) - 2;
  let hi = Math.max(minMidi, maxMidi) + 2;
  // snap to C … B/C
  lo = lo - (((lo % 12) + 12) % 12);
  hi = hi + (12 - (((hi % 12) + 12) % 12)) % 12;
  let whites = 0;
  for (let m = lo; m <= hi; m++) if (!isBlack(m)) whites++;
  while (whites < minKeys) {
    lo -= 12;
    if (whites + 7 < minKeys) hi += 12;
    whites = 0;
    for (let m = lo; m <= hi; m++) if (!isBlack(m)) whites++;
  }
  return [lo, hi];
}
