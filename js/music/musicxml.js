// MusicXML (score-partwise) → Song.
// Handles: multiple staves/voices (backup/forward), chords, ties, rests,
// key/time signatures, tempo marks, fingering, pickup measures, grace notes
// (skipped). Repeats are played as written (once).

import { midiFromSpelling } from './theory.js';
import { finalizeSong } from './song.js';

const EPS = 1e-6;

const $ = (el, sel) => el && el.querySelector(sel);
const txt = (el, sel) => {
  const e = $(el, sel);
  return e ? e.textContent.trim() : null;
};
const kids = (el, name) => [...el.children].filter((c) => c.tagName === name);

export function parseMusicXML(xmlText, fileName = '') {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('This file isn’t valid MusicXML.');
  const root = doc.documentElement;
  if (root.tagName === 'score-timewise') throw new Error('Timewise MusicXML isn’t supported. Re-export as standard (partwise) MusicXML.');
  if (root.tagName !== 'score-partwise') throw new Error('Not a MusicXML score.');

  const title = txt(root, 'work > work-title') || txt(root, 'movement-title') || fileName.replace(/\.[^.]+$/, '') || 'Imported score';
  const composerEl = [...root.querySelectorAll('identification > creator')].find((c) => (c.getAttribute('type') || '') === 'composer');
  const composer = composerEl ? composerEl.textContent.trim() : '';

  // Part names (to prefer a piano part).
  const partNames = {};
  root.querySelectorAll('part-list > score-part').forEach((sp) => {
    partNames[sp.getAttribute('id')] = (txt(sp, 'part-name') || '').toLowerCase();
  });
  const parts = kids(root, 'part').map((p) => parsePart(p));
  if (!parts.length) throw new Error('No parts found in this score.');

  // Choose which part(s) become right/left hand.
  let chosen;
  const twoStaff = parts.find((p) => p.staves >= 2 && p.notes.length);
  const withNotes = parts.filter((p) => p.notes.length);
  if (twoStaff) {
    chosen = [{ part: twoStaff, map: (n) => (n.staff >= 2 ? 'L' : 'R') }];
  } else if (withNotes.length >= 2) {
    const piano = withNotes.filter((p) => /piano|keyboard|pno/.test(partNames[p.id] || ''));
    const pair = piano.length >= 2 ? piano.slice(0, 2) : withNotes.slice(0, 2);
    const [a, b] = pair.sort((x, y) => avgPitch(y) - avgPitch(x));
    chosen = [{ part: a, map: () => 'R' }, { part: b, map: () => 'L' }];
  } else if (withNotes.length === 1) {
    const p = withNotes[0];
    const bass = p.firstClef === 'F';
    chosen = [{ part: p, map: () => (bass ? 'L' : 'R') }];
  } else {
    throw new Error('This score doesn’t contain any notes.');
  }

  const notes = [];
  const rests = [];
  for (const { part, map } of chosen) {
    for (const n of part.notes) notes.push({ ...n, hand: map(n) });
    for (const r of part.rests) rests.push({ ...r, hand: map(r) });
  }
  const ref = chosen[0].part;
  const song = {
    id: 'import',
    title,
    composer,
    level: 0,
    tags: [],
    bpm: ref.tempo || 90,
    time: ref.time,
    keyFifths: ref.fifths,
    notes,
    rests: dedupeRests(rests),
    measures: ref.measures,
    sections: [],
    source: 'import',
  };
  return finalizeSong(song);
}

function avgPitch(p) {
  return p.notes.reduce((a, n) => a + n.midi, 0) / Math.max(1, p.notes.length);
}

function dedupeRests(rests) {
  // Keep one rest per hand/time (multiple voices often produce duplicates).
  const seen = new Set();
  return rests.filter((r) => {
    const k = `${r.hand}:${r.start.toFixed(3)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function parsePart(partEl) {
  let divisions = 1;
  let fifths = null;
  let time = null;
  let tempo = null;
  let staves = 1;
  let firstClef = null;
  const notes = [];
  const rests = [];
  const measures = [];
  const tieOpen = new Map(); // `${staff}:${midi}` → note
  let mStart = 0;

  kids(partEl, 'measure').forEach((mEl, idx) => {
    let pos = mStart;
    let maxPos = mStart;
    let lastStart = mStart;
    const implicit = mEl.getAttribute('implicit') === 'yes';
    for (const el of mEl.children) {
      switch (el.tagName) {
        case 'attributes': {
          const d = txt(el, 'divisions');
          if (d) divisions = parseFloat(d);
          const f = txt(el, 'key > fifths');
          if (f != null && fifths === null) fifths = parseInt(f, 10);
          const beats = txt(el, 'time > beats');
          const bt = txt(el, 'time > beat-type');
          if (beats && bt && !time) time = [parseInt(beats, 10) || 4, parseInt(bt, 10) || 4];
          const st = txt(el, 'staves');
          if (st) staves = parseInt(st, 10);
          const clef = txt(el, 'clef > sign');
          if (clef && !firstClef) firstClef = clef;
          break;
        }
        case 'direction':
        case 'sound': {
          const snd = el.tagName === 'sound' ? el : $(el, 'sound');
          if (snd && snd.getAttribute('tempo') && !tempo) tempo = parseFloat(snd.getAttribute('tempo'));
          if (!tempo) {
            const pm = txt(el, 'metronome > per-minute');
            const bu = txt(el, 'metronome > beat-unit');
            if (pm) tempo = parseFloat(pm) * (bu === 'half' ? 2 : bu === 'eighth' ? 0.5 : 1) * ($(el, 'metronome > beat-unit-dot') ? 1.5 : 1);
          }
          break;
        }
        case 'backup':
          pos -= parseFloat(txt(el, 'duration') || '0') / divisions;
          break;
        case 'forward':
          pos += parseFloat(txt(el, 'duration') || '0') / divisions;
          maxPos = Math.max(maxPos, pos);
          break;
        case 'note': {
          if ($(el, 'grace') || $(el, 'cue')) break;
          const dur = parseFloat(txt(el, 'duration') || '0') / divisions;
          const isChord = !!kids(el, 'chord').length;
          const start = isChord ? lastStart : pos;
          const staff = parseInt(txt(el, 'staff') || '1', 10);
          if ($(el, 'rest')) {
            rests.push({ start, dur, staff });
          } else {
            const step = txt(el, 'pitch > step');
            const alter = Math.round(parseFloat(txt(el, 'pitch > alter') || '0'));
            const octave = parseInt(txt(el, 'pitch > octave') || '4', 10);
            if (step) {
              const midi = midiFromSpelling(step, alter, octave);
              const ties = [...el.querySelectorAll('tie')].map((t) => t.getAttribute('type'));
              const key = `${staff}:${midi}`;
              const open = tieOpen.get(key);
              if (ties.includes('stop') && open && Math.abs(open.start + open.dur - start) < 0.01) {
                open.dur += dur;
                if (!ties.includes('start')) tieOpen.delete(key);
              } else {
                const n = { midi, step, alter, octave, start, dur, staff };
                const fing = txt(el, 'notations > technical > fingering');
                if (fing && /^[1-5]/.test(fing)) n.finger = parseInt(fing, 10);
                notes.push(n);
                if (ties.includes('start')) tieOpen.set(key, n);
              }
            }
          }
          if (!isChord) {
            lastStart = pos;
            pos += dur;
            maxPos = Math.max(maxPos, pos);
          }
          break;
        }
        default:
      }
    }
    const t = time || [4, 4];
    const nominal = (t[0] * 4) / t[1];
    let len = maxPos - mStart;
    if (len < EPS) len = nominal; // empty measure
    // A short first measure is a pickup; otherwise trust the nominal length.
    if (!(idx === 0 && len < nominal - EPS) && !implicit) len = Math.max(len, nominal);
    const number = idx === 0 && len < nominal - EPS ? 0 : measures.length + (measures[0] && measures[0].number === 0 ? 0 : 1);
    measures.push({ number, start: mStart, len });
    mStart += len;
  });

  return {
    id: partEl.getAttribute('id'),
    notes,
    rests,
    measures,
    staves,
    firstClef,
    fifths: fifths || 0,
    time: time || [4, 4],
    tempo,
  };
}
