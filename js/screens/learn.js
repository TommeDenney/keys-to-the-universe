// "Learn" tab: the course map.

import { MAX_STARS } from '../stars.js';
import { h, icon, starsHTML } from '../ui.js';
import { COURSE, allLessons } from '../data/course.js';
import { progress, settings, getState } from '../store.js';
import { QUESTS } from '../data/quests.js';
import { installCard, fullscreenButton } from './install.js';
import { walletPill } from '../economy.js';
import { challengesCard } from './challenges.js';
import { avatarBadge } from './avatar.js';

/** Index of the furthest lesson ever completed (so content added later never re-locks your progress). */
function furthestDone(list) {
  let f = -1;
  list.forEach((l, i) => { if (progress.lesson(l.id)) f = i; });
  return f;
}

/** Bonus stars from rogue planets (side quests) drifting after this galaxy. */
function bonusStars(unitIndex) {
  const quests = (getState().wallet && getState().wallet.quests) || {};
  return QUESTS.filter((q) => q.after === unitIndex + 1 && quests[q.id]).length * MAX_STARS;
}

/** Stars earned in a galaxy vs. what's needed (80%) to open the next one. */
export function galaxyStars(unit) {
  const ui = COURSE.indexOf(unit);
  // Planets, moons and the boss: 5 stars each. A Knowledge Check counts once taken,
  // so adding one never locks a galaxy you'd already earned your way past.
  const max = unit.lessons.filter((l) => !l.quiz || progress.lesson(l.id)).length * MAX_STARS;
  const earned = unit.lessons.reduce((a, l) => a + ((progress.lesson(l.id) || {}).stars || 0), 0);
  const bonus = bonusStars(ui);
  return { earned, bonus, total: Math.min(max, earned + bonus), max, needed: Math.ceil(max * 0.8) };
}

export function lessonUnlocked(id) {
  const list = allLessons();
  const i = list.findIndex((l) => l.id === id);
  if (i <= 0 || i <= furthestDone(list)) return true; // never re-lock progress you've made
  // A galaxy's Guardian can be challenged as soon as you reach the galaxy: beat it to skip ahead.
  if (list[i].boss && list[i].unit.lessons[0].id !== id) return lessonUnlocked(list[i].unit.lessons[0].id);
  if (!progress.lesson(list[i - 1].id)) return false;
  // First world of a galaxy: the previous galaxy needs 80% of its stars.
  const unit = list[i].unit;
  if (unit.lessons[0].id === id) {
    const prev = COURSE[COURSE.indexOf(COURSE.find((u) => u.id === unit.id)) - 1];
    if (prev && !progress.skipped(prev.id)) { const g = galaxyStars(prev); if (g.total < g.needed) return false; }
  }
  return true;
}

/** If your next world is behind a star gate, say which galaxy needs more stars. */
export function starGate() {
  const list = allLessons();
  const first = list.find((l) => !progress.lesson(l.id));
  if (!first || lessonUnlocked(first.id) || first.unit.lessons[0].id !== first.id) return null;
  const prev = COURSE[COURSE.indexOf(first.unit) - 1];
  if (!prev) return null;
  const g = galaxyStars(prev);
  return g.total < g.needed ? { from: prev, to: first.unit, ...g, missing: g.needed - g.total } : null;
}

export function nextLesson() {
  const list = allLessons();
  const f = furthestDone(list);
  // Skip worlds you've already moved beyond (e.g. a boss added after you passed it).
  return list.find((l, i) => i > f && !progress.lesson(l.id) && lessonUnlocked(l.id))
    || list.find((l) => !progress.lesson(l.id) && lessonUnlocked(l.id)) || null;
}

function greeting() {
  const hr = new Date().getHours();
  return hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
}

const ZIG = [0, 70, 105, 70, 0, -70, -105, -70];

export function renderLearn(root) {
  const lessons = allLessons();
  const done = lessons.filter((l) => progress.lesson(l.id)).length;
  const next = nextLesson();

  const header = h('header', { class: 'top' }, [
    avatarBadge(),
    h('div', { class: 'grow' }, [h('div', { class: 'eyebrow' }, greeting()), h('h1', { class: 'brand' }, ['Keys to the Universe', h('span', { class: 'dot' })])]),
    h('div', { class: 'pills' }, [
      h('div', { class: 'pill flame', title: 'Day streak' }, [icon('flame'), h('b', {}, String(progress.streak))]),
      h('div', { class: 'pill stars-pill', title: 'Stars' }, [icon('star'), h('b', {}, String(progress.totalStars))]),
      walletPill(),
      h('a', { class: 'pill hb-pill', href: '#/handbook', title: 'Handbook: every lesson explanation' }, [icon('book'), h('b', {}, 'Handbook')]),
      h('a', { class: 'pill inv-pill', href: '#/arcade', title: 'Arcade' }, [h('span', { class: 'inv-ico' }, '\u{1F579}\uFE0F'), h('b', {}, 'Arcade')]),
      h('a', { class: 'pill inv-pill', href: '#/inventory', title: 'Inventory: everything you own' }, [h('span', { class: 'inv-ico' }, '\u{1F392}'), h('b', {}, 'Inventory')]),
      fullscreenButton(),
    ]),
  ]);

  const hero = next
    ? h('section', { class: 'hero', style: { '--c': next.unit.color } }, [
      h('div', { class: 'hero-keys', 'aria-hidden': 'true' }),
      h('div', { class: 'hero-body' }, [
        h('div', { class: 'eyebrow light' }, done === 0 ? 'Start here' : `Up next · ${next.unit.title}`),
        h('h2', {}, next.title),
        h('p', {}, done === 0 ? 'Find Middle C and play your very first notes. It only takes a few minutes.' : `${done} of ${lessons.length} lessons complete. Keep your streak going!`),
        h('a', { class: 'btn white', href: `#/lesson/${next.id}` }, [icon('play'), done === 0 ? 'Start lesson' : 'Continue']),
      ]),
    ])
    : h('section', { class: 'hero', style: { '--c': '#17B26A' } }, [
      h('div', { class: 'hero-body' }, [
        h('div', { class: 'eyebrow light' }, 'Course complete'),
        h('h2', {}, 'You finished every lesson!'),
        h('p', {}, 'Keep playing songs from the library, or import your own sheet music.'),
        h('a', { class: 'btn white', href: '#/library' }, [icon('library'), 'Browse songs']),
      ]),
    ]);

  const path = h('div', { class: 'course' });
  let k = 0;
  for (const unit of COURSE) {
    const uDone = unit.lessons.filter((l) => progress.lesson(l.id)).length;
    path.append(h('div', { class: 'unit-head', style: { '--c': unit.color } }, [
      h('div', {}, [
        h('div', { class: 'eyebrow' }, `Unit ${COURSE.indexOf(unit) + 1}`),
        h('h3', {}, unit.title),
        h('p', {}, unit.subtitle),
      ]),
      h('div', { class: 'ring', style: { '--p': uDone / unit.lessons.length } }, h('span', {}, `${uDone}/${unit.lessons.length}`)),
    ]));
    const nodes = h('div', { class: 'nodes' });
    unit.lessons.forEach((l) => {
      const rec = progress.lesson(l.id);
      const open = lessonUnlocked(l.id);
      const isNext = next && next.id === l.id;
      const cls = `node ${rec ? 'done' : ''} ${open ? '' : 'locked'} ${isNext ? 'current' : ''} ${l.boss ? 'boss' : ''}`;
      const off = ZIG[k++ % ZIG.length];
      const node = h(open ? 'a' : 'div', { class: cls, style: { '--x': `${off}px`, '--c': unit.color }, href: open ? `#/lesson/${l.id}` : null }, [
        isNext ? h('div', { class: 'bubble' }, 'START') : null,
        h('div', { class: 'disc' }, open ? h('span', { class: 'glyph' }, rec ? icon('check') : l.icon) : icon('lock')),
        h('div', { class: 'label' }, l.title),
        rec ? h('div', { class: 'mini-stars', html: starsHTML(rec.stars) }) : null,
      ]);
      nodes.append(node);
    });
    path.append(nodes);
  }

  root.append(h('div', { class: 'page learn' }, [header, installCard(), hero, challengesCard(), path]));
  // Scroll the current lesson into view.
  requestAnimationFrame(() => {
    const cur = root.querySelector('.node.current');
    if (cur && done > 0) cur.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
}
