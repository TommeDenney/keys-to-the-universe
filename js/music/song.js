// Canonical song model + the compact text notation used for built-in songs.
//
// Song = {
//   id, title, composer, level, tags, bpm, time:[num, den], keyFifths,
//   notes:  [{ id, midi, step, alter, octave, start, dur, hand:'R'|'L', finger? }]   (start/dur in quarter notes)
//   rests:  [{ start, dur, hand }],
//   measures: [{ number, start, len }],
//   sections: [{ label, from, to }]   (measure indexes into `measures`, inclusive)
// }
//
// Notation tokens (whitespace separated, "|" = barline, checked for length):
//   C4  F#4  Bb3        a pitch (quarter note by default)
//   E4/2  E4/8  E4/4.   duration: /1 whole, /2 half, /4 quarter, /8, /16, trailing "." = dotted
//   E4@3                finger number
//   (C4 E4 G4)/2        chord (fingers allowed inside: (C3@5 E3@3 G3@1))
//   r/2                 rest
//   E4/4~ E4/4          tie (merged into one longer note)

import { parsePitch } from './theory.js';

const EPS = 1e-6;

function parseDur(s) {
  if (!s) return 1;
  const m = /^\/(\d+)(\.?)$/.exec(s);
  if (!m) throw new Error(`Bad duration "${s}"`);
  let d = 4 / parseInt(m[1], 10);
  if (m[2]) d *= 1.5;
  return d;
}

function tokenize(str) {
  const out = [];
  const re = /\|+|\([^)]*\)[^\s|]*|[^\s|]+/g;
  let m;
  while ((m = re.exec(str))) out.push(m[0]);
  return out;
}

/** Parse one hand's notation → { notes, rests, bars:[lengths] } */
export function parseNotation(str, hand) {
  const notes = [];
  const rests = [];
  const bars = [];
  let t = 0;
  let barStart = 0;
  const pendingTies = new Map(); // midi → note
  for (const tok of tokenize(str || '')) {
    if (tok.startsWith('|')) {
      bars.push(t - barStart);
      barStart = t;
      continue;
    }
    let body = tok;
    let tie = false;
    if (body.endsWith('~')) { tie = true; body = body.slice(0, -1); }
    let pitches;
    let durStr = '';
    if (body.startsWith('(')) {
      const close = body.indexOf(')');
      pitches = body.slice(1, close).trim().split(/\s+/);
      durStr = body.slice(close + 1);
    } else {
      const slash = body.indexOf('/');
      const at = body.indexOf('@');
      const cut = slash >= 0 ? slash : body.length;
      pitches = [body.slice(0, cut)];
      durStr = body.slice(cut);
      if (at > cut) { // finger written after the duration: E4/2@3
        pitches = [body.slice(0, cut) + body.slice(at)];
        durStr = body.slice(cut, at);
      }
    }
    const dur = parseDur(durStr);
    if (pitches[0] === 'r') {
      rests.push({ start: t, dur, hand });
    } else {
      for (const p of pitches) {
        const [pitchStr, fingerStr] = p.split('@');
        const sp = parsePitch(pitchStr);
        const tied = pendingTies.get(sp.midi);
        if (tied && Math.abs(tied.start + tied.dur - t) < EPS) {
          tied.dur += dur;
          if (!tie) pendingTies.delete(sp.midi);
          continue;
        }
        const n = { ...sp, start: t, dur, hand };
        if (fingerStr) n.finger = parseInt(fingerStr, 10);
        notes.push(n);
        if (tie) pendingTies.set(sp.midi, n);
      }
    }
    t += dur;
  }
  if (t - barStart > EPS) bars.push(t - barStart);
  return { notes, rests, bars, length: t };
}

/** Measures for a constant time signature with optional pickup. */
export function buildMeasures(totalLen, measureLen, pickup = 0) {
  const measures = [];
  let start = 0;
  let number = pickup > EPS ? 0 : 1;
  if (pickup > EPS) {
    measures.push({ number: 0, start: 0, len: pickup });
    start = pickup;
    number = 1;
  }
  while (start < totalLen - EPS) {
    measures.push({ number, start, len: measureLen });
    start += measureLen;
    number++;
  }
  return measures;
}

export function measureLength([num, den]) {
  return (num * 4) / den;
}

/** Auto-split measures into practice sections (phrases of ~4 bars). */
export function autoSections(measures) {
  const n = measures.length;
  if (n === 0) return [];
  const hasPickup = measures[0].number === 0;
  const full = hasPickup ? n - 1 : n;
  let size = 4;
  if (full <= 4) size = full;
  else if (full > 32) size = 8;
  const secs = [];
  let i = 0;
  while (i < n) {
    let to = Math.min(n - 1, i + size - 1 + (i === 0 && hasPickup ? 1 : 0));
    // avoid a tiny trailing section: merge if fewer than 2 bars remain
    if (n - 1 - to > 0 && n - 1 - to < 2) to = n - 1;
    secs.push({ from: i, to });
    i = to + 1;
  }
  return secs.map((s, k) => ({ ...s, label: `Part ${k + 1}` }));
}

let uid = 0;

/** Finalize any song object (built-in or imported). */
export function finalizeSong(song) {
  song.notes.sort((a, b) => a.start - b.start || a.midi - b.midi);
  song.notes.forEach((n) => (n.id = ++uid));
  song.rests = song.rests || [];
  if (!song.sections || !song.sections.length) song.sections = autoSections(song.measures);
  song.hands = {
    R: song.notes.some((n) => n.hand === 'R'),
    L: song.notes.some((n) => n.hand === 'L'),
  };
  const end = song.notes.reduce((m, n) => Math.max(m, n.start + n.dur), 0);
  song.length = Math.max(end, ...song.measures.map((m) => m.start + m.len));
  song.minMidi = Math.min(...song.notes.map((n) => n.midi));
  song.maxMidi = Math.max(...song.notes.map((n) => n.midi));
  return song;
}

/** Build a song from the compact notation definition. Validates bar lengths. */
export function songFromDef(def) {
  const time = def.time || [4, 4];
  const mLen = measureLength(time);
  const pickup = def.pickup || 0;
  const rh = parseNotation(def.rh, 'R');
  const lh = parseNotation(def.lh, 'L');
  const errors = [];
  for (const [name, part] of [['rh', rh], ['lh', lh]]) {
    if (!def[name]) continue;
    part.bars.forEach((len, i) => {
      const expected = i === 0 && pickup ? pickup : mLen;
      const isLast = i === part.bars.length - 1;
      if (Math.abs(len - expected) > EPS && !(isLast && len < expected)) {
        errors.push(`${def.id} ${name} bar ${i + (pickup ? 0 : 1)}: ${len} beats (expected ${expected})`);
      }
    });
  }
  const total = Math.max(rh.length, lh.length);
  const measures = buildMeasures(total, mLen, pickup);
  const song = {
    id: def.id,
    title: def.title,
    composer: def.composer || 'Traditional',
    level: def.level || 1,
    tags: def.tags || [],
    about: def.about || '',
    instrument: def.instrument || null,
    bpm: def.bpm || 90,
    time,
    keyFifths: def.key || 0,
    notes: [...rh.notes, ...lh.notes],
    rests: [...rh.rests, ...lh.rests],
    measures,
    sections: (def.sections || []).map(([from, to, label], k) => ({
      from: measures.findIndex((m) => m.number === from),
      to: measures.findIndex((m) => m.number === to),
      label: label || `Part ${k + 1}`,
    })),
    source: 'builtin',
  };
  song.errors = errors;
  return finalizeSong(song);
}

/** Slice of a song for practice: measure range + hands. Times re-based to 0. */
export function sliceSong(song, fromIdx = 0, toIdx = song.measures.length - 1) {
  const m0 = song.measures[fromIdx];
  const m1 = song.measures[toIdx];
  const t0 = m0.start;
  const t1 = m1.start + m1.len;
  const inRange = (x) => x.start >= t0 - EPS && x.start < t1 - EPS;
  return {
    ...song,
    notes: song.notes.filter(inRange).map((n) => ({ ...n, start: n.start - t0, dur: Math.min(n.dur, t1 - n.start) })),
    rests: song.rests.filter(inRange).map((r) => ({ ...r, start: r.start - t0 })),
    measures: song.measures.slice(fromIdx, toIdx + 1).map((m) => ({ ...m, start: m.start - t0 })),
    length: t1 - t0,
    offset: t0,
  };
}

/** Group the notes a player must play into chronological events. */
export function buildEvents(notes) {
  const events = [];
  for (const n of notes) {
    const last = events[events.length - 1];
    if (last && Math.abs(last.start - n.start) < 1e-3) last.notes.push(n);
    else events.push({ start: n.start, notes: [n] });
  }
  return events;
}

/** The ordered practice plan for a song (Simply-style breakdown). */
export function practicePlan(song) {
  const steps = [];
  const both = song.hands.R && song.hands.L;
  const multi = song.sections.length > 1;
  song.sections.forEach((sec, i) => {
    const label = multi ? sec.label : 'Whole song';
    const range = [sec.from, sec.to];
    if (song.hands.R) steps.push({ key: `s${i}-R`, section: i, label, hands: 'R', mode: 'wait', range });
    if (song.hands.L) steps.push({ key: `s${i}-L`, section: i, label, hands: 'L', mode: 'wait', range });
    if (both) steps.push({ key: `s${i}-B`, section: i, label, hands: 'both', mode: 'wait', range });
  });
  const all = [0, song.measures.length - 1];
  const hands = both ? 'both' : song.hands.R ? 'R' : 'L';
  if (multi) steps.push({ key: 'full-wait', section: -1, label: 'Full song', hands, mode: 'wait', range: all });
  steps.push({ key: 'full-slow', section: -1, label: 'Full song', hands, mode: 'timed', tempo: 0.75, range: all });
  steps.push({ key: 'full-timed', section: -1, label: 'Full song', hands, mode: 'timed', tempo: 1, range: all });
  return steps;
}

export function handsLabel(h) {
  return h === 'R' ? 'Right hand' : h === 'L' ? 'Left hand' : 'Both hands';
}
