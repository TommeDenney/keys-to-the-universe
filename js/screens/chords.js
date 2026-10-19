// "Chords" tab: chord explorer + progression trainer.

import { h, icon } from '../ui.js';
import { CHORD_TYPES, ROOTS, chordMidis, spellMidi, accidentalSymbol } from '../music/theory.js';
import { Keyboard } from '../render/keyboard.js';
import { audio } from '../audio/engine.js';
import { input } from '../input/hub.js';
import { finalizeSong, buildMeasures } from '../music/song.js';
import { playSong } from './songpage.js';

const FINGERS = { 3: { R: [1, 3, 5], L: [5, 3, 1] }, 4: { R: [1, 2, 3, 5], L: [5, 3, 2, 1] } };

const PROGRESSIONS = [
  { name: 'I – IV – V – I', about: 'The backbone of folk, rock and classical music.', degrees: ['I', 'IV', 'V', 'I'] },
  { name: 'I – V – vi – IV', about: 'The “pop” progression heard in countless hits.', degrees: ['I', 'V', 'vi', 'IV'] },
  { name: 'vi – IV – I – V', about: 'The same chords, starting on the minor chord: moodier.', degrees: ['vi', 'IV', 'I', 'V'] },
  { name: 'I – vi – IV – V', about: 'The 1950s doo-wop progression.', degrees: ['I', 'vi', 'IV', 'V'] },
  { name: 'ii7 – V7 – Imaj7', about: 'The most important progression in jazz.', degrees: ['ii7', 'V7', 'Imaj7', 'Imaj7'] },
  { name: '12-bar blues', about: 'Twelve bars of dominant 7th chords: the blues.', degrees: ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'] },
];
const DEG = {
  I: [0, 'maj'], ii: [2, 'min'], iii: [4, 'min'], IV: [5, 'maj'], V: [7, 'maj'], vi: [9, 'min'],
  I7: [0, 'dom7'], IV7: [5, 'dom7'], V7: [7, 'dom7'], ii7: [2, 'min7'], Imaj7: [0, 'maj7'],
};

let sel = { root: 0, type: 'maj', inv: 0, hand: 'R' };

export function renderChords(root) {
  const page = h('div', { class: 'page chords' });
  root.append(page);
  let kb = null;
  const name = h('div', { class: 'chord-name' });
  const kbEl = h('div', { class: 'chord-kb' });
  const invRow = h('div', { class: 'seg' });

  const current = () => {
    const base = sel.hand === 'R' ? 60 : 48;
    let notes = chordMidis(ROOTS[sel.root].pc, sel.type, sel.inv, base);
    while (notes[0] > base + 7) notes = notes.map((m) => m - 12);
    return notes;
  };

  const update = () => {
    const notes = current();
    const r = ROOTS[sel.root];
    const t = CHORD_TYPES[sel.type];
    const spelled = notes.map((m) => spellMidi(m, r.fifths));
    const label = r.name.split('/')[0] + t.symbol;
    name.replaceChildren(
      h('h2', {}, [label, h('small', {}, ` ${r.name.split('/')[0]} ${t.label.toLowerCase()}`)]),
      h('div', { class: 'chord-notes' }, spelled.map((s) => h('span', {}, s.step + accidentalSymbol(s.alter)))),
      h('p', { class: 'muted' }, t.blurb),
    );
    const fingers = FINGERS[notes.length][sel.hand];
    const lo = sel.hand === 'R' ? 53 : 41;
    if (!kb) kb = new Keyboard(kbEl, { lo, hi: lo + 26, labels: 'c', onKey: (m, d) => input.touch(m, d) });
    else if (kb.opts.lo !== lo) kb.setRange(lo, lo + 26);
    kb.setHints(new Map(notes.map((m, i) => [m, { hand: sel.hand, finger: fingers[i] }])));
    const invs = ['Root', '1st inv.', '2nd inv.', '3rd inv.'].slice(0, t.intervals.length);
    if (sel.inv >= invs.length) sel.inv = 0;
    invRow.replaceChildren(...invs.map((l, i) => h('button', { class: sel.inv === i ? 'on' : '', onclick: () => { sel.inv = i; update(); } }, l)));
  };

  const hear = (arp = false) => {
    audio.ensure();
    const t = audio.now + 0.02;
    current().forEach((m, i) => audio.play(m, { when: t + (arp ? i * 0.22 : i * 0.01), dur: arp ? 1.6 : 1.5, velocity: 0.7 }));
  };

  const practice = () => {
    const notes = current();
    const r = ROOTS[sel.root];
    const fingers = FINGERS[notes.length][sel.hand];
    const mk = (start, dur, i) => notes.map((m, k) => ({ midi: m, ...spellMidi(m, r.fifths), start, dur, hand: sel.hand, finger: i === 0 ? fingers[k] : undefined }));
    const ns = [...mk(0, 4, 0), ...mk(4, 2, 1), ...mk(6, 2, 2), ...mk(8, 1, 3), ...mk(9, 1, 4), ...mk(10, 2, 5), ...mk(12, 4, 6)];
    const song = finalizeSong({ id: 'chord', title: name.querySelector('h2').firstChild.textContent, composer: '', bpm: 72, time: [4, 4], keyFifths: r.fifths, notes: ns, rests: [], measures: buildMeasures(16, 4), sections: [] });
    playSong(song, { hands: sel.hand, mode: 'wait', title: `${song.title} chord`, subtitle: 'Play all the notes together' });
  };

  const rootRow = h('div', { class: 'pick-grid roots' }, ROOTS.map((r, i) => h('button', { class: `pick ${sel.root === i ? 'on' : ''}`, onclick: (e) => { sel.root = i; mark(e); update(); } }, r.name)));
  const typeRow = h('div', { class: 'pick-grid types' }, Object.entries(CHORD_TYPES).map(([k, t]) => h('button', { class: `pick ${sel.type === k ? 'on' : ''}`, onclick: (e) => { sel.type = k; mark(e); update(); } }, t.label)));
  function mark(e) {
    e.target.parentNode.querySelectorAll('.pick').forEach((b) => b.classList.toggle('on', b === e.target));
  }

  page.append(
    h('header', { class: 'top' }, [h('div', {}, [h('div', { class: 'eyebrow' }, 'Explore'), h('h1', {}, 'Chords')])]),
    h('section', { class: 'card chord-card' }, [
      h('div', { class: 'chord-top' }, [name, h('div', { class: 'chord-actions' }, [
        h('div', { class: 'seg' }, [['R', 'Right hand'], ['L', 'Left hand']].map(([v, l]) => h('button', { class: sel.hand === v ? 'on' : '', onclick: (e) => { sel.hand = v; e.target.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === e.target)); update(); } }, l))),
        invRow,
        h('div', { class: 'row' }, [
          h('button', { class: 'btn ghost', onclick: () => hear(false) }, [icon('ear'), 'Hear it']),
          h('button', { class: 'btn ghost', onclick: () => hear(true) }, 'Arpeggio'),
          h('button', { class: 'btn primary', onclick: practice }, [icon('play'), 'Practice']),
        ]),
      ])]),
      kbEl,
      h('div', { class: 'pick-label' }, 'Root'), rootRow,
      h('div', { class: 'pick-label' }, 'Chord type'), typeRow,
    ]),
    h('h2', {}, 'Chord progressions'),
    h('p', { class: 'muted' }, ['Played in the key selected above (', h('b', {}, ROOTS[sel.root].name), '). The right hand uses smooth inversions; the left hand plays the root.']),
    h('div', { class: 'prog-list' }, PROGRESSIONS.map((p) => h('div', { class: 'prog' }, [
      h('div', { class: 'grow' }, [h('b', {}, p.name), h('span', {}, p.about)]),
      h('button', { class: 'icon-btn', 'aria-label': 'Hear', onclick: () => hearProg(p) }, icon('ear')),
      h('button', { class: 'btn primary sm', onclick: () => practiceProg(p, 'wait') }, 'Practice'),
    ]))),
  );
  update();
  return () => kb && kb.destroy();
}

function voiceProgression(p) {
  const key = ROOTS[sel.root];
  let prev = null;
  return p.degrees.map((d) => {
    const [off, type] = DEG[d];
    const pc = (key.pc + off) % 12;
    // choose the inversion closest to the previous chord, within C4..A5
    let best = null;
    let bestCost = Infinity;
    const n = CHORD_TYPES[type].intervals.length;
    for (let inv = 0; inv < n; inv++) {
      for (const base of [48, 60]) {
        const v = chordMidis(pc, type, inv, base);
        if (v[0] < 55 || v[v.length - 1] > 81) continue;
        const cost = prev ? v.reduce((a, m, i) => a + Math.abs(m - (prev[i] ?? prev[prev.length - 1])), 0) : Math.abs(v[0] - 60);
        if (cost < bestCost) { bestCost = cost; best = v; }
      }
    }
    prev = best;
    let bass = 36 + pc;
    if (bass < 41) bass += 12;
    return { notes: best, bass, label: d };
  });
}

function hearProg(p) {
  audio.ensure();
  const v = voiceProgression(p);
  const t0 = audio.now + 0.05;
  v.forEach((c, i) => {
    const t = t0 + i * 1.1;
    audio.play(c.bass, { when: t, dur: 1.05, velocity: 0.6 });
    c.notes.forEach((m) => audio.play(m, { when: t, dur: 1.05, velocity: 0.55 }));
  });
}

function practiceProg(p) {
  const key = ROOTS[sel.root];
  const v = voiceProgression(p);
  const notes = [];
  v.forEach((c, i) => {
    c.notes.forEach((m) => notes.push({ midi: m, ...spellMidi(m, key.fifths), start: i * 4, dur: 4, hand: 'R' }));
    notes.push({ midi: c.bass, ...spellMidi(c.bass, key.fifths), start: i * 4, dur: 4, hand: 'L' });
  });
  const song = finalizeSong({ id: 'prog', title: p.name, composer: '', bpm: 80, time: [4, 4], keyFifths: key.fifths, notes, rests: [], measures: buildMeasures(v.length * 4, 4), sections: [] });
  playSong(song, { hands: 'both', mode: 'wait', title: `${p.name} in ${key.name.split('/')[0]}` });
}
