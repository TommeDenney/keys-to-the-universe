// Song catalogue: built-in songs (instant), graded repertoire from the Mutopia
// Project (MIDI files fetched + parsed on first use, then cached) and the
// user's imports. Also extends the course with one galaxy per grade.

import { builtinSong, builtinSongs } from './songs.js';
import { COURSE } from './course.js';
import { parseMidiFile } from '../music/midifile.js';
import { finalizeSong } from '../music/song.js';
import { library } from '../store.js';
import { registerPieces } from './shop.js';

let pieces = [];
const loaded = new Map(); // id → Song
const pending = new Map(); // id → Promise<Song>

export function catalogPieces() {
  return pieces;
}

export function pieceMeta(id) {
  return pieces.find((p) => p.id === id) || null;
}

/** Synchronous lookup for songs that are already available. */
export function songNow(id) {
  return builtinSong(id) || loaded.get(id) || null;
}

/** Load any song by id: built-in, catalogue piece or import. */
export async function getSong(id) {
  const b = builtinSong(id);
  if (b) return b;
  if (loaded.has(id)) return loaded.get(id);
  if (pending.has(id)) return pending.get(id);
  const p = (async () => {
    if (id.startsWith('imp-')) {
      const rec = await library.get(id);
      if (!rec) return null;
      const s = rec.song;
      s.id = id;
      if (!s.hands) finalizeSong(s);
      return s;
    }
    const meta = pieceMeta(id);
    if (!meta) return null;
    const res = await fetch(new URL(`../../${meta.file}`, import.meta.url));
    if (!res.ok) throw new Error(`Couldn’t load ${meta.title}`);
    const song = parseMidiFile(await res.arrayBuffer(), meta.title);
    Object.assign(song, {
      id, title: meta.title, composer: meta.composer, level: Math.ceil(meta.grade / 2) + 2, grade: meta.grade,
      about: meta.about || '', tags: [`Grade ${meta.grade}`, ...(meta.skills || [])], source: 'catalog',
      license: meta.license, sourceUrl: meta.source, maintainer: meta.maintainer,
    });
    loaded.set(id, song);
    return song;
  })();
  pending.set(id, p);
  try {
    return await p;
  } finally {
    pending.delete(id);
  }
}

export async function getSongs(ids) {
  return Promise.all([...new Set(ids)].map(getSong));
}

// ---- Graded galaxies -------------------------------------------------------

const GRADE_UNITS = [
  { grades: [1], title: 'First Classics', subtitle: 'Your first real pieces by real composers', color: '#22C55E' },
  { grades: [2], title: 'Little Masters', subtitle: 'Short studies that build steady hands', color: '#06B6D4' },
  { grades: [3], title: 'The Notebook', subtitle: 'Minuets, marches and elementary favourites', color: '#3B82F6' },
  { grades: [4], title: 'Character Pieces', subtitle: 'Musical stories: moods, colours and styles', color: '#6366F1' },
  { grades: [5], title: 'Études & Sonatinas', subtitle: 'Technique meets music', color: '#8B5CF6' },
  { grades: [6], title: 'Romantic Moods', subtitle: 'Singing melodies and rich harmony', color: '#D946EF' },
  { grades: [7], title: 'Counterpoint & Ragtime', subtitle: 'Independent hands and syncopation', color: '#F43F5E' },
  { grades: [8], title: 'The Recital Hall', subtitle: 'Pieces you can perform for people', color: '#F97316' },
  { grades: [9], title: 'Virtuoso Road', subtitle: 'Advanced repertoire', color: '#EAB308' },
  { grades: [10], title: 'Concert Stage', subtitle: 'Professional-level masterpieces', color: '#FACC15' },
];

function pieceLesson(meta) {
  return {
    id: `p-${meta.id}`, title: meta.title, icon: '♫', song: meta.id, piece: true,
    steps: [
      { t: 'learn', title: meta.title, text: `<b>${meta.composer}</b>. ${meta.about || ''}${meta.skills && meta.skills.length ? `<br>You’ll practise: <b>${meta.skills.join(', ')}</b>.` : ''}`, piece: meta.id },
      { t: 'plan', song: meta.id, compact: meta.grade >= 3 },
    ],
  };
}

const GUARDIANS = {
  g1: 'The Gatekeeper', g2: 'The Clockwork Étude', g3: 'Lady of the Notebook', g4: 'The Storyteller', g5: 'The Sonatina Sphinx',
  g6: 'The Romantic Phantom', g7: 'The Ragtime Rogue', g8: 'The Recital Judge', g9: 'The Virtuoso', g10: 'The Grand Maestro',
};

function bossLesson(unitId, meta) {
  return {
    id: `boss-${unitId}`, title: `Boss Battle: ${meta.title}`, icon: '⚔', song: meta.id, boss: true, guardian: GUARDIANS[unitId] || 'The Guardian',
    steps: [{ t: 'boss', song: meta.id, hands: 'both' }],
  };
}

/** Load the repertoire manifest and add the graded galaxies to the course (once). */
let ready = null;
export function loadCatalog() {
  if (ready) return ready;
  ready = (async () => {
    try {
      const res = await fetch(new URL('./pieces.json', import.meta.url));
      if (res.ok) pieces = await res.json();
    } catch {
      pieces = [];
    }
    if (!pieces.length) return;
    registerPieces(pieces);
    GRADE_UNITS.forEach((g, i) => {
      const list = pieces.filter((p) => g.grades.includes(p.grade));
      if (list.length < 2) return;
      const boss = list[list.length - 1]; // the last (hardest) piece is the Guardian's test
      const id = `g${i + 1}`;
      COURSE.push({
        id, title: g.title, subtitle: g.subtitle, color: g.color, graded: true,
        lessons: [...list.slice(0, -1).map(pieceLesson), bossLesson(id, boss)],
      });
    });
  })();
  return ready;
}

export { builtinSongs };
