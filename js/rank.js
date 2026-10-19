// Your rank: a title that shows how far you've come, from New Explorer to Grand
// Maestro. It comes from what you've actually cleared: a galaxy counts once its
// Guardian is beaten (or every world in it is done).

import { COURSE } from './data/course.js';
import { progress } from './store.js';

// Title for clearing each Learn-path galaxy (graded galaxies are worked out below).
const PATH = {
  u1: ['Beginner', 'Knows C, D and E'],
  u2: ['Beginner', 'Plays in five-finger position'],
  u3: ['Novice', 'Plays across the whole octave'],
  u4: ['Novice', 'Reads both clefs'],
  u5: ['Apprentice', 'Plays hands together'],
  u6: ['Apprentice', 'Plays sharps and flats'],
  u7: ['Chord Builder', 'Plays chords'],
  u9: ['Gospel Organist', 'Plays gospel organ'],
  u8: ['Classics Player', 'Plays the classics'],
};
const GRADED = ['Grade 1 Pianist', 'Grade 2 Pianist', 'Grade 3 Pianist', 'Grade 4 Pianist', 'Grade 5 Pianist', 'Advanced Pianist', 'Advanced Pianist', 'Recital Pianist', 'Virtuoso', 'Grand Maestro'];

const cleared = (u) => {
  const boss = u.lessons.find((l) => l.boss);
  return (boss && progress.lesson(boss.id)) || (u.lessons.length && u.lessons.every((l) => progress.lesson(l.id)));
};

/** { title, detail, level } for the current progress. */
export function rank() {
  let best = { title: 'New Explorer', detail: 'Just starting the journey', level: 0 };
  let gradeN = 0;
  COURSE.forEach((u, i) => {
    if (!cleared(u)) return;
    if (u.graded) {
      gradeN += 1;
      const g = Math.min(10, gradeN);
      best = { title: GRADED[g - 1], detail: g >= 10 ? 'Can play Grade 10 pieces: the very top' : `Can play Grade ${g} pieces`, level: 9 + g };
    } else if (PATH[u.id] && (!best.level || i + 1 > best.level || best.level < 10)) {
      if (!gradeN) best = { title: PATH[u.id][0], detail: PATH[u.id][1], level: i + 1 };
    }
  });
  if (!best.level && Object.keys(progress).length && COURSE[0] && COURSE[0].lessons.some((l) => progress.lesson(l.id))) best = { title: 'New Explorer', detail: 'Learning the first notes', level: 0 };
  return best;
}
