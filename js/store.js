// Persistence: settings + progress in localStorage, imported scores in IndexedDB.

const LS_KEY = 'ivory.v1';

const DEFAULT_SETTINGS = {
  input: 'auto', // auto | mic | touch
  micSensitivity: 0.5,
  micLatency: 40,
  micPitchOffset: 0, // semitones, measured by calibration
  micGhosts: [], // phantom-note intervals learned by calibration
  theme: 'lavender', // page background colour (see theme.js) // ms subtracted from mic onset times (timed mode judging)
  midiLatency: 0,
  volume: 0.8, // effects + metronome
  musicVolume: 0.35, // piano sound: Listen, accompaniment, on-screen keys
  musicVolumeSet: false, // asked the user once?
  metronome: true,
  otherHand: true, // play the hand you're not practising during timed play
  noteNames: 'auto', // auto | always | never
  keyHints: true,
  keyLabels: 'c', // c | all | none
  unlockAll: false,
  pianoNav: true, // navigate menus with piano keys around Middle C
  onboarded: false,
};

function load() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
}

const state = Object.assign({ settings: {}, lessons: {}, songs: {}, streak: { day: null, count: 0 }, practiceDays: [] }, load());

function save() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch { /* private mode / quota */ }
}

const subs = new Set();
export function onChange(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
function changed() {
  save();
  subs.forEach((f) => f());
}

export const settings = {
  get(k) {
    return k in state.settings ? state.settings[k] : DEFAULT_SETTINGS[k];
  },
  set(k, v) {
    state.settings[k] = v;
    changed();
  },
};

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function touchStreak() {
  const t = today();
  if (state.streak.day === t) return;
  const y = new Date(Date.now() - 86400000);
  const yesterday = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
  state.streak.count = state.streak.day === yesterday ? state.streak.count + 1 : 1;
  state.streak.day = t;
}

export const progress = {
  lesson(id) {
    return state.lessons[id] || null;
  },
  completeLesson(id, stars) {
    const prev = state.lessons[id];
    state.lessons[id] = { stars: Math.max(stars, prev ? prev.stars : 0), done: true, at: Date.now() };
    touchStreak();
    changed();
  },
  songStep(songId, key) {
    return (state.songs[songId] && state.songs[songId][key]) || 0;
  },
  songSteps(songId) {
    return state.songs[songId] || {};
  },
  recordSongStep(songId, key, stars) {
    const s = (state.songs[songId] ||= {});
    s[key] = Math.max(s[key] || 0, stars);
    touchStreak();
    changed();
  },
  get streak() {
    const t = today();
    const y = new Date(Date.now() - 86400000);
    const yesterday = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
    return state.streak.day === t || state.streak.day === yesterday ? state.streak.count : 0;
  },
  get totalStars() {
    return Object.values(state.lessons).reduce((a, l) => a + (l.stars || 0), 0);
  },
  reset() {
    state.lessons = {};
    state.songs = {};
    state.streak = { day: null, count: 0 };
    changed();
  },
};

// ---- IndexedDB for imported scores -------------------------------------

let dbp = null;
function db() {
  if (!dbp) {
    dbp = new Promise((ok, fail) => {
      const req = indexedDB.open('ivory', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('scores', { keyPath: 'id' });
      req.onsuccess = () => ok(req.result);
      req.onerror = () => fail(req.error);
    });
  }
  return dbp;
}

async function tx(mode, fn) {
  const d = await db();
  return new Promise((ok, fail) => {
    const t = d.transaction('scores', mode);
    const store = t.objectStore('scores');
    const r = fn(store);
    t.oncomplete = () => ok(r && r.result);
    t.onerror = () => fail(t.error);
  });
}

export const library = {
  async all() {
    try {
      const rows = await tx('readonly', (s) => s.getAll());
      return (rows || []).sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  },
  async get(id) {
    return tx('readonly', (s) => s.get(id));
  },
  async put(rec) {
    return tx('readwrite', (s) => s.put(rec));
  },
  async remove(id) {
    return tx('readwrite', (s) => s.delete(id));
  },
};
