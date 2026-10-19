// Persistence: settings + progress in localStorage, imported scores in IndexedDB.

const LS_KEY = 'ivory.v1';

const DEFAULT_SETTINGS = {
  input: 'auto', // auto | mic | touch
  micSensitivity: 0.5,
  micLatency: 40,
  micPitchOffset: 0, // semitones, measured by calibration
  micGhosts: [], // phantom-note intervals learned by calibration
  theme: 'lavender', // page background colour (see theme.js)
  tabBar: 'bottom', // bottom | top | left | right
  learnLayout: 'universe', // universe | classic // ms subtracted from mic onset times (timed mode judging)
  midiLatency: 0,
  volume: 0.8, // effects + metronome
  musicVolume: 0.35, // piano sound: Listen, accompaniment, on-screen keys
  musicVolumeSet: false, // asked the user once?
  metronome: true,
  otherHand: true, // play the hand you're not practising during timed play
  noteNames: 'auto', // auto | always | never
  keyHints: true,
  wrongNotes: 'off', // off | subtle | on: feedback when a wrong key is heard
  keyboardSound: 'piano', // what your keyboard is set to: piano | epiano | organ | pad | bass | split
  appSound: 'match', // the app's own playback voice: match | piano | epiano | organ | pad | bass
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

/** Raw state access for modules that keep their own slice (e.g. the Stardust wallet). */
export const getState = () => state;
export const saveState = () => save();

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
  lessonStep(id) {
    return (state.steps && state.steps[id]) || 0;
  },
  setLessonStep(id, i) {
    state.steps ||= {};
    if (i) state.steps[id] = i;
    else delete state.steps[id];
    save();
  },
  /** Returns the previous star count (0 if first completion). */
  completeLesson(id, stars) {
    const prev = state.lessons[id];
    state.lessons[id] = { stars: Math.max(stars, prev ? prev.stars : 0), done: true, at: Date.now() };
    state.justCompleted = { id, at: Date.now() };
    touchStreak();
    changed();
    return prev ? prev.stars : 0;
  },
  /** Forget a galaxy's progress so it can be replayed from scratch (Stardust already paid is remembered). */
  resetLessons(ids) {
    state.paid ||= {};
    for (const id of ids) {
      const rec = state.lessons[id];
      if (rec) state.paid[id] = Math.max(state.paid[id] || 0, rec.stars || 0);
      delete state.lessons[id];
      if (state.skipped) for (const u of Object.keys(state.skipped)) if (id === `boss-${u}`) delete state.skipped[u];
      if (state.steps) delete state.steps[id];
    }
    changed();
  },
  /** Beat a galaxy's Guardian before finishing its worlds: the next galaxy opens (no stars for the skipped worlds). */
  skipGalaxy(unitId) {
    state.skipped ||= {};
    state.skipped[unitId] = Date.now();
    changed();
  },
  skipped(unitId) {
    return !!(state.skipped && state.skipped[unitId]);
  },
  /** Stars you were already paid Stardust for (survives a galaxy reset). */
  paidStars(id) {
    const rec = state.lessons[id];
    return Math.max(rec ? rec.stars || 0 : 0, (state.paid && state.paid[id]) || 0);
  },
  justCompleted() {
    return state.justCompleted || null;
  },
  clearJustCompleted() {
    delete state.justCompleted;
    save();
  },
  songStep(songId, key) {
    return (state.songs[songId] && state.songs[songId][key]) || 0;
  },
  songSteps(songId) {
    return state.songs[songId] || {};
  },
  /** Returns the previous star count for this step. */
  recordSongStep(songId, key, stars) {
    const s = (state.songs[songId] ||= {});
    const prev = s[key] || 0;
    s[key] = Math.max(prev, stars);
    touchStreak();
    changed();
    return prev;
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

// ---- Backup / restore / persistent storage --------------------------------

/** Ask the browser not to evict our data (Safari/Chrome may clear unused site data). */
export async function protectStorage() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return 'unsupported';
    if (await navigator.storage.persisted()) return 'protected';
    return (await navigator.storage.persist()) ? 'protected' : 'not-protected';
  } catch {
    return 'unsupported';
  }
}

export async function storageStatus() {
  try {
    if (!navigator.storage || !navigator.storage.persisted) return 'unsupported';
    return (await navigator.storage.persisted()) ? 'protected' : 'not-protected';
  } catch {
    return 'unsupported';
  }
}

/** Everything worth keeping, as one JSON object (progress, settings, imported music). */
export async function makeBackup() {
  const scores = await library.all();
  const constellations = await constellationsDB.all();
  state.lastBackup = Date.now();
  save();
  return { app: 'ivory', version: 1, createdAt: new Date().toISOString(), state: JSON.parse(JSON.stringify(state)), scores, constellations };
}

export async function restoreBackup(data) {
  if (!data || data.app !== 'ivory' || !data.state) throw new Error('This isn\u2019t an Ivory backup file.');
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, { settings: {}, lessons: {}, songs: {}, streak: { day: null, count: 0 } }, data.state);
  for (const rec of data.scores || []) await library.put(rec);
  for (const rec of data.constellations || []) await constellationsDB.put(rec);
  changed();
}

export const lastBackup = () => state.lastBackup || null;

// ---- IndexedDB for imported scores -------------------------------------

let dbp = null;
function db() {
  if (!dbp) {
    dbp = new Promise((ok, fail) => {
      const req = indexedDB.open('ivory', 2);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains('scores')) d.createObjectStore('scores', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('constellations')) d.createObjectStore('constellations', { keyPath: 'id' });
      };
      req.onsuccess = () => ok(req.result);
      req.onerror = () => fail(req.error);
    });
  }
  return dbp;
}

async function tx(mode, fn, storeName = 'scores') {
  const d = await db();
  return new Promise((ok, fail) => {
    const t = d.transaction(storeName, mode);
    const store = t.objectStore(storeName);
    const r = fn(store);
    t.oncomplete = () => ok(r && r.result);
    t.onerror = () => fail(t.error);
  });
}

/** Personal constellations (private photos imported on this device only). */
export const constellationsDB = {
  async all() {
    try { return (await tx('readonly', (s) => s.getAll(), 'constellations')) || []; } catch { return []; }
  },
  async put(rec) { return tx('readwrite', (s) => s.put(rec), 'constellations'); },
  async remove(id) { return tx('readwrite', (s) => s.delete(id), 'constellations'); },
};

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
