// Pitch / spelling helpers shared by parsers, renderer and UI.

export const STEPS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const STEP_SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_SPELL = [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0]];
const FLAT_SPELL = [['C', 0], ['D', -1], ['D', 0], ['E', -1], ['E', 0], ['F', 0], ['G', -1], ['G', 0], ['A', -1], ['A', 0], ['B', -1], ['B', 0]];

export function midiFromSpelling(step, alter, octave) {
  return (octave + 1) * 12 + STEP_SEMI[step] + (alter || 0);
}

/** Parse "C4", "F#4", "Bb3", "Ebb5", "C##4" → {step, alter, octave, midi}. */
export function parsePitch(str) {
  const m = /^([A-Ga-g])(##|#|bb|b|n)?(-?\d)$/.exec(str.trim());
  if (!m) throw new Error(`Bad pitch "${str}"`);
  const step = m[1].toUpperCase();
  const acc = m[2] || '';
  const alter = acc === '#' ? 1 : acc === '##' ? 2 : acc === 'b' ? -1 : acc === 'bb' ? -2 : 0;
  const octave = parseInt(m[3], 10);
  return { step, alter, octave, midi: midiFromSpelling(step, alter, octave) };
}

/** Spell a MIDI number using sharps (keyFifths >= 0) or flats. */
export function spellMidi(midi, keyFifths = 0) {
  const pc = ((midi % 12) + 12) % 12;
  const [step, alter] = (keyFifths < 0 ? FLAT_SPELL : SHARP_SPELL)[pc];
  // octave belongs to the letter: B#3 = C4 etc. Our tables never cross octave so this is safe.
  const octave = Math.floor(midi / 12) - 1;
  return { step, alter, octave };
}

export function accidentalSymbol(alter) {
  return alter === 1 ? '♯' : alter === -1 ? '♭' : alter === 2 ? '𝄪' : alter === -2 ? '𝄫' : '';
}

export function noteName(midi, keyFifths = 0, withOctave = false) {
  const s = spellMidi(midi, keyFifths);
  return s.step + accidentalSymbol(s.alter) + (withOctave ? s.octave : '');
}

export function spelledName(n, withOctave = false) {
  return n.step + accidentalSymbol(n.alter) + (withOctave ? n.octave : '');
}

/** Diatonic index: C4 → 28 (4*7+0). Used for vertical staff placement. */
export function diatonic(step, octave) {
  return octave * 7 + STEPS.indexOf(step);
}

export function isBlack(midi) {
  return [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);
}

export function midiToFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

// Key signatures: order in which sharps / flats are added.
export const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
export const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

/** Map step → alter implied by key signature. */
export function keyAlterMap(fifths) {
  const map = { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 };
  if (fifths > 0) SHARP_ORDER.slice(0, fifths).forEach((s) => (map[s] = 1));
  if (fifths < 0) FLAT_ORDER.slice(0, -fifths).forEach((s) => (map[s] = -1));
  return map;
}

const KEY_NAMES = { '-7': 'C♭', '-6': 'G♭', '-5': 'D♭', '-4': 'A♭', '-3': 'E♭', '-2': 'B♭', '-1': 'F', 0: 'C', 1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F♯', 7: 'C♯' };
export function keyName(fifths) {
  return (KEY_NAMES[fifths] || 'C') + ' major';
}

// ---- Chords -------------------------------------------------------------

export const CHORD_TYPES = {
  maj: { label: 'Major', symbol: '', intervals: [0, 4, 7], blurb: 'Bright and happy. Root, major 3rd, perfect 5th.' },
  min: { label: 'Minor', symbol: 'm', intervals: [0, 3, 7], blurb: 'Darker, sadder. The middle note moves down one half step.' },
  dim: { label: 'Diminished', symbol: 'dim', intervals: [0, 3, 6], blurb: 'Tense and unstable. Minor chord with a lowered 5th.' },
  aug: { label: 'Augmented', symbol: 'aug', intervals: [0, 4, 8], blurb: 'Dreamy and unresolved. Major chord with a raised 5th.' },
  sus2: { label: 'Sus 2', symbol: 'sus2', intervals: [0, 2, 7], blurb: 'Open sound: the 3rd is replaced by the 2nd.' },
  sus4: { label: 'Sus 4', symbol: 'sus4', intervals: [0, 5, 7], blurb: 'Wants to resolve: the 3rd is replaced by the 4th.' },
  dom7: { label: 'Dominant 7', symbol: '7', intervals: [0, 4, 7, 10], blurb: 'Bluesy pull back home. Major chord + minor 7th.' },
  maj7: { label: 'Major 7', symbol: 'maj7', intervals: [0, 4, 7, 11], blurb: 'Smooth and jazzy. Major chord + major 7th.' },
  min7: { label: 'Minor 7', symbol: 'm7', intervals: [0, 3, 7, 10], blurb: 'Mellow and soulful. Minor chord + minor 7th.' },
};

export const ROOTS = [
  { name: 'C', pc: 0, fifths: 0 }, { name: 'C♯/D♭', pc: 1, fifths: -5 }, { name: 'D', pc: 2, fifths: 2 },
  { name: 'E♭', pc: 3, fifths: -3 }, { name: 'E', pc: 4, fifths: 4 }, { name: 'F', pc: 5, fifths: -1 },
  { name: 'F♯', pc: 6, fifths: 6 }, { name: 'G', pc: 7, fifths: 1 }, { name: 'A♭', pc: 8, fifths: -4 },
  { name: 'A', pc: 9, fifths: 3 }, { name: 'B♭', pc: 10, fifths: -2 }, { name: 'B', pc: 11, fifths: 5 },
];

/** Build chord midis around a base octave, with inversion (0 = root position). */
export function chordMidis(rootPc, type, inversion = 0, baseMidi = 60) {
  const iv = CHORD_TYPES[type].intervals;
  let notes = iv.map((i) => baseMidi + rootPc + i);
  for (let k = 0; k < inversion; k++) notes = [...notes.slice(1), notes[0] + 12];
  return notes;
}
