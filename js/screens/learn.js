// "Learn" tab: the course map.

import { h, icon, starsHTML } from '../ui.js';
import { COURSE, allLessons } from '../data/course.js';
import { progress, settings } from '../store.js';
import { installCard, fullscreenButton } from './install.js';

export function lessonUnlocked(id) {
  if (settings.get('unlockAll')) return true;
  const list = allLessons();
  const i = list.findIndex((l) => l.id === id);
  return i <= 0 || !!progress.lesson(list[i - 1].id);
}

export function nextLesson() {
  return allLessons().find((l) => !progress.lesson(l.id) && lessonUnlocked(l.id)) || null;
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
    h('div', {}, [h('div', { class: 'eyebrow' }, greeting()), h('h1', { class: 'brand' }, ['Ivory', h('span', { class: 'dot' })])]),
    h('div', { class: 'pills' }, [
      h('div', { class: 'pill flame', title: 'Day streak' }, [icon('flame'), h('b', {}, String(progress.streak))]),
      h('div', { class: 'pill stars-pill', title: 'Stars' }, [icon('star'), h('b', {}, String(progress.totalStars))]),
      h('a', { class: 'pill hb-pill', href: '#/handbook', title: 'Handbook: every lesson explanation' }, [icon('book'), h('b', {}, 'Handbook')]),
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
      const cls = `node ${rec ? 'done' : ''} ${open ? '' : 'locked'} ${isNext ? 'current' : ''}`;
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

  root.append(h('div', { class: 'page learn' }, [header, installCard(), hero, path]));
  // Scroll the current lesson into view.
  requestAnimationFrame(() => {
    const cur = root.querySelector('.node.current');
    if (cur && done > 0) cur.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
}
