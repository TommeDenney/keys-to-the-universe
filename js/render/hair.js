// Hairstyles for the explorer portrait (100×100, head centred at 50,46, r≈20).
// Drawn with reusable textures: coils, braids, locs, twists, cornrow rows, beads and
// laid edges. Every fill and stroke uses the hair "paint" (c.F), a vertical gradient
// that carries the base colour and the optional highlight (tips-up or roots-down),
// so highlights follow the real length of each style.
//
// Each style: { back?(c), front?(c), span: [top, bottom] } where span is the hair's
// vertical extent (the highlight gradient is stretched over it).

const f1 = (v) => +v.toFixed(1);

// ---- Building blocks -------------------------------------------------------------------
const cap = (c, d = 'M29 44 Q28 22 50 21 Q72 22 71 44 Q67 32 50 31 Q33 32 29 44 Z') => `<path d="${d}" fill="${c.F}"/>`;
const hairline = (c) => `<path d="M32 40 Q34 32 50 31 Q66 32 68 40" stroke="${c.dark}" stroke-width="1" fill="none" opacity=".35"/>`;
/** Faded sides: a soft shadow of hair over the temples. */
const fade = (c) => `<path d="M30 46 Q29 26 50 25 Q71 26 70 46 Q66 34 50 33 Q34 34 30 46 Z" fill="${c.F}" opacity=".5"/>`;
/** Little curls (natural texture) over an area. */
function coils(c, x0, x1, y0, y1, r, mode = 'line') {
  const o = [];
  let row = 0;
  for (let y = y0; y <= y1; y += r * 2, row++) {
    for (let x = x0 + (row % 2) * r; x <= x1; x += r * 2.3) {
      if (mode === 'fill') o.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${c.F}"/>`);
      else o.push(`<path d="M${f1(x - r)} ${f1(y)} a${r} ${r} 0 1 1 ${f1(r * 2)} 0" stroke="${c.hi}" stroke-width=".9" fill="none" opacity=".55"/>`);
    }
  }
  return o.join('');
}
/** A cloud of curls: lots of circles around an ellipse outline, plus texture. */
function cloud(c, cx, cy, rx, ry, r = 5, tex = true) {
  const o = [`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c.F}"/>`];
  const n = Math.round((rx + ry) / 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    o.push(`<circle cx="${f1(cx + Math.cos(a) * rx)}" cy="${f1(cy + Math.sin(a) * ry)}" r="${r}" fill="${c.F}"/>`);
  }
  if (tex) o.push(coils(c, cx - rx + 4, cx + rx - 4, cy - ry + 4, cy + ry - 4, r * 0.62));
  return o.join('');
}
/** A braid from (x,y0) down to y1: overlapping links, optional sway and beads. */
function braid(c, x, y0, y1, w = 4, sway = 0, beads = null) {
  const o = [];
  let i = 0;
  for (let y = y0; y <= y1; y += w * 0.8, i++) {
    const t = (y - y0) / Math.max(1, y1 - y0);
    const cx = x + Math.sin(t * Math.PI) * sway + (i % 2 ? w * 0.22 : -w * 0.22);
    o.push(`<ellipse cx="${f1(cx)}" cy="${f1(y)}" rx="${f1(w * 0.55)}" ry="${f1(w * 0.48)}" fill="${c.F}" stroke="${c.dark}" stroke-width=".5" transform="rotate(${i % 2 ? 28 : -28} ${f1(cx)} ${f1(y)})"/>`);
  }
  if (beads) o.push(bead(x + sway * 0, y1 + 2, beads));
  return o.join('');
}
const bead = (x, y, col) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="2.2" fill="${col}" stroke="#fff" stroke-width=".6" opacity=".95"/>`;
/** A loc: a thick, slightly wavy rope with texture. */
function loc(c, x, y0, y1, w = 4.6, wob = 2) {
  const m = (y0 + y1) / 2;
  const d = `M${x} ${y0} Q${f1(x + wob)} ${f1(m)} ${f1(x - wob * 0.4)} ${y1}`;
  return `<path d="${d}" stroke="${c.F}" stroke-width="${w}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c.hi}" stroke-width="1" fill="none" stroke-dasharray="1.6 2.4" opacity=".45"/>`;
}
/** A two-strand twist: a rope with diagonal stripes. */
function twist(c, x, y0, y1, w = 4.4, wob = 1.5) {
  const d = `M${x} ${y0} Q${f1(x + wob)} ${f1((y0 + y1) / 2)} ${x} ${y1}`;
  return `<path d="${d}" stroke="${c.F}" stroke-width="${w}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c.dark}" stroke-width="${w}" fill="none" stroke-dasharray=".9 2.2" opacity=".35"/>`;
}
/** Where the hairline sits at a given x (low at the temples, high in the middle). */
const hairY = (x) => 31 + ((x - 50) / 20) ** 2 * 10;
/**
 * Cornrow rows (front view): each starts at the hairline and runs back over the
 * crown, converging towards the back. `tight` pulls them together; `zig` adds a part.
 */
function rows(c, xs, _top = 22, _bottom = 42, tight = 0) {
  return xs.map((x) => {
    const y0 = hairY(x) - 0.5;
    const xTop = 50 + (x - 50) * (0.55 - tight);
    const d = `M${f1(x)} ${f1(y0)} Q${f1(x + (x - 50) * 0.08)} ${f1((y0 + 21) / 2)} ${f1(xTop)} 20.5`;
    return `<path d="${d}" stroke="${c.F}" stroke-width="5.2" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c.hi}" stroke-width="1.1" fill="none" stroke-dasharray="1.8 1.6" opacity=".65"/>`;
  }).join('') + xs.slice(1).map((x, i) => { const mx = (x + xs[i]) / 2; return `<path d="M${f1(mx)} ${f1(hairY(mx) - 1)} Q${f1(mx)} ${f1((hairY(mx) + 21) / 2)} ${f1(50 + (mx - 50) * 0.55)} 21" stroke="${c.skinLine}" stroke-width=".7" fill="none" opacity=".55"/>`; }).join('');
}
/** Laid edges: baby-hair swoops at the temples. */
const edges = (c) => `<path d="M32 42 Q30 46 33 48 Q36 47 34 45 M31 38 Q29 41 31 43 M68 42 Q70 46 67 48 Q64 47 66 45 M69 38 Q71 41 69 43" stroke="${c.F}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
const bun = (c, cx, cy, r, tex = true) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c.F}"/>${tex ? coils(c, cx - r + 2, cx + r - 2, cy - r + 2, cy + r - 2, r * 0.22) : `<path d="M${cx - r * 0.6} ${cy} Q${cx} ${cy - r * 0.7} ${cx + r * 0.6} ${cy}" stroke="${c.hi}" stroke-width="1" fill="none" opacity=".6"/>`}`;
const sleek = (c, part = 50) => `<path d="M29 44 Q28 22 50 21 Q72 22 71 44 Q67 32 50 31 Q33 32 29 44 Z" fill="${c.F}"/><path d="M${part} 21 Q${part - 1} 26 ${part} 31" stroke="${c.dark}" stroke-width=".8" fill="none" opacity=".6"/><path d="M34 30 Q42 25 50 25 M66 30 Q58 25 50 25" stroke="${c.hi}" stroke-width=".9" fill="none" opacity=".5"/>`;
/** Box-braid parting: a little grid of parts over the cap. */
const boxParts = (c) => `<path d="M50 21 V31 M42 22 L41 32 M58 22 L59 32 M35 26 L33 36 M65 26 L67 36 M33 27 Q50 22 67 27" stroke="${c.skinLine}" stroke-width=".7" fill="none" opacity=".6"/>`;
const BEADS = ['#FBBF24', '#F472B6', '#38BDF8', '#F8FAFC', '#A78BFA'];
const xsRange = (a, b, n) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));


/** A springy coil from (x,y0) downward: tight S-loops, like a defined curl. */
function spring(c, x, y0, y1, w = 2.6, amp = 2.2) {
  let d = `M${f1(x)} ${f1(y0)}`;
  const step = 2.6;
  let side = 1;
  for (let y = y0; y < y1; y += step, side = -side) d += ` q${f1(amp * side)} ${f1(step / 2)} 0 ${f1(step)}`;
  return `<path d="${d}" stroke="${c.F}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${c.hi}" stroke-width=".7" fill="none" opacity=".45" stroke-dasharray="1.2 2.4"/>`;
}
/** A fuller scalp cap (covers more of the head) for locs, twists and braids. */
const fullCap = (c) => `<path d="M27 47 Q24 15 50 14 Q76 15 73 47 Q68 33 50 31.5 Q32 33 27 47 Z" fill="${c.F}"/>`;
/** Scalp parting: rows of little squares, one per loc / twist / braid. */
function parting(c, rows = 4) {
  const out = [];
  for (let r = 0; r < rows; r++) {
    const y = 17 + r * 4.4;                 // rows from the crown towards the hairline
    const half = 13 + r * 3.6;              // wider as the head widens
    out.push(`<path d="M${f1(50 - half)} ${f1(y + 3.6 + r * 0.6)} Q50 ${f1(y)} ${f1(50 + half)} ${f1(y + 3.6 + r * 0.6)}" stroke="${c.skinLine}" stroke-width=".75" fill="none" opacity=".7"/>`);
    const n = 3 + r;
    for (let k = 0; k <= n; k++) {
      const x = 50 - half + (2 * half * (k + (r % 2 ? 0.5 : 0))) / (n + 0.5);
      if (x < 50 - half + 1 || x > 50 + half - 1) continue;
      const yy = y + 3.6 + r * 0.6 - Math.cos(((x - 50) / half) * 1.2) * 3.4;
      out.push(`<path d="M${f1(x)} ${f1(yy)} v4.2" stroke="${c.skinLine}" stroke-width=".75" opacity=".7"/>`);
    }
  }
  return out.join('');
}

// ---- Styles ------------------------------------------------------------------------
export const HAIR = {
  'hair-none': { span: [20, 40] },

  // Short & sculpted
  'hair-twa': { span: [20, 44], front: (c) => `${cap(c, 'M30 42 Q29 21 50 21 Q71 21 70 42 Q66 30 50 30 Q34 30 30 42 Z')}${coils(c, 32, 68, 24, 30, 2.1)}` },
  'hair-buzz': { span: [22, 44], front: (c) => `${cap(c, 'M30 42 Q29 24 50 24 Q71 24 70 42 Q66 32 50 32 Q34 32 30 42 Z')}<path d="M36 28 Q50 24 64 28" stroke="${c.hi}" stroke-width=".8" fill="none" opacity=".4"/>` },
  'hair-caesar': { span: [22, 44], front: (c) => `${cap(c, 'M30 42 Q29 23 50 23 Q71 23 70 42 Q66 32 50 32 Q34 32 30 42 Z')}<path d="M33 33 Q50 30 67 33" stroke="${c.dark}" stroke-width="1.6" fill="none"/><path d="M38 26 L44 31" stroke="${c.skinLine}" stroke-width="1.2"/>${fade(c)}` },
  'hair-waves': { span: [21, 44], front: (c) => `${cap(c)}<path d="M33 37 Q41 33 50 35 Q59 33 67 37 M35 31 Q42 27 50 29 Q58 27 65 31 M39 26 Q45 23 50 24 Q55 23 61 26" stroke="${c.hi}" stroke-width="1.2" fill="none" opacity=".8"/>${fade(c)}` },
  'hair-hightop': { up: true, span: [4, 44], front: (c) => `<path d="M31 44 Q30 30 33 26 L33 4 Q50 0 67 4 L67 26 Q70 30 69 44 Q66 32 50 31 Q34 32 31 44 Z" fill="${c.F}"/>${coils(c, 35, 65, 7, 24, 2.2)}${fade(c)}` },
  'hair-flattop': { up: true, span: [8, 44], front: (c) => `<path d="M31 44 Q30 30 32 24 L33 9 L67 9 L68 24 Q70 30 69 44 Q66 32 50 31 Q34 32 31 44 Z" fill="${c.F}"/><path d="M33 9 H67" stroke="${c.hi}" stroke-width="1.4" opacity=".6"/>${coils(c, 36, 64, 13, 26, 2)}${fade(c)}` },
  'hair-fingerwaves': { span: [20, 46], front: (c) => `${cap(c)}<path d="M31 40 Q36 34 41 38 Q46 34 51 38 Q56 34 61 38 Q66 34 69 39 M33 32 Q38 27 43 31 Q48 27 53 31 Q58 27 63 31 Q67 28 68 32 M38 25 Q43 22 48 25 Q53 22 58 25" stroke="${c.hi}" stroke-width="1.6" fill="none" opacity=".75"/>${edges(c)}` },
  'hair-frohawk': { up: true, span: [4, 44], front: (c) => `${fade(c)}${cloud(c, 50, 18, 9, 13, 4.2)}<path d="M41 32 Q42 26 50 24 Q58 26 59 32" fill="${c.F}"/>` },
  'hair-spongetwists': { up: true, span: [10, 44], front: (c) => `${fade(c)}${cap(c, 'M33 34 Q34 22 50 21 Q66 22 67 34 Q62 30 50 30 Q38 30 33 34 Z')}${xsRange(36, 64, 8).map((x, i) => twist(c, x, 26 - (i % 2) * 3, 14 + (i % 3) * 2, 4.2, 1)).join('')}` },
  'hair-starterlocs': { up: true, span: [8, 46], front: (c) => `${fullCap(c)}${parting(c, 4)}${xsRange(33, 67, 9).map((x, i) => loc(c, x, 24, 13 + (i % 3) * 3 + Math.abs(x - 50) * 0.45, 4.2, 1)).join('')}` },
  'hair-cornrows': { span: [21, 46], front: (c) => `${cap(c)}${rows(c, xsRange(35, 65, 6), 22, 44)}` },
  'hair-cornrowzig': { span: [21, 46], front: (c) => `${cap(c)}${rows(c, xsRange(36, 64, 5), 22, 44, .05)}<path d="M40 24 L44 29 L40 34 L44 39 M60 24 L56 29 L60 34 L56 39" stroke="${c.skinLine}" stroke-width="1" fill="none"/>` },

  // Afros, puffs & curls
  'hair-afro': { volume: 5, span: [6, 60], back: (c) => cloud(c, 50, 34, 26, 26, 5), front: (c) => `<path d="M30 40 Q32 26 50 26 Q68 26 70 40 Q64 32 50 32 Q36 32 30 40 Z" fill="${c.F}"/>` },
  'hair-bigafro': { volume: 10, span: [0, 70], back: (c) => cloud(c, 50, 32, 33, 32, 6), front: (c) => `<path d="M29 40 Q32 25 50 25 Q68 25 71 40 Q64 31 50 31 Q36 31 29 40 Z" fill="${c.F}"/>` },
  'hair-puffs': { volume: 6, up: true, span: [8, 44], back: (c) => `${cloud(c, 26, 22, 10, 10, 3.6)}${cloud(c, 74, 22, 10, 10, 3.6)}`, front: (c) => `${sleek(c)}${edges(c)}` },
  'hair-highpuff': { up: true, span: [0, 44], back: (c) => cloud(c, 50, 12, 15, 11, 4.2), front: (c) => `${sleek(c)}<path d="M44 22 Q50 19 56 22" stroke="${c.dark}" stroke-width="2.4" fill="none"/>${edges(c)}` },
  'hair-pineapple': { up: true, span: [0, 46], back: (c) => cloud(c, 50, 16, 13, 13, 4), front: (c) => `${sleek(c)}<path d="M31 40 q-3 5 0 10 q3 5 -1 9 M69 40 q3 5 0 10 q-3 5 1 9" stroke="${c.F}" stroke-width="1.6" fill="none"/>${edges(c)}` },
  'hair-twistout': { volume: 7, span: [6, 74], back: (c) => `${cloud(c, 50, 38, 28, 30, 5.5, false)}${xsRange(26, 74, 10).map((x, i) => `<path d="M${f1(x)} ${30 + (i % 2) * 6} q-3 6 0 12 q3 6 0 12" stroke="${c.hi}" stroke-width="1.1" fill="none" opacity=".55"/>`).join('')}`, front: (c) => `${cap(c)}${coils(c, 32, 68, 24, 31, 2.6, 'fill')}` },
  'hair-curly': { up: true, span: [8, 46], front: (c) => `${fade(c)}<path d="M31 40 Q30 22 36 16 Q40 10 46 12 Q50 7 55 11 Q61 9 64 15 Q70 20 69 40 Q64 30 50 29 Q36 30 31 40 Z" fill="${c.F}"/>${[34, 39, 44, 49, 54, 59, 64].map((x, i) => spring(c, x, 12 + (i % 2) * 2 + Math.abs(x - 50) * 0.18, 28 + (i % 2) * 2, 2.4, 1.8)).join('')}` },
  'hair-coils': { volume: 3, span: [10, 66], back: (c) => `<path d="M24 44 Q20 14 50 12 Q80 14 76 44 L78 62 Q70 66 64 60 L62 46 L38 46 L36 60 Q30 66 22 62 Z" fill="${c.F}"/>${[24, 28, 32, 68, 72, 76].map((x, i) => spring(c, x, 36, 60 + (i % 3) * 3, 3, 2.2)).join('')}`, front: (c) => `${fullCap(c)}${[33, 38, 43, 48, 53, 58, 63, 68].map((x, i) => spring(c, x, 16 + Math.abs(x - 50) * 0.3, 30 + Math.abs(x - 50) * 0.35 + (i % 2) * 2, 2.8, 2)).join('')}` },
  'hair-curlybob': { volume: 4, span: [12, 70], back: (c) => `${cloud(c, 50, 46, 27, 22, 5.2)}`, front: (c) => `${cap(c)}${coils(c, 32, 68, 22, 33, 3.2, 'fill')}` },
  'hair-crochet': { volume: 9, span: [8, 92], back: (c) => `${cloud(c, 50, 50, 30, 38, 6, false)}${xsRange(22, 78, 11).map((x, i) => `<path d="M${f1(x)} ${46 + (i % 2) * 8} q-4 6 0 12 q4 6 0 12 q-4 6 0 12" stroke="${c.hi}" stroke-width="1.2" fill="none" opacity=".55"/>`).join('')}`, front: (c) => `${cap(c)}${coils(c, 32, 68, 22, 32, 3, 'fill')}` },
  'hair-halfup': { volume: 4, span: [4, 80], back: (c) => `${cloud(c, 50, 58, 27, 22, 5, false)}${coils(c, 26, 74, 48, 76, 3.2)}`, front: (c) => `${sleek(c)}${bun(c, 50, 14, 9)}${edges(c)}` },

  // Braids
  'hair-boxbraids': { span: [20, 98], back: (c) => [22, 25.5, 29, 32.5, 67.5, 71, 74.5, 78].map((x) => braid(c, x, 38, 96, 3.8)).join(''), front: (c) => `${cap(c)}${boxParts(c)}${[28, 31, 69, 72].map((x) => braid(c, x, 42, 92, 3.4)).join('')}` },
  'hair-knotless': { span: [20, 98], back: (c) => xsRange(25, 75, 11).filter((x) => x < 36 || x > 64).map((x, i) => braid(c, x, 40, 92, 3.2, 0, BEADS[i % BEADS.length])).join(''), front: (c) => `${sleek(c, 46)}${edges(c)}` },
  'hair-goddess': { span: [20, 98], back: (c) => xsRange(26, 74, 9).filter((x) => x < 36 || x > 64).map((x) => `${braid(c, x, 40, 80, 3.8)}<path d="M${x} 80 q-4 5 0 9 q4 4 0 8" stroke="${c.F}" stroke-width="2" fill="none"/>`).join(''), front: (c) => `${cap(c)}<path d="M36 34 q-3 4 0 8 q3 4 0 8 M64 34 q3 4 0 8 q-3 4 0 8" stroke="${c.F}" stroke-width="1.6" fill="none"/>${edges(c)}` },
  'hair-fulani': { span: [20, 96], back: (c) => `${braid(c, 27, 42, 92, 3.6, 0, '#FBBF24')}${braid(c, 73, 42, 92, 3.6, 0, '#FBBF24')}${braid(c, 31, 44, 86, 3.2, 0, '#F8FAFC')}${braid(c, 69, 44, 86, 3.2, 0, '#F8FAFC')}`, front: (c) => `${cap(c)}${rows(c, [50], 21, 32)}${rows(c, [38, 62], 24, 42, .1)}${bead(50, 33, '#FBBF24')}${edges(c)}` },
  'hair-feedin': { span: [20, 70], back: (c) => `${braid(c, 50, 18, 62, 4.6)}`, front: (c) => `${cap(c)}${rows(c, xsRange(35, 65, 5), 22, 42, .04)}${edges(c)}` },
  'hair-cornrowbun': { up: true, span: [4, 46], back: (c) => bun(c, 50, 12, 10, false) + `<path d="M42 12 Q50 6 58 12 M42 16 Q50 10 58 16" stroke="${c.dark}" stroke-width="1" fill="none" opacity=".5"/>`, front: (c) => `${cap(c)}${rows(c, xsRange(35, 65, 6), 22, 42, .02)}${edges(c)}` },
  'hair-pigtails': { span: [20, 92], back: (c) => `${braid(c, 27, 44, 88, 5.2, -2)}${braid(c, 73, 44, 88, 5.2, 2)}`, front: (c) => `${cap(c)}<path d="M50 21 V31" stroke="${c.dark}" stroke-width="1" opacity=".6"/>${bead(27, 46, '#F472B6')}${bead(73, 46, '#F472B6')}` },
  'hair-crown': { span: [14, 46], front: (c) => `${cap(c)}${braid(c, 31, 20, 40, 4.4, -2).replace(/rotate\((-?\d+)/g, 'rotate($1')}<path d="M30 28 Q50 10 70 28" stroke="${c.F}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M30 28 Q50 10 70 28" stroke="${c.hi}" stroke-width="1.2" fill="none" stroke-dasharray="2.4 1.6" opacity=".7"/>` },
  'hair-bantu': { up: true, span: [8, 44], front: (c) => `${cap(c)}${[[36, 22], [50, 15], [64, 22], [42, 28], [58, 28]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.6" fill="${c.F}"/><path d="M${x - 3.4} ${y} Q${x} ${y - 4.4} ${x + 3.4} ${y} Q${x} ${y + 2} ${x - 1.6} ${y - 0.6}" stroke="${c.hi}" stroke-width="1" fill="none" opacity=".75"/>`).join('')}` },

  // Twists & locs
  'hair-twists': { span: [14, 70], back: (c) => [26, 31, 69, 74].map((x) => twist(c, x, 36, 66, 5, 2)).join(''), front: (c) => `${fullCap(c)}${parting(c, 4)}${xsRange(36, 64, 5).map((x) => `<path d="M${x} 22 Q${x + 2} 27 ${x} 32" stroke="${c.hi}" stroke-width="1.2" fill="none" opacity=".6"/>`).join('')}` },
  'hair-passion': { volume: 2, span: [18, 96], back: (c) => xsRange(25, 75, 10).filter((x) => x < 37 || x > 63).map((x, i) => `${twist(c, x, 40, 92, 5.4, 3 * (i % 2 ? 1 : -1))}<path d="M${x} 50 q-2 4 1 8 M${x} 70 q2 4 -1 8" stroke="${c.hi}" stroke-width=".8" fill="none" opacity=".5"/>`).join(''), front: (c) => `${fullCap(c)}${parting(c, 4)}${edges(c)}` },
  'hair-locs': { span: [14, 92], back: (c) => [22, 26, 30, 70, 74, 78].map((x) => loc(c, x, 36, 88, 5)).join(''), front: (c) => `${fullCap(c)}${parting(c, 4)}${[31, 69].map((x) => loc(c, x, 38, 76, 4.6, x < 50 ? -1.5 : 1.5)).join('')}` },
  'hair-longlocs': { span: [14, 100], back: (c) => [20, 23.5, 27, 30.5, 69.5, 73, 76.5, 80].map((x, i) => loc(c, x, 36, 100, 4.6, (i % 2 ? 2.5 : -2.5))).join(''), front: (c) => `${fullCap(c)}${parting(c, 4)}${[30, 34, 66, 70].map((x) => loc(c, x, 38, 92, 4.4, x < 50 ? -2 : 2)).join('')}` },
  'hair-butterfly': { span: [14, 96], back: (c) => [22, 26, 30, 70, 74, 78].map((x) => `${loc(c, x, 36, 90, 5.6, 2)}${[50, 64, 78].map((y) => `<path d="M${x - 3} ${y} q3 -3 6 0" stroke="${c.F}" stroke-width="2.2" fill="none"/>`).join('')}`).join(''), front: (c) => `${fullCap(c)}${parting(c, 4)}${[31, 69].map((x) => `${loc(c, x, 38, 80, 5, x < 50 ? -1.5 : 1.5)}<path d="M${x - 3} 56 q3 -3 6 0 M${x - 3} 70 q3 -3 6 0" stroke="${c.F}" stroke-width="2" fill="none"/>`).join('')}${edges(c)}` },
  'hair-freeform': { volume: 4, span: [6, 60], back: (c) => xsRange(24, 76, 12).map((x, i) => loc(c, x, 30, 30 + 20 + (i % 3) * 6, 4.6, (i % 2 ? 4 : -4))).join(''), front: (c) => `${cap(c)}${xsRange(32, 68, 8).map((x, i) => loc(c, x, 26, 10 + (i % 3) * 4, 4.2, (i % 2 ? 3 : -3))).join('')}` },
  'hair-locknot': { up: true, span: [0, 44], front: (c) => `${fade(c)}${cap(c, 'M33 36 Q34 22 50 21 Q66 22 67 36 Q62 30 50 30 Q38 30 33 36 Z')}${xsRange(38, 62, 5).map((x) => loc(c, x, 26, 12, 4, 0)).join('')}${bun(c, 50, 10, 7, false)}${xsRange(42, 58, 4).map((x, i) => loc(c, x, 6, 0 - (i % 2) * 2, 3.4, (i % 2 ? 4 : -4))).join('')}` },
  'hair-locpony': { span: [0, 70], back: (c) => xsRange(42, 58, 5).map((x, i) => loc(c, x, 14, 60 + (i % 2) * 6, 4, (i % 2 ? 3 : -3))).join(''), front: (c) => `${sleek(c)}${xsRange(38, 62, 5).map((x) => `<path d="M${x} 30 Q${x + (50 - x) * .4} 22 50 16" stroke="${c.hi}" stroke-width="1" fill="none" opacity=".6"/>`).join('')}<rect x="44" y="12" width="12" height="5" rx="2.5" fill="${c.accent}"/>` },

  // Straight, sleek & waves
  'hair-silkpress': { span: [20, 96], back: (c) => `<path d="M28 40 Q26 72 30 94 L70 94 Q74 72 72 40 Q72 22 50 21 Q28 22 28 40 Z" fill="${c.F}"/>${xsRange(32, 68, 6).map((x) => `<path d="M${x} 50 V90" stroke="${c.hi}" stroke-width=".8" opacity=".35"/>`).join('')}`, front: (c) => `<path d="M29 48 Q28 22 50 21 Q72 22 71 48 Q66 30 44 30 Q36 34 29 48 Z" fill="${c.F}"/><path d="M44 21 Q42 25 44 30" stroke="${c.dark}" stroke-width=".8" fill="none" opacity=".6"/>` },
  'hair-wavy': { span: [20, 96], back: (c) => `<path d="M27 40 Q22 56 28 66 Q22 78 30 94 L70 94 Q78 78 72 66 Q78 56 73 40 Q72 21 50 20 Q28 21 27 40 Z" fill="${c.F}"/>${[30, 70].map((x) => `<path d="M${x} 48 q-4 8 0 16 q4 8 0 16" stroke="${c.hi}" stroke-width="1" fill="none" opacity=".45"/>`).join('')}`, front: (c) => `<path d="M29 46 Q28 22 50 21 Q72 22 71 46 Q66 30 56 30 Q50 38 42 32 Q34 34 29 46 Z" fill="${c.F}"/>` },
  'hair-ponytail': { span: [14, 86], back: (c) => `<path d="M64 26 Q86 34 80 60 Q78 76 70 84 Q74 64 68 46 Q66 36 62 30 Z" fill="${c.F}"/>`, front: (c) => `${sleek(c)}<circle cx="64" cy="27" r="3" fill="${c.accent}"/>${edges(c)}` },
  'hair-long': { span: [20, 94], back: (c) => `<path d="M28 40 Q26 70 30 92 L70 92 Q74 70 72 40 Q72 22 50 21 Q28 22 28 40 Z" fill="${c.F}"/>`, front: (c) => `<path d="M29 46 Q28 22 50 21 Q72 22 71 46 Q66 30 56 30 Q50 38 42 32 Q34 34 29 46 Z" fill="${c.F}"/>` },
  'hair-bob': { span: [20, 70], back: (c) => `<path d="M27 40 Q26 64 32 68 L68 68 Q74 64 73 40 Q72 21 50 20 Q28 21 27 40 Z" fill="${c.F}"/>`, front: (c) => `<path d="M29 44 Q28 22 50 21 Q72 22 71 44 Q64 30 50 32 Q36 30 29 44 Z" fill="${c.F}"/>` },
  'hair-short': { span: [20, 44], front: (c) => `${cap(c)}<path d="M30 40 Q36 28 52 28 Q46 32 44 38" fill="${c.F}"/>` },
  'hair-bun': { up: true, span: [4, 44], front: (c) => `${bun(c, 50, 13, 9, false)}${sleek(c)}` },
  'hair-mohawk': { up: true, span: [4, 44], front: (c) => `${fade(c)}<path d="M44 38 Q42 14 46 4 Q50 10 54 4 Q58 14 56 38 Z" fill="${c.F}"/>` },
  'hair-spiky': { up: true, span: [10, 44], front: (c) => `<path d="M29 44 L28 26 L35 30 L36 16 L43 25 L48 10 L53 24 L60 14 L62 28 L70 22 L71 44 Q66 32 50 31 Q34 32 29 44 Z" fill="${c.F}"/>` },

  // More cuts from around the world
  'hair-bluntbob': { span: [18, 70], back: (c) => `<path d="M27 38 Q26 66 30 68 L70 68 Q74 66 73 38 Q72 19 50 18 Q28 19 27 38 Z" fill="${c.F}"/>`, front: (c) => `<path d="M29 40 Q28 20 50 19 Q72 20 71 40 L71 41 L29 41 Z" fill="${c.F}"/><path d="M34 41 V36 M42 41 V35 M50 41 V35 M58 41 V35 M66 41 V36" stroke="${c.dark}" stroke-width=".7" opacity=".4"/>` },
  'hair-hime': { span: [18, 96], back: (c) => `<path d="M27 38 Q25 70 28 96 L72 96 Q75 70 73 38 Q72 19 50 18 Q28 19 27 38 Z" fill="${c.F}"/>`, front: (c) => `<path d="M29 40 Q28 20 50 19 Q72 20 71 40 L71 41 L29 41 Z" fill="${c.F}"/><path d="M28 42 L28 62 L33 62 L33 42 Z M72 42 L72 62 L67 62 L67 42 Z" fill="${c.F}"/>` },
  'hair-pixie': { span: [18, 46], front: (c) => `<path d="M29 46 Q27 20 50 19 Q73 20 71 44 Q66 30 58 30 Q52 36 42 34 Q36 38 33 46 Z" fill="${c.F}"/><path d="M44 22 Q38 28 36 36" stroke="${c.hi}" stroke-width="1" fill="none" opacity=".5"/>` },
  'hair-undercut': { span: [10, 44], front: (c) => `${fade(c)}<path d="M33 36 Q30 18 52 14 Q72 14 74 30 Q66 24 56 26 Q46 28 42 36 Z" fill="${c.F}"/><path d="M40 24 Q52 16 68 22" stroke="${c.hi}" stroke-width="1" fill="none" opacity=".6"/>` },
  'hair-asym': { span: [12, 60], front: (c) => `<path d="M30 44 Q28 30 32 26 Q32 34 34 44 Z" fill="${c.F}" opacity=".55"/><path d="M36 30 Q40 14 56 14 Q74 16 72 44 L72 60 Q66 52 64 42 Q60 28 48 28 Q40 30 36 30 Z" fill="${c.F}"/>` },
  'hair-quiff': { up: true, span: [6, 44], front: (c) => `${fade(c)}${cap(c)}<path d="M34 30 Q34 8 54 6 Q70 8 66 24 Q60 16 50 20 Q42 22 34 30 Z" fill="${c.F}"/><path d="M44 12 Q54 8 62 14" stroke="${c.hi}" stroke-width="1.1" fill="none" opacity=".6"/>` },
  'hair-sidepart': { span: [20, 44], front: (c) => `${cap(c)}<path d="M40 21 Q38 26 39 31" stroke="${c.skinLine}" stroke-width="1.2" fill="none"/><path d="M40 24 Q56 18 70 30" stroke="${c.hi}" stroke-width="1" fill="none" opacity=".5"/>` },
  'hair-slick': { span: [18, 44], front: (c) => `${cap(c, 'M30 42 Q28 18 50 18 Q72 18 70 42 Q66 30 50 30 Q34 30 30 42 Z')}${xsRange(36, 64, 5).map((x) => `<path d="M${x} 29 Q${x} 22 ${x + (x - 50) * .2} 19" stroke="${c.hi}" stroke-width=".9" fill="none" opacity=".55"/>`).join('')}` },
  'hair-fauxhawk': { up: true, span: [6, 44], front: (c) => `${fade(c)}<path d="M40 32 Q38 14 50 4 Q62 14 60 32 Q56 26 50 26 Q44 26 40 32 Z" fill="${c.F}"/><path d="M44 22 L50 8 L56 22" stroke="${c.hi}" stroke-width="1" fill="none" opacity=".6"/>` },
  'hair-balding': { span: [28, 50], front: (c) => `<path d="M29 46 Q28 34 32 30 Q34 38 33 48 Z M71 46 Q72 34 68 30 Q66 38 67 48 Z" fill="${c.F}"/>` },
  'hair-manbun': { up: true, span: [0, 44], front: (c) => `${bun(c, 50, 12, 8, false)}${sleek(c)}<path d="M44 14 Q50 10 56 14" stroke="${c.accent}" stroke-width="2" fill="none"/>` },
  'hair-topknot': { up: true, span: [0, 44], front: (c) => `${fade(c)}${bun(c, 50, 10, 6, false)}${cap(c, 'M33 34 Q34 22 50 21 Q66 22 67 34 Q62 30 50 30 Q38 30 33 34 Z')}` },
  'hair-messybun': { up: true, span: [0, 50], front: (c) => `${bun(c, 50, 12, 10, false)}<path d="M42 6 q-6 2 -4 8 M58 6 q6 2 4 8 M50 2 q-2 4 1 6" stroke="${c.F}" stroke-width="1.6" fill="none"/>${sleek(c)}<path d="M31 42 q-3 6 0 12 M69 42 q3 6 0 12" stroke="${c.F}" stroke-width="1.4" fill="none"/>` },
  'hair-spacebuns': { up: true, span: [4, 44], front: (c) => `${bun(c, 32, 16, 8, false)}${bun(c, 68, 16, 8, false)}${sleek(c)}` },
  'hair-chignon': { span: [20, 56], back: (c) => `<ellipse cx="50" cy="66" rx="12" ry="8" fill="${c.F}"/><path d="M42 66 Q50 60 58 66" stroke="${c.hi}" stroke-width="1" fill="none" opacity=".6"/>`, front: (c) => `${sleek(c, 44)}` },
  'hair-sidepony': { span: [20, 90], back: (c) => `<path d="M68 40 Q80 50 76 70 Q74 82 66 90 Q70 72 66 56 Q64 48 62 44 Z" fill="${c.F}"/>`, front: (c) => `${sleek(c, 42)}<circle cx="68" cy="42" r="2.6" fill="${c.accent}"/>` },
  'hair-curtain': { span: [18, 80], back: (c) => `<path d="M27 40 Q26 66 30 80 L70 80 Q74 66 73 40 Q72 19 50 18 Q28 19 27 40 Z" fill="${c.F}"/>`, front: (c) => `<path d="M29 46 Q28 20 50 19 Q72 20 71 46 Q66 32 52 30 L50 34 L48 30 Q34 32 29 46 Z" fill="${c.F}"/>` },
  'hair-shag': { span: [16, 74], back: (c) => `<path d="M26 38 Q22 56 28 74 L34 68 L38 76 L50 70 L62 76 L66 68 L72 74 Q78 56 74 38 Q72 17 50 16 Q28 17 26 38 Z" fill="${c.F}"/>`, front: (c) => `<path d="M29 46 Q27 18 50 17 Q73 18 71 46 L66 40 L62 34 L56 38 L50 32 L44 38 L38 34 L34 40 Z" fill="${c.F}"/>` },
  'hair-beachwaves': { volume: 2, span: [18, 96], back: (c) => `<path d="M26 40 Q20 54 26 64 Q20 76 28 86 Q24 92 30 96 L70 96 Q76 92 72 86 Q80 76 74 64 Q80 54 74 40 Q72 19 50 18 Q28 19 26 40 Z" fill="${c.F}"/>${[29, 71].map((x) => `<path d="M${x} 46 q-5 8 0 16 q5 8 0 16 q-4 6 0 12" stroke="${c.hi}" stroke-width="1.1" fill="none" opacity=".5"/>`).join('')}`, front: (c) => `<path d="M29 46 Q28 22 50 20 Q72 22 71 46 Q66 30 58 29 Q52 34 46 30 Q36 32 29 46 Z" fill="${c.F}"/>` },

  // Composer wigs and hair (any hair colour works: try white for a powdered wig)
  'hair-powdered': { span: [16, 60], back: (c) => `<path d="M44 40 Q50 66 56 40 Z" fill="${c.F}"/><path d="M50 56 q-6 2 -6 6 q6 -1 6 -4 q0 3 6 4 q0 -4 -6 -6 Z" fill="#111827"/>`, front: (c) => `<path d="M30 42 Q28 20 50 19 Q72 20 70 42 Q66 30 50 28 Q34 30 30 42 Z" fill="${c.F}"/><path d="M36 26 Q50 20 64 26" stroke="${c.hi}" stroke-width="1" fill="none" opacity=".6"/>${[38, 44].map((y) => `<ellipse cx="28.5" cy="${y}" rx="5" ry="3.2" fill="${c.F}" stroke="${c.dark}" stroke-width=".6"/><ellipse cx="71.5" cy="${y}" rx="5" ry="3.2" fill="${c.F}" stroke="${c.dark}" stroke-width=".6"/>`).join('')}` },
  'hair-baroque': { volume: 6, span: [12, 82], back: (c) => `${cloud(c, 30, 56, 9, 22, 4.4, false)}${cloud(c, 70, 56, 9, 22, 4.4, false)}${coils(c, 22, 38, 38, 76, 2.6)}${coils(c, 62, 78, 38, 76, 2.6)}`, front: (c) => `<path d="M28 44 Q26 16 50 15 Q74 16 72 44 Q66 30 50 29 Q34 30 28 44 Z" fill="${c.F}"/><path d="M50 15 V29" stroke="${c.dark}" stroke-width="1" opacity=".6"/>${coils(c, 30, 70, 18, 28, 2.6)}` },
  'hair-maestro': { volume: 4, span: [6, 52], back: (c) => `<path d="M24 50 Q16 30 26 18 Q24 28 30 30 Q26 14 40 8 Q38 18 44 20 Q46 6 58 8 Q54 16 60 20 Q66 10 74 16 Q70 24 74 28 Q84 32 76 50 Q70 36 50 32 Q30 36 24 50 Z" fill="${c.F}"/>`, front: (c) => `<path d="M30 42 Q30 26 42 22 Q38 30 44 32 Q48 22 56 22 Q54 30 60 32 Q66 26 70 30 Q72 36 70 42 Q64 32 50 31 Q36 32 30 42 Z" fill="${c.F}"/><path d="M34 34 Q38 26 44 24 M56 24 Q64 26 68 34" stroke="${c.hi}" stroke-width="1" fill="none" opacity=".55"/>` },
  'hair-romantic': { span: [16, 62], back: (c) => `<path d="M27 42 Q24 58 30 62 L36 54 L34 44 Z M73 42 Q76 58 70 62 L64 54 L66 44 Z" fill="${c.F}"/>`, front: (c) => `<path d="M28 48 Q26 18 50 17 Q74 18 72 46 Q66 30 54 28 Q44 32 38 30 Q32 36 28 48 Z" fill="${c.F}"/><path d="M38 30 Q48 22 60 24 M30 44 q-3 6 1 12" stroke="${c.hi}" stroke-width="1.1" fill="none" opacity=".55"/>` },
  'hair-liszt': { span: [16, 80], back: (c) => `<path d="M27 40 Q25 66 30 80 L70 80 Q75 66 73 40 Q72 19 50 18 Q28 19 27 40 Z" fill="${c.F}"/>`, front: (c) => `<path d="M29 46 Q27 18 50 17 Q73 18 71 46 Q68 28 50 27 Q32 28 29 46 Z" fill="${c.F}"/>${xsRange(36, 64, 5).map((x) => `<path d="M${x} 27 Q${x + (x - 50) * .15} 24 ${x + (x - 50) * .25} 21.5" stroke="${c.hi}" stroke-width=".9" fill="none" opacity=".55"/>`).join('')}` },

  // Whimsical (their own colours)
  'hair-flame': { span: [4, 42], fixed: true, front: () => `<path d="M30 42 Q24 26 34 18 Q34 26 40 26 Q38 12 50 4 Q50 16 58 18 Q58 8 66 14 Q74 24 70 42 Q64 30 50 30 Q36 30 30 42 Z" fill="#F97316"/><path d="M36 36 Q34 26 42 22 Q42 28 48 28 Q48 18 54 14 Q56 22 62 24 Q66 30 64 36 Q58 30 50 30 Q42 30 36 36 Z" fill="#FDE047"/>` },
  'hair-nebula': { span: [16, 44], fixed: true, front: () => `<path d="M28 44 Q24 18 50 16 Q76 18 72 44 Q66 30 50 30 Q34 30 28 44 Z" fill="#7C3AED"/><path d="M32 34 Q40 20 54 22 Q66 24 68 36 Q60 28 50 28 Q40 28 32 34 Z" fill="#EC4899" opacity=".8"/>${[[38, 24], [56, 20], [64, 30], [46, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="#fff"/>`).join('')}` },
  'hair-tentacles': { span: [8, 32], fixed: true, front: () => `${[34, 42, 50, 58, 66].map((x, i) => `<path d="M${x} 30 Q${x + (i - 2) * 4} 14 ${x + (i - 2) * 8} 10" stroke="#34D399" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="${x + (i - 2) * 8}" cy="10" r="2.4" fill="#A7F3D0"/>`).join('')}` },
  'hair-crystal': { span: [8, 42], fixed: true, front: () => `<path d="M30 42 L32 22 L38 30 L42 12 L48 26 L54 8 L58 26 L64 14 L66 30 L70 24 L70 42 Q64 32 50 31 Q36 32 30 42 Z" fill="#67E8F9"/><path d="M42 12 L44 28 M54 8 L54 26 M64 14 L62 28" stroke="#ECFEFF" stroke-width="1" opacity=".8"/>` },
};
