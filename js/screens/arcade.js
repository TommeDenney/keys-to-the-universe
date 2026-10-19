// Arcade: Endless, Boss Rush, Battle and mini games. Runs reuse the regular
// Player (with arcade hooks): energy carries from section to section, a short
// break separates sections whose timing changes, and losing all energy ends the run.

import { h, icon, toast } from '../ui.js';
import { Player } from './player.js';
import { Keyboard } from '../render/keyboard.js';
import { input } from '../input/hub.js';
import { audio } from '../audio/engine.js';
import { builtinSongs } from '../data/songs.js';
import { catalogPieces, getSong } from '../data/catalog.js';
import { allLessons } from '../data/course.js';
import { progress, getState, saveState } from '../store.js';
import { songUnlocked } from '../unlocks.js';
import { earn, walletPill, SYMBOL } from '../economy.js';
import { track } from '../challenges.js';
import { noteName, CHORD_TYPES, chordMidis, ROOTS } from '../music/theory.js';
import { guardianArt } from '../render/guardians.js';

// ---- Saved bests + a daily Stardust cap (the arcade is for fun, not farming) -----------
const DAILY_CAP = 300;
function arcadeState() {
  const st = getState();
  st.arcade ||= { best: {}, day: null, earnedToday: 0 };
  const today = new Date().toDateString();
  if (st.arcade.day !== today) { st.arcade.day = today; st.arcade.earnedToday = 0; }
  return st.arcade;
}
function reward(amount, why) {
  const a = arcadeState();
  const pay = Math.max(0, Math.min(amount, DAILY_CAP - a.earnedToday));
  a.earnedToday += pay;
  saveState();
  if (pay) earn(pay, why);
  return pay;
}
function best(key, value) {
  const a = arcadeState();
  const isNew = value > (a.best[key] || 0);
  if (isNew) { a.best[key] = value; saveState(); }
  return { best: a.best[key] || 0, isNew };
}
const bestOf = (key) => arcadeState().best[key] || 0;

// ---- The arcade lobby ---------------------------------------------------------------
export function renderArcade(root) {
  const page = h('div', { class: 'page arcade' });
  root.append(page);
  const card = (cls, emoji, title, blurb, bestTxt, go) => h('button', { class: `arc-card ${cls}`, onclick: go }, [
    h('span', { class: 'arc-emoji' }, emoji), h('b', {}, title), h('span', { class: 'arc-blurb' }, blurb), bestTxt ? h('small', { class: 'arc-best' }, bestTxt) : null,
  ]);
  const bosses = defeatedGuardians();
  page.append(
    h('header', { class: 'top' }, [h('div', {}, [h('a', { class: 'back-link', href: '#/learn' }, [icon('back'), 'Learn']), h('div', { class: 'eyebrow' }, 'Play for fun'), h('h1', {}, '\u{1F579}️ Arcade')]), walletPill('big')]),
    h('p', { class: 'muted arc-note' }, `Arcade runs earn a little Stardust (up to ${DAILY_CAP} ${SYMBOL} a day). Best scores are saved.`),
    h('div', { class: 'arc-grid' }, [
      card('endless', '♾️', 'Endless', 'Random songs back to back, getting harder as you go, even past the grades you’ve reached. Misses drain energy. Rifts restore it.', `Best: ${bestOf('endless').toLocaleString('en-US')} pts`, () => startEndless(root)),
      card('rush', '⚔️', 'Boss Rush', bosses.length >= 2 ? `Every Guardian you’ve beaten (${bosses.length}), one after another, on one energy bar.` : 'Beat 2 Guardians in the Learn path to unlock.', bosses.length >= 2 ? `Best: ${bestOf('rush')} Guardians` : '\u{1F512} Locked', () => (bosses.length >= 2 ? startRush(root) : toast('Defeat 2 Guardians first.', 'bad'))),
      card('battle', '\u{1F3B8}', 'Battle', 'Face a rival player on the same song. Their skill decides how often they miss or play early or late. Highest score wins.', `Wins: ${bestOf('battleWins')}`, () => battleSetup(root)),
    ]),
    h('h2', { class: 'arc-sub' }, 'Mini games'),
    h('div', { class: 'arc-grid mini' }, MINIS.map((m) => card('mini', m.emoji, m.name, m.blurb, `Best: ${bestOf(`mini-${m.id}`)}`, () => startMini(root, m)))),
  );
}

// ---- Shared run screen ------------------------------------------------------------------
/** A full-screen arcade stage with a HUD (score, round, energy is the player's own). */
function stage(root, title) {
  root.replaceChildren();
  const hud = h('div', { class: 'arc-hud' }, [h('b', { class: 'arc-title' }, title), h('span', { class: 'arc-score' }, '0 pts'), h('span', { class: 'arc-round' }, ''), h('button', { class: 'btn ghost sm', onclick: () => quit() }, 'Quit')]);
  const host = h('div', { class: 'arc-host' });
  const el = h('div', { class: 'page arc-stage' }, [hud, host]);
  root.append(el);
  let quit = () => { location.hash = '#/arcade'; };
  return { el, hud, host, setScore: (s) => { hud.querySelector('.arc-score').textContent = `${Math.round(s).toLocaleString('en-US')} pts`; }, setRound: (t) => { hud.querySelector('.arc-round').textContent = t; }, onQuit: (fn) => { quit = fn; } };
}

/** A 2-second break card between sections ("next up…"). */
function breakCard(host, lines, ms = 2000) {
  return new Promise((ok) => {
    const bar = h('i');
    const card = h('div', { class: 'card arc-break pop' }, [...lines.map((l, i) => (i === 0 ? h('h2', {}, l) : h('p', {}, l))), h('span', { class: 'ar-bar' }, bar)]);
    host.replaceChildren(h('div', { class: 'ls-center' }, card));
    requestAnimationFrame(() => { bar.style.transitionDuration = `${ms}ms`; bar.style.width = '100%'; });
    setTimeout(ok, ms);
  });
}

const POINTS = { perfect: 100, good: 70, ok: 40 };
const timeSig = (s) => (s.time ? `${s.time[0]}/${s.time[1]}` : '4/4');

/**
 * Play one section in the shared host. Resolves with { result, energy }.
 * `rift`: { fromBeat, toBeat, reward } — hit every note inside to restore energy.
 */
function playSection(host, { song, range, hands, tempo, energy, title, subtitle, rift, onPoints, onBeat }) {
  return new Promise((ok) => {
    host.replaceChildren();
    const box = h('div', { class: 'arc-player' });
    const riftBanner = rift ? h('div', { class: 'arc-rift' }, rift.reward >= 1 ? '⚡ RIFT: hit every note to refill ALL your energy' : '⚡ Rift: hit every note to restore half your energy') : null;
    host.append(box, riftBanner || '');
    let riftBroken = false;
    let riftDone = false;
    let player = null;
    let raf = 0;
    const inRift = (n) => rift && n.start >= rift.fromBeat && n.start < rift.toBeat;
    player = new Player(box, {
      song, range, hands, mode: 'timed', tempo, title, subtitle, energy, autoStart: true,
      exam: { pass: 0, name: title },
      arcade: {
        noResult: true,
        onHit: (grade, n) => { onPoints(POINTS[grade] || 0, grade); },
        onMiss: (n) => { if (inRift(n)) riftBroken = true; onPoints(0, 'miss'); },
      },
      onExit: () => { cancelAnimationFrame(raf); ok({ quit: true }); },
      onFinish: (result) => {
        cancelAnimationFrame(raf);
        const e = player.energy;
        setTimeout(() => { player.destroy(); ok({ result, energy: e }); }, 600);
      },
    });
    // Watch the rift and report the beat (for battle rivals).
    const watch = () => {
      if (!player || player.destroyed) return;
      if (rift && !riftDone && player.beat >= rift.toBeat + 0.5) {
        riftDone = true;
        if (!riftBroken) {
          player.addEnergy(rift.reward >= 1 ? 1 : 0.5);
          player.sheet.popup(rift.reward >= 1 ? 'RIFT CLEARED! Full energy' : 'Rift cleared! +50% energy', '#A855F7');
          if (riftBanner) { riftBanner.textContent = '✨ Rift cleared!'; riftBanner.classList.add('won'); }
        } else if (riftBanner) { riftBanner.textContent = 'Rift broken'; riftBanner.classList.add('lost'); }
      }
      if (riftBanner) riftBanner.classList.toggle('live', !!rift && player.beat >= rift.fromBeat && player.beat < rift.toBeat);
      if (onBeat) onBeat(player);
      raf = requestAnimationFrame(watch);
    };
    raf = requestAnimationFrame(watch);
  });
}

function runSummary(host, { title, lines, again, rewardTxt }) {
  host.replaceChildren(h('div', { class: 'ls-center' }, h('div', { class: 'card result-card pop' }, [
    h('div', { class: 'eyebrow' }, 'Run over'), h('h2', {}, title), ...lines.map((l) => h('p', {}, l)),
    rewardTxt ? h('p', { class: 'arc-reward' }, rewardTxt) : null,
    h('div', { class: 'row' }, [h('button', { class: 'btn ghost', onclick: () => { location.hash = '#/arcade'; } }, 'Arcade'), h('button', { class: 'btn primary', onclick: again }, [icon('restart'), 'Play again'])]),
  ])));
}

// ---- Endless ----------------------------------------------------------------------
/** Difficulty of a song on one scale: built-in songs 1–3, graded pieces 2–11. */
const difficultyOf = (s) => (s.grade ? s.grade + 1 : Math.max(1, Math.round((s.level || 1) * 0.6)));
function endlessPool() {
  return [
    ...builtinSongs().filter((s) => !s.id.startsWith('boss-') && s.notes.length > 8).map((s) => ({ id: s.id, title: s.title, d: difficultyOf(s), grade: 0 })),
    ...catalogPieces().map((p) => ({ id: p.id, title: p.title, d: difficultyOf(p), grade: p.grade })),
  ];
}

async function startEndless(root) {
  const S = stage(root, '♾️ Endless');
  let stopped = false;
  S.onQuit(() => { stopped = true; location.hash = '#/arcade'; });
  const pool = endlessPool();
  let score = 0;
  let energy = 0.8;
  let level = 1;
  let cleared = 0;
  let lastSig = null;
  let lastBpm = null;
  while (!stopped) {
    const near = pool.filter((p) => p.d >= level - 1 && p.d <= level);
    const pick = (near.length ? near : pool)[Math.floor(Math.random() * (near.length || pool.length))];
    let song;
    try { song = await getSong(pick.id); } catch { song = null; }
    if (!song || !song.measures.length) continue;
    const bars = Math.min(song.measures.length, level <= 2 ? 6 : 8);
    const from = Math.floor(Math.random() * Math.max(1, song.measures.length - bars + 1));
    const range = [from, from + bars - 1];
    const hands = level <= 2 ? (song.hands.R ? 'R' : 'L') : song.hands.R && song.hands.L ? 'both' : song.hands.R ? 'R' : 'L';
    const tempo = Math.min(1.25, 0.85 + cleared * 0.025);
    const bpm = Math.round((song.bpm || 90) * tempo);
    // A rift in about one section in four: the middle bars, restoring half (or rarely all) energy.
    let rift = null;
    if (Math.random() < 0.25 && bars >= 4) {
      const m0 = song.measures[from + 1] || song.measures[from];
      const m1 = song.measures[Math.min(song.measures.length - 1, from + bars - 2)];
      rift = { fromBeat: m0.start, toBeat: m1.start + m1.len, reward: Math.random() < 0.2 ? 1 : 0.5 };
    }
    // Timing change (time signature or tempo) → a short 2-second break.
    const sig = timeSig(song);
    if (lastSig !== null && (sig !== lastSig || Math.abs(bpm - lastBpm) > 6)) {
      await breakCard(S.host, [`Next: ${song.title}`, `${sig} time · ♩ = ${bpm}${pick.grade ? ` · Grade ${pick.grade}` : ''}`, rift ? '⚡ A rift is coming!' : 'Get ready…']);
      if (stopped) return;
    }
    lastSig = sig; lastBpm = bpm;
    S.setRound(`Level ${level} · section ${cleared + 1}`);
    const r = await playSection(S.host, {
      song, range, hands, tempo, energy, title: song.title, subtitle: `Endless · level ${level}`, rift,
      onPoints: (p) => { score += p * (1 + (level - 1) * 0.15); S.setScore(score); },
    });
    if (r.quit || stopped) return;
    energy = r.energy;
    if (r.result.knockedOut || energy <= 0) break;
    cleared++;
    if (cleared % 2 === 0) level = Math.min(11, level + 1);
  }
  if (stopped) return;
  const b = best('endless', Math.round(score));
  const pay = reward(Math.min(150, cleared * 10), 'Endless run');
  track('notes', 0);
  runSummary(S.host, { title: `${cleared} section${cleared === 1 ? '' : 's'} cleared`, lines: [`Score: ${Math.round(score).toLocaleString('en-US')}${b.isNew ? ' — new best!' : ` (best ${b.best.toLocaleString('en-US')})`}`, `You reached level ${level}.`], rewardTxt: pay ? `+${pay} ${SYMBOL}` : null, again: () => startEndless(root) });
}

// ---- Boss Rush ----------------------------------------------------------------------
function defeatedGuardians() {
  return allLessons().filter((l) => l.boss && progress.lesson(l.id));
}
async function startRush(root) {
  const S = stage(root, '⚔️ Boss Rush');
  let stopped = false;
  S.onQuit(() => { stopped = true; location.hash = '#/arcade'; });
  const bosses = defeatedGuardians();
  let score = 0;
  let energy = 0.8;
  let beaten = 0;
  for (const [i, b] of bosses.entries()) {
    const song = await getSong(b.song).catch(() => null);
    if (!song) continue;
    S.setRound(`Guardian ${i + 1} of ${bosses.length}`);
    await new Promise((ok) => {
      S.host.replaceChildren(h('div', { class: 'ls-center' }, h('div', { class: 'card arc-break pop' }, [h('div', { class: 'boss-emblem' }, [h('i'), h('i'), h('span', { class: 'g-mascot', html: guardianArt(b.id) })]), h('h2', {}, b.guardian || 'The Guardian'), h('p', {}, `${song.title} · ${timeSig(song)}`)])));
      setTimeout(ok, 2000);
    });
    if (stopped) return;
    const hands = song.hands.R && song.hands.L ? 'both' : song.hands.R ? 'R' : 'L';
    const r = await playSection(S.host, { song, hands, tempo: 1, energy, title: song.title, subtitle: `Boss Rush · ${b.guardian}`, onPoints: (p) => { score += p; S.setScore(score); } });
    if (r.quit || stopped) return;
    energy = r.energy;
    if (r.result.knockedOut || energy <= 0) break;
    beaten++;
    energy = Math.min(1, energy + 0.2); // a breather between bosses
  }
  if (stopped) return;
  const b = best('rush', beaten);
  const pay = reward(beaten * 25 + (beaten === bosses.length ? 100 : 0), 'Boss Rush');
  runSummary(S.host, { title: beaten === bosses.length ? 'You beat them all!' : `${beaten} of ${bosses.length} Guardians beaten`, lines: [`Score: ${Math.round(score).toLocaleString('en-US')}`, b.isNew ? 'New best!' : `Best: ${b.best} Guardians`], rewardTxt: pay ? `+${pay} ${SYMBOL}` : null, again: () => startRush(root) });
}

// ---- Battle ------------------------------------------------------------------------
// Rival skill: chances per note of perfect / good / early-or-late / miss.
const RIVALS = [
  { id: 'rookie', name: 'Rookie Rex', emoji: '\u{1F466}', odds: [0.25, 0.3, 0.25, 0.2] },
  { id: 'pro', name: 'Pro Penny', emoji: '\u{1F469}‍\u{1F3A4}', odds: [0.45, 0.3, 0.15, 0.1] },
  { id: 'virtuoso', name: 'Virtuoso Vee', emoji: '\u{1F9D1}‍\u{1F3A8}', odds: [0.65, 0.22, 0.09, 0.04] },
  { id: 'maestro', name: 'The Maestro', emoji: '\u{1F3A9}', odds: [0.82, 0.13, 0.04, 0.01] },
];

function battleSetup(root) {
  root.replaceChildren();
  // Your unlocked songs, plus the beginner songs so there's always something to battle on.
  const songs = [...builtinSongs().filter((s) => !s.id.startsWith('boss-') && (songUnlocked(s.id) || (s.level || 1) <= 1)), ...catalogPieces().filter((p) => songUnlocked(p.id))];
  let rival = RIVALS[0];
  let songId = songs[0] && songs[0].id;
  const page = h('div', { class: 'page arcade' });
  const rivalsEl = h('div', { class: 'arc-rivals' });
  const drawRivals = () => rivalsEl.replaceChildren(...RIVALS.map((r) => h('button', { class: `arc-rival ${r === rival ? 'on' : ''}`, onclick: () => { rival = r; drawRivals(); } }, [h('span', { class: 'arc-emoji' }, r.emoji), h('b', {}, r.name), h('small', {}, `Misses about ${Math.round(r.odds[3] * 100)}% · off-beat ${Math.round(r.odds[2] * 100)}%`)])));
  drawRivals();
  const select = h('select', { class: 'pf-input', onchange: (e) => { songId = e.target.value; } }, songs.map((s) => h('option', { value: s.id }, `${s.title}${s.grade ? ` (Grade ${s.grade})` : ''}`)));
  page.append(
    h('header', { class: 'top' }, [h('div', {}, [h('a', { class: 'back-link', href: '#/arcade' }, [icon('back'), 'Arcade']), h('div', { class: 'eyebrow' }, 'Battle'), h('h1', {}, 'Pick your rival')])]),
    rivalsEl,
    h('label', { class: 'field' }, [h('span', {}, 'Song'), select]),
    h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, [h('button', { class: 'btn primary', onclick: () => startBattle(root, songId, rival) }, ['\u{1F3B8} Battle!'])]),
  );
  root.append(page);
}

async function startBattle(root, songId, rival) {
  const S = stage(root, `\u{1F3B8} Battle vs ${rival.name}`);
  let stopped = false;
  S.onQuit(() => { stopped = true; location.hash = '#/arcade'; });
  const song = songId ? await getSong(songId).catch(() => null) : null;
  if (!song) { toast('Couldn’t load that song.', 'bad'); return; }
  const vs = h('div', { class: 'arc-vs' }, [h('div', { class: 'arc-side you' }, [h('b', {}, 'You'), h('span', { class: 'v' }, '0')]), h('div', { class: 'arc-meter' }, h('i')), h('div', { class: 'arc-side rival' }, [h('b', {}, `${rival.emoji} ${rival.name}`), h('span', { class: 'v' }, '0'), h('small', { class: 'rv-last' }, '')])]);
  S.el.insertBefore(vs, S.host);
  let you = 0;
  let them = 0;
  const done = new Set();
  const draw = () => {
    vs.querySelector('.you .v').textContent = you.toLocaleString('en-US');
    vs.querySelector('.rival .v').textContent = them.toLocaleString('en-US');
    const share = you + them ? you / (you + them) : 0.5;
    vs.querySelector('.arc-meter i').style.width = `${share * 100}%`;
  };
  const roll = () => {
    const r = Math.random();
    const [p, g, o] = rival.odds;
    return r < p ? 'perfect' : r < p + g ? 'good' : r < p + g + o ? (Math.random() < 0.5 ? 'early' : 'late') : 'miss';
  };
  const hands = song.hands.R && song.hands.L ? 'both' : song.hands.R ? 'R' : 'L';
  await breakCard(S.host, [`${song.title}`, `${rival.emoji} ${rival.name} is ready. First to the higher score wins.`]);
  if (stopped) return;
  const r = await playSection(S.host, {
    song, hands, tempo: 1, energy: 1, title: song.title, subtitle: `Battle vs ${rival.name}`,
    onPoints: (p) => { you += p; draw(); S.setScore(you); },
    onBeat: (pl) => {
      // The rival plays each note as it reaches the line.
      for (const n of pl.active) {
        if (done.has(n.id) || n.start > pl.beat) continue;
        done.add(n.id);
        const res = roll();
        them += res === 'perfect' ? 100 : res === 'good' ? 70 : res === 'miss' ? 0 : 40;
        vs.querySelector('.rv-last').textContent = res === 'perfect' ? 'Perfect' : res === 'good' ? 'Good' : res === 'miss' ? 'Miss!' : res === 'early' ? 'Early' : 'Late';
      }
      draw();
    },
  });
  if (r.quit || stopped) return;
  const won = you > them && !r.result.knockedOut;
  if (won) { best('battleWins', bestOf('battleWins') + 1); }
  const pay = won ? reward(40 + RIVALS.indexOf(rival) * 30, `Beat ${rival.name}`) : 0;
  runSummary(S.host, { title: won ? `You beat ${rival.name}!` : r.result.knockedOut ? 'Your energy ran out' : `${rival.name} wins this one`, lines: [`You ${you.toLocaleString('en-US')} — ${them.toLocaleString('en-US')} ${rival.name}`], rewardTxt: pay ? `+${pay} ${SYMBOL}` : null, again: () => startBattle(root, songId, rival) });
}

// ---- Mini games -------------------------------------------------------------------
const MINIS = [
  { id: 'noterush', name: 'Note Rush', emoji: '\u{1F3BC}', blurb: 'A note appears on the staff: play it! As many as you can in 60 seconds.', secs: 60 },
  { id: 'keyfinder', name: 'Key Finder', emoji: '\u{1F50E}', blurb: 'Find the named key (any octave), fast. 45 seconds.', secs: 45 },
  { id: 'echo', name: 'Echo', emoji: '\u{1F501}', blurb: 'Listen to the tune, then play it back. It grows every round.', secs: 0 },
  { id: 'chords', name: 'Chord Catch', emoji: '\u{1F3B9}', blurb: 'Play the named chord (all three notes together). 60 seconds.', secs: 60 },
];
const NATURALS = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79];

function staffSVG(midi) {
  // Treble staff, middle C (60) on a ledger line below. Natural notes only.
  const order = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
  const step = order[midi % 12] + (Math.floor(midi / 12) - 5) * 7; // 0 = C4
  const y = 92 - step * 6; // E4 (step 2) sits on the bottom line (y=80)
  const lines = [80, 68, 56, 44, 32].map((ly) => `<line x1="20" x2="200" y1="${ly}" y2="${ly}" stroke="currentColor" stroke-width="1.6"/>`).join('');
  const ledger = step <= 0 ? `<line x1="96" x2="124" y1="92" y2="92" stroke="currentColor" stroke-width="1.6"/>` : step >= 12 ? `<line x1="96" x2="124" y1="20" y2="20" stroke="currentColor" stroke-width="1.6"/>` : '';
  return `<svg viewBox="0 0 220 110" class="arc-staff">${lines}${ledger}<text x="22" y="82" font-size="62" font-family="Noto Music, serif" fill="currentColor">\u{1D11E}</text><ellipse cx="110" cy="${y}" rx="8" ry="6" fill="currentColor" transform="rotate(-20 110 ${y})"/><line x1="${step >= 6 ? 102.5 : 117.5}" x2="${step >= 6 ? 102.5 : 117.5}" y1="${y}" y2="${step >= 6 ? y + 34 : y - 34}" stroke="currentColor" stroke-width="1.8"/></svg>`;
}

async function startMini(root, m) {
  const S = stage(root, `${m.emoji} ${m.name}`);
  const prompt = h('div', { class: 'arc-prompt' });
  const timer = h('div', { class: 'arc-timer' });
  const kbEl = h('div', { class: 'arc-kb' });
  S.host.append(h('div', { class: 'arc-mini' }, [timer, prompt]), kbEl);
  const kb = new Keyboard(kbEl, { lo: 48, hi: 84, labels: 'c', onKey: (midi, down) => input.touch(midi, down) });
  await input.activate();
  let score = 0;
  let over = false;
  let target = null;
  const held = new Set();
  const finish = () => {
    if (over) return;
    over = true;
    off();
    kb.destroy();
    const b = best(`mini-${m.id}`, score);
    const pay = reward(Math.min(60, score * 2), m.name);
    track('notes', score);
    runSummary(S.host, { title: `${score} point${score === 1 ? '' : 's'}`, lines: [b.isNew ? 'New best!' : `Best: ${b.best}`], rewardTxt: pay ? `+${pay} ${SYMBOL}` : null, again: () => startMini(root, m) });
  };
  S.onQuit(() => { over = true; off(); location.hash = '#/arcade'; });
  const good = () => { score++; S.setScore(score); audio.chime('good'); prompt.classList.remove('ok'); void prompt.offsetWidth; prompt.classList.add('ok'); next(); };
  const bad = () => { prompt.classList.remove('no'); void prompt.offsetWidth; prompt.classList.add('no'); };

  let next = () => {};
  let seq = [];
  let pos = 0;
  if (m.id === 'noterush') next = () => { target = NATURALS[Math.floor(Math.random() * NATURALS.length)]; prompt.innerHTML = staffSVG(target); };
  if (m.id === 'keyfinder') next = () => { target = Math.floor(Math.random() * 12); prompt.innerHTML = `<div class="arc-big">${noteName(60 + target, target === 1 || target === 3 || target === 6 || target === 8 || target === 10 ? (Math.random() < 0.5 ? 1 : -1) : 0)}</div>`; };
  if (m.id === 'chords') {
    next = () => {
      const r = ROOTS[Math.floor(Math.random() * ROOTS.length)];
      const type = Math.random() < 0.6 ? 'maj' : 'min';
      target = new Set(chordMidis(r.pc, type, 0, 60).map((x) => x % 12));
      prompt.innerHTML = `<div class="arc-big">${r.name}${CHORD_TYPES[type].symbol}</div><small>${CHORD_TYPES[type].label}</small>`;
    };
  }
  if (m.id === 'echo') {
    const playSeq = () => {
      prompt.innerHTML = `<div class="arc-big">Listen…</div>`;
      pos = 0;
      seq.forEach((n, i) => setTimeout(() => { audio.play(n, { velocity: 0.8 }); kb.flash(n, 'play', 380); }, 500 + i * 520));
      setTimeout(() => { if (!over) prompt.innerHTML = `<div class="arc-big">Your turn (${seq.length})</div>`; }, 500 + seq.length * 520);
    };
    next = () => { seq.push(NATURALS[Math.floor(Math.random() * 8)]); playSeq(); };
  }
  const off = input.on((type, e) => {
    if (over || type !== 'noteon') return;
    if (m.id === 'noterush') { if (e.midi === target) good(); else bad(); }
    else if (m.id === 'keyfinder') { if (e.midi % 12 === target) good(); else bad(); }
    else if (m.id === 'chords') {
      held.add(e.midi % 12);
      setTimeout(() => held.delete(e.midi % 12), 900);
      if ([...target].every((pc) => held.has(pc))) { held.clear(); good(); } else if (!target.has(e.midi % 12)) bad();
    } else if (m.id === 'echo') {
      if (e.midi === seq[pos]) { pos++; if (pos === seq.length) { score = seq.length; S.setScore(score); audio.chime('good'); setTimeout(next, 600); } }
      else { bad(); score = seq.length - 1; setTimeout(finish, 500); }
    }
  });
  next();
  if (m.secs) {
    const end = performance.now() + m.secs * 1000;
    const tick = () => {
      if (over) return;
      const left = Math.max(0, Math.ceil((end - performance.now()) / 1000));
      timer.textContent = `${left}s`;
      if (left <= 0) finish(); else setTimeout(tick, 200);
    };
    tick();
  } else timer.textContent = 'Round by round';
}
