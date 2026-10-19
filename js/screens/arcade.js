// Arcade: Endless, Boss Rush, Battle and mini games. Runs reuse the regular
// Player (with arcade hooks): energy carries from section to section, a short
// break separates sections whose timing changes, and losing all energy ends the run.

import { hold as holdBg, release as releaseBg } from '../audio/bgmusic.js';
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
import { glyph } from '../render/glyphs.js';
import { avatarSVG } from '../render/avatar.js';
import { DEFAULT_AVATAR } from '../data/avatar.js';
import { finalizeSong } from '../music/song.js';
import { excerpt, snippetSVG, loadSnippets } from '../render/snippet.js';
import { library } from '../store.js';

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
let lobbyRoot = null;
/** Back to the Arcade menu from anywhere inside it (the page address doesn't change). */
function toLobby(root = lobbyRoot) {
  if (Player.current) Player.current.destroy();
  input.deactivate();
  releaseBg('listen');
  if (!root) { location.hash = '#/learn'; return; }
  root.replaceChildren();
  root.scrollTop = 0;
  renderArcade(root);
}

export function renderArcade(root) {
  lobbyRoot = root;
  const page = h('div', { class: 'page arcade' });
  root.append(page);
  const card = (cls, art, title, blurb, bestTxt, go, locked = false) => h('button', { class: `arc-card ${cls} ${locked ? 'locked' : ''}`, onclick: go }, [
    h('span', { class: 'arc-art', html: glyph(art) }),
    h('span', { class: 'arc-text' }, [h('b', {}, title), h('span', { class: 'arc-blurb' }, blurb)]),
    bestTxt ? h('span', { class: 'arc-best' }, [locked ? h('span', { html: glyph('lock') }) : h('span', { html: glyph('trophy') }), bestTxt]) : null,
  ]);
  const bosses = defeatedGuardians();
  page.append(
    h('header', { class: 'top' }, [h('div', {}, [h('div', { class: 'eyebrow' }, 'Play for fun'), h('h1', { class: 'arc-h1' }, [h('span', { html: glyph('joystick') }), 'Arcade'])])]),
    h('p', { class: 'arc-note' }, [h('span', { html: glyph('sparkles') }), `Runs earn a little Stardust, up to ${DAILY_CAP} ${SYMBOL} a day. Your best scores are saved.`]),
    h('div', { class: 'arc-grid' }, [
      card('endless', 'infinity', 'Endless', 'One never-ending scroll of music that keeps getting harder, even past the grades you’ve reached. Misses drain energy; rifts restore it.', `Best ${bestOf('endless').toLocaleString('en-US')} pts`, () => startEndless(root)),
      card('rush', 'swords', 'Boss Rush', bosses.length >= 2 ? `Every Guardian you’ve beaten (${bosses.length}), one after another, on one energy bar.` : 'Beat 2 Guardians on the Learn map to unlock.', bosses.length >= 2 ? `Best ${bestOf('rush')} Guardians` : 'Locked', () => (bosses.length >= 2 ? startRush(root) : toast('Defeat 2 Guardians first.', 'bad')), bosses.length < 2),
      card('battle', 'guitar', 'Battle', 'Face a rival on any song you’ve unlocked. Their skill decides how often they miss or play off the beat. Highest score wins.', `${bestOf('battleWins')} wins`, () => battleSetup(root)),
    ]),
    h('h2', { class: 'arc-sub' }, 'Mini games'),
    h('div', { class: 'arc-grid mini' }, MINIS.map((m) => card('mini', m.art, m.name, m.blurb, `Best ${bestOf(`mini-${m.id}`)}`, () => startMini(root, m)))),
  );
}

// ---- Shared run screen ------------------------------------------------------------------
/** A full-screen arcade stage with a HUD (score, round, energy is the player's own). */
function stage(root, title, art) {
  root.replaceChildren();
  const hud = h('div', { class: 'arc-hud' }, [
    h('b', { class: 'arc-title' }, [art ? h('span', { html: glyph(art) }) : null, title]),
    h('span', { class: 'arc-round' }, ''),
    h('span', { class: 'arc-score' }, '0 pts'),
    h('button', { class: 'btn ghost sm arc-quit', onclick: () => quit() }, [icon('close'), 'Quit']),
  ]);
  const host = h('div', { class: 'arc-host' });
  const el = h('div', { class: 'page arc-stage' }, [hud, host]);
  root.append(el);
  let quit = () => toLobby(root);
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
function playSection(host, { song, range, hands, tempo, energy, title, subtitle, rift, rifts: riftList, onPoints, onBeat }) {
  const rifts = riftList || (rift ? [rift] : []);
  return new Promise((ok) => {
    host.replaceChildren();
    const box = h('div', { class: 'arc-player' });
    const riftBanner = rifts.length ? h('div', { class: 'arc-rift' }) : null;
    host.append(box, riftBanner || '');
    let player = null;
    let raf = 0;
    const riftAt = (beat) => rifts.find((r) => beat >= r.fromBeat && beat < r.toBeat);
    const inRift = (n) => !!riftAt(n.start);
    player = new Player(box, {
      song, range, hands, mode: 'timed', tempo, title, subtitle, energy, autoStart: true,
      exam: { pass: 0, name: title },
      arcade: {
        noResult: true,
        onHit: (grade, n) => { onPoints(POINTS[grade] || 0, grade); },
        onMiss: (n) => { const r = riftAt(n.start); if (r) r.broken = true; onPoints(0, 'miss'); },
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
      for (const rf of rifts) {
        if (rf.done || player.beat < rf.toBeat + 0.5) continue;
        rf.done = true;
        if (!rf.broken) {
          player.addEnergy(rf.reward >= 1 ? 1 : 0.5);
          player.sheet.popup(rf.reward >= 1 ? 'RIFT CLEARED! Full energy' : 'Rift cleared! +50% energy', '#A855F7');
          if (riftBanner) { riftBanner.innerHTML = `${glyph('sparkles')} Rift cleared!`; riftBanner.className = 'arc-rift won'; }
        } else if (riftBanner) { riftBanner.textContent = 'Rift broken'; riftBanner.className = 'arc-rift lost'; }
      }
      if (riftBanner) {
        // Show the next rift a few beats ahead, then while you're in it.
        const now = riftAt(player.beat);
        const soon = rifts.find((r) => !r.done && r.fromBeat > player.beat && r.fromBeat - player.beat < 8);
        if (now || soon) {
          const r = now || soon;
          const msg = `${glyph('bolt')} ${now ? 'RIFT' : 'Rift ahead'}: hit every note to ${r.reward >= 1 ? 'refill ALL your energy' : 'restore half your energy'}`;
          if (riftBanner.dataset.msg !== msg) { riftBanner.innerHTML = msg; riftBanner.dataset.msg = msg; riftBanner.className = `arc-rift ${now ? 'live' : ''}`; }
        } else if (!riftBanner.classList.contains('won') && !riftBanner.classList.contains('lost')) riftBanner.className = 'arc-rift hide';
      }
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
    h('div', { class: 'row' }, [h('button', { class: 'btn ghost', onclick: () => toLobby() }, [icon('back'), 'Arcade']), h('button', { class: 'btn primary', onclick: again }, [icon('restart'), 'Play again'])]),
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

/**
 * One long stretch of Endless: sections from different songs joined bar to bar into a
 * single piece (same time signature and tempo within a stretch), getting harder as
 * it goes. Notes keep their spelling, so each section reads as it was written.
 */
async function endlessStretch(pool, { level, cleared, n = 10 }) {
  const sigs = ['4/4', '4/4', '4/4', '3/4', '2/4', '6/8'];
  const sig = level <= 2 ? '4/4' : sigs[Math.floor(Math.random() * sigs.length)];
  const notes = [], rests = [], measures = [], rifts = [], marks = [];
  let t = 0, num = 1, lvl = level, done = cleared, bpmMin = Infinity, tries = 0;
  let time = [4, 4];
  while (marks.length < n && tries++ < n * 6) {
    const near = pool.filter((p) => p.d >= lvl - 1 && p.d <= lvl);
    const pick = (near.length ? near : pool)[Math.floor(Math.random() * (near.length || pool.length))];
    let song;
    try { song = await getSong(pick.id); } catch { song = null; }
    if (!song || !song.measures.length || timeSig(song) !== sig) continue;
    time = song.time || [4, 4];
    const bars = Math.min(song.measures.length, lvl <= 2 ? 6 : 8);
    const from = Math.floor(Math.random() * Math.max(1, song.measures.length - bars + 1));
    const ms = song.measures.slice(from, from + bars);
    const a = ms[0].start, b = ms[ms.length - 1].start + ms[ms.length - 1].len;
    const oneHand = lvl <= 2 ? (song.hands.R ? 'R' : 'L') : null;
    const take = (x) => x.start >= a - 1e-6 && x.start < b - 1e-6 && (!oneHand || x.hand === oneHand);
    for (const x of song.notes) if (take(x)) notes.push({ ...x, id: undefined, start: x.start - a + t, dur: Math.min(x.dur, b - x.start) });
    for (const x of song.rests || []) if (take(x)) rests.push({ ...x, start: x.start - a + t });
    for (const m of ms) measures.push({ number: num++, start: m.start - a + t, len: m.len });
    // About one section in four has a rift in its middle bars.
    if (Math.random() < 0.25 && ms.length >= 4) rifts.push({ fromBeat: ms[1].start - a + t, toBeat: ms[ms.length - 2].start + ms[ms.length - 2].len - a + t, reward: Math.random() < 0.2 ? 1 : 0.5 });
    marks.push({ beat: t, title: song.title, level: lvl, grade: pick.grade });
    bpmMin = Math.min(bpmMin, song.bpm || 90);
    t += b - a;
    done++;
    if (done % 2 === 0) lvl = Math.min(11, lvl + 1);
  }
  if (!marks.length) return null;
  // A steady tempo for the stretch: a little quicker every stretch, never faster than its slowest piece allows.
  const bpm = Math.round(Math.max(60, Math.min(150, bpmMin * Math.min(1.25, 0.85 + cleared * 0.025))));
  const song = finalizeSong({ id: `endless-${Date.now()}`, title: 'Endless', composer: '', bpm, time, keyFifths: 0, notes, rests, measures, sections: [] });
  return { song, rifts, marks, level: lvl, cleared: done };
}

async function startEndless(root) {
  const S = stage(root, 'Endless', 'infinity');
  let stopped = false;
  S.onQuit(() => { stopped = true; toLobby(root); });
  const pool = endlessPool();
  let score = 0;
  let energy = 0.8;
  let level = 1;
  let cleared = 0;
  let curLevel = 1;
  let next = endlessStretch(pool, { level, cleared });
  while (!stopped) {
    const st = await next;
    if (stopped) return;
    if (!st) break;
    // Get the next stretch ready while this one plays, so it starts straight away.
    next = endlessStretch(pool, { level: st.level, cleared: st.cleared });
    let mi = -1;
    const r = await playSection(S.host, {
      song: st.song, hands: st.song.hands.R && st.song.hands.L ? 'both' : st.song.hands.R ? 'R' : 'L', tempo: 1, energy, rifts: st.rifts,
      title: 'Endless', subtitle: `Level ${st.marks[0].level}`,
      onPoints: (p) => { score += p * (1 + (curLevel - 1) * 0.15); S.setScore(score); },
      onBeat: (pl) => {
        // Name the piece you're in, and count the sections you've passed.
        let k = mi;
        while (k + 1 < st.marks.length && pl.beat >= st.marks[k + 1].beat) k++;
        if (k !== mi) {
          if (mi >= 0) cleared++;
          mi = k;
          const m = st.marks[k];
          curLevel = m.level;
          S.setRound(`Level ${m.level} · ${m.title}${m.grade ? ` · Grade ${m.grade}` : ''}`);
        }
      },
    });
    if (r.quit) { if (!stopped) toLobby(root); return; }
    if (stopped) return;
    energy = r.energy;
    cleared = Math.max(cleared, st.cleared);
    level = st.level;
    if (r.result.knockedOut || energy <= 0) break;
  }
  if (stopped) return;
  const b = best('endless', Math.round(score));
  const pay = reward(Math.min(150, cleared * 10), 'Endless run');
  runSummary(S.host, { title: `${cleared} section${cleared === 1 ? '' : 's'} cleared`, lines: [`Score: ${Math.round(score).toLocaleString('en-US')}${b.isNew ? ' (new best!)' : ` (best ${b.best.toLocaleString('en-US')})`}`, `You reached level ${level}.`], rewardTxt: pay ? `+${pay} ${SYMBOL}` : null, again: () => startEndless(root) });
}

// ---- Boss Rush ----------------------------------------------------------------------
function defeatedGuardians() {
  return allLessons().filter((l) => l.boss && progress.lesson(l.id));
}
async function startRush(root) {
  const S = stage(root, 'Boss Rush', 'swords');
  let stopped = false;
  S.onQuit(() => { stopped = true; toLobby(root); });
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
    if (r.quit) { if (!stopped) toLobby(root); return; }
    if (stopped) return;
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
const RA = (o) => ({ ...DEFAULT_AVATAR, ...o });
const RIVALS = [
  { id: 'rookie', name: 'Rookie Rex', odds: [0.25, 0.3, 0.25, 0.2], look: RA({ skin: 'skin-peach', hair: 'hair-curly', hairColor: '#B45309', clothes: 'clothes-tee', clothesColor: '#2563EB', expr: 'expr-grin', bg: '#1E3A8A' }) },
  { id: 'pro', name: 'Pro Penny', odds: [0.45, 0.3, 0.15, 0.1], look: RA({ skin: 'skin-cocoa', hair: 'hair-highpuff', hairColor: '#1B1210', eyes: 'eyes-lashes', clothes: 'clothes-hoodie', clothesColor: '#DB2777', expr: 'expr-smirk', bg: '#831843' }) },
  { id: 'virtuoso', name: 'Virtuoso Vee', odds: [0.65, 0.22, 0.09, 0.04], look: RA({ skin: 'skin-honey', hair: 'hair-bun', hairColor: '#2B1A12', glasses: 'glasses-round', clothes: 'clothes-collar', clothesColor: '#059669', expr: 'expr-calm', bg: '#14532D' }) },
  { id: 'maestro', name: 'The Maestro', odds: [0.82, 0.13, 0.04, 0.01], look: RA({ skin: 'skin-ebony', hair: 'hair-caesar', facial: 'facial-goatee', clothes: 'clothes-tux', expr: 'expr-determined', hat: 'hat-none', bg: '#1E1B4B' }) },
  { id: 'nova', name: 'Nova', odds: [0.9, 0.08, 0.01, 0.01], look: RA({ skin: 'skin-starhead', eyes: 'eyes-star', hair: 'hair-none', clothes: 'clothes-robe', clothesColor: '#7C3AED', expr: 'expr-smile', bg: '#0F0A2E' }) },
  { id: 'perfecta', name: 'Perfecta', odds: [1, 0, 0, 0], look: RA({ skin: 'skin-robot', eyes: 'eyes-visor', ears: 'ears-robot', hair: 'hair-none', clothes: 'clothes-armor', expr: 'expr-calm', bg: '#111827' }) },
];
const rivalArt = (r, size = 64) => avatarSVG(r.look, { size, uid: `rv-${r.id}-${size}` });
const pct = (x) => (x > 0 && x < 0.01 ? '<1' : String(Math.round(x * 100)));

/** Songs you can battle on: anything unlocked on the Learn path, bought in the Shop, or imported. */
async function battleSongs() {
  const imports = (await library.all()).map((r) => ({ ...r.song, id: r.id, title: r.title || (r.song && r.song.title), imported: true }));
  const list = [
    ...builtinSongs().filter((x) => !x.id.startsWith('boss-') && songUnlocked(x.id)),
    ...catalogPieces().filter((p) => songUnlocked(p.id)),
    ...imports,
  ];
  // Brand-new players haven't unlocked anything yet: give them the first songs to try.
  return list.length ? list : builtinSongs().filter((x) => !x.id.startsWith('boss-') && (x.level || 1) <= 1);
}

async function battleSetup(root) {
  root.replaceChildren();
  const [songs, snips] = await Promise.all([battleSongs(), loadSnippets()]);
  const exOf = (x) => snips[x.id] !== undefined ? snips[x.id] : (Array.isArray(x.notes) ? (() => { try { return excerpt(x); } catch { return null; } })() : null);
  let rival = RIVALS[0];
  let pick = songs[0] || null;
  const page = h('div', { class: 'page arcade battle-setup' });
  root.append(page);
  const rivalsEl = h('div', { class: 'arc-rivals' });
  const bar = (label, v, cls) => h('div', { class: `rv-bar ${cls}` }, [h('span', {}, label), h('i', {}, h('b', { style: { width: `${Math.max(2, v * 100)}%` } })), h('em', {}, `${pct(v)}%`)]);
  const drawRivals = () => rivalsEl.replaceChildren(...RIVALS.map((r) => h('button', { class: `arc-rival ${r === rival ? 'on' : ''}`, onclick: () => { rival = r; drawRivals(); } }, [
    h('span', { class: 'rv-face', html: rivalArt(r) }),
    h('b', {}, r.name),
    h('div', { class: 'rv-bars' }, [bar('Perfect', r.odds[0], 'p'), bar('Off-beat', r.odds[2], 'o'), bar('Miss', r.odds[3], 'm')]),
  ])));
  drawRivals();

  // Song picker: a dropdown that opens into song cards like the Songs tab.
  const songCard = (x, selected) => h('button', { class: `pick-song ${selected ? 'on' : ''}`, onclick: () => { pick = x; drawPicker(false); } }, [
    h('span', { class: 'ps-cover', html: snippetSVG(exOf(x), x.id) }),
    h('span', { class: 'ps-meta' }, [h('b', {}, x.title), h('small', {}, [x.composer || (x.imported ? 'My music' : 'Traditional'), x.grade ? ` · Grade ${x.grade}` : ''])]),
  ]);
  let q = '';
  const picker = h('div', { class: 'song-picker' });
  const drawPicker = (open) => {
    picker.classList.toggle('open', open);
    const head = h('button', { class: 'sp-head', onclick: () => drawPicker(!picker.classList.contains('open')), 'aria-expanded': String(open) }, [
      pick ? songCard(pick, true) : h('span', { class: 'muted' }, 'No songs yet'),
      h('span', { class: 'sp-chev' }, icon('chevron')),
    ]);
    const items = songs.filter((x) => !q || `${x.title} ${x.composer || ''}`.toLowerCase().includes(q));
    const search = h('label', { class: 'search sp-search' }, [icon('search'), h('input', { type: 'search', placeholder: `Search ${songs.length} songs`, value: q, oninput: (e) => { q = e.target.value.toLowerCase(); drawList(); } })]);
    const list = h('div', { class: 'sp-list' });
    const drawList = () => list.replaceChildren(...songs.filter((x) => !q || `${x.title} ${x.composer || ''}`.toLowerCase().includes(q)).map((x) => songCard(x, x === pick)));
    drawList();
    picker.replaceChildren(head, ...(open ? [search, list] : []));
    if (open) setTimeout(() => search.querySelector('input').focus({ preventScroll: true }), 50);
  };
  drawPicker(false);

  page.append(
    h('button', { class: 'back-link arc-back', onclick: () => toLobby(root) }, [icon('back'), 'Arcade']),
    h('header', { class: 'top' }, [h('div', {}, [h('div', { class: 'eyebrow' }, 'Battle'), h('h1', { class: 'arc-h1' }, [h('span', { html: glyph('guitar') }), 'Pick your rival'])])]),
    rivalsEl,
    h('h2', { class: 'arc-sub' }, 'Pick a song'),
    picker,
    h('div', { class: 'row arc-go' }, [h('button', { class: 'btn primary big', onclick: () => (pick ? startBattle(root, pick.id, rival) : toast('Unlock a song first.', 'bad')) }, [h('span', { html: glyph('guitar') }), 'Battle!'])]),
  );
}

async function startBattle(root, songId, rival) {
  const S = stage(root, `Battle vs ${rival.name}`, 'guitar');
  let stopped = false;
  S.onQuit(() => { stopped = true; toLobby(root); });
  const song = songId ? await getSong(songId).catch(() => null) : null;
  if (!song) { toast('Couldn’t load that song.', 'bad'); return; }
  const vs = h('div', { class: 'arc-vs' }, [h('div', { class: 'arc-side you' }, [h('b', {}, 'You'), h('span', { class: 'v' }, '0')]), h('div', { class: 'arc-meter' }, h('i')), h('div', { class: 'arc-side rival' }, [h('span', { class: 'rv-face sm', html: rivalArt(rival, 40) }), h('b', {}, rival.name), h('span', { class: 'v' }, '0'), h('small', { class: 'rv-last' }, '')])]);
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
  await breakCard(S.host, [`${song.title}`, `${rival.name} is ready. The higher score wins.`]);
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
  if (r.quit) { if (!stopped) toLobby(root); return; }
  if (stopped) return;
  const won = you > them && !r.result.knockedOut;
  if (won) { best('battleWins', bestOf('battleWins') + 1); }
  const pay = won ? reward(40 + RIVALS.indexOf(rival) * 30, `Beat ${rival.name}`) : 0;
  const tie = you === them && !r.result.knockedOut;
  runSummary(S.host, { title: won ? `You beat ${rival.name}!` : r.result.knockedOut ? 'Your energy ran out' : tie ? `A perfect tie with ${rival.name}!` : `${rival.name} wins this one`, lines: [`You ${you.toLocaleString('en-US')} — ${them.toLocaleString('en-US')} ${rival.name}`], rewardTxt: pay ? `+${pay} ${SYMBOL}` : null, again: () => startBattle(root, songId, rival) });
}

// ---- Mini games -------------------------------------------------------------------
const MINIS = [
  { id: 'noterush', name: 'Note Rush', art: 'score', blurb: 'A note appears on the staff: play it! As many as you can in 60 seconds.', secs: 60 },
  { id: 'keyfinder', name: 'Key Finder', art: 'magnifier', blurb: 'Find the named key (any octave), fast. 45 seconds.', secs: 45 },
  { id: 'echo', name: 'Echo', art: 'repeat', blurb: 'Listen to the tune, then play it back. It grows every round.', secs: 0 },
  { id: 'chords', name: 'Chord Catch', art: 'piano', blurb: 'Play the named chord (all three notes together). 60 seconds.', secs: 60 },
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
  const S = stage(root, m.name, m.art);
  const prompt = h('div', { class: 'arc-prompt' });
  const timer = h('div', { class: 'arc-timer' });
  const kbEl = h('div', { class: 'arc-kb' });
  S.host.append(h('div', { class: 'arc-mini' }, [timer, prompt]), kbEl);
  const kb = new Keyboard(kbEl, { lo: 48, hi: 84, labels: 'c', onKey: (midi, down) => input.touch(midi, down) });
  await input.activate();
  holdBg('listen');
  let score = 0;
  let over = false;
  let target = null;
  const held = new Set();
  const finish = () => {
    if (over) return;
    over = true;
    off();
    releaseBg('listen');
    kb.destroy();
    const b = best(`mini-${m.id}`, score);
    const pay = reward(Math.min(60, score * 2), m.name);
    track('notes', score);
    runSummary(S.host, { title: `${score} point${score === 1 ? '' : 's'}`, lines: [b.isNew ? 'New best!' : `Best: ${b.best}`], rewardTxt: pay ? `+${pay} ${SYMBOL}` : null, again: () => startMini(root, m) });
  };
  S.onQuit(() => { over = true; off(); kb.destroy(); toLobby(root); });
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
