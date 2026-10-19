// Song detail: practice plan broken into sections → hands → full song.

import { h, icon, starsHTML, coverGradient, modal } from '../ui.js';
import { builtinSong } from '../data/songs.js';
import { library, progress } from '../store.js';
import { practicePlan, handsLabel, finalizeSong } from '../music/song.js';
import { keyName } from '../music/theory.js';
import { Player } from './player.js';
import { input } from '../input/hub.js';

async function loadSong(id) {
  if (id.startsWith('imp-')) {
    const rec = await library.get(id);
    if (!rec) return null;
    const s = rec.song;
    s.id = id;
    if (!s.hands) finalizeSong(s);
    return s;
  }
  return builtinSong(id);
}

/** Open a full-screen player for a song. */
export function playSong(song, cfg, onDone) {
  const host = h('div', { class: 'fullscreen player-host open' });
  document.body.appendChild(host);
  const close = () => { player.destroy(); host.remove(); input.deactivate(); if (onDone) onDone(); };
  host._close = close;
  const player = new Player(host, { song, ...cfg, onExit: () => close() });
  return player;
}

export async function renderSongPage(root, id) {
  const song = await loadSong(id);
  if (!song) {
    root.append(h('div', { class: 'page' }, [h('p', {}, 'Song not found.'), h('a', { class: 'btn', href: '#/library' }, 'Back')]));
    return;
  }
  const page = h('div', { class: 'page songpage' });
  root.append(page);
  const draw = () => {
    page.replaceChildren();
    build(page, song);
  };
  draw();
  page._redraw = draw;
}

function build(page, song) {
  const plan = practicePlan(song);
  const recs = progress.songSteps(song.id);
  const nextStep = plan.find((p) => !recs[p.key]) || null;
  const redraw = () => page._redraw && page._redraw();

  const launch = (step) => {
    const idx = plan.indexOf(step);
    playSong(song, {
      hands: step.hands, mode: step.mode, tempo: step.tempo || 1, range: step.range,
      title: `${song.title}`,
      subtitle: `${step.label} · ${handsLabel(step.hands)} · ${step.mode === 'wait' ? 'Your own pace' : `With the beat${step.tempo < 1 ? ` (${Math.round(step.tempo * 100)}%)` : ''}`}`,
      onFinish: (r) => { if (r.stars > 0) progress.recordSongStep(song.id, step.key, r.stars); },
      actions: () => (plan[idx + 1] ? [{ label: 'Next step', primary: true, fn: () => { document.querySelectorAll('.player-host').forEach((e) => e._close()); launch(plan[idx + 1]); } }] : []),
    }, redraw);
  };

  const m = song.measures;
  const barsOf = (sec) => {
    const a = m[sec.from];
    const b = m[sec.to];
    return a.number === b.number ? `bar ${a.number}` : `bars ${Math.max(1, a.number)}–${b.number}`;
  };

  page.append(h('a', { class: 'back-link', href: '#/library' }, [icon('back'), 'Songs']));
  page.append(h('section', { class: 'song-hero', style: { background: coverGradient(song.id + song.title) } }, [
    h('div', { class: 'grow' }, [
      h('div', { class: 'eyebrow light' }, song.source === 'import' ? 'Imported' : (song.tags || []).join(' · ')),
      h('h1', {}, song.title),
      h('p', { class: 'by' }, song.composer || ''),
      song.about ? h('p', { class: 'about' }, song.about) : null,
      h('div', { class: 'facts' }, [
        h('span', {}, keyName(song.keyFifths || 0)),
        h('span', {}, `${song.time[0]}/${song.time[1]}`),
        h('span', {}, `♩ = ${song.bpm}`),
        h('span', {}, `${song.measures.filter((x) => x.number > 0).length} bars`),
        h('span', {}, song.hands.R && song.hands.L ? 'Both hands' : song.hands.R ? 'Right hand' : 'Left hand'),
      ]),
    ]),
    h('div', { class: 'hero-actions' }, [
      h('button', { class: 'btn white', onclick: () => { const p = playSong(song, { hands: 'both', mode: 'wait', title: song.title, subtitle: 'Listen' }); p.hideOverlay(); p.listen(); } }, [icon('ear'), 'Listen']),
      nextStep ? h('button', { class: 'btn white solid', onclick: () => launch(nextStep) }, [icon('play'), Object.keys(recs).length ? 'Continue' : 'Start practising']) : null,
    ]),
  ]));

  // Practice plan
  const list = h('div', { class: 'plan' });
  const bySection = new Map();
  for (const p of plan) {
    const k = p.section;
    if (!bySection.has(k)) bySection.set(k, []);
    bySection.get(k).push(p);
  }
  for (const [sec, steps] of bySection) {
    const title = sec === -1 ? 'Full song' : song.sections.length > 1 ? `${song.sections[sec].label}` : 'Learn the song';
    const sub = sec === -1 ? 'Put it all together' : barsOf(song.sections[sec]);
    list.append(h('div', { class: 'plan-sec' }, [
      h('div', { class: 'plan-head' }, [h('b', {}, title), h('span', {}, sub)]),
      h('div', { class: 'plan-steps' }, steps.map((p) => {
        const st = recs[p.key] || 0;
        const isNext = nextStep === p;
        return h('button', { class: `step ${st ? 'done' : ''} ${isNext ? 'next' : ''}`, onclick: () => launch(p) }, [
          h('span', { class: `hand-badge h-${p.hands}` }, p.hands === 'both' ? 'LR' : p.hands),
          h('span', { class: 'step-text' }, [
            h('b', {}, handsLabel(p.hands)),
            h('small', {}, p.mode === 'wait' ? 'Own pace' : `With the beat${p.tempo < 1 ? ` · ${Math.round(p.tempo * 100)}%` : ''}`),
          ]),
          h('span', { class: 'mini-stars', html: starsHTML(st) }),
        ]);
      })),
    ]));
  }

  // Free practice
  let fp = { hands: song.hands.R && song.hands.L ? 'both' : song.hands.R ? 'R' : 'L', mode: 'wait', tempo: 1 };
  const seg = (opts, key) => h('div', { class: 'seg' }, opts.map(([v, l]) => h('button', {
    class: fp[key] === v ? 'on' : '',
    onclick: (e) => { fp[key] = v; e.target.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === e.target)); },
  }, l)));
  const handOpts = [['R', 'Right'], ['L', 'Left'], ['both', 'Both']].filter(([v]) => v === 'both' ? song.hands.R && song.hands.L : song.hands[v]);
  const tempoLabel = h('span', {}, '100%');
  const free = h('section', { class: 'card free' }, [
    h('h3', {}, 'Free practice'),
    h('div', { class: 'free-row' }, [seg(handOpts, 'hands'), seg([['wait', 'Own pace'], ['timed', 'With the beat']], 'mode')]),
    h('label', { class: 'field' }, [h('span', {}, ['Tempo ', tempoLabel]), h('input', { type: 'range', min: 0.4, max: 1.3, step: 0.05, value: 1, oninput: (e) => { fp.tempo = +e.target.value; tempoLabel.textContent = `${Math.round(fp.tempo * 100)}%`; } })]),
    h('button', { class: 'btn primary', onclick: () => playSong(song, { ...fp, title: song.title }, redraw) }, [icon('play'), 'Play whole song']),
  ]);

  page.append(h('div', { class: 'song-cols' }, [h('div', {}, [h('h2', {}, 'Practice plan'), list]), h('div', {}, [free, song.source === 'import' ? deleteBtn(song) : null])]));
}

function deleteBtn(song) {
  return h('button', {
    class: 'btn ghost danger',
    onclick: () => modal((close) => [
      h('h2', {}, 'Remove this song?'),
      h('p', {}, `“${song.title}” will be removed from this device.`),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn ghost', onclick: close }, 'Cancel'),
        h('button', { class: 'btn primary danger', onclick: async () => { await library.remove(song.id); close(); location.hash = '#/library'; } }, 'Remove'),
      ]),
    ]),
  }, [icon('trash'), 'Remove from library']);
}
