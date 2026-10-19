// Background music: your unlocked songs played softly in the menus, with a
// playlist and shuffle. Pauses automatically while you're practising.

import { audio } from './engine.js';
import { settings } from '../store.js';
import { getSong } from '../data/catalog.js';
import { mic } from '../input/mic.js';
import { startAmbient, stopAmbient } from './ambient.js';
import { item } from '../data/shop.js';

const AMB_LEN = 180; // an ambience plays for 3 minutes before the playlist moves on

const listeners = new Set();
export const onBg = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = () => listeners.forEach((f) => f(state()));

let cur = null; // { id, title, song, t0, idx, timer, scheduled }
let paused = true;
const holds = new Set(); // what's pausing the music for now: 'player', 'listen', 'sound'…
const isHeld = () => holds.size > 0;
export const holdReasons = () => [...holds]; // for checks
let queue = [];

export const playlist = () => settings.get('bgPlaylist') || [];
export const setPlaylist = (ids) => { settings.set('bgPlaylist', [...new Set(ids)]); queue = []; emit(); };
export const shuffleOn = () => settings.get('bgShuffle') !== false;
export const setShuffle = (v) => { settings.set('bgShuffle', v); queue = []; emit(); };
export const state = () => ({ playing: !paused && !isHeld() && !!cur, held: !paused && isHeld() && !!cur, amb: !!(cur && cur.amb), title: cur ? cur.title : null, hasList: playlist().length > 0, shuffle: shuffleOn() });
/** Stop the Learn-tab ambience, unless an ambience is playing as background music. */
export function stopTabAmbient() {
  if (!(state().playing && state().amb)) stopAmbient();
}

function nextId() {
  const list = playlist();
  if (!list.length) return null;
  if (!queue.length) {
    queue = [...list];
    if (shuffleOn()) for (let i = queue.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [queue[i], queue[j]] = [queue[j], queue[i]]; }
    if (cur && queue.length > 1 && queue[0] === cur.id) queue.push(queue.shift());
  }
  return queue.shift();
}

async function startSong(id) {
  stopScheduling();
  if (id.startsWith('amb-')) { // an ambience from the Shop, as a playlist track
    const it = item(id);
    if (!it) { setPlaylist(playlist().filter((x) => x !== id)); return skip(); }
    audio.ensure();
    cur = { id, title: it.name, amb: true, t0: audio.now, end: audio.now + AMB_LEN, pausedAt: null };
    startAmbient(id, true);
    cur.timer = setInterval(() => { if (audio.now > cur.end) skip(); }, 1000);
    emit();
    return;
  }
  let song = null;
  try { song = await getSong(id); } catch { song = null; }
  if (!song) { setPlaylist(playlist().filter((x) => x !== id)); return skip(); }
  audio.ensure();
  const spq = 60 / (song.bpm || 90);
  cur = { id, title: song.title, song, spq, t0: audio.now + 0.6, idx: 0, notes: [...song.notes].sort((a, b) => a.start - b.start), pausedAt: null };
  cur.end = cur.t0 + (song.length || 0) * spq + 2.5;
  stopAmbient();
  cur.timer = setInterval(tick, 200);
  tick();
  emit();
}

function tick() {
  if (!cur) return;
  const now = audio.now;
  // Let the microphone ignore the app's own music.
  mic.mute(0.6);
  const horizon = now + 1.2;
  const vol = settings.get('bgVolume') ?? 0.3;
  while (cur.idx < cur.notes.length) {
    const n = cur.notes[cur.idx];
    const t = cur.t0 + n.start * cur.spq;
    if (t > horizon) break;
    cur.idx++;
    if (t < now - 0.05) continue;
    audio.schedule(n.midi, t, Math.max(0.2, n.dur * cur.spq * 0.95), 0.25 + 0.5 * vol, n.hand);
  }
  if (now > cur.end) skip();
}

function stopScheduling() {
  if (cur) { clearInterval(cur.timer); if (cur.amb) stopAmbient(); }
  audio.stopAll();
}

/** Stop where we are, remembering the position. */
function suspend() {
  if (!cur || !cur.timer) return;
  cur.pausedAt = Math.max(0, audio.now - cur.t0);
  clearInterval(cur.timer);
  cur.timer = 0;
  if (cur.amb) stopAmbient(); else audio.stopAll();
}

/** Carry on from the remembered position (not from the start, and not the next song). */
function resume() {
  const pos = cur.pausedAt || 0;
  cur.pausedAt = null;
  if (cur.amb) {
    const left = Math.max(10, cur.end - cur.t0 - pos);
    cur.t0 = audio.now - pos;
    cur.end = audio.now + left;
    startAmbient(cur.id, true);
    cur.timer = setInterval(() => { if (audio.now > cur.end) skip(); }, 1000);
    return;
  }
  cur.t0 = audio.now + 0.4 - pos;
  cur.idx = cur.notes.findIndex((n) => n.start * cur.spq >= pos);
  if (cur.idx < 0) cur.idx = cur.notes.length;
  cur.end = cur.t0 + (cur.song.length || 0) * cur.spq + 2.5;
  cur.timer = setInterval(tick, 200);
}

export function play() {
  paused = false;
  if (isHeld()) return emit();
  if (cur && cur.pausedAt != null) resume();
  else if (!cur || audio.now > cur.end) { const id = nextId(); if (id) startSong(id); }
  emit();
}

export function pause() {
  paused = true;
  suspend();
  emit();
}

export function skip() {
  const id = nextId();
  if (id) startSong(id); else { stopScheduling(); cur = null; emit(); }
}

export const toggle = () => (state().playing ? pause() : play());

/**
 * Pause the music while something else needs the sound: practising (the player),
 * listening for your notes (mic test, Knowledge Check, mini games) or another app
 * sound (Listen, chord demos, previews). It carries on when the last one is done.
 */
export function hold(reason = 'player') {
  const was = isHeld();
  holds.add(reason);
  if (!was) { suspend(); emit(); }
}
export function release(reason = 'player') {
  if (!holds.delete(reason) || isHeld()) return;
  if (!paused) play();
  else emit();
}
// Other app sounds (anything played straight through the engine) pause the music
// for a moment; it resumes a few seconds after they stop.
let soundT = 0;
audio.onPlay(() => {
  if (paused || !cur) return;
  hold('sound');
  clearTimeout(soundT);
  soundT = setTimeout(() => release('sound'), 3500);
});
