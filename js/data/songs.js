// Built-in library. Every melody here is in the public domain; the
// arrangements (simplified left hands, fingerings) were written for this app.
import { songFromDef } from '../music/song.js';
import { personalSongDefs, personalSongTitle } from '../personal.js';
import { parsePitch, diatonic } from '../music/theory.js';

const C = '(C3@5 E3@3 G3@1)';
const F = '(C3@5 F3@2 A3@1)';
const G7 = '(B2@5 F3@2 G3@1)';

export const SONG_DEFS = [
  {
    id: 'hot-cross-buns', title: 'Hot Cross Buns', level: 1, bpm: 80, pos: { R: 'C4', L: 'C3' },
    tags: ['C D E', 'Folk'], about: 'An English street cry, and the perfect first song: just three notes.',
    rh: 'E4 D4 C4/2 | E4 D4 C4/2 | C4/8 C4/8 C4/8 C4/8 D4/8 D4/8 D4/8 D4/8 | E4 D4 C4/2 |',
    lh: 'C3/1 | C3/1 | C3/2 G3/2 | C3/1 |',
  },
  {
    id: 'mary', title: 'Mary Had a Little Lamb', level: 1, bpm: 100, pos: { R: 'C4', L: 'C3' },
    tags: ['C position', 'Folk'], about: 'A 19th-century American nursery song built from the first five notes.',
    rh: 'E4 D4 C4 D4 | E4 E4 E4/2 | D4 D4 D4/2 | E4 G4 G4/2 | E4 D4 C4 D4 | E4 E4 E4 E4 | D4 D4 E4 D4 | C4/1 |',
    lh: 'C3/1 | C3/1 | G3/1 | C3/1 | C3/1 | C3/1 | G3/1 | C3/1 |',
  },
  {
    id: 'ode', title: 'Ode to Joy', composer: 'Ludwig van Beethoven', level: 1, bpm: 100, pos: { R: 'C4', L: 'C3' },
    tags: ['C position', 'Classical'], about: 'The main theme from the finale of Beethoven’s 9th Symphony (1824).',
    rh: `E4 E4 F4 G4 | G4 F4 E4 D4 | C4 C4 D4 E4 | E4/4. D4/8 D4/2 |
         E4 E4 F4 G4 | G4 F4 E4 D4 | C4 C4 D4 E4 | D4/4. C4/8 C4/2 |
         D4 D4 E4 C4 | D4 E4/8 F4/8 E4 C4 | D4 E4/8 F4/8 E4 D4 | C4 D4 G3/2 |
         E4 E4 F4 G4 | G4 F4 E4 D4 | C4 C4 D4 E4 | D4/4. C4/8 C4/2 |`,
    lh: `C3/1 | G3/1 | C3/1 | G3/1 | C3/1 | G3/1 | C3/1 | G3/2 C3/2 |
         G3/1 | C3/1 | G3/1 | G3/2 r/2 | C3/1 | G3/1 | C3/1 | G3/2 C3/2 |`,
    sections: [[1, 4], [5, 8], [9, 12], [13, 16]],
  },
  {
    id: 'jingle-bells', title: 'Jingle Bells', composer: 'James Lord Pierpont', level: 1, bpm: 110, pos: { R: 'C4', L: 'C3' },
    tags: ['C position', 'Holiday'], about: 'Written in 1857. The chorus fits entirely under five fingers.',
    rh: `E4 E4 E4/2 | E4 E4 E4/2 | E4 G4 C4/4. D4/8 | E4/1 |
         F4 F4 F4/4. F4/8 | F4 E4 E4 E4/8 E4/8 | E4 D4 D4 E4 | D4/2 G4/2 |
         E4 E4 E4/2 | E4 E4 E4/2 | E4 G4 C4/4. D4/8 | E4/1 |
         F4 F4 F4 F4 | F4 E4 E4 E4/8 E4/8 | G4 G4 F4 D4 | C4/1 |`,
    lh: `C3/1 | C3/1 | C3/1 | C3/1 | F3/1 | C3/1 | G3/1 | G3/1 |
         C3/1 | C3/1 | C3/1 | C3/1 | F3/1 | C3/1 | G3/1 | C3/1 |`,
  },
  {
    id: 'saints', title: 'When the Saints Go Marching In', level: 2, bpm: 110, pickup: 3, pos: { R: 'C4', L: 'C3' },
    tags: ['C position', 'Rests', 'Spiritual'], about: 'An American gospel hymn that became a jazz standard. Starts with a pickup.',
    rh: `C4 E4 F4 | G4/1 | r C4 E4 F4 | G4/1 | r C4 E4 F4 | G4/2 E4/2 | C4/2 E4/2 | D4/1 |
         r E4 E4 D4 | C4/2. C4 | E4/2 G4 G4 | F4/1 | r E4 F4 G4 | E4/2 C4/2 | D4/1 | C4/1 |`,
    lh: `r/2. | C3/1 | C3/1 | C3/1 | C3/1 | C3/1 | C3/1 | G3/1 |
         G3/1 | C3/1 | C3/1 | F3/1 | C3/1 | C3/1 | G3/1 | C3/1 |`,
  },
  {
    id: 'twinkle', title: 'Twinkle, Twinkle, Little Star', level: 2, bpm: 90, pos: { L: 'C3' },
    tags: ['C to A', 'Folk'], about: 'The French melody “Ah! vous dirai-je, maman”, which Mozart wrote variations on.',
    rh: `C4@1 C4 G4@4 G4 | A4@5 A4 G4/2@4 | F4@3 F4 E4@2 E4 | D4@1 D4 C4/2@1 |
         G4@4 G4 F4@3 F4 | E4@2 E4 D4/2@1 | G4@4 G4 F4@3 F4 | E4@2 E4 D4/2@1 |
         C4@1 C4 G4@4 G4 | A4@5 A4 G4/2@4 | F4@3 F4 E4@2 E4 | D4@1 D4 C4/2@1 |`,
    lh: `C3/1 | F3/2 C3/2 | F3/2 C3/2 | G3/2 C3/2 | C3/2 F3/2 | C3/2 G3/2 |
         C3/2 F3/2 | C3/2 G3/2 | C3/1 | F3/2 C3/2 | F3/2 C3/2 | G3/2 C3/2 |`,
  },
  {
    id: 'twinkle-chords', title: 'Twinkle, Twinkle (with Chords)', level: 3, bpm: 80,
    tags: ['Chords', 'Both hands'], about: 'The same melody with left-hand C, F and G7 chords that barely move.',
    rh: `C4@1 C4 G4@4 G4 | A4@5 A4 G4/2@4 | F4@3 F4 E4@2 E4 | D4@1 D4 C4/2@1 |
         G4@4 G4 F4@3 F4 | E4@2 E4 D4/2@1 | G4@4 G4 F4@3 F4 | E4@2 E4 D4/2@1 |
         C4@1 C4 G4@4 G4 | A4@5 A4 G4/2@4 | F4@3 F4 E4@2 E4 | D4@1 D4 C4/2@1 |`,
    lh: `${C}/1 | ${F}/2 ${C}/2 | ${F}/2 ${C}/2 | ${G7}/2 ${C}/2 | ${C}/2 ${F}/2 | ${C}/2 ${G7}/2 |
         ${C}/2 ${F}/2 | ${C}/2 ${G7}/2 | ${C}/1 | ${F}/2 ${C}/2 | ${F}/2 ${C}/2 | ${G7}/2 ${C}/2 |`,
  },
  {
    id: 'london-bridge', title: 'London Bridge', level: 2, bpm: 100, pos: { R: 'D4', L: 'C3' },
    tags: ['C to A', 'Folk'], about: 'A traditional English singing game, centuries old.',
    rh: 'G4/4. A4/8 G4 F4 | E4 F4 G4/2 | D4 E4 F4/2 | E4 F4 G4/2 | G4/4. A4/8 G4 F4 | E4 F4 G4/2 | D4/2 G4/2 | E4 C4/2. |',
    lh: 'C3/1 | C3/1 | G3/1 | C3/1 | C3/1 | C3/1 | G3/1 | C3/1 |',
  },
  {
    id: 'row-row', title: 'Row, Row, Row Your Boat', level: 2, bpm: 90, time: [6, 8], pos: { R: 'C4', L: 'C3' },
    tags: ['6/8 time', 'Folk'], about: 'A 19th-century round in a gently rocking 6/8 time.',
    rh: 'C4/4. C4/4. | C4/4 D4/8 E4/4. | E4/4 D4/8 E4/4 F4/8 | G4/2. | C5/8 C5/8 C5/8 G4/8 G4/8 G4/8 | E4/8 E4/8 E4/8 C4/8 C4/8 C4/8 | G4/4 F4/8 E4/4 D4/8 | C4/2. |',
    lh: 'C3/2. | C3/2. | C3/2. | C3/2. | C3/2. | C3/2. | G3/2. | C3/2. |',
  },
  {
    id: 'frere-jacques', title: 'Frère Jacques', level: 2, bpm: 100, pos: { R: 'C4', L: 'C3' },
    tags: ['C to A', 'Folk', 'Both hands'], about: 'The French round also known as “Are You Sleeping, Brother John?”',
    rh: 'C4 D4 E4 C4 | C4 D4 E4 C4 | E4 F4 G4/2 | E4 F4 G4/2 | G4/8 A4/8 G4/8 F4/8 E4 C4 | G4/8 A4/8 G4/8 F4/8 E4 C4 | C4 G3 C4/2 | C4 G3 C4/2 |',
    lh: 'C3/2 G3/2 | C3/2 G3/2 | C3/2 G3/2 | C3/2 G3/2 | C3/2 G3/2 | C3/2 G3/2 | C3/1 | C3/1 |',
  },
  {
    id: 'au-clair', title: 'Au Clair de la Lune', level: 2, bpm: 100, pos: { R: 'C4' },
    tags: ['Folk', 'Both hands'], about: 'An 18th-century French folk song: “By the light of the moon.”',
    rh: `C4 C4 C4 D4 | E4/2 D4/2 | C4 E4 D4 D4 | C4/1 | C4 C4 C4 D4 | E4/2 D4/2 | C4 E4 D4 D4 | C4/1 |
         D4 D4 D4 D4 | A3/2 A3/2 | D4 C4 B3 A3 | G3/1 | C4 C4 C4 D4 | E4/2 D4/2 | C4 E4 D4 D4 | C4/1 |`,
    lh: `C3/1 | C3/2 G2/2 | C3/2 G2/2 | C3/1 | C3/1 | C3/2 G2/2 | C3/2 G2/2 | C3/1 |
         G2/1 | D3/1 | G2/1 | G2/1 | C3/1 | C3/2 G2/2 | C3/2 G2/2 | C3/1 |`,
  },
  {
    id: 'yankee-doodle', title: 'Yankee Doodle', level: 2, bpm: 110, pos: { R: 'C4' },
    tags: ['Folk', 'Both hands'], about: 'An American tune dating back to before the Revolutionary War.',
    rh: 'C4 C4 D4 E4 | C4 E4 D4 G3 | C4 C4 D4 E4 | C4/2 B3/2 | C4 C4 D4 E4 | F4 E4 D4 C4 | B3 G3 A3 B3 | C4/2 C4/2 |',
    lh: 'C3/1 | C3/2 G2/2 | C3/1 | C3/2 G2/2 | C3/1 | F2/1 | G2/1 | C3/1 |',
  },
  {
    id: 'happy-birthday', title: 'Happy Birthday', composer: 'Patty & Mildred Hill', level: 3, bpm: 100, time: [3, 4], pickup: 1,
    tags: ['3/4 time', 'Moving hand'], about: 'From “Good Morning to All” (1893). Reaches up to high G, so your hand travels.',
    rh: 'G4/8 G4/8 | A4 G4 C5 | B4/2 G4/8 G4/8 | A4 G4 D5 | C5/2 G4/8 G4/8 | G5 E5 C5 | B4 A4 F5/8 F5/8 | E5 C5 D5 | C5/2. |',
    lh: 'r | C3/2. | G2/2. | G2/2. | C3/2. | C3/2. | F2/2. | C3/2 G2 | C3/2. |',
  },
  {
    id: 'old-macdonald', title: 'Old MacDonald', level: 2, bpm: 110, key: 1, pos: { R: 'D4' },
    tags: ['G major', 'Folk'], about: 'A children’s song about a farmer, in the key of G major.',
    rh: 'G4 G4 G4 D4 | E4 E4 D4/2 | B4 B4 A4 A4 | G4/2. D4 | G4 G4 G4 D4 | E4 E4 D4/2 | B4 B4 A4 A4 | G4/1 |',
    lh: 'G2/1 | C3/2 G2/2 | D3/1 | G2/1 | G2/1 | C3/2 G2/2 | D3/1 | G2/1 |',
  },
  {
    id: 'ode-in-f', title: 'Ode to Joy in F', composer: 'Ludwig van Beethoven', level: 3, bpm: 100, key: -1, pos: { R: 'F4' },
    tags: ['F major', 'B♭'], about: 'The same theme moved to F major: every B is now B♭.',
    rh: 'A4 A4 Bb4 C5 | C5 Bb4 A4 G4 | F4 F4 G4 A4 | A4/4. G4/8 G4/2 | A4 A4 Bb4 C5 | C5 Bb4 A4 G4 | F4 F4 G4 A4 | G4/4. F4/8 F4/2 |',
    lh: 'F3/1 | C3/1 | F3/1 | C3/1 | F3/1 | C3/1 | F3/1 | C3/2 F3/2 |',
  },
  {
    id: 'fur-elise', title: 'Für Elise (Theme)', composer: 'Ludwig van Beethoven', level: 4, bpm: 60, time: [3, 8], pickup: 0.5,
    tags: ['Sharps', 'Classical', 'Both hands'], about: 'Bagatelle No. 25 in A minor (1810). The famous opening theme.',
    rh: `E5@5/16 D#5@4/16 | E5@5/16 D#5@4/16 E5@5/16 B4@2/16 D5@4/16 C5@3/16 | A4@1/8 r/16 C4@1/16 E4@2/16 A4@3/16 | B4@4/8 r/16 E4@1/16 G#4@3/16 B4@4/16 |
         C5@5/8 r/16 E4@1/16 E5@4/16 D#5@3/16 | E5@4/16 D#5@3/16 E5@4/16 B4@1/16 D5@3/16 C5@2/16 | A4@1/8 r/16 C4@1/16 E4@2/16 A4@3/16 | B4@4/8 r/16 E4@1/16 C5@5/16 B4@4/16 | A4@3/4 r/8 |`,
    lh: `r/8 | r/4. | A2@5/16 E3@2/16 A3@1/16 r/16 r/8 | E2@5/16 E3@2/16 G#3@1/16 r/16 r/8 |
         A2@5/16 E3@2/16 A3@1/16 r/16 r/8 | r/4. | A2@5/16 E3@2/16 A3@1/16 r/16 r/8 | E2@5/16 E3@2/16 G#3@1/16 r/16 r/8 | A2@5/16 E3@2/16 A3@1/16 r/16 r/8 |`,
    sections: [[0, 4, 'Part 1'], [5, 8, 'Part 2']],
  },
  {
    id: 'minuet-g', title: 'Minuet in G', composer: 'Christian Petzold', level: 4, bpm: 90, time: [3, 4], key: 1,
    tags: ['G major', 'F♯', 'Classical'], about: 'From the 1725 Notebook for Anna Magdalena Bach. Simplified left hand.',
    rh: `D5 G4/8 A4/8 B4/8 C5/8 | D5 G4 G4 | E5 C5/8 D5/8 E5/8 F#5/8 | G5 G4 G4 |
         C5 D5/8 C5/8 B4/8 A4/8 | B4 C5/8 B4/8 A4/8 G4/8 | F#4 G4/8 A4/8 B4/8 G4/8 | A4/2. |
         D5 G4/8 A4/8 B4/8 C5/8 | D5 G4 G4 | E5 C5/8 D5/8 E5/8 F#5/8 | G5 G4 G4 |
         C5 D5/8 C5/8 B4/8 A4/8 | B4 C5/8 B4/8 A4/8 G4/8 | A4 B4/8 A4/8 G4/8 F#4/8 | G4/2. |`,
    lh: `G3/2 A3 | B3/2. | C4/2. | B3/2. | A3/2. | G3/2. | D3/2. | D3/2. |
         G3/2 A3 | B3/2. | C4/2. | B3/2. | A3/2. | G3/2. | D3/2. | G2/2. |`,
  },
  {
    id: 'greensleeves', title: 'Greensleeves', level: 4, bpm: 90, time: [3, 4], pickup: 1,
    tags: ['A minor', 'G♯', 'Folk'], about: 'An English ballad from the 1500s, in a minor key with raised G♯.',
    rh: `A4 | C5/2 D5 | E5/4. F5/8 E5 | D5/2 B4 | G4/4. A4/8 B4 | C5/2 A4 | A4/4. G#4/8 A4 | B4/2 G#4 | E4/2 A4 |
         C5/2 D5 | E5/4. F5/8 E5 | D5/2 B4 | G4/4. A4/8 B4 | C5/4. B4/8 A4 | G#4/4. F#4/8 G#4 | A4/2. |`,
    lh: `r | A2/2. | A2/2. | G2/2. | G2/2. | A2/2. | A2/2. | E2/2. | E2/2. |
         A2/2. | C3/2. | G2/2. | E2/2. | A2/2. | E2/2. | A2/2. |`,
  },
  {
    id: 'canon-d', title: 'Canon in D', composer: 'Johann Pachelbel', level: 3, bpm: 70, key: 2,
    tags: ['D major', 'Classical', 'Both hands'], about: 'Written around 1700. The eight-note bass line repeats under ever-changing melodies.',
    rh: 'F#5/2 E5/2 | D5/2 C#5/2 | B4/2 A4/2 | B4/2 C#5/2 | D5/2 C#5/2 | B4/2 A4/2 | G4/2 F#4/2 | G4/2 E4/2 |',
    lh: 'D3/2 A2/2 | B2/2 F#2/2 | G2/2 D2/2 | G2/2 A2/2 | D3/2 A2/2 | B2/2 F#2/2 | G2/2 D2/2 | G2/2 A2/2 |',
  },
  {
    id: 'canon-chords', title: 'Canon in D (Chords)', composer: 'Johann Pachelbel', level: 4, bpm: 60, key: 2,
    tags: ['Chords', 'D major', 'Both hands'], about: 'The famous chord progression: D, A, Bm, F♯m, G, D, G, A.',
    rh: `(F#4 A4 D5)/2 (E4 A4 C#5)/2 | (D4 F#4 B4)/2 (C#4 F#4 A4)/2 | (B3 D4 G4)/2 (A3 D4 F#4)/2 | (B3 D4 G4)/2 (C#4 E4 A4)/2 |
         (F#4 A4 D5)/2 (E4 A4 C#5)/2 | (D4 F#4 B4)/2 (C#4 F#4 A4)/2 | (B3 D4 G4)/2 (A3 D4 F#4)/2 | (B3 D4 G4)/2 (C#4 E4 A4)/2 |`,
    lh: 'D3/2 A2/2 | B2/2 F#2/2 | G2/2 D2/2 | G2/2 A2/2 | D3/2 A2/2 | B2/2 F#2/2 | G2/2 D2/2 | G2/2 A2/2 |',
  },
  {
    id: 'four-chords', title: 'Four-Chord Progression', composer: 'Practice piece', level: 3, bpm: 80,
    tags: ['Chords', 'Both hands'], about: 'C – G – Am – F: the progression behind countless pop songs.',
    rh: '(C4@1 E4@3 G4@5)/1 | (B3@1 D4@2 G4@5)/1 | (C4@1 E4@3 A4@5)/1 | (C4@1 F4@3 A4@5)/1 | (C4 E4 G4)/1 | (B3 D4 G4)/1 | (C4 E4 A4)/1 | (C4 F4 A4)/1 |',
    lh: 'C3/1 | G2/1 | A2/1 | F2/1 | C3/1 | G2/1 | A2/1 | F2/1 |',
  },
  // ---- Gospel organ: progressions in the style (patterns, not copyrighted songs) ----
  {
    id: 'gospel-amen', title: 'The Amen Cadence', composer: 'Gospel organ pattern', level: 2, bpm: 66, instrument: 'organ',
    tags: ['Gospel', 'Organ', 'Chords'], about: 'IV to I, the \u201cAmen\u201d at the end of a hymn. The heartbeat of church organ playing.',
    rh: '(E4@1 G4@2 C5@5)/1 | (F4@1 A4@3 C5@5)/1 | (E4 G4 C5)/1 | (F4 A4 C5)/2 (E4 G4 C5)/2 | (E4 G4 C5)/1 | (F4 A4 C5)/1 | (F4 A4 C5)/2 (E4 G4 C5)/2 | (E4 G4 C5)/1 |',
    lh: 'C3@5/1 | C3/1 | C3/1 | C3/1 | C3/1 | F2@5/1 | F2/2 C3/2 | C3/1 |',
  },
  {
    id: 'gospel-blues', title: '12-Bar Gospel Blues', composer: 'Gospel organ pattern', level: 3, bpm: 76, instrument: 'organ',
    tags: ['Gospel', 'Organ', 'Dominant 7ths'], about: 'Dominant 7th chords (C7, F7, G7) over twelve bars: the bluesy side of gospel and the root of rock & roll.',
    rh: `(E4@1 G4@2 Bb4@4)/1 | (Eb4@1 F4@2 A4@4)/1 | (E4 G4 Bb4)/1 | (E4 G4 Bb4)/1 |
         (Eb4 F4 A4)/1 | (Eb4 F4 A4)/1 | (E4 G4 Bb4)/1 | (E4 G4 Bb4)/1 |
         (F4@1 G4@2 B4@4)/1 | (Eb4 F4 A4)/1 | (E4 G4 Bb4)/1 | (F4 G4 B4)/1 |`,
    lh: 'C3@5/1 | F2@5/1 | C3/1 | C3/1 | F2/1 | F2/1 | C3/1 | C3/1 | G2/1 | F2/1 | C3/1 | G2/1 |',
  },
  {
    id: 'gospel-walkup', title: 'Walk-Up Bass', composer: 'Gospel organ pattern', level: 3, bpm: 72, instrument: 'organ',
    tags: ['Gospel', 'Organ', 'Bass lines'], about: 'The left hand walks up step by step into the next chord: C D E \u2192 F, F F\u266f G \u2192 C.',
    rh: '(E4 G4 C5)/1 | (F4 A4 C5)/1 | (F4 G4 B4)/1 | (E4 G4 C5)/1 | (E4 G4 C5)/1 | (F4 A4 C5)/1 | (F4 G4 B4)/1 | (E4 G4 C5)/1 |',
    lh: 'C3@5/2 D3@4 E3@3 | F3@2/1 | F3@5/2 F#3@4 G3@3 | C3@5/1 | C3/2 D3 E3 | F3/1 | F3/2 F#3 G3 | C3/1 |',
  },
  {
    id: 'gospel-passing', title: 'The Passing Diminished Chord', composer: 'Gospel organ pattern', level: 4, bpm: 66, instrument: 'organ',
    tags: ['Gospel', 'Organ', 'Diminished'], about: 'C \u2192 C\u266fdim7 \u2192 Dm7 \u2192 G7 \u2192 C. The bass climbs a half step and the chord in between adds that classic church tension.',
    rh: '(E4@1 G4@2 C5@5)/1 | (E4@1 G4@2 Bb4@4)/1 | (F4@1 A4@3 C5@5)/1 | (F4@1 G4@2 B4@4)/1 | (E4 G4 C5)/1 | (E4 G4 Bb4)/1 | (F4 A4 C5)/1 | (F4 G4 B4)/2 (E4 G4 C5)/2 |',
    lh: 'C3/1 | C#3/1 | D3/1 | G2/1 | C3/1 | C#3/1 | D3/1 | G2/2 C3/2 |',
  },
  {
    id: 'gospel-251', title: 'Gospel 2-5-1', composer: 'Gospel organ pattern', level: 4, bpm: 70, instrument: 'organ',
    tags: ['Gospel', 'Organ', '7th chords'], about: 'Dm7 \u2192 G7 \u2192 Cmaj7: the move behind countless gospel and jazz endings, with smooth right-hand voicings.',
    rh: '(F4@1 A4@3 C5@5)/1 | (F4@1 G4@2 B4@4)/1 | (E4@1 G4@2 B4@4)/1 | (E4 G4 B4)/1 | (F4 A4 C5)/1 | (F4 G4 B4)/1 | (E4 G4 B4)/2 (E4 G4 C5)/2 | (E4 G4 C5)/1 |',
    lh: 'D3/1 | G2/1 | C3/1 | C3/1 | D3/1 | G2/1 | C3/1 | C3/1 |',
  },
  {
    id: 'saints-organ', title: 'When the Saints (Organ)', level: 3, bpm: 100, pickup: 3, instrument: 'organ', pos: { R: 'C4' },
    tags: ['Gospel', 'Organ', 'Spiritual'], about: 'The spiritual on the organ, with left-hand chords instead of single bass notes.',
    rh: `C4 E4 F4 | G4/1 | r C4 E4 F4 | G4/1 | r C4 E4 F4 | G4/2 E4/2 | C4/2 E4/2 | D4/1 |
         r E4 E4 D4 | C4/2. C4 | E4/2 G4 G4 | F4/1 | r E4 F4 G4 | E4/2 C4/2 | D4/1 | C4/1 |`,
    lh: `r/2. | (C3 E3 G3)/1 | (C3 E3 G3)/1 | (C3 E3 G3)/1 | (C3 E3 G3)/1 | (C3 E3 G3)/1 | (C3 E3 G3)/1 | (B2 F3 G3)/1 |
         (B2 F3 G3)/1 | (C3 E3 G3)/1 | (C3 E3 Bb3)/1 | (C3 F3 A3)/1 | (C3 E3 G3)/1 | (C3 E3 G3)/1 | (B2 F3 G3)/1 | (C3 E3 G3)/1 |`,
  },
  // ---- Boss battles: original test pieces, one per galaxy ----
  { id: 'boss-u1', title: 'Primera Trial', composer: 'Original test piece', level: 1, bpm: 84, pos: { R: 'C4' }, tags: ['Boss'], about: 'C, D and E with mixed rhythms. Keep the beat!',
    rh: 'C4 D4 E4 C4 | E4 D4 C4/2 | C4 C4 D4 D4 | E4/1 | E4 D4 C4 D4 | E4 E4 D4/2 | C4/8 D4/8 E4/8 D4/8 C4 E4 | C4/1 |' },
  { id: 'boss-u2', title: 'Pentara Trial', composer: 'Original test piece', level: 2, bpm: 92, pos: { R: 'C4' }, tags: ['Boss'], about: 'All five fingers, eighth notes, a dotted rhythm and rests.',
    rh: 'C4 E4 G4/2 | F4 E4 D4 r | E4/4. F4/8 G4 E4 | D4/2 r/2 | G4 F4/8 E4/8 D4 C4 | E4/2. D4 | C4 D4 E4 F4 | G4/2 C4/2 |' },
  { id: 'boss-u3', title: 'Octavia Trial', composer: 'Original test piece', level: 2, bpm: 88, tags: ['Boss'], about: 'The whole octave: thumb under, A and B, and back down.',
    rh: 'C4@1 D4@2 E4@3 F4@1 | G4@2 A4@3 B4@4 C5@5 | C5@5 B4@4 A4@3 G4@2 | A4/2 G4/2 | E4@1 G4@2 A4@3 C5@5 | B4@4 A4@3 G4@2/2 | F4@1 A4@3 G4@2 E4@1 | C4@1/1 |' },
  { id: 'boss-u4', title: 'Basso Trial', composer: 'Original test piece', level: 2, bpm: 84, pos: { L: 'C3' }, tags: ['Boss'], about: 'A left-hand melody in C position, read from the bass clef.',
    rh: '', lh: 'C3 E3 G3 E3 | F3 E3 D3/2 | E3 D3 C3 D3 | E3/2 G3/2 | G3 F3 E3 D3 | C3 D3 E3/2 | D3 E3 F3 D3 | C3/1 |' },
  { id: 'boss-u5', title: 'Gemini Trial', composer: 'Original test piece', level: 3, bpm: 80, pos: { R: 'C4', L: 'C3' }, tags: ['Boss'], about: 'Melody in the right hand, bass notes in the left: together, in time.',
    rh: 'E4 F4 G4/2 | E4 D4 C4/2 | D4 E4 F4 D4 | E4/1 | G4 F4 E4 D4 | C4 E4 G4/2 | F4 D4 E4 C4 | C4/1 |',
    lh: 'C3/1 | G3/1 | G3/1 | C3/1 | C3/2 G3/2 | C3/1 | G3/1 | C3/1 |' },
  { id: 'boss-u6', title: 'Chroma Trial', composer: 'Original test piece', level: 3, bpm: 88, key: 1, tags: ['Boss'], about: 'G major: watch every F\u266f.',
    rh: 'G4 A4 B4 G4 | D5/2 B4/2 | C5 B4 A4 F#4 | G4/1 | B4 C5 D5 B4 | E5 D5 C5 A4 | F#4 G4 A4 F#4 | G4/1 |',
    lh: 'G2/1 | G2/1 | D3/1 | G2/1 | G2/1 | C3/1 | D3/1 | G2/1 |' },
  { id: 'boss-u7', title: 'Triad Trial', composer: 'Original test piece', level: 3, bpm: 76, tags: ['Boss'], about: 'C, F, G and Am chords over a moving bass. Change chords right on the beat.',
    rh: '(C4 E4 G4)/2 (C4 E4 G4)/2 | (C4 F4 A4)/2 (C4 F4 A4)/2 | (B3 D4 G4)/2 (B3 D4 G4)/2 | (C4 E4 G4)/1 | (C4 E4 A4)/2 (C4 E4 A4)/2 | (C4 F4 A4)/2 (C4 F4 A4)/2 | (B3 D4 G4)/2 (B3 F4 G4)/2 | (C4 E4 G4)/1 |',
    lh: 'C3/1 | F2/1 | G2/1 | C3/1 | A2/1 | F2/1 | G2/1 | C3/1 |' },
  { id: 'boss-u9', title: 'Cathedral Trial', composer: 'Original test piece', level: 4, bpm: 72, instrument: 'organ', tags: ['Boss', 'Gospel'], about: 'Passing diminished chord and the Amen, on the organ, in time.',
    rh: '(E4 G4 C5)/1 | (E4 G4 Bb4)/1 | (F4 A4 C5)/1 | (F4 G4 B4)/1 | (E4 G4 C5)/2 (F4 A4 C5)/2 | (E4 G4 C5)/2 (E4 G4 Bb4)/2 | (F4 A4 C5)/2 (F4 G4 B4)/2 | (E4 G4 C5)/1 |',
    lh: 'C3/1 | C#3/1 | D3/1 | G2/1 | C3/2 F2/2 | C3/2 C#3/2 | D3/2 G2/2 | C3/1 |' },
];

/** Apply "five-finger position" fingering to notes that have none. */
function applyPosition(song, pos) {
  if (!pos) return;
  for (const hand of ['R', 'L']) {
    if (!pos[hand]) continue;
    const base = parsePitch(pos[hand]);
    const d0 = diatonic(base.step, base.octave);
    for (const n of song.notes) {
      if (n.hand !== hand || n.finger) continue;
      const k = diatonic(n.step, n.octave) - d0;
      if (k >= 0 && k <= 4) n.finger = hand === 'R' ? k + 1 : 5 - k;
    }
  }
}

export function buildSong(def) {
  const song = songFromDef(def);
  applyPosition(song, def.pos);
  return song;
}

let cache = null;
export function builtinSongs() {
  if (!cache) {
    // Songs from a personal pack (private, on this device) join the built-in ones.
    cache = [...SONG_DEFS, ...personalSongDefs()].map((d) => buildSong(personalSongTitle(d.id) ? { ...d, title: personalSongTitle(d.id) } : d));
    for (const s of cache) if (s.errors.length) console.warn(s.errors.join('\n'));
  }
  return cache;
}

export function builtinSong(id) {
  return builtinSongs().find((s) => s.id === id);
}
