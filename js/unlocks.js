// Which songs can be practised from the Songs tab: anything the Learn path
// has reached, anything bought with Stardust, and your own imports.

import { allLessons } from './data/course.js';
import { lessonUnlocked } from './screens/learn.js';
import { songOwned } from './economy.js';
import { personalSongDefs } from './personal.js';
import { settings } from './store.js';
import { galaxyName, planetName } from './screens/universe.js';

export function songUnlocked(id) {
  if (!id || id.startsWith('imp-') || songOwned(id) || personalSongDefs().some((d) => d.id === id)) return true;
  return allLessons().some((l) => !l.boss && (l.song === id || l.steps.some((s) => s.song === id)) && lessonUnlocked(l.id));
}

/**
 * What unlocks a song for free on the Learn path, as a short line
 * ("Unlocked by completing Planet Vela in the Orion Galaxy"), or null for
 * songs that aren't on the path (those are Stardust only).
 */
export function unlockCondition(id) {
  const list = allLessons();
  const i = list.findIndex((l) => !l.boss && (l.song === id || l.steps.some((s) => s.song === id)));
  if (i <= 0) return null;
  const l = list[i];
  const universe = settings.get('learnLayout') !== 'classic';
  const prevUnit = list[i - 1].unit;
  if (l.unit.lessons[0].id === l.id) return `Unlocked by completing ${universe ? `the ${galaxyName(prevUnit)}` : `“${prevUnit.title}”`}`;
  const prev = list[i - 1];
  return universe ? `Unlocked by completing Planet ${planetName(prev.id)} in the ${galaxyName(prev.unit)}` : `Unlocked by completing “${prev.title}”`;
}
