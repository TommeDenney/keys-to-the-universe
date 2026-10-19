// Lesson runner: a sequence of "learn" cards and practice steps.

import { h, icon, starsHTML } from '../ui.js';
import { allLessons } from '../data/course.js';
import { buildSong } from '../data/songs.js';
import { songNow, getSongs } from '../data/catalog.js';
import { backupNow } from '../backup.js';
import { rewardLesson, rewardDaily, earn, REWARD } from '../economy.js';
import { track, bossRewardAvailable, markBossRewarded } from '../challenges.js';
import { practicePlan, handsLabel, songFromDef } from '../music/song.js';
import { progress } from '../store.js';
import { Player, confetti } from './player.js';
import { Keyboard, rangeFor } from '../render/keyboard.js';
import { Sheet } from '../render/sheet.js';
import { audio } from '../audio/engine.js';
import { input } from '../input/hub.js';
import { lessonUnlocked } from './learn.js';

function resolveSong(ref) {
  return typeof ref === 'string' ? songNow(ref) : buildSong(ref);
}

function measureIdx(song, num) {
  const i = song.measures.findIndex((m) => m.number === num);
  return i < 0 ? (num <= 0 ? 0 : song.measures.length - 1) : i;
}

export function expandSteps(lesson) {
  const out = [];
  for (const st of lesson.steps) {
    if (st.t !== 'plan') { out.push(st); continue; }
    const song = songNow(st.song);
    if (!song) continue;
    let plan = practicePlan(song);
    if (st.only === 'both') plan = plan.filter((p) => p.hands === 'both' || p.section === -1);
    // Compact plan for longer pieces: each part with both hands, then the whole piece.
    if (st.compact && song.hands.R && song.hands.L) plan = plan.filter((p) => p.hands === 'both' || p.section === -1);
    for (const p of plan) {
      out.push({
        t: 'play', song: st.song, hands: p.hands, mode: p.mode, tempo: p.tempo || 1, rangeIdx: p.range,
        title: `${p.label}: ${handsLabel(p.hands)}`,
        subtitle: p.mode === 'wait' ? 'Your own pace' : `With the beat${p.tempo && p.tempo < 1 ? ` · ${Math.round(p.tempo * 100)}% speed` : ''}`,
      });
    }
  }
  return out;
}

/**
 * Build the visual for a "learn" card into `visual` (keyboard with hints,
 * staff example, chord buttons, hand illustration). Shared by lessons and the
 * Handbook. Returns { kb, ro, destroy }.
 */
export function learnVisual(st, visual) {
  const out = { kb: null, ro: null };
  if (st.img === 'hand') visual.append(handArt());
  if (st.staff) {
    const def = { id: 'staff', title: '', key: st.key || 0, time: st.time };
    if (st.clef === 'bass') def.lh = st.staff; else def.rh = st.staff;
    const song = songFromDef(def);
    const cv = h('canvas', { class: 'mini-staff' });
    visual.append(cv);
    requestAnimationFrame(() => {
      const sh = new Sheet(cv, { static: true, clef: st.clef === 'bass' ? 'bass' : 'treble' });
      sh.setSong(song, { showNames: true });
      sh.scroll = 0;
      sh.draw(0);
      out.ro = new ResizeObserver(() => { sh.resize(); sh.scroll = 0; sh.draw(0); });
      out.ro.observe(cv);
    });
  }
  const allChordNotes = (st.chords || []).flatMap((c) => c.notes);
  if (st.keys || st.chords) {
    const keys = st.keys || allChordNotes;
    const [lo, hi] = st.range || rangeFor(Math.min(...keys, ...allChordNotes), Math.max(...keys, ...allChordNotes), 15);
    const kbEl = h('div', { class: 'learn-kb' });
    visual.append(kbEl);
    out.kb = new Keyboard(kbEl, { lo, hi, labels: st.labels ? 'all' : 'c', onKey: (m, down) => input.touch(m, down) });
    out.kb.setHints(new Map((st.keys || []).map((m) => [m, { hand: st.hand || 'R', finger: st.fingers ? st.fingers[m] : undefined }])));
  }
  if (st.chords) {
    visual.append(h('div', { class: 'chord-btns' }, st.chords.map((c) => h('button', {
      class: 'chip-btn',
      onclick: () => {
        audio.ensure();
        c.notes.forEach((m, k) => audio.play(m, { when: audio.now + k * 0.012, dur: 1.4, velocity: 0.7 }));
        if (out.kb) out.kb.setHints(new Map(c.notes.map((m) => [m, { hand: st.hand || 'R' }])));
      },
    }, [icon('ear'), c.label]))));
  }
  out.destroy = () => {
    if (out.kb) out.kb.destroy();
    if (out.ro) out.ro.disconnect();
  };
  return out;
}

/** Song ids a lesson needs loaded before it can run. */
function lessonSongIds(lesson) {
  return lesson.steps.filter((s) => typeof s.song === 'string').map((s) => s.song);
}

export async function openLesson(id, onClose) {
  const lesson = allLessons().find((l) => l.id === id);
  if (!lesson || !lessonUnlocked(id)) { onClose(); return; }
  document.querySelectorAll('.fullscreen').forEach((el) => el._close && el._close());
  // Catalogue pieces are fetched on demand.
  const ids = lessonSongIds(lesson);
  if (ids.some((x) => !songNow(x))) {
    const loading = h('div', { class: 'fullscreen open lesson-loading' }, [h('div', { class: 'spinner' }), h('p', {}, 'Loading the music\u2026')]);
    document.body.appendChild(loading);
    try { await getSongs(ids); } catch (e) { console.warn(e); }
    loading.remove();
  }
  const steps = expandSteps(lesson);
  const results = [];
  // Long lessons resume where you left off.
  let i = Math.min(progress.lessonStep(lesson.id), Math.max(0, steps.length - 1));
  let player = null;
  let kb = null;
  let ro = null;

  const bar = h('div', { class: 'ls-steps' }, steps.map(() => h('i')));
  const body = h('div', { class: 'ls-body' });
  const el = h('div', { class: 'fullscreen lesson', style: { '--c': lesson.unit.color } }, [
    h('header', { class: 'ls-top' }, [
      h('button', { class: 'icon-btn', 'aria-label': 'Close lesson', onclick: () => close() }, icon('close')),
      bar,
      h('div', { class: 'ls-title' }, lesson.title),
    ]),
    body,
  ]);
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('open'));

  function teardown() {
    if (player) { player.destroy(); player = null; }
    if (kb) { kb.destroy(); kb = null; }
    if (ro) { ro.disconnect(); ro = null; }
  }

  function close() {
    teardown();
    input.deactivate();
    el.classList.remove('open');
    setTimeout(() => el.remove(), 250);
    el._close = null;
    onClose();
  }
  el._close = () => { teardown(); el.remove(); };

  function updateBar() {
    [...bar.children].forEach((b, k) => {
      b.className = k < i ? 'done' : k === i ? 'cur' : '';
    });
  }

  function show() {
    teardown();
    body.replaceChildren();
    updateBar();
    if (i >= steps.length) return finish();
    const st = steps[i];
    if (st.t === 'learn') showLearn(st);
    else if (st.t === 'boss') showBoss(st);
    else showPlay(st);
  }

  function next() {
    i++;
    progress.setLessonStep(lesson.id, i < steps.length ? i : 0);
    show();
  }

  function showLearn(st) {
    const visual = h('div', { class: 'learn-visual' });
    const card = h('div', { class: 'card learn-card pop' }, [
      h('div', { class: 'eyebrow' }, `${lesson.unit.title}`),
      h('h2', {}, st.title),
      h('p', { class: 'lead', html: st.text }),
      visual,
      h('div', { class: 'row end' }, [
        i > 0 ? h('button', { class: 'btn ghost', onclick: () => { i--; show(); } }, [icon('back'), 'Back']) : null,
        h('button', { class: 'btn primary big', onclick: next }, ['Continue', icon('chevron')]),
      ]),
    ]);
    body.append(h('div', { class: 'ls-center' }, card));

    const v = learnVisual(st, visual);
    kb = v.kb;
    ro = { disconnect: () => v.ro && v.ro.disconnect() }; // created a frame later
  }

  function showPlay(st) {
    const song = resolveSong(st.song);
    const range = st.rangeIdx || (st.range ? [measureIdx(song, st.range[0]), measureIdx(song, st.range[1])] : null);
    const hands = st.hands || (song.hands.R && song.hands.L ? 'both' : song.hands.R ? 'R' : 'L');
    const host = h('div', { class: 'ls-player' });
    body.append(host);
    player = new Player(host, {
      song, hands, range, mode: st.mode || 'wait', tempo: st.tempo || 1, names: st.names, hideOther: st.hideOther,
      title: st.title, subtitle: st.subtitle,
      onExit: () => close(),
      onFinish: (r) => { results[i] = r.stars; },
      actions: (r) => [{ label: r.stars > 0 ? 'Continue' : 'Skip for now', primary: r.stars > 0, fn: next }],
    });
  }

  function showBoss(st) {
    const song = resolveSong(st.song);
    const host = h('div', { class: 'ls-player' });
    body.append(host);
    const hands = song.hands.R && song.hands.L ? 'both' : song.hands.R ? 'R' : 'L';
    player = new Player(host, {
      song, hands, mode: 'timed', tempo: 1, title: song.title, subtitle: `Boss battle \u00b7 ${lesson.guardian || 'The Guardian'}`,
      exam: { pass: 0.75, name: lesson.guardian || 'The Guardian' },
      onExit: () => close(),
      onFinish: (r) => {
        if (r.passed) {
          const stars = Math.max(1, r.stars);
          progress.completeLesson(lesson.id, stars);
          // Guardians pay out once per week (rematches are a way to earn).
          if (bossRewardAvailable(lesson.id)) {
            earn(REWARD.bossBase + REWARD.bossPerStar * stars, 'Guardian defeated');
            markBossRewarded(lesson.id);
          }
          track('bosses');
          track('worlds');
          track('stars', stars);
          rewardDaily(progress.streak);
          progress.setLessonStep(lesson.id, 0);
        }
      },
      actions: (r) => (r.passed
        ? [{ label: 'Continue', primary: true, fn: () => { i = steps.length; victory(r); } }]
        : [{ label: 'Back to course', primary: false, fn: close }]),
    });
  }

  function victory(r) {
    teardown();
    body.replaceChildren();
    updateBar();
    const list = allLessons();
    const nxt = list[list.findIndex((l) => l.id === lesson.id) + 1];
    body.append(h('div', { class: 'ls-center' }, h('div', { class: 'card result-card boss-card pop' }, [
      h('div', { class: 'boss-emblem' }, [h('i'), h('i'), h('span', {}, '\u{1F3C6}')]),
      h('div', { class: 'eyebrow' }, 'Galaxy conquered'),
      h('h2', {}, `${lesson.guardian || 'The Guardian'} is defeated!`),
      h('div', { class: 'stars-big', html: starsHTML(r.stars, 3, true) }),
      h('p', {}, nxt ? `A new galaxy awaits: ${nxt.unit.title}.` : 'You conquered the final galaxy. You can truly play the piano!'),
      backupOffer(),
      h('div', { class: 'row' }, [
        nxt ? h('button', { class: 'btn primary', onclick: () => { teardown(); el.remove(); location.hash = `#/lesson/${nxt.id}`; } }, ['Onward', icon('chevron')]) : null,
        h('button', { class: `btn ${nxt ? 'ghost' : 'primary'}`, onclick: close }, 'Back to the universe'),
      ]),
    ])));
    confetti(el);
  }

  /** After each world: offer a one-tap backup (skippable). */
  function backupOffer() {
    const box = h('div', { class: 'backup-offer' }, [
      h('span', {}, 'Save a backup of your progress?'),
      h('button', { class: 'btn ghost sm', onclick: async () => { if (await backupNow()) box.replaceChildren(h('span', {}, 'Backed up \u2713')); } }, [icon('upload'), 'Back up']),
      h('button', { class: 'btn ghost sm', onclick: () => box.remove() }, 'Not now'),
    ]);
    return box;
  }

  function finish() {
    progress.setLessonStep(lesson.id, 0);
    const played = results.filter((x) => x != null);
    const stars = played.length ? Math.max(1, Math.round(played.reduce((a, b) => a + b, 0) / played.length)) : 3;
    const prev = progress.completeLesson(lesson.id, stars);
    rewardLesson(prev, stars, false);
    track('worlds');
    track('stars', stars);
    rewardDaily(progress.streak);
    const list = allLessons();
    const nxt = list[list.findIndex((l) => l.id === lesson.id) + 1];
    const card = h('div', { class: 'card result-card pop' }, [
      h('div', { class: 'eyebrow' }, 'Lesson complete'),
      h('div', { class: 'stars-big', html: starsHTML(stars, 3, true) }),
      h('h2', {}, lesson.title),
      h('p', { class: 'muted' }, stars === 3 ? 'Perfect! You nailed it.' : 'Great work! Replay anytime to earn more stars.'),
      backupOffer(),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn ghost', onclick: () => { i = 0; results.length = 0; show(); } }, [icon('restart'), 'Replay']),
        nxt ? h('button', { class: 'btn primary', onclick: () => { teardown(); el.remove(); location.hash = `#/lesson/${nxt.id}`; } }, ['Next lesson', icon('chevron')]) : null,
        h('button', { class: `btn ${nxt ? 'ghost' : 'primary'}`, onclick: close }, 'Back to course'),
      ]),
    ]);
    body.append(h('div', { class: 'ls-center' }, card));
    confetti(el);
  }

  show();
}

function handArt() {
  // Two stylised hands with finger numbers (thumbs inward).
  const finger = (x, y, w, hgt, n, rot) => `<g transform="rotate(${rot} ${x + w / 2} ${y + hgt})"><rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="${w / 2}" class="f"/><text x="${x + w / 2}" y="${y + 22}" class="fn">${n}</text></g>`;
  const hand = (ox, mirror) => {
    const fs = [
      [0, 62, 26, 70, mirror ? 5 : 1, mirror ? -10 : -38],
      [32, 18, 26, 96, mirror ? 4 : 2, mirror ? -5 : -6],
      [62, 6, 26, 108, 3, 0],
      [92, 18, 26, 96, mirror ? 2 : 4, mirror ? 6 : 5],
      [122, 62, 26, 70, mirror ? 1 : 5, mirror ? 38 : 10],
    ];
    return `<g transform="translate(${ox} 0)">${fs.map(([x, y, w, hh, n, r]) => finger(x, y, w, hh, n, r)).join('')}<rect x="4" y="112" width="140" height="78" rx="34" class="palm"/></g>`;
  };
  const wrap = h('div', { class: 'hand-art' });
  wrap.innerHTML = `<svg viewBox="0 0 360 210" role="img" aria-label="Finger numbers: thumbs are 1, pinkies are 5">
    ${hand(10, true)}${hand(202, false)}
    <text x="84" y="206" class="cap">Left hand</text><text x="276" y="206" class="cap">Right hand</text></svg>`;
  return wrap;
}
