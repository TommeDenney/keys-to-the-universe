// Scrolling sheet-music renderer (canvas).
// Time runs left→right; the playhead is fixed and the music scrolls under it.

import { diatonic, keyAlterMap, SHARP_ORDER, FLAT_ORDER, accidentalSymbol } from '../music/theory.js';

export const COLORS = {
  paper: '#FFFFFF',
  ink: '#262340',
  line: '#B9B6CC',
  faint: '#CFCDDC',
  R: '#3D7BFF',
  L: '#F0821E',
  hit: '#17B26A',
  miss: '#F04461',
  playhead: '#6C4DF6',
};

const MUSIC_FONT = '"Noto Music", "Apple Symbols", "Segoe UI Symbol", serif';
const STEP_INDEX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const TREBLE_TOP = 38; // F5
const BASS_TOP = 26; // A3
const SHARP_D = [38, 35, 39, 36, 33, 37, 34];
const FLAT_D = [34, 37, 33, 36, 32, 35, 31];

const VALUES = [
  [6, 'whole', 0, 1], [4, 'whole', 0, 0], [3, 'half', 0, 1], [2, 'half', 0, 0], [1.5, 'filled', 0, 1],
  [1, 'filled', 0, 0], [0.75, 'filled', 1, 1], [0.5, 'filled', 1, 0], [0.375, 'filled', 2, 1],
  [0.25, 'filled', 2, 0], [0.125, 'filled', 3, 0],
];
function noteValue(dur) {
  let best = VALUES[0];
  let bd = Infinity;
  for (const v of VALUES) {
    const dd = Math.abs(Math.log(dur / v[0]));
    if (dd < bd) { bd = dd; best = v; }
  }
  return { head: best[1], flags: best[2], dots: best[3], stem: best[1] !== 'whole' };
}

const REST_GLYPH = { 4: '\u{1D13B}', 2: '\u{1D13C}', 1: '\u{1D13D}', 0.5: '\u{1D13E}', 0.25: '\u{1D13F}' };

export class Sheet {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.static = !!opts.static;
    this.forceClef = opts.clef || null;
    this.state = new Map(); // note id → 'target' | 'hit' | 'miss'
    this.effects = [];
    this.scroll = 0;
    this.showNames = true;
    this.showFingers = true;
    this.activeHands = 'both';
    this.w = this.h = 0;
    this.resize();
  }

  setSong(song, { hands = 'both', showNames = true } = {}) {
    this.song = song;
    this.activeHands = hands;
    this.showNames = showNames;
    this.state.clear();
    this.effects = [];
    const hasR = song.notes.some((n) => n.hand === 'R') || (song.rests || []).some((r) => r.hand === 'R');
    const hasL = song.notes.some((n) => n.hand === 'L') || (song.rests || []).some((r) => r.hand === 'L');
    this.staves = [];
    if (this.forceClef === 'bass') this.staves = ['L'];
    else if (this.forceClef === 'treble') this.staves = ['R'];
    else {
      if (hasR || !hasL) this.staves.push('R');
      if (hasL) this.staves.push('L');
    }
    this.prepareAccidentals();
    this.groups = this.buildGroups();
    const shortest = Math.max(0.25, Math.min(1, ...song.notes.map((n) => n.dur)));
    this.shortest = shortest;
    this.layout();
  }

  isActive(n) {
    return this.activeHands === 'both' || this.activeHands === n.hand;
  }

  prepareAccidentals() {
    const keyMap = keyAlterMap(this.song.keyFifths || 0);
    const measures = this.song.measures;
    const mIndex = (t) => {
      let i = 0;
      while (i + 1 < measures.length && measures[i + 1].start <= t + 1e-6) i++;
      return i;
    };
    for (const hand of ['R', 'L']) {
      let cur = -1;
      let state = {};
      for (const n of this.song.notes.filter((x) => x.hand === hand)) {
        const mi = mIndex(n.start);
        if (mi !== cur) { cur = mi; state = {}; }
        const k = n.step + n.octave;
        const curAlter = k in state ? state[k] : keyMap[n.step];
        n.acc = n.alter !== curAlter ? (n.alter === 0 ? '♮' : accidentalSymbol(n.alter)) : null;
        // Chord notes at the same time share state updates after the chord.
        state[k] = n.alter;
      }
    }
  }

  buildGroups() {
    const groups = [];
    const map = new Map();
    for (const n of this.song.notes) {
      const v = noteValue(n.dur);
      const key = `${n.hand}|${n.start.toFixed(4)}|${v.head}|${v.flags}|${v.dots}`;
      let g = map.get(key);
      if (!g) {
        g = { hand: n.hand, start: n.start, value: v, notes: [] };
        map.set(key, g);
        groups.push(g);
      }
      g.notes.push(n);
    }
    for (const g of groups) {
      g.notes.sort((a, b) => diatonic(a.step, a.octave) - diatonic(b.step, b.octave));
      const mid = g.hand === 'R' ? 34 : 22;
      const ds = g.notes.map((n) => diatonic(n.step, n.octave));
      const far = ds.reduce((a, d) => (Math.abs(d - mid) > Math.abs(a - mid) ? d : a), ds[0]);
      g.stemUp = far < mid;
      // Seconds: alternate heads to the other side of the stem.
      g.offsets = ds.map(() => 0);
      for (let i = 1; i < ds.length; i++) {
        if (ds[i] - ds[i - 1] === 1 && g.offsets[i - 1] === 0) g.offsets[i] = g.stemUp ? 1 : -1;
      }
    }
    groups.sort((a, b) => a.start - b.start);
    return groups;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const r = this.canvas.getBoundingClientRect();
    this.w = Math.max(10, r.width);
    this.h = Math.max(10, r.height);
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.song) this.layout();
  }

  layout() {
    const two = this.staves.length === 2;
    const units = two ? 23 : 15;
    let s = this.h / units;
    s = Math.max(6, Math.min(this.static ? 13 : 17, s));
    this.s = s;
    const total = (two ? 14 : 4) * s;
    const top = (this.h - total) / 2 + (two ? 0 : 0.5 * s);
    this.staffTop = {};
    if (two) {
      this.staffTop.R = top;
      this.staffTop.L = top + 10 * s;
    } else {
      this.staffTop[this.staves[0]] = top;
    }
    const nAcc = Math.abs(this.song.keyFifths || 0);
    this.clefW = 4.2 * s + nAcc * 1.05 * s + 3.2 * s;
    this.ppb = Math.max(7.5 * s, (3.6 * s) / this.shortest);
    if (this.static) {
      const avail = this.w - this.clefW - 3 * s;
      this.ppb = Math.min(this.ppb, avail / Math.max(1, this.song.length));
      this.playheadX = this.clefW + 2 * s;
    } else {
      this.playheadX = Math.min(this.w * 0.32, this.clefW + 6 * s);
    }
  }

  y(hand, d) {
    const top = this.staffTop[hand] ?? this.staffTop[this.staves[0]];
    const ref = (this.staffTop[hand] != null ? hand : this.staves[0]) === 'R' ? TREBLE_TOP : BASS_TOP;
    return top + ((ref - d) * this.s) / 2;
  }

  /** Which staff a note is drawn on (handles hidden staves). */
  staffOf(hand) {
    return this.staffTop[hand] != null ? hand : this.staves[0];
  }

  x(beat) {
    return this.playheadX + (beat - this.scroll) * this.ppb;
  }

  // ---- effects --------------------------------------------------------

  burst(note) {
    const st = this.staffOf(note.hand);
    const y = this.y(st, diatonic(note.step, note.octave));
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
      const v = (1.2 + Math.random() * 1.8) * this.s * 4;
      this.effects.push({ type: 'p', x: this.playheadX, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.45 + Math.random() * 0.2, color: COLORS.hit, r: this.s * (0.18 + Math.random() * 0.18) });
    }
  }

  wrong(n) {
    // n: {midi, step, alter, octave, hand}
    this.effects.push({ type: 'w', note: n, t: 0, life: 0.9 });
  }

  popup(text, color = COLORS.hit) {
    this.effects = this.effects.filter((e) => e.type !== 't');
    this.effects.push({ type: 't', text, color, t: 0, life: 0.9 });
  }

  // ---- drawing --------------------------------------------------------

  draw(dt = 0) {
    const { ctx, w, h, s } = this;
    if (!this.song) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COLORS.paper;
    ctx.fillRect(0, 0, w, h);

    // staff lines
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = Math.max(1, s * 0.09);
    for (const st of this.staves) {
      for (let i = 0; i < 5; i++) {
        const y = Math.round(this.staffTop[st] + i * s) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    const left = -4 * s;
    const right = w + 4 * s;
    // bar lines
    const firstTop = this.staffTop[this.staves[0]];
    const lastBottom = this.staffTop[this.staves[this.staves.length - 1]] + 4 * s;
    ctx.lineWidth = Math.max(1, s * 0.12);
    ctx.strokeStyle = COLORS.faint;
    ctx.fillStyle = '#9C99B3';
    ctx.font = `600 ${Math.round(s * 0.95)}px Nunito, system-ui, sans-serif`;
    ctx.textAlign = 'left';
    const barPad = Math.min(1.6 * s, this.ppb * 0.35);
    const ms = this.song.measures;
    for (let i = 0; i <= ms.length; i++) {
      const t = i < ms.length ? ms[i].start : ms[ms.length - 1].start + ms[ms.length - 1].len;
      if (i === 0 && ms[0] && ms[0].number === 0) continue;
      const x = this.x(t) - barPad;
      if (x < left || x > right) continue;
      ctx.strokeStyle = i === ms.length ? COLORS.ink : COLORS.line;
      ctx.lineWidth = i === ms.length ? s * 0.35 : Math.max(1, s * 0.12);
      ctx.beginPath();
      ctx.moveTo(x, firstTop);
      ctx.lineTo(x, lastBottom);
      ctx.stroke();
      if (i < ms.length && !this.static && ms[i].number > 0) ctx.fillText(String(ms[i].number), x + 0.25 * s, firstTop - 0.6 * s);
    }

    // rests
    for (const r of this.song.rests || []) {
      const x = this.x(r.start + 0.0001);
      if (x < left || x > right) continue;
      if (!this.staffTop[r.hand] && this.staves.length > 1) continue;
      if (this.staffTop[r.hand] == null) continue;
      this.drawRest(r, x);
    }

    // notes
    for (const g of this.groups) {
      const x = this.x(g.start);
      if (x < left || x > right) continue;
      this.drawGroup(g, x);
    }

    // effects under the left panel
    this.drawEffects(dt);

    // sticky clef panel
    const grad = ctx.createLinearGradient(this.clefW - 0.5 * s, 0, this.clefW + 2.5 * s, 0);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = COLORS.paper;
    ctx.fillRect(0, 0, this.clefW - 0.5 * s, h);
    ctx.fillStyle = grad;
    ctx.fillRect(this.clefW - 0.5 * s, 0, 3 * s, h);
    this.drawClefs();

    if (!this.static) this.drawPlayhead();
  }

  drawClefs() {
    const { ctx, s } = this;
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = Math.max(1, s * 0.09);
    for (const st of this.staves) {
      for (let i = 0; i < 5; i++) {
        const y = Math.round(this.staffTop[st] + i * s) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0.6 * s, y);
        ctx.lineTo(this.clefW - 0.5 * s, y);
        ctx.stroke();
      }
    }
    const firstTop = this.staffTop[this.staves[0]];
    const lastBottom = this.staffTop[this.staves[this.staves.length - 1]] + 4 * s;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = s * 0.14;
    ctx.beginPath();
    ctx.moveTo(0.6 * s, firstTop);
    ctx.lineTo(0.6 * s, lastBottom);
    ctx.stroke();
    if (this.staves.length === 2) this.drawBrace(0.15 * s, firstTop, lastBottom);

    ctx.fillStyle = COLORS.ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    for (const st of this.staves) {
      const top = this.staffTop[st];
      if (st === 'R') {
        ctx.font = `${4 * s}px ${MUSIC_FONT}`;
        ctx.fillText('\u{1D11E}', 1.0 * s, top + 3 * s); // baseline on the G line
      } else {
        ctx.font = `${4 * s}px ${MUSIC_FONT}`;
        ctx.fillText('\u{1D122}', 1.1 * s, top + 1 * s); // baseline on the F line
      }
      // key signature
      const f = this.song.keyFifths || 0;
      const list = f > 0 ? SHARP_D.slice(0, f) : FLAT_D.slice(0, -f);
      const sym = f > 0 ? '♯' : '♭';
      ctx.font = `${2.6 * s}px ${MUSIC_FONT}`;
      list.forEach((d, i) => {
        const dd = st === 'R' ? d : d - 14;
        const y = this.y(st, dd);
        ctx.fillText(sym, 4.3 * s + i * 1.05 * s, y + (f > 0 ? 0.85 * s : 0.55 * s));
      });
      // time signature
      const [num, den] = this.song.time || [4, 4];
      const tx = 4.3 * s + list.length * 1.05 * s + 1.4 * s;
      ctx.font = `800 ${2.5 * s}px Georgia, "Times New Roman", serif`;
      ctx.textAlign = 'center';
      ctx.fillText(String(num), tx, top + 1.9 * s);
      ctx.fillText(String(den), tx, top + 3.9 * s);
      ctx.textAlign = 'left';
    }
  }

  drawBrace(x, y0, y1) {
    const { ctx } = this;
    const m = (y0 + y1) / 2;
    const wv = this.s * 0.55;
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.moveTo(x + wv, y0);
    ctx.bezierCurveTo(x - wv * 0.2, y0 + (m - y0) * 0.3, x + wv * 1.2, m - (m - y0) * 0.3, x, m);
    ctx.bezierCurveTo(x + wv * 1.2, m + (y1 - m) * 0.3, x - wv * 0.2, y1 - (y1 - m) * 0.3, x + wv, y1);
    ctx.bezierCurveTo(x + wv * 0.3, y1 - (y1 - m) * 0.3, x + wv * 1.9, m + (y1 - m) * 0.3, x + wv * 0.25, m);
    ctx.bezierCurveTo(x + wv * 1.9, m - (m - y0) * 0.3, x + wv * 0.3, y0 + (m - y0) * 0.3, x + wv, y0);
    ctx.fill();
  }

  colorFor(n) {
    const st = this.state.get(n.id);
    if (st === 'hit') return COLORS.hit;
    if (st === 'miss') return COLORS.miss;
    if (!this.isActive(n)) return COLORS.faint;
    if (st === 'target') return COLORS[n.hand];
    return COLORS.ink;
  }

  drawGroup(g, x) {
    const { ctx, s } = this;
    const st = this.staffOf(g.hand);
    const rx = this.showNames ? 0.78 * s : 0.62 * s;
    const ry = this.showNames ? 0.6 * s : 0.46 * s;
    const ds = g.notes.map((n) => diatonic(n.step, n.octave));
    const ys = ds.map((d) => this.y(st, d));
    const top = this.staffTop[st];
    const bottom = top + 4 * s;
    const anyTarget = g.notes.some((n) => this.state.get(n.id) === 'target');
    const groupColor = this.colorFor(g.notes[g.notes.length - 1]);

    // ledger lines
    ctx.strokeStyle = this.isActive(g.notes[0]) ? COLORS.ink : COLORS.faint;
    ctx.lineWidth = Math.max(1, s * 0.12);
    const ref = st === 'R' ? TREBLE_TOP : BASS_TOP;
    const minD = Math.min(...ds);
    const maxD = Math.max(...ds);
    for (let d = ref - 10; d >= minD; d -= 2) {
      const y = this.y(st, d);
      ctx.beginPath();
      ctx.moveTo(x - rx * 1.7, y);
      ctx.lineTo(x + rx * 1.7, y);
      ctx.stroke();
    }
    for (let d = ref + 2; d <= maxD; d += 2) {
      const y = this.y(st, d);
      ctx.beginPath();
      ctx.moveTo(x - rx * 1.7, y);
      ctx.lineTo(x + rx * 1.7, y);
      ctx.stroke();
    }

    // target halo
    if (anyTarget) {
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 180);
      ctx.fillStyle = COLORS[g.hand] + '22';
      const y0 = Math.min(...ys) - ry * 2.2;
      const y1 = Math.max(...ys) + ry * 2.2;
      roundRect(ctx, x - rx * 2.1 - pulse * s * 0.15, y0, rx * 4.2 + pulse * s * 0.3, y1 - y0, rx * 1.6);
      ctx.fill();
    }

    // stem
    const v = g.value;
    const stemLen = 3.4 * s + (v.flags > 1 ? (v.flags - 1) * 0.8 * s : 0);
    let stemX = 0;
    let stemTip = 0;
    if (v.stem) {
      ctx.strokeStyle = groupColor;
      ctx.lineWidth = Math.max(1.2, s * 0.13);
      if (g.stemUp) {
        stemX = x + rx * 0.92;
        stemTip = Math.min(...ys) - stemLen;
        ctx.beginPath();
        ctx.moveTo(stemX, Math.max(...ys) - ry * 0.2);
        ctx.lineTo(stemX, stemTip);
        ctx.stroke();
      } else {
        stemX = x - rx * 0.92;
        stemTip = Math.max(...ys) + stemLen;
        ctx.beginPath();
        ctx.moveTo(stemX, Math.min(...ys) + ry * 0.2);
        ctx.lineTo(stemX, stemTip);
        ctx.stroke();
      }
      // flags
      ctx.fillStyle = groupColor;
      for (let f = 0; f < v.flags; f++) {
        const dir = g.stemUp ? 1 : -1;
        const y0 = stemTip + dir * f * 0.85 * s;
        ctx.beginPath();
        ctx.moveTo(stemX, y0);
        ctx.bezierCurveTo(stemX + 0.2 * s, y0 + dir * 1.0 * s, stemX + 1.5 * s, y0 + dir * 1.2 * s, stemX + 1.0 * s, y0 + dir * 2.6 * s);
        ctx.bezierCurveTo(stemX + 1.2 * s, y0 + dir * 1.6 * s, stemX + 0.4 * s, y0 + dir * 1.3 * s, stemX, y0 + dir * 1.0 * s);
        ctx.fill();
      }
    }

    // heads
    g.notes.forEach((n, i) => {
      const hx = x + g.offsets[i] * rx * 1.85;
      const y = ys[i];
      const color = this.colorFor(n);
      ctx.save();
      ctx.translate(hx, y);
      ctx.rotate(-0.33);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      if (v.head === 'filled') {
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.fillStyle = COLORS.paper;
        ctx.fill();
        ctx.lineWidth = s * (v.head === 'whole' ? 0.3 : 0.22);
        ctx.strokeStyle = color;
        ctx.stroke();
      }
      ctx.restore();
      // dot
      if (v.dots) {
        ctx.fillStyle = color;
        const dy = ds[i] % 2 === 0 ? -0.5 * s : 0; // dots sit in spaces
        ctx.beginPath();
        ctx.arc(hx + rx + 0.55 * s + (g.stemUp && v.flags ? 0.9 * s : 0), y + dy, s * 0.17, 0, Math.PI * 2);
        ctx.fill();
      }
      // accidental
      if (n.acc) {
        ctx.fillStyle = color;
        ctx.font = `${2.4 * s}px ${MUSIC_FONT}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.acc, hx - rx - 0.2 * s, y + (n.acc === '♭' ? -0.25 * s : 0.05 * s));
      }
      // name inside the head
      if (this.showNames) {
        ctx.font = `800 ${Math.round(0.95 * s)}px Nunito, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = v.head === 'filled' ? '#fff' : color;
        ctx.fillText(n.step, hx, y + 0.06 * s);
      }
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
    });

    // finger numbers
    if (this.showFingers && this.isActive(g.notes[0])) {
      const fingers = g.notes.filter((n) => n.finger).map((n) => n.finger);
      if (fingers.length) {
        ctx.font = `800 ${Math.round(1.05 * s)}px Nunito, system-ui, sans-serif`;
        ctx.fillStyle = anyTarget ? COLORS[g.hand] : '#8F8BA8';
        ctx.textAlign = 'center';
        const above = g.hand === 'R';
        const lineH = 1.1 * s;
        if (above) {
          const base = Math.min(g.stemUp && v.stem ? stemTip : Math.min(...ys) - ry, top) - 0.7 * s;
          [...fingers].reverse().forEach((f, i) => ctx.fillText(String(f), x, base - i * lineH));
        } else {
          const base = Math.max(!g.stemUp && v.stem ? stemTip : Math.max(...ys) + ry, bottom) + 1.5 * s;
          fingers.forEach((f, i) => ctx.fillText(String(f), x, base + i * lineH));
        }
        ctx.textAlign = 'left';
      }
    }
  }

  drawRest(r, x) {
    const { ctx, s } = this;
    const top = this.staffTop[r.hand];
    const active = this.activeHands === 'both' || this.activeHands === r.hand;
    ctx.fillStyle = active ? '#5D5A78' : COLORS.faint;
    const v = [4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25].reduce((a, b) => (Math.abs(b - r.dur) < Math.abs(a - r.dur) ? b : a));
    const base = v >= 4 ? 4 : v >= 2 ? 2 : v >= 1 ? 1 : v >= 0.5 ? 0.5 : 0.25;
    if (base === 4) {
      ctx.fillRect(x - 0.7 * s, top + 1 * s, 1.4 * s, 0.55 * s);
    } else if (base === 2) {
      ctx.fillRect(x - 0.7 * s, top + 1.45 * s, 1.4 * s, 0.55 * s);
    } else {
      ctx.font = `${4 * s}px ${MUSIC_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(REST_GLYPH[base], x, top + 2 * s);
      ctx.textAlign = 'left';
    }
    if (v === 3 || v === 1.5 || v === 0.75) {
      ctx.beginPath();
      ctx.arc(x + 1.1 * s, top + 1.5 * s, s * 0.17, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPlayhead() {
    const { ctx, s, h } = this;
    const x = this.playheadX;
    const g = ctx.createLinearGradient(x - 1.2 * s, 0, x + 1.2 * s, 0);
    g.addColorStop(0, 'rgba(108,77,246,0)');
    g.addColorStop(0.5, 'rgba(108,77,246,0.13)');
    g.addColorStop(1, 'rgba(108,77,246,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 1.2 * s, 0, 2.4 * s, h);
    ctx.fillStyle = COLORS.playhead;
    roundRect(ctx, x - s * 0.12, s * 0.6, s * 0.24, h - s * 1.2, s * 0.12);
    ctx.globalAlpha = 0.55;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  drawEffects(dt) {
    const { ctx, s } = this;
    const keep = [];
    for (const e of this.effects) {
      e.t += dt;
      if (e.t > e.life) continue;
      keep.push(e);
      const k = e.t / e.life;
      if (e.type === 'p') {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vy += 30 * s * dt;
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * (1 - k * 0.5), 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'w') {
        const n = e.note;
        const st = this.staffOf(n.hand);
        const d = diatonic(n.step, n.octave);
        const y = this.y(st, d);
        const x = this.playheadX + 2.2 * s;
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = COLORS.miss;
        ctx.save();
        ctx.translate(x + Math.sin(e.t * 50) * s * 0.25 * (1 - k), y);
        ctx.rotate(-0.33);
        ctx.beginPath();
        ctx.ellipse(0, 0, 0.7 * s, 0.52 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.font = `800 ${Math.round(1.1 * s)}px Nunito, system-ui, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(n.step + accidentalSymbol(n.alter), x + 1.2 * s, y + 0.4 * s);
        // ledger lines for the ghost
        const ref = st === 'R' ? TREBLE_TOP : BASS_TOP;
        ctx.strokeStyle = COLORS.miss;
        ctx.lineWidth = Math.max(1, s * 0.12);
        for (let dd = ref - 10; dd >= d; dd -= 2) { const yy = this.y(st, dd); ctx.beginPath(); ctx.moveTo(x - 1.1 * s, yy); ctx.lineTo(x + 1.1 * s, yy); ctx.stroke(); }
        for (let dd = ref + 2; dd <= d; dd += 2) { const yy = this.y(st, dd); ctx.beginPath(); ctx.moveTo(x - 1.1 * s, yy); ctx.lineTo(x + 1.1 * s, yy); ctx.stroke(); }
      } else if (e.type === 't') {
        const y = this.staffTop[this.staves[0]] - 1.6 * s - k * 1.5 * s;
        ctx.globalAlpha = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8;
        ctx.font = `900 ${Math.round(1.6 * s * (1 + 0.15 * Math.max(0, 0.2 - k) * 5))}px Nunito, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = e.color;
        ctx.fillText(e.text, this.playheadX, Math.max(1.6 * s, y));
        ctx.textAlign = 'left';
      }
      ctx.globalAlpha = 1;
    }
    this.effects = keep;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export { STEP_INDEX };
