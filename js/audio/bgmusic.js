// Background music: your unlocked songs played softly in the menus, with a
// playlist and shuffle. Pauses automatically while you're practising.

import { audio } from './engine.js';
import { settings } from '../store.js';
import { getSong } from '../data/catalog.js';
import { mic } from '../input/mic.js';
import { stopAmbient } from './ambient.js';

const listeners = new Set();
export const onBg = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = () => listeners.forEach((f) => f(state()));

let cur = null; // { id, title, song, t0, idx, timer, scheduled }
let paused = true;
let held = false; // paused by a lesson/player
let queue = [];

export const playlist = () => settings.get('bgPlaylist') || [];
export const setPlaylist = (ids) => { settings.set('bgPlaylist', [...new Set(ids)]); queue = []; emit(); };
export const shuffleOn = () => settings.get('bgShuffle') !== false;
export const setShuffle = (v) => { settings.set('bgShuffle', v); queue = []; emit(); };
export const state = () => ({ playing: !paused && !held && !!cur, title: cur ? cur.title : null, hasList: playlist().length > 0, shuffle: shuffleOn() });

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
  let song = null;
  try { song = await getSong(id); } catch { song = null; }
  if (!song) { setPlaylist(playlist().filter((x) => x !== id)); return skip(); }
  audio.ensure();
  const spq = 60 / (song.bpm || 90);
  cur = { id, title: song.title, song, spq, t0: audio.now + 0.6, idx: 0, notes: [...song.notes].sort((a, b) => a.start - b.start) };
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
  if (cur) clearInterval(cur.timer);
  audio.stopAll();
}

export function play() {
  paused = false;
  if (held) return emit();
  if (!cur || !cur.timer || audio.now > cur.end) { const id = nextId(); if (id) startSong(id); }
  else { // resume from where we were
    const pos = cur.pausedAt != null ? cur.pausedAt : 0;
    cur.t0 = audio.now + 0.4 - pos;
    cur.idx = cur.notes.findIndex((n) => n.start * cur.spq >= pos);
    if (cur.idx < 0) cur.idx = cur.notes.length;
    cur.end = cur.t0 + (cur.song.length || 0) * cur.spq + 2.5;
    cur.timer = setInterval(tick, 200);
  }
  emit();
}

export function pause() {
  paused = true;
  if (cur) { cur.pausedAt = Math.max(0, audio.now - cur.t0); clearInterval(cur.timer); cur.timer = 0; audio.stopAll(); }
  emit();
}

export function skip() {
  const id = nextId();
  if (id) startSong(id); else { stopScheduling(); cur = null; emit(); }
}

export const toggle = () => (state().playing ? pause() : play());

/** Lessons/players call these so practice is never drowned out. */
export function hold() {
  if (held) return;
  held = true;
  if (cur && cur.timer) { cur.pausedAt = Math.max(0, audio.now - cur.t0); clearInterval(cur.timer); cur.timer = 0; audio.stopAll(); }
  emit();
}
export function release() {
  if (!held) return;
  held = false;
  if (!paused) play();
  else emit();
}
