// Which songs can be practised from the Songs tab: anything the Learn path
// has reached, anything bought with Stardust, and your own imports.

import { allLessons } from './data/course.js';
import { lessonUnlocked } from './screens/learn.js';
import { songOwned } from './economy.js';

export function songUnlocked(id) {
  if (!id || id.startsWith('imp-') || songOwned(id) || id === 'divinae-garden') return true;
  return allLessons().some((l) => !l.boss && (l.song === id || l.steps.some((s) => s.song === id)) && lessonUnlocked(l.id));
}
