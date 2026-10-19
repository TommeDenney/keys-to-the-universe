// Handbook: every explanation from the course in one place, so you can look
// something up ("How long is a note?") without replaying a lesson.

import { h, icon } from '../ui.js';
import { COURSE } from '../data/course.js';
import { progress, settings } from '../store.js';
import { lessonUnlocked } from './learn.js';
import { learnVisual } from './lesson.js';
import { galaxyName, planetName } from './universe.js';
import { howYouPlay } from './settings.js';

let query = '';
let playOpen = false; // the How to play dropdown stays open between visits

export function renderHandbook(root) {
  const page = h('div', { class: 'page handbook' });
  root.append(page);
  const universe = settings.get('learnLayout') !== 'classic';
  const open = new Map(); // card element → visual (for cleanup)
  let play = null; // the How to play panel while it's open
  const list = h('div', { class: 'hb-list' });

  const strip = (html) => html.replace(/<[^>]+>/g, '');
  const draw = () => {
    for (const v of open.values()) v.destroy();
    open.clear();
    list.replaceChildren();
    const q = query.trim().toLowerCase();
    let shown = 0;
    COURSE.forEach((unit, ui) => {
      const cards = [];
      for (const l of unit.lessons) {
        l.steps.filter((s) => s.t === 'learn').forEach((st) => {
          const text = `${st.title} ${strip(st.text)} ${l.title}`.toLowerCase();
          if (q && !text.includes(q)) return;
          cards.push(card(unit, l, st));
        });
      }
      if (!cards.length) return;
      shown += cards.length;
      list.append(h('section', { class: 'hb-unit', style: { '--c': unit.color } }, [
        h('div', { class: 'hb-unit-head' }, [
          h('div', { class: 'eyebrow' }, universe ? `Galaxy ${ui + 1} · ${galaxyName(unit)}` : `Unit ${ui + 1}`),
          h('h2', {}, unit.title),
          h('p', { class: 'muted' }, unit.subtitle),
        ]),
        h('div', { class: 'hb-cards' }, cards),
      ]));
    });
    if (!shown) list.append(h('p', { class: 'muted empty' }, `Nothing matches “${query}”.`));
  };

  function card(unit, lesson, st) {
    const unlocked = lessonUnlocked(lesson.id) || !!progress.lesson(lesson.id);
    const where = universe ? `Planet ${planetName(lesson.id)} · ${lesson.title}` : lesson.title;
    if (!unlocked) {
      return h('div', { class: 'hb-card locked' }, [
        h('div', { class: 'hb-card-head' }, [icon('lock'), h('div', { class: 'grow' }, [h('b', {}, st.title), h('small', {}, `Discover on ${where}`)])]),
      ]);
    }
    const visual = h('div', { class: 'learn-visual' });
    const bodyEl = h('div', { class: 'hb-body' }, [
      h('p', { class: 'lead', html: st.text }),
      visual,
      h('div', { class: 'row end' }, [h('a', { class: 'btn ghost sm', href: `#/lesson/${lesson.id}` }, [icon('play'), 'Replay this lesson'])]),
    ]);
    const el = h('div', { class: 'hb-card' });
    const head = h('button', {
      class: 'hb-card-head',
      'aria-expanded': 'false',
      onclick: () => {
        const isOpen = el.classList.toggle('open');
        head.setAttribute('aria-expanded', String(isOpen));
        if (isOpen && !open.has(el)) open.set(el, learnVisual(st, visual));
        if (!isOpen && open.has(el)) { open.get(el).destroy(); open.delete(el); visual.replaceChildren(); }
      },
    }, [
      h('span', { class: 'hb-dot' }),
      h('div', { class: 'grow' }, [h('b', {}, st.title), h('small', {}, where)]),
      icon('chevron', 'hb-chev'),
    ]);
    el.append(head, bodyEl);
    return el;
  }

  page.append(
    h('header', { class: 'top' }, [h('div', {}, [h('div', { class: 'eyebrow' }, 'Your notes from every lesson'), h('h1', {}, 'Handbook')])]),
    h('label', { class: 'search hb-search' }, [icon('search'), h('input', {
      type: 'search', placeholder: 'Search: e.g. half note, sharp, chord, bass clef', value: query,
      oninput: (e) => { query = e.target.value; draw(); },
    })]),
    h('a', { class: 'hb-chords', href: '#/chords' }, [
      h('span', { class: 'hb-chords-icon' }, icon('chords')),
      h('span', { class: 'grow' }, [h('b', {}, 'Chords'), h('small', {}, 'Build, hear and see every chord on the keyboard: majors, minors, sevenths and inversions.')]),
      icon('chevron'),
    ]),
    howToPlay(),
    list,
  );
  draw();
  return () => { for (const v of open.values()) v.destroy(); if (play && play._cleanup) play._cleanup(); };

  // How to play: input, mic test + calibration, MIDI / Bluetooth help. Built only
  // while open, so the mic meter isn't running in the background.
  function howToPlay() {
    const body = h('div', { class: 'hb-body' });
    const el = h('div', { class: 'hb-card hb-play' });
    const build = () => { if (play && play._cleanup) play._cleanup(); play = howYouPlay(build); body.replaceChildren(play); };
    const set = (isOpen) => {
      playOpen = isOpen;
      el.classList.toggle('open', isOpen);
      head.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) build(); else { if (play && play._cleanup) play._cleanup(); play = null; body.replaceChildren(); }
    };
    const head = h('button', { class: 'hb-card-head', 'aria-expanded': 'false', onclick: () => set(!el.classList.contains('open')) }, [
      h('span', { class: 'hb-chords-icon' }, icon('piano')),
      h('div', { class: 'grow' }, [h('b', {}, 'How to play'), h('small', {}, 'Microphone or MIDI piano, testing and calibrating the mic, and connecting over Bluetooth.')]),
      icon('chevron', 'hb-chev'),
    ]);
    el.append(head, body);
    if (playOpen || /^#\/handbook\/play/.test(location.hash)) set(true);
    return el;
  }
}
