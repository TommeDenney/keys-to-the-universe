// Achievement requirements for special Shop rewards: still bought with Stardust,
// but only once you've done something to earn the right (beat a Guardian,
// clear rogue planets, finish lots of challenges...).

import { getState, progress } from './store.js';
import { allLessons } from './data/course.js';
import { QUESTS } from './data/quests.js';
import { questDone } from './economy.js';

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

const worlds = () => allLessons().filter((l) => !l.boss && progress.lesson(l.id));
const guardians = () => allLessons().filter((l) => l.boss && progress.lesson(l.id));

const KINDS = {
  planets: (r) => worlds().length,
  threeStar: (r) => worlds().filter((l) => (progress.lesson(l.id).stars || 0) >= 3).length,
  guardians: (r) => guardians().length,
  boss: (r) => (progress.lesson(r.id) ? 1 : 0),
  rogues: (r) => QUESTS.filter((q) => questDone(q.id)).length,
  dailyDone: (r) => lifetime().dailyDone || 0,
  weeklyDone: (r) => lifetime().weeklyDone || 0,
  monthlyDone: (r) => lifetime().monthlyDone || 0,
  minutes: (r) => Math.floor(lifetime().minutes || 0),
  mastered: (r) => lifetime().mastered || 0,
};

/** { value, goal, met } for an item's requirement. */
export function reqProgress(req) {
  const goal = req.goal || 1;
  const value = Math.min(goal, (KINDS[req.kind] || (() => 0))(req));
  return { value, goal, met: value >= goal };
}
