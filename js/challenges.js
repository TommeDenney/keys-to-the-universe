// Daily / weekly / monthly challenges. Each period picks a few goals from a
// pool (deterministically, so they're stable within the period), tracks
// progress from what you play, and pays Stardust automatically when a goal is met.

import { getState, saveState } from './store.js';
import { earn, SYMBOL } from './economy.js';
import { toast } from './ui.js';
import { bumpLifetime, checkAchievements } from './achievements.js';

// ---- Challenge pools (100+ per period), generated from templates ------------
// General goals at several tiers + targeted goals (specific songs, galaxies,
// keys, grades). Targeted ones are only offered when you can actually do them.
import { builtinSongs } from './data/songs.js';
import { catalogPieces, pieceMeta } from './data/catalog.js';
export const gradeOf = (id) => (pieceMeta(id) || {}).grade || 0;
import { COURSE } from './data/course.js';
import { songUnlocked } from './unlocks.js';
import { lessonUnlocked } from './screens/learn.js';

const n = (x) => x.toLocaleString('en-US');
const STAT_TEXT = {
  worlds: (g) => `Complete ${g === 1 ? 'a world' : `${g} worlds`}`,
  steps: (g) => `Finish ${g} song practice steps`,
  stars: (g) => `Earn ${g} stars`,
  minutes: (g) => (g >= 120 ? `Practise for ${g / 60} hours` : `Practise for ${g} minutes`),
  timed: (g) => `Score 2★+ with the beat ${g === 1 ? 'once' : `${g} times`}`,
  threeStar: (g) => `Get ${g === 1 ? 'a 5-star result' : `${g} five-star results`}`,
  notes: (g) => `Play ${n(g)} correct notes`,
  perfect: (g) => `Hit ${n(g)} perfect-timed notes`,
  both: (g) => `Finish ${g === 1 ? 'a piece' : `${g} pieces`} with both hands`,
  listens: (g) => `Listen to ${g} song demos`,
  bosses: (g) => `Defeat ${g === 1 ? 'a Guardian' : `${g} Guardians`}`,
  days: (g) => `Practise on ${g} different days`,
  mastered: (g) => `Master ${g === 1 ? 'a song' : `${g} songs`}: 3★ with the beat`,
  flawless: (g) => `Play ${g === 1 ? 'a flawless run' : `${g} flawless runs`} (no misses, with the beat)`,
  quests: (g) => `Conquer ${g === 1 ? 'a rogue planet' : `${g} rogue planets`}`,
};
const TIERS = {
  daily: { worlds: [1, 2, 3], steps: [3, 5, 8], stars: [10, 15, 20], minutes: [10, 15, 20, 30], timed: [1, 2, 3], threeStar: [1, 2, 3], notes: [150, 250, 400, 600], perfect: [30, 60, 100], both: [1, 2, 3], listens: [2, 3, 5] },
  weekly: { worlds: [5, 8, 12], bosses: [1, 2, 3], days: [4, 5, 6], mastered: [1, 2, 3], stars: [50, 75, 100], minutes: [60, 90, 120, 180], notes: [1200, 2000, 3000], perfect: [300, 500, 800], flawless: [1, 2, 3], quests: [1, 2], both: [5, 8], threeStar: [5, 8, 12] },
  monthly: { worlds: [15, 20, 30], bosses: [3, 5, 8], days: [12, 15, 20], minutes: [300, 450, 600], mastered: [4, 6, 10], notes: [6000, 9000, 15000], perfect: [1500, 2500, 4000], flawless: [5, 8, 12], quests: [2, 3, 5], stars: [200, 300, 400], threeStar: [20, 30] },
};
const BASE = { daily: 18, weekly: 90, monthly: 380 };
const KEYS = [[0, 'C major / A minor'], [1, 'G major'], [-1, 'F major'], [2, 'D major'], [-2, 'B♭ major']];

let pools = null;
let builtFor = -1;
function buildPools() {
  const songs = builtinSongs().filter((x) => !x.id.startsWith('boss-'));
  const pieces = catalogPieces();
  const out = { daily: [], weekly: [], monthly: [] };
  for (const p of Object.keys(out)) {
    // General goals at every tier.
    for (const [stat, goals] of Object.entries(TIERS[p])) {
      goals.forEach((goal, tier) => out[p].push({ id: `${p[0]}-${stat}-${goal}`, stat, goal, reward: Math.round(BASE[p] * (1 + tier * 0.6)), text: STAT_TEXT[stat](goal) }));
    }
    const bonus = BASE[p];
    if (p === 'daily') {
      for (const x of songs) {
        out[p].push({ id: `d-song-${x.id}`, stat: `song:${x.id}`, goal: 1, reward: bonus, text: `Play “${x.title}” (any mode, 1★+)`, avail: () => songUnlocked(x.id) });
        out[p].push({ id: `d-tsong-${x.id}`, stat: `timedsong:${x.id}`, goal: 1, reward: Math.round(bonus * 1.6), text: `Score 2★+ with the beat on “${x.title}”`, avail: () => songUnlocked(x.id) });
      }
      for (const [k, name] of KEYS) out[p].push({ id: `d-key-${k}`, stat: `key:${k}`, goal: 1, reward: Math.round(bonus * 1.3), text: `Finish a piece in ${name}`, avail: () => songs.some((x) => x.keyFifths === k && songUnlocked(x.id)) });
      for (const u of COURSE) out[p].push({ id: `d-gal-${u.id}`, stat: `galaxy:${u.id}`, goal: 1, reward: Math.round(bonus * 1.4), text: `Complete a world in the ${u.title} galaxy`, avail: () => u.lessons.some((l) => lessonUnlocked(l.id)) });
    } else {
      const big = p === 'monthly';
      for (const x of [...songs, ...pieces.filter((q) => q.grade <= 8)]) {
        out[p].push({ id: `${p[0]}-master-${x.id}`, stat: `mastersong:${x.id}`, goal: 1, reward: Math.round(bonus * (big ? 0.8 : 1.6) + (x.grade || 0) * 15), text: `Master “${x.title}”: 3★ with the beat`, avail: () => songUnlocked(x.id) });
      }
      for (let g = 1; g <= 10; g++) out[p].push({ id: `${p[0]}-grade-${g}`, stat: `grade:${g}`, goal: big ? 6 : 3, reward: Math.round(bonus * (1.2 + g * 0.15)), text: `Score 2★+ on Grade-${g} pieces ${big ? 6 : 3} times`, avail: () => pieces.some((q) => q.grade === g && songUnlocked(q.id)) });
      for (const u of COURSE) out[p].push({ id: `${p[0]}-gal-${u.id}`, stat: `galaxy:${u.id}`, goal: big ? 6 : 3, reward: Math.round(bonus * 1.5), text: `Complete ${big ? 6 : 3} worlds in the ${u.title} galaxy`, avail: () => u.lessons.some((l) => lessonUnlocked(l.id)) });
    }
  }
  return out;
}
function poolFor(p) {
  // Rebuild once the piece catalogue has loaded (it arrives after start-up).
  if (!pools || builtFor !== catalogPieces().length) { pools = buildPools(); builtFor = catalogPieces().length; }
  return pools[p];
}
const POOL = { get daily() { return poolFor('daily'); }, get weekly() { return poolFor('weekly'); }, get monthly() { return poolFor('monthly'); } };
export const poolSizes = () => ({ daily: POOL.daily.length, weekly: POOL.weekly.length, monthly: POOL.monthly.length });

const PICK = { daily: 10, weekly: 10, monthly: 10 };
export const PERIODS = [
  { id: 'daily', name: 'Daily', resets: 'Resets at midnight' },
  { id: 'weekly', name: 'Weekly', resets: 'Resets Monday' },
  { id: 'monthly', name: 'Monthly', resets: 'Resets on the 1st' },
];

const pad = (n) => String(n).padStart(2, '0');
function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function weekKey(d = new Date()) {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); // back to Monday
  return `W${dayKey(m)}`;
}
function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
const KEY = { daily: dayKey, weekly: weekKey, monthly: monthKey };

export function nextReset(period) {
  const d = new Date();
  if (period === 'daily') return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  if (period === 'weekly') { const m = new Date(d.getFullYear(), d.getMonth(), d.getDate()); m.setDate(m.getDate() + (8 - (m.getDay() || 7))); return m; }
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

function seeded(str) {
  let x = 2166136261;
  for (const c of str) x = Math.imul(x ^ c.charCodeAt(0), 16777619) >>> 0;
  return () => ((x = Math.imul(x ^ (x >>> 15), 2246822507) >>> 0) / 4294967296);
}

function store() {
  const st = getState();
  st.challenges ||= {};
  for (const p of Object.keys(POOL)) {
    const key = KEY[p]();
    const cur = st.challenges[p];
    if (!cur || cur.key !== key || cur.ids.length < PICK[p] || cur.ids.some((id) => !POOL[p].find((x) => x.id === id))) {
      // New period: pick goals deterministically for this period.
      const r = seeded(key + p);
      const shuffled = POOL[p].filter((c) => !c.avail || c.avail());
      for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      // One goal per stat, so a set never has "Earn 6 stars" and "Earn 9 stars" together.
      const stats = new Set();
      const pool = shuffled.filter((c) => !stats.has(c.stat) && stats.add(c.stat));
      // Keep some general goals in every set so there's always something for any session.
      const general = pool.filter((c) => !c.avail).slice(0, 4);
      const rest = pool.filter((c) => !general.includes(c)).slice(0, PICK[p] - general.length);
      st.challenges[p] = { key, ids: [...general, ...rest].map((c) => c.id), stats: {}, claimed: [], days: [] };
    }
  }
  return st.challenges;
}

/** Current challenges with progress, for display. */
export function current(period) {
  const c = store()[period];
  return c.ids.map((id) => {
    const def = POOL[period].find((x) => x.id === id);
    if (!def) return null;
    const value = def.stat === 'days' ? c.days.length : c.stats[def.stat] || 0;
    return { ...def, value: Math.min(value, def.goal), done: c.claimed.includes(id) };
  }).filter(Boolean);
}

/** Record activity: track('worlds', 1), track('notes', 37)… */
export function track(stat, amount = 1) {
  const all = store();
  const today = dayKey();
  for (const p of Object.keys(POOL)) {
    const c = all[p];
    c.stats[stat] = (c.stats[stat] || 0) + amount;
    if (!c.days.includes(today)) c.days.push(today);
  }
  if (!stat.includes(':')) bumpLifetime(stat, amount);
  saveState();
  checkComplete();
  checkAchievements();
}

function checkComplete() {
  const all = store();
  for (const p of Object.keys(POOL)) {
    for (const ch of current(p)) {
      if (ch.done || ch.value < ch.goal) continue;
      all[p].claimed.push(ch.id);
      bumpLifetime(`${p}Done`);
      saveState();
      earn(ch.reward, `${PERIODS.find((x) => x.id === p).name} challenge`);
      toast(`${PERIODS.find((x) => x.id === p).name} challenge complete: ${ch.text} (+${ch.reward} ${SYMBOL})`, 'ok');
    }
  }
}

/** Called on app start so "practise on N days" counts days you just open and play. */
export function touch() {
  store();
  saveState();
}

// ---- Guardians pay out once per week -------------------------------------
export function bossRewardAvailable(lessonId) {
  const st = getState();
  st.bossWeeks ||= {};
  return st.bossWeeks[lessonId] !== weekKey();
}
export function markBossRewarded(lessonId) {
  const st = getState();
  st.bossWeeks ||= {};
  st.bossWeeks[lessonId] = weekKey();
  saveState();
}
