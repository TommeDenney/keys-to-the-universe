// Constellations on the Learn map. Everyone gets the app's own star pictures
// (data/skyfigures.js); a private pack can bring personal ones instead: photos
// imported on this device only (never part of the public app) turned into star
// patterns. Each sits in a galaxy; reach it, unlock it with Stardust, see its story.

import { h, icon, modal, toast } from './ui.js';
import { constellationsDB, getState, saveState } from './store.js';
import { SKY_FIGURES } from './data/skyfigures.js';
import { COURSE } from './data/course.js';
import { lessonUnlocked } from './screens/learn.js';
import { spend, balance, SYMBOL } from './economy.js';

let cache = null;
export async function loadConstellations() {
  cache = await constellationsDB.all();
  return cache;
}
const skyUnlocked = () => (getState().skyUnlocked ||= []);
/** The constellations in a galaxy: your private ones if you have any, otherwise the app's own. */
export const constellationsFor = (unitId) => {
  const mine = cache || [];
  if (mine.length) return mine.filter((c) => c.galaxy === unitId);
  return SKY_FIGURES.filter((c) => c.galaxy === unitId).map((c) => ({ ...c, unlocked: skyUnlocked().includes(c.id) }));
};

export function galaxyReached(unitId) {
  const unit = COURSE.find((u) => u.id === unitId);
  return !!unit && unit.lessons.some((l) => lessonUnlocked(l.id));
}

/** Trace a constellation from a photo: strong outlines → spaced bright stars → connecting lines. */
export async function traceStars(dataUrl) {
  const img = await new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = dataUrl; });
  const W = 120;
  const H = Math.max(40, Math.round((W * img.naturalHeight) / img.naturalWidth));
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.filter = 'blur(1px)';
  ctx.drawImage(img, 0, 0, W, H);
  const d = ctx.getImageData(0, 0, W, H).data;
  const g = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) g[i] = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11;
  const cand = [];
  for (let y = 3; y < H - 3; y++) {
    for (let x = 3; x < W - 3; x++) {
      const p = (xx, yy) => g[yy * W + xx];
      const gx = -p(x - 1, y - 1) - 2 * p(x - 1, y) - p(x - 1, y + 1) + p(x + 1, y - 1) + 2 * p(x + 1, y) + p(x + 1, y + 1);
      const gy = -p(x - 1, y - 1) - 2 * p(x, y - 1) - p(x + 1, y - 1) + p(x - 1, y + 1) + 2 * p(x, y + 1) + p(x + 1, y + 1);
      // Favour the subject (usually centred) strongly over the background.
      const cx = (x / W - 0.5) * 2;
      const cy = (y / H - 0.45) * 2;
      cand.push([x, y, Math.hypot(gx, gy) * Math.exp(-(cx * cx * 2.2 + cy * cy * 1.1))]);
    }
  }
  cand.sort((a, b) => b[2] - a[2]);
  const minD = W / 8;
  const stars = [];
  for (const c of cand) {
    if (stars.length >= 15) break;
    if (stars.every((s) => (s[0] - c[0]) ** 2 + (s[1] - c[1]) ** 2 > minD * minD)) stars.push(c);
  }
  // Minimum spanning tree for the constellation lines.
  const inTree = [0];
  const lines = [];
  while (inTree.length < stars.length) {
    let best = null;
    for (const a of inTree) {
      for (let b = 0; b < stars.length; b++) {
        if (inTree.includes(b)) continue;
        const dd = (stars[a][0] - stars[b][0]) ** 2 + (stars[a][1] - stars[b][1]) ** 2;
        if (!best || dd < best[2]) best = [a, b, dd];
      }
    }
    inTree.push(best[1]);
    lines.push([best[0], best[1]]);
  }
  return { aspect: H / W, stars: stars.map(([x, y], i) => [+(x / W).toFixed(4), +(y / H).toFixed(4), i < 4 ? 3 : i < 9 ? 2 : 1.4]), lines };
}

/** Import a private pack file (.ivorypack.json). */
export async function importPack(file) {
  const data = JSON.parse(await file.text());
  if (!data || data.type !== 'ivory-constellations' || !Array.isArray(data.items)) throw new Error('That isn’t a constellation pack for this app.');
  const existing = new Map((await constellationsDB.all()).map((c) => [c.id, c]));
  for (const it of data.items) {
    const traced = await traceStars(it.image);
    const prev = existing.get(it.id);
    await constellationsDB.put({ ...it, ...traced, unlocked: prev ? prev.unlocked : false });
  }
  await loadConstellations();
  return data.items.length;
}

export function constellationSVG(c, cls = '') {
  const vb = `0 0 100 ${Math.round(100 * c.aspect)}`;
  const P = (s) => [s[0] * 100, s[1] * 100 * c.aspect];
  const lines = c.lines.map(([a, b], i) => { const [x1, y1] = P(c.stars[a]); const [x2, y2] = P(c.stars[b]); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="--i:${i}"/>`; }).join('');
  const stars = c.stars.map((s, i) => { const [x, y] = P(s); return `<circle cx="${x}" cy="${y}" r="${s[2]}" style="--i:${i}"/>`; }).join('');
  const wrap = h('div', { class: `constellation-art ${cls}` });
  wrap.innerHTML = `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g class="c-lines">${lines}</g><g class="c-stars">${stars}</g></svg>`;
  return wrap;
}

/** A constellation floating in its galaxy on the Learn map. */
export function constellationEl(c, onChange) {
  const reached = galaxyReached(c.galaxy);
  const state = c.unlocked ? 'unlocked' : reached ? 'available' : 'hidden';
  return h('button', { class: `constellation ${state}`, onclick: () => openConstellation(c, onChange), 'aria-label': `Constellation ${c.name}` }, [
    constellationSVG(c),
    h('span', { class: 'c-label' }, [
      h('small', {}, state === 'hidden' ? 'Unknown constellation' : 'Constellation'),
      h('b', {}, state === 'hidden' ? '? ? ?' : c.name),
      state === 'available' ? h('em', {}, [icon('lock'), ` ${c.price} ${SYMBOL}`]) : null,
    ]),
  ]);
}

export function openConstellation(c, onChange) {
  const reached = galaxyReached(c.galaxy);
  if (!c.unlocked) {
    modal((close) => [h('div', { class: 'const-modal' }, [
      constellationSVG(c, 'big'),
      h('div', { class: 'eyebrow' }, reached ? 'Constellation discovered' : 'Unknown constellation'),
      h('h2', {}, reached ? c.name : 'A mystery in the stars'),
      h('p', { class: 'muted' }, reached ? (c.builtin ? `Unlock ${c.name} to light it up and hear its story.` : `Unlock ${c.name} to reveal the picture it was drawn from.`) : 'Reach this galaxy on your journey to discover this constellation.'),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn ghost', onclick: close }, 'Close'),
        reached ? h('button', {
          class: 'btn primary', onclick: async () => {
            if (!spend(c.price)) { toast(`You need ${c.price - balance()} more ${SYMBOL}.`, 'bad'); return; }
            c.unlocked = true;
            if (c.builtin) { if (!skyUnlocked().includes(c.id)) skyUnlocked().push(c.id); saveState(); }
            else { await constellationsDB.put(c); await loadConstellations(); }
            close();
            reveal(c);
            if (onChange) onChange();
          },
        }, [`Unlock for ${c.price} ${SYMBOL}`]) : null,
      ]),
    ])]);
    return;
  }
  reveal(c);
}

function reveal(c) {
  if (c.builtin) {
    // The app's own constellations: lit up in full, with their legend.
    modal((close) => [h('div', { class: 'const-reveal sky-reveal' }, [
      h('div', { class: 'reveal-stage sky-stage' }, [constellationSVG(c, 'figure')]),
      h('div', { class: 'eyebrow' }, 'Constellation'),
      h('h2', {}, c.name),
      h('p', { class: 'muted' }, c.legend),
      h('div', { class: 'row' }, [h('button', { class: 'btn primary', onclick: close }, 'Close')]),
    ])]);
    return;
  }
  modal((close) => [h('div', { class: 'const-reveal' }, [
    h('div', { class: 'reveal-stage', style: { aspectRatio: `1 / ${c.aspect}` } }, [
      h('img', { class: 'reveal-photo', src: c.image, alt: c.name }),
      constellationSVG(c, 'overlay'),
    ]),
    h('h2', {}, c.name),
    h('p', { class: 'muted' }, c.caption || ''),
    h('div', { class: 'row' }, [h('button', { class: 'btn primary', onclick: close }, 'Close')]),
  ])]);
}
