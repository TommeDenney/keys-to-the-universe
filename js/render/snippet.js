// Song-card sheet music: a short excerpt of each song's melody, printed on one of
// the Shop's sheet-music papers (just for show, no need to own it).
//   excerpt(song)  picks the hook: the most repeated two bars of the right hand
//                  (usually the chorus), else the opening. Baked for built-in and
//                  catalogue songs into data/snippets.json, worked out live for imports.
//   snippetSVG(ex, songId)  draws it.

import { diatonic, keyAlterMap, spellMidi, SHARP_ORDER, FLAT_ORDER } from '../music/theory.js';
import { SHOP } from '../data/shop.js';
import { SHEET_THEMES } from './sheet.js';

const EPS = 1e-6;
const MAX_NOTES = 16;

/** The excerpt as compact data: { k, len, bars:[...], n:[[diatonic, alter, start, dur], ...] }. */
export function excerpt(song) {
  const ms = song.measures || [];
  let mel = (song.notes || []).filter((n) => n.hand === 'R');
  if (!mel.length) mel = song.notes || [];
  if (!ms.length || !mel.length) return null;
  const end = (i) => ms[i].start + ms[i].len;
  const take = (i, w) => {
    const a = ms[i].start, b = end(Math.min(ms.length - 1, i + w - 1));
    return { a, b, notes: mel.filter((n) => n.start >= a - EPS && n.start < b - EPS) };
  };
  const sig = ({ a, notes }) => notes.map((n) => `${n.midi}:${(n.start - a).toFixed(2)}:${n.dur.toFixed(2)}`).join(' ');
  // Count how often each two-bar phrase comes back; the hook repeats most.
  const counts = new Map();
  const wins = [];
  for (let i = 0; i < ms.length; i++) {
    const w = take(i, 2);
    if (w.notes.length < 3) continue;
    const k = sig(w);
    counts.set(k, (counts.get(k) || 0) + 1);
    wins.push({ i, k });
  }
  if (!wins.length) return null;
  let best = wins[0];
  for (const w of wins) if (counts.get(w.k) > counts.get(best.k)) best = w;
  let win = take(best.i, 2);
  if (win.notes.length > MAX_NOTES + 2) win = take(best.i, 1); // busy music: one bar is plenty
  let { a, b, notes } = win;
  const starts = [...new Set(notes.map((n) => +n.start.toFixed(4)))].sort((x, y) => x - y);
  if (starts.length > MAX_NOTES) { b = starts[MAX_NOTES]; notes = notes.filter((n) => n.start < b - EPS); }
  const key = song.keyFifths || 0;
  const bars = ms.map((m) => m.start).filter((t) => t > a + EPS && t < b - EPS).map((t) => +(t - a).toFixed(3));
  return {
    k: key, len: +(b - a).toFixed(3), bars,
    n: notes.map((n) => {
      const sp = n.step ? n : spellMidi(n.midi, key);
      return [diatonic(sp.step, sp.octave), sp.alter || 0, +(n.start - a).toFixed(3), +Math.min(n.dur, b - n.start).toFixed(3)];
    }),
  };
}

// Baked excerpts (data/snippets.json), loaded once.
let baked = null;
export function loadSnippets() {
  return (baked ||= fetch(new URL('../data/snippets.json', import.meta.url)).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
}

// ---- Papers ----------------------------------------------------------------------
let papers = null;
function allPapers() {
  if (!papers) {
    papers = SHOP.filter((it) => it.cat === 'sheet').map((it) => it.look || SHEET_THEMES[it.id.replace('sheet-', '')]).filter(Boolean);
    if (!papers.length) papers = [SHEET_THEMES.classic];
  }
  return papers;
}
const hash = (s) => { let x = 2166136261; for (const c of s) x = Math.imul(x ^ c.charCodeAt(0), 16777619); return x >>> 0; };
export const paperFor = (id) => { const p = allPapers(); return p[hash(id) % p.length]; };

// Notehead colours by letter name (C red … B violet), like classroom bells.
const NOTE_COLOURS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#6366F1', '#A855F7'];

// ---- Drawing ----------------------------------------------------------------------
const W = 220, H = 110;
const GAP = 8; // space between staff lines
const MID = 40; // y of the middle line (B4), leaving room for the level tag below
const RX = GAP * 0.66, RY = GAP * 0.5; // notehead
const SO = RX - 0.6; // stem offset from the notehead centre
const B4 = diatonic('B', 4);
const yOf = (d) => MID - (d - B4) * (GAP / 2);
const f = (v) => +v.toFixed(1);
const MUSIC = '"Noto Music","Apple Symbols","Segoe UI Symbol",serif';
const ACC = { 1: '♯', '-1': '♭', 0: '♮', 2: '\u{1D12A}', '-2': '\u{1D12B}' };

/** The excerpt drawn as an SVG string, on the song's paper. */
export function snippetSVG(ex, songId) {
  const P = paperFor(songId);
  const head = `<svg class="snip" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="${W}" height="${H}" fill="${P.paper}"/>`;
  const out = [];
  const top = MID - 2 * GAP;
  for (let i = 0; i < 5; i++) out.push(`<line x1="0" x2="${W}" y1="${top + i * GAP}" y2="${top + i * GAP}" stroke="${P.line}" stroke-width="1"/>`);
  out.push(`<text x="3" y="${top + 3 * GAP}" font-family='${MUSIC}' font-size="${GAP * 4}" fill="${P.ink}">\u{1D11E}</text>`); // baseline on the G line
  // Key signature
  let x0 = 3 + GAP * 2.8;
  const k = ex ? ex.k : 0;
  const ks = k > 0 ? SHARP_ORDER.slice(0, k) : FLAT_ORDER.slice(0, -k);
  const KS_D = k > 0 ? [38, 35, 39, 36, 33, 37, 34] : [34, 37, 33, 36, 32, 35, 31];
  ks.forEach((_, i) => { out.push(`<text x="${x0 + i * 6}" y="${f(yOf(KS_D[i]) + 3.5)}" font-family='${MUSIC}' font-size="13" fill="${P.ink}">${k > 0 ? ACC[1] : ACC[-1]}</text>`); });
  x0 += ks.length * 6 + 6;
  if (!ex || !ex.n.length) return `${head}${out.join('')}</svg>`;

  const right = W - 10;
  const unit = (right - x0 - 6) / ex.len;
  const X = (t) => x0 + 6 + t * unit;
  for (const t of ex.bars) out.push(`<line x1="${f(X(t) - 5)}" x2="${f(X(t) - 5)}" y1="${top}" y2="${top + 4 * GAP}" stroke="${P.ink}" stroke-width="1.1"/>`);

  // Group notes that start together (chords share a stem).
  const groups = [];
  for (const [d, alter, start, dur] of ex.n) {
    let g = groups.find((x) => Math.abs(x.start - start) < EPS);
    if (!g) groups.push((g = { start, dur, ds: [] }));
    g.ds.push({ d, alter });
    g.dur = Math.max(g.dur, dur);
  }
  groups.sort((a, b) => a.start - b.start);
  const keyMap = keyAlterMap(k);
  const barOf = (t) => ex.bars.filter((b) => b <= t + EPS).length;
  const seen = new Map(); // accidentals already shown in this bar
  const valueOf = (dur) => (dur >= 3.9 ? { hollow: true, stem: false } : dur >= 1.9 ? { hollow: true, stem: true } : { hollow: false, stem: true, beams: dur < 0.4 ? 2 : dur < 0.9 ? 1 : 0 });

  for (const g of groups) {
    const v = valueOf(g.dur);
    const avg = g.ds.reduce((a, n) => a + n.d, 0) / g.ds.length;
    g.up = avg < B4;
    g.v = v;
    g.x = X(g.start);
    const ys = g.ds.map((n) => yOf(n.d));
    g.tipY = g.up ? Math.min(...ys) - GAP * 3.3 : Math.max(...ys) + GAP * 3.3;
    g.baseY = g.up ? Math.max(...ys) : Math.min(...ys);
  }
  // Beam runs of eighths/sixteenths within a beat.
  const runs = [];
  let run = [];
  for (const g of groups) {
    const beat = Math.floor(g.start + EPS);
    if (g.v.beams && run.length && run[0].v.beams && Math.floor(run[0].start + EPS) === beat && Math.abs(run[run.length - 1].start + run[run.length - 1].dur - g.start) < 0.01) run.push(g);
    else { if (run.length > 1) runs.push(run); run = g.v.beams ? [g] : []; }
  }
  if (run.length > 1) runs.push(run);
  for (const r of runs) {
    const up = r.reduce((a, g) => a + g.ds.reduce((s, n) => s + n.d, 0) / g.ds.length, 0) / r.length < B4;
    const tip = up ? Math.min(...r.map((g) => g.tipY)) : Math.max(...r.map((g) => g.tipY));
    r.forEach((g) => { g.up = up; g.tipY = tip; g.beamed = true; g.baseY = up ? Math.max(...g.ds.map((n) => yOf(n.d))) : Math.min(...g.ds.map((n) => yOf(n.d))); });
  }

  const ink = P.ink;
  for (const g of groups) {
    const sx = g.up ? g.x + SO : g.x - SO;
    // Ledger lines
    for (const n of g.ds) {
      for (let d = B4 - 6; d >= n.d; d -= 2) out.push(`<line x1="${f(g.x - RX - 2)}" x2="${f(g.x + RX + 2)}" y1="${f(yOf(d))}" y2="${f(yOf(d))}" stroke="${ink}" stroke-width="1"/>`);
      for (let d = B4 + 6; d <= n.d; d += 2) out.push(`<line x1="${f(g.x - RX - 2)}" x2="${f(g.x + RX + 2)}" y1="${f(yOf(d))}" y2="${f(yOf(d))}" stroke="${ink}" stroke-width="1"/>`);
    }
    if (g.v.stem) out.push(`<line x1="${f(sx)}" x2="${f(sx)}" y1="${f(g.baseY)}" y2="${f(g.tipY)}" stroke="${ink}" stroke-width="1.2"/>`);
    if (g.v.beams && !g.beamed) {
      for (let b = 0; b < g.v.beams; b++) {
        const y = g.tipY + (g.up ? b * 4 : -b * 4);
        out.push(`<path d="M${f(sx)} ${f(y)} q 5 ${g.up ? 5 : -5} 3 ${g.up ? 11 : -11}" stroke="${ink}" stroke-width="1.4" fill="none"/>`);
      }
    }
    for (const n of g.ds) {
      const y = yOf(n.d);
      const col = NOTE_COLOURS[((n.d % 7) + 7) % 7];
      // Accidental when it differs from the key (or from earlier in the bar)
      const letter = n.d % 7;
      const bar = barOf(g.start);
      const prev = seen.has(`${bar}:${n.d}`) ? seen.get(`${bar}:${n.d}`) : keyMap['CDEFGAB'[letter]];
      if (n.alter !== prev) { out.push(`<text x="${f(g.x - 12)}" y="${f(y + 3.5)}" font-family='${MUSIC}' font-size="12" fill="${ink}">${ACC[n.alter]}</text>`); seen.set(`${bar}:${n.d}`, n.alter); }
      out.push(g.v.hollow
        ? `<ellipse cx="${f(g.x)}" cy="${f(y)}" rx="${f(RX)}" ry="${f(RY)}" transform="rotate(-20 ${f(g.x)} ${f(y)})" fill="${P.paper}" stroke="${col}" stroke-width="1.8"/>`
        : `<ellipse cx="${f(g.x)}" cy="${f(y)}" rx="${f(RX)}" ry="${f(RY)}" transform="rotate(-20 ${f(g.x)} ${f(y)})" fill="${col}" stroke="${ink}" stroke-width=".5"/>`);
      if ([0.75, 1.5, 3].some((v) => Math.abs(g.dur - v) < 0.01)) out.push(`<circle cx="${f(g.x + 7)}" cy="${f(y - ((n.d - B4) % 2 === 0 ? GAP / 2 : 0))}" r="1.3" fill="${ink}"/>`); // dotted
    }
  }
  for (const r of runs) {
    const a = r[0], b = r[r.length - 1];
    const ax = a.up ? a.x + SO : a.x - SO, bx = b.up ? b.x + SO : b.x - SO;
    const levels = Math.min(...r.map((g) => g.v.beams));
    for (let l = 0; l < levels; l++) {
      const dy = a.up ? l * 4 : -l * 4;
      out.push(`<line x1="${f(ax)}" x2="${f(bx)}" y1="${f(a.tipY + dy)}" y2="${f(b.tipY + dy)}" stroke="${ink}" stroke-width="3"/>`);
    }
    // Extra sixteenth beams on the notes that need them
    r.forEach((g, i) => {
      if (g.v.beams > levels) {
        const gx = g.up ? g.x + SO : g.x - SO;
        const nb = r[i + 1] || r[i - 1];
        const dir = r[i + 1] ? 1 : -1;
        const len = Math.min(6, Math.abs((nb.up ? nb.x + SO : nb.x - SO) - gx) / 2);
        out.push(`<line x1="${f(gx)}" x2="${f(gx + dir * len)}" y1="${f(g.tipY + (g.up ? 4 : -4))}" y2="${f(g.tipY + (g.up ? 4 : -4))}" stroke="${ink}" stroke-width="3"/>`);
      }
    });
  }
  out.push(`<line x1="${right}" x2="${right}" y1="${top}" y2="${top + 4 * GAP}" stroke="${ink}" stroke-width="1.1"/>`);
  // High (or low) melodies: slide the whole staff so the notes stay on the card,
  // clear of the tags along the bottom.
  let minY = top, maxY = top + 4 * GAP;
  for (const g of groups) {
    for (const n of g.ds) { minY = Math.min(minY, yOf(n.d) - RY); maxY = Math.max(maxY, yOf(n.d) + RY); }
    if (g.v.stem) { minY = Math.min(minY, g.tipY - 2); maxY = Math.max(maxY, g.tipY + 2); }
  }
  const dy = minY < 4 ? 4 - minY : maxY > 80 ? Math.max(4 - minY, 80 - maxY) : 0;
  return `${head}<g transform="translate(0 ${f(dy)})">${out.join('')}</g></svg>`;
}
