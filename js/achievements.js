// Achievements: lifetime stats, requirements for special Shop rewards (still
// bought with Stardust, but only once you've earned the right), and badges.

import { MAX_STARS } from './stars.js';
import { getState, saveState, progress } from './store.js';
import { COURSE, allLessons } from './data/course.js';
import { QUESTS } from './data/quests.js';
import { questDone, earnedTotal, ownedItems, ownedSongs, owns } from './economy.js';
import { galaxyName } from './screens/universe.js';
import { EVENTS, EVENT_ITEMS } from './data/events.js';

/** Lifetime counters (never reset), kept alongside the period challenges. */
export function lifetime() {
  const st = getState();
  st.lifetime ||= {};
  return st.lifetime;
}
export function bumpLifetime(stat, amount = 1) {
  const l = lifetime();
  l[stat] = (l[stat] || 0) + amount;
}

// ---- What you've done ------------------------------------------------------------
const worlds = () => allLessons().filter((l) => !l.boss && progress.lesson(l.id));
const guardians = () => allLessons().filter((l) => l.boss && progress.lesson(l.id));
const unitById = (id) => COURSE.find((u) => u.id === id);
// A galaxy skipped by beating its Guardian counts as cleared (but not as 100%).
const galaxyDone = (u) => progress.skipped(u.id) || (u.lessons.length > 0 && u.lessons.every((l) => progress.lesson(l.id)));
const galaxyPerfect = (u) => u.lessons.length > 0 && u.lessons.every((l) => (progress.lesson(l.id) || {}).stars >= MAX_STARS);
function bestStreak() {
  const l = lifetime();
  const cur = getState().streak ? getState().streak.count || 0 : 0;
  if (cur > (l.bestStreak || 0)) l.bestStreak = cur;
  return l.bestStreak || 0;
}

const KINDS = {
  planets: () => worlds().length,
  threeStar: () => worlds().filter((l) => (progress.lesson(l.id).stars || 0) >= MAX_STARS).length, // named from the 3-star days: now 5★
  guardians: () => guardians().length,
  boss: (r) => (progress.lesson(r.id) ? 1 : 0),
  rogues: () => QUESTS.filter((q) => questDone(q.id)).length,
  dailyDone: () => lifetime().dailyDone || 0,
  weeklyDone: () => lifetime().weeklyDone || 0,
  monthlyDone: () => lifetime().monthlyDone || 0,
  life: (r) => Math.floor(lifetime()[r.stat] || 0),
  days: () => (getState().practiceDays || []).length,
  streak: () => bestStreak(),
  galaxies: () => COURSE.filter(galaxyDone).length,
  perfectGalaxies: () => COURSE.filter(galaxyPerfect).length,
  galaxy: (r) => { const u = unitById(r.unit); return !u ? 0 : galaxyDone(u) ? u.lessons.length : u.lessons.filter((l) => progress.lesson(l.id)).length; },
  galaxyWorlds: (r) => { const u = unitById(r.unit); return u ? u.lessons.filter((l) => !l.boss && progress.lesson(l.id)).length : 0; },
  galaxyPerfect: (r) => { const u = unitById(r.unit); return u ? u.lessons.filter((l) => (progress.lesson(l.id) || {}).stars >= MAX_STARS).length : 0; },
  stardust: () => earnedTotal(),
  owned: () => ownedItems().length,
  songs: () => ownedSongs().length,
  badges: () => BADGES.filter((b) => b.kind !== 'badges' && reqProgress(b).met).length,
  eventItems: (r) => EVENT_ITEMS.filter((i) => (!r.event || i.event === r.event) && owns(i.id)).length,
};

function goalOf(req) {
  const u = req.unit && unitById(req.unit);
  if (req.kind === 'galaxy' || req.kind === 'galaxyPerfect') return u ? u.lessons.length : 1;
  if (req.kind === 'galaxyWorlds' && u) return Math.min(req.goal || 1, u.lessons.filter((l) => !l.boss).length);
  return req.goal || 1;
}

/** { value, goal, met } for a requirement. */
export function reqProgress(req) {
  const goal = goalOf(req);
  let value = 0;
  try { value = (KINDS[req.kind] || (() => 0))(req); } catch { value = 0; }
  value = Math.min(goal, value);
  return { value, goal, met: value >= goal };
}

const n = (x) => x.toLocaleString('en-US');
const LIFE_TEXT = {
  notes: (g) => `Play ${n(g)} correct notes`,
  perfect: (g) => `Hit ${n(g)} perfect-timed notes`,
  flawless: (g) => `Play ${g} flawless runs`,
  mastered: (g) => `Master ${g} songs (5★ with the beat)`,
  minutes: (g) => (g >= 60 ? `Practise for ${n(g / 60)} hours` : `Practise for ${g} minutes`),
  both: (g) => `Finish ${g} pieces with both hands`,
  listens: (g) => `Listen to ${g} song demos`,
  timed: (g) => `Score 2★+ with the beat ${g} times`,
};
const bossName = (id) => { const l = allLessons().find((x) => x.id === id); return l ? (l.guardian || l.title) : 'a Guardian'; };
const gname = (unitId) => { const u = unitById(unitId); return u ? galaxyName(u) : 'a galaxy'; };

/** Human-readable requirement. */
export function reqText(req) {
  if (req.text) return req.text;
  const g = req.goal || 1;
  switch (req.kind) {
    case 'planets': return g === 1 ? 'Complete a world' : `Complete ${g} worlds`;
    case 'threeStar': return `Get 5★ on ${g} worlds`;
    case 'guardians': return g === 1 ? 'Defeat a Guardian' : `Defeat ${g} Guardians`;
    case 'boss': return `Defeat ${bossName(req.id)}`;
    case 'rogues': return g >= QUESTS.length ? 'Conquer every rogue planet' : g === 1 ? 'Conquer a rogue planet' : `Conquer ${g} rogue planets`;
    case 'dailyDone': return `Complete ${g} daily challenges`;
    case 'weeklyDone': return `Complete ${g} weekly challenges`;
    case 'monthlyDone': return g === 1 ? 'Complete a monthly challenge' : `Complete ${g} monthly challenges`;
    case 'life': return (LIFE_TEXT[req.stat] || ((x) => `${req.stat} ${x}`))(g);
    case 'days': return `Practise on ${g} different days`;
    case 'streak': return `Reach a ${g}-day practice streak`;
    case 'galaxies': return g === 1 ? 'Complete a whole galaxy' : `Complete ${g} whole galaxies`;
    case 'perfectGalaxies': return g === 1 ? 'Collect every star in a galaxy' : `Collect every star in ${g} galaxies`;
    case 'galaxy': return `Complete the ${gname(req.unit)}`;
    case 'galaxyWorlds': return `Explore ${goalOf(req)} worlds in the ${gname(req.unit)}`;
    case 'galaxyPerfect': return `Collect every star in the ${gname(req.unit)}`;
    case 'stardust': return `Collect ${n(g)} Stardust in total`;
    case 'owned': return `Own ${g} Shop items`;
    case 'songs': return `Buy ${g} songs`;
    case 'badges': return `Earn ${g} badges`;
    case 'eventItems': return r_event(req);
    default: return 'Keep playing';
  }
}

// ---- Badges --------------------------------------------------------------------------
// tier: bronze / silver / gold / cosmic. Generated per galaxy and Guardian, plus milestones.
const B = (id, name, icon, tier, req, group) => ({ id, name, icon, tier, group, ...req });
const ladder = (group, kind, steps, icon, names, extra = {}) => steps.map((goal, i) =>
  B(`b-${kind}${extra.stat || ''}-${goal}`, names[i], icon, ['bronze', 'silver', 'gold', 'cosmic', 'cosmic'][Math.min(4, Math.round(i * 4 / Math.max(1, steps.length - 1)))], { kind, goal, ...extra }, group));

export const BADGES = [];
function buildBadges() {
  if (BADGES.length) return;
  BADGES.push(
    B('b-first', 'First Steps', '\u{1F463}', 'bronze', { kind: 'planets', goal: 1 }, 'Journey'),
    ...ladder('Journey', 'planets', [5, 10, 25, 50, 100], '\u{1FA90}', ['Explorer', 'Voyager', 'Pathfinder', 'Star Sailor', 'Worldwalker']),
    ...ladder('Journey', 'threeStar', [5, 15, 30, 60, 100], '⭐', ['Shining', 'Bright', 'Brilliant', 'Dazzling', 'Supernova']),
    ...ladder('Journey', 'galaxies', [1, 3, 5, 10, 19], '\u{1F30C}', ['Galaxy Hopper', 'Star Cartographer', 'Cosmic Wanderer', 'Galactic Legend', 'Master of the Universe']),
    ...ladder('Journey', 'perfectGalaxies', [1, 3, 5, 10], '\u{1F4AF}', ['Perfectionist', 'Star Collector', 'Constellation Keeper', 'Flawless Cosmos']),
    ...ladder('Guardians', 'guardians', [1, 3, 5, 10, 19], '⚔️', ['Challenger', 'Duelist', 'Champion', 'Guardian Slayer', 'Undefeated']),
    ...ladder('Side quests', 'rogues', [1, 3, 5, 7], '☄️', ['Rogue Hunter', 'Void Ranger', 'Comet Chaser', 'Lord of the Rogues']),
    ...ladder('Practice', 'days', [3, 7, 30, 100, 365], '\u{1F4C5}', ['Getting Started', 'One Week In', 'Month of Music', 'Hundred Days', 'A Year of Piano']),
    ...ladder('Practice', 'streak', [3, 7, 14, 30, 100], '\u{1F525}', ['On Fire', 'Week Streak', 'Fortnight Flame', 'Unstoppable', 'Eternal Flame']),
    ...ladder('Practice', 'life', [60, 300, 600, 1500, 3000], '⏱️', ['First Hour', 'Five Hours', 'Ten Hours', 'Twenty-Five Hours', 'Fifty Hours'], { stat: 'minutes' }),
    ...ladder('Skill', 'life', [1000, 5000, 20000, 50000, 100000], '\u{1F3B9}', ['Thousand Notes', 'Five Thousand', 'Twenty Thousand', 'Fifty Thousand', 'Hundred Thousand'], { stat: 'notes' }),
    ...ladder('Skill', 'life', [100, 1000, 5000, 15000], '\u{1F3AF}', ['Sharpshooter', 'Metronome', 'Clockwork', 'Atomic Clock'], { stat: 'perfect' }),
    ...ladder('Skill', 'life', [1, 5, 25, 100], '\u{1F48E}', ['Clean Run', 'Spotless', 'Immaculate', 'Diamond Hands'], { stat: 'flawless' }),
    ...ladder('Skill', 'life', [1, 5, 15, 40], '\u{1F3C5}', ['Mastered', 'Repertoire', 'Concert Ready', 'Virtuoso'], { stat: 'mastered' }),
    ...ladder('Skill', 'life', [1, 10, 50], '\u{1F64C}', ['Two Hands', 'Ambidextrous', 'Octopus'], { stat: 'both' }),
    ...ladder('Challenges', 'dailyDone', [1, 10, 50, 150, 365], '☀️', ['Daily Doer', 'Routine', 'Dedicated', 'Relentless', 'Daily Legend']),
    ...ladder('Challenges', 'weeklyDone', [1, 10, 30, 75], '\u{1F4C6}', ['Weekly Warrior', 'Consistent', 'Steadfast', 'Iron Will']),
    ...ladder('Challenges', 'monthlyDone', [1, 5, 15, 30], '\u{1F319}', ['Moonlit', 'Lunar', 'Eclipse', 'Celestial']),
    ...ladder('Collector', 'stardust', [500, 2500, 10000, 25000, 50000], '✦', ['Stardust Saver', 'Stardust Hoarder', 'Stardust Baron', 'Stardust Tycoon', 'Stardust Emperor']),
    ...ladder('Collector', 'owned', [3, 10, 25, 50, 100], '\u{1F6CD}️', ['Window Shopper', 'Collector', 'Connoisseur', 'Curator', 'Owns the Shop']),
    ...ladder('Collector', 'songs', [1, 5, 15, 40], '\u{1F3BC}', ['Song Seeker', 'Music Lover', 'Library Builder', 'Archivist']),
  );
  // One badge per galaxy for finishing it, one for collecting every star in it.
  for (const u of COURSE) {
    BADGES.push(B(`b-gal-${u.id}`, galaxyName(u), '\u{1F30C}', 'silver', { kind: 'galaxy', unit: u.id }, 'Galaxies'));
    BADGES.push(B(`b-galp-${u.id}`, `${galaxyName(u)}: 100%`, '\u{1F4AF}', 'gold', { kind: 'galaxyPerfect', unit: u.id }, 'Galaxies'));
  }
  // One per Guardian.
  for (const l of allLessons().filter((x) => x.boss)) BADGES.push(B(`b-boss-${l.id}`, l.guardian || l.title, '\u{1F3C6}', 'gold', { kind: 'boss', id: l.id }, 'Guardians'));
  // Holiday Season 2026: own a rare from each holiday, and collect them all.
  for (const e of EVENTS) BADGES.push(B(`b-ev-${e.id}`, `${e.name} ${e.buy.getFullYear()}`, e.emoji, 'gold', { kind: 'eventItems', event: e.id, goal: 1 }, 'Seasons'));
  BADGES.push(...ladder('Seasons', 'eventItems', [5, 15, 40, 80], '\u{1F381}', ['Festive', 'Season Collector', 'Rare Hunter', 'Legendary Collector']));
  BADGES.push(...ladder('Meta', 'badges', [10, 25, 50, 100], '\u{1F396}️', ['Badge Hunter', 'Badge Collector', 'Decorated', 'Living Legend']));
}

/** All badges with progress; groups in display order. */
export function badges() {
  buildBadges();
  // Once earned, a badge is yours for good (even if you reset a galaxy).
  const kept = new Set(lifetime().seen || []);
  return BADGES.map((b) => {
    const p = reqProgress(b);
    return { ...b, text: reqText(b), ...p, met: p.met || kept.has(b.id) };
  });
}
export const BADGE_GROUPS = ['Journey', 'Galaxies', 'Guardians', 'Side quests', 'Practice', 'Skill', 'Challenges', 'Collector', 'Seasons', 'Meta'];
function r_event(req) {
  const e = req.event && EVENTS.find((x) => x.id === req.event);
  return e ? `Own a ${e.name} ${e.buy.getFullYear()} rare` : `Own ${req.goal} seasonal rares`;
}

// ---- Notifications: tell the player when a badge or Shop reward unlocks -------------
let toastFn = null;
let shopItems = () => [];
export function initAchievements({ toast, items }) {
  toastFn = toast;
  shopItems = items;
  // First run: remember what's already earned, without a flood of toasts.
  const l = lifetime();
  if (!l.seen) { l.seen = currentlyMet(); saveState(); }
}
function currentlyMet() {
  buildBadges();
  return [...BADGES.filter((b) => reqProgress(b).met).map((b) => b.id), ...shopItems().filter((i) => i.req && reqProgress(i.req).met).map((i) => i.id)];
}
let pending = 0;
/** Check for newly earned badges / newly buyable rewards (debounced). */
export function checkAchievements() {
  if (!toastFn) return;
  clearTimeout(pending);
  pending = setTimeout(() => {
    const l = lifetime();
    const seen = new Set(l.seen || []);
    const fresh = currentlyMet().filter((id) => !seen.has(id));
    if (!fresh.length) return;
    l.seen = [...seen, ...fresh];
    l.newBadges = [...new Set([...(l.newBadges || []), ...fresh.filter((id) => id.startsWith('b-'))])];
    saveState();
    const bs = fresh.filter((id) => id.startsWith('b-')).map((id) => BADGES.find((b) => b.id === id)).filter(Boolean);
    const items = fresh.filter((id) => !id.startsWith('b-')).map((id) => shopItems().find((i) => i.id === id)).filter(Boolean);
    bs.slice(0, 3).forEach((b, i) => setTimeout(() => toastFn(`${b.icon} Badge earned: ${b.name}!`, 'ok'), i * 1600));
    if (bs.length > 3) setTimeout(() => toastFn(`\u{1F396}️ +${bs.length - 3} more badges. See them on your Badges page.`, 'ok'), 3 * 1600);
    items.slice(0, 2).forEach((it, i) => setTimeout(() => toastFn(`\u{1F381} New Shop reward unlocked: ${it.name}`, 'ok'), (Math.min(bs.length, 4) + i) * 1600));
    if (items.length > 2) setTimeout(() => toastFn(`\u{1F381} +${items.length - 2} more Shop rewards unlocked`, 'ok'), (Math.min(bs.length, 4) + 2) * 1600);
  }, 600);
}
