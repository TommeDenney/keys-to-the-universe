// Daily / weekly / monthly challenges. Each period picks a few goals from a
// pool (deterministically, so they're stable within the period), tracks
// progress from what you play, and pays Stardust automatically when a goal is met.

import { getState, saveState } from './store.js';
import { earn, SYMBOL } from './economy.js';
import { toast } from './ui.js';

const POOL = {
  daily: [
    { id: 'd-world', stat: 'worlds', goal: 1, reward: 25, text: 'Complete a world (lesson)' },
    { id: 'd-steps', stat: 'steps', goal: 3, reward: 20, text: 'Finish 3 song practice steps' },
    { id: 'd-stars', stat: 'stars', goal: 6, reward: 25, text: 'Earn 6 stars' },
    { id: 'd-minutes', stat: 'minutes', goal: 10, reward: 30, text: 'Practise for 10 minutes' },
    { id: 'd-timed', stat: 'timed', goal: 1, reward: 30, text: 'Score 2★+ playing with the beat' },
    { id: 'd-three', stat: 'threeStar', goal: 1, reward: 35, text: 'Get a 3-star result' },
    { id: 'd-notes', stat: 'notes', goal: 150, reward: 25, text: 'Play 150 correct notes' },
  ],
  weekly: [
    { id: 'w-boss', stat: 'bosses', goal: 1, reward: 150, text: 'Defeat a Guardian (boss battle)' },
    { id: 'w-days', stat: 'days', goal: 4, reward: 150, text: 'Practise on 4 different days' },
    { id: 'w-worlds', stat: 'worlds', goal: 5, reward: 120, text: 'Complete 5 worlds' },
    { id: 'w-master', stat: 'mastered', goal: 1, reward: 200, text: 'Master a song: 3★ with the beat' },
    { id: 'w-stars', stat: 'stars', goal: 30, reward: 120, text: 'Earn 30 stars' },
    { id: 'w-minutes', stat: 'minutes', goal: 60, reward: 150, text: 'Practise for 60 minutes' },
    { id: 'w-notes', stat: 'notes', goal: 1200, reward: 100, text: 'Play 1,200 correct notes' },
  ],
  monthly: [
    { id: 'm-worlds', stat: 'worlds', goal: 15, reward: 500, text: 'Complete 15 worlds' },
    { id: 'm-bosses', stat: 'bosses', goal: 3, reward: 600, text: 'Defeat 3 Guardians' },
    { id: 'm-days', stat: 'days', goal: 15, reward: 750, text: 'Practise on 15 different days' },
    { id: 'm-minutes', stat: 'minutes', goal: 300, reward: 600, text: 'Practise for 5 hours' },
    { id: 'm-master', stat: 'mastered', goal: 4, reward: 500, text: 'Master 4 songs' },
    { id: 'm-notes', stat: 'notes', goal: 6000, reward: 400, text: 'Play 6,000 correct notes' },
  ],
};
const PICK = { daily: 3, weekly: 3, monthly: 3 };
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
    if (!cur || cur.key !== key) {
      // New period: pick goals deterministically for this period.
      const r = seeded(key + p);
      const pool = [...POOL[p]].sort(() => r() - 0.5);
      st.challenges[p] = { key, ids: pool.slice(0, PICK[p]).map((c) => c.id), stats: {}, claimed: [], days: [] };
    }
  }
  return st.challenges;
}

/** Current challenges with progress, for display. */
export function current(period) {
  const c = store()[period];
  return c.ids.map((id) => {
    const def = POOL[period].find((x) => x.id === id);
    const value = def.stat === 'days' ? c.days.length : c.stats[def.stat] || 0;
    return { ...def, value: Math.min(value, def.goal), done: c.claimed.includes(id) };
  });
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
  saveState();
  checkComplete();
}

function checkComplete() {
  const all = store();
  for (const p of Object.keys(POOL)) {
    for (const ch of current(p)) {
      if (ch.done || ch.value < ch.goal) continue;
      all[p].claimed.push(ch.id);
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
