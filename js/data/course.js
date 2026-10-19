// The guided course. Each lesson is a list of steps:
//   { t:'learn', title, text, keys?, fingers?, hand?, staff?, chords?, img? }
//   { t:'play', title, song: id | inline def, hands, mode:'wait'|'timed', range?, tempo?, names?, hideOther? }
//   { t:'plan', song: id }   → expands into the song's full practice plan (sections → hands → full song)

const ex = (rh, opts = {}) => ({ id: opts.id || 'exercise', title: opts.title || 'Exercise', bpm: opts.bpm || 80, key: opts.key || 0, time: opts.time, rh, lh: opts.lh });
const exL = (lh, opts = {}) => ({ id: 'exercise', title: opts.title || 'Exercise', bpm: opts.bpm || 80, key: opts.key || 0, lh, rh: '' });
const RH_C = { 60: 1, 62: 2, 64: 3, 65: 4, 67: 5 };
const LH_C = { 48: 5, 50: 4, 52: 3, 53: 2, 55: 1 };

export const COURSE = [
  {
    id: 'u1', title: 'First Notes', subtitle: 'C, D and E with your right hand', color: '#5B6CFF',
    lessons: [
      {
        id: 'l-middle-c', title: 'Meet Middle C', icon: '♪',
        steps: [
          { t: 'learn', title: 'Welcome to the piano!', text: 'Look at the black keys: they come in <b>groups of 2</b> and <b>groups of 3</b>. That pattern repeats all the way up the keyboard, and it’s your map for finding every note.', keys: [61, 63, 66, 68, 70], range: [48, 72] },
          { t: 'learn', title: 'Find C', text: '<b>C</b> is the white key just to the <b>left of every group of 2 black keys</b>. The C nearest the middle of your piano is called <b>Middle C</b>. Find it now on your piano.', keys: [60], range: [48, 72], labels: true },
          { t: 'learn', title: 'Finger numbers', text: 'Each finger has a number. <b>Thumbs are 1</b> and <b>pinkies are 5</b>, on both hands. Place your right thumb on Middle C.', img: 'hand' },
          { t: 'play', title: 'Play Middle C with your thumb (finger 1)', song: ex('C4@1/2 C4@1/2 | C4@1 C4@1 C4@1/2 |'), mode: 'wait' },
          { t: 'play', title: 'Now play along with the beat', song: ex('C4@1 C4@1 C4@1 C4@1 | C4@1/2 C4@1/2 | C4@1 C4@1 C4@1/2 | C4@1/1 |', { bpm: 70 }), mode: 'timed' },
        ],
      },
      {
        id: 'l-d-e', title: 'D and E', icon: '♫',
        steps: [
          { t: 'learn', title: 'Meet D', text: '<b>D</b> sits right between the two black keys. Play it with <b>finger 2</b>, your pointer finger.', keys: [60, 62], fingers: RH_C, range: [55, 72], labels: true },
          { t: 'play', title: 'C and D: thumb, then finger 2', song: ex('C4@1 D4@2 C4@1 D4@2 | C4@1/2 D4@2/2 | D4@2 C4@1 D4@2 C4@1 | C4@1/1 |'), mode: 'wait' },
          { t: 'learn', title: 'Meet E', text: '<b>E</b> is just to the right of the two black keys. Use <b>finger 3</b>. Now your first three fingers each have a home key.', keys: [60, 62, 64], fingers: RH_C, range: [55, 72], labels: true },
          { t: 'play', title: 'Play C, D and E at your own pace', song: ex('C4@1 D4@2 E4@3/2 | E4@3 D4@2 C4@1/2 | C4@1 D4@2 E4@3 D4@2 | C4@1/1 |'), mode: 'wait' },
          { t: 'play', title: 'Same notes — now keep a steady beat', song: ex('C4@1 D4@2 E4@3/2 | E4@3 D4@2 C4@1/2 | C4@1 D4@2 E4@3 D4@2 | C4@1/1 |', { bpm: 72 }), mode: 'timed' },
        ],
      },
      {
        id: 'l-hot-cross', title: 'Hot Cross Buns', icon: '★', song: 'hot-cross-buns',
        steps: [
          { t: 'learn', title: 'Your first song!', text: 'This tune uses only <b>C, D and E</b>. Tap <b>Listen</b> anytime to hear how it goes. First play at your own pace: the music waits for you.', keys: [60, 62, 64], fingers: RH_C, range: [55, 72] },
          { t: 'play', title: 'Hot Cross Buns: your own pace', song: 'hot-cross-buns', hands: 'R', mode: 'wait', hideOther: true },
          { t: 'play', title: 'Hot Cross Buns: with the beat', song: 'hot-cross-buns', hands: 'R', mode: 'timed', tempo: 0.85, hideOther: true },
        ],
      },
      {
        id: 'l-read-cde', title: 'Reading C, D, E', icon: '𝄞',
        steps: [
          { t: 'learn', title: 'Notes live on the staff', text: 'Music is written on <b>5 lines</b> called a <b>staff</b>. Higher notes sit higher. <b>Middle C</b> gets its own short line below the staff. <b>D</b> hangs just under the bottom line, and <b>E</b> sits right on it.', staff: 'C4/2 D4/2 | E4/2 r/2 |' },
          { t: 'play', title: 'Read the notes — no letters this time!', song: ex('E4 D4 C4 D4 | E4 E4 E4/2 | D4 C4 D4 E4 | C4/1 |'), mode: 'wait', names: false },
          { t: 'play', title: 'Read and keep the beat', song: ex('C4 E4 D4 C4 | E4/2 D4/2 | C4 D4 E4 E4 | C4/1 |', { bpm: 72 }), mode: 'timed', names: false },
        ],
      },
    ],
  },
  {
    id: 'u2', title: 'Five-Finger Position', subtitle: 'Add F and G, songs and rhythm', color: '#8B5CF6',
    lessons: [
      {
        id: 'l-f-g', title: 'F and G', icon: '✋',
        steps: [
          { t: 'learn', title: 'Meet F', text: '<b>F</b> is the white key just to the <b>left of the group of 3 black keys</b>. Use <b>finger 4</b>.', keys: [60, 62, 64, 65], fingers: RH_C, range: [55, 72], labels: true },
          { t: 'learn', title: 'Meet G: C position', text: '<b>G</b> comes right after F. Play it with <b>finger 5</b>, your pinky. One finger on each key from C to G is called <b>C position</b>. Most early songs live here.', keys: [60, 62, 64, 65, 67], fingers: RH_C, range: [55, 72], labels: true },
          { t: 'play', title: 'Walk up and down C position', song: ex('C4@1 D4@2 E4@3 F4@4 | G4@5/1 | G4@5 F4@4 E4@3 D4@2 | C4@1/1 |'), mode: 'wait' },
          { t: 'learn', title: 'F and G on the staff', text: '<b>F</b> sits in the first space and <b>G</b> on the second line. Notice the pattern: line, space, line, space… each step up is the next letter.', staff: 'C4 D4 E4 F4 | G4/2 r/2 |' },
          { t: 'play', title: 'Up and down, with the beat', song: ex('C4@1 D4@2 E4@3 F4@4 | G4@5/1 | G4@5 F4@4 E4@3 D4@2 | C4@1/1 |', { bpm: 76 }), mode: 'timed' },
        ],
      },
      {
        id: 'l-mary', title: 'Mary Had a Little Lamb', icon: '★', song: 'mary',
        steps: [
          { t: 'play', title: 'Mary: your own pace', song: 'mary', hands: 'R', mode: 'wait', hideOther: true },
          { t: 'play', title: 'Mary: with the beat', song: 'mary', hands: 'R', mode: 'timed', tempo: 0.8, hideOther: true },
        ],
      },
      {
        id: 'l-rhythm', title: 'Long and Short Notes', icon: '♩',
        steps: [
          { t: 'learn', title: 'How long is a note?', text: '<b>Quarter note</b> (filled, with a stem) = 1 beat.<br><b>Half note</b> (hollow, with a stem) = 2 beats.<br><b>Whole note</b> (hollow, no stem) = 4 beats.<br><b>Eighth notes</b> (with a flag) = half a beat each.', staff: 'C4/1 | E4/2 E4/2 | G4 G4 G4/8 G4/8 G4 |' },
          { t: 'learn', title: 'Dots and counting', text: 'A <b>dot</b> adds half the note’s length: a dotted half note lasts <b>3 beats</b>. Count “1, 2, 3, 4” out loud along with the metronome clicks.', staff: 'C4/2. C4 | E4/2. E4 |' },
          { t: 'play', title: 'Hold each note for its full length', song: ex('C4/1 | E4/2 E4/2 | G4 G4 G4 G4 | C4/1 |', { bpm: 80 }), mode: 'timed' },
          { t: 'play', title: 'Mix it up: eighths and a dotted half', song: ex('C4 D4 E4/2 | E4/8 E4/8 D4/8 D4/8 C4/2 | G4/2. G4 | C4/1 |', { bpm: 72 }), mode: 'timed' },
        ],
      },
      {
        id: 'l-ode', title: 'Ode to Joy', icon: '★', song: 'ode',
        steps: [
          { t: 'learn', title: 'Beethoven’s Ode to Joy', text: 'We’ll break this famous melody into parts. Learn each part at your own pace, then join them together with the beat.', keys: [60, 62, 64, 65, 67], fingers: RH_C, range: [55, 72] },
          { t: 'play', title: 'Part 1', song: 'ode', hands: 'R', mode: 'wait', range: [1, 4], hideOther: true },
          { t: 'play', title: 'Part 2', song: 'ode', hands: 'R', mode: 'wait', range: [5, 8], hideOther: true },
          { t: 'play', title: 'Parts 1 + 2 with the beat', song: 'ode', hands: 'R', mode: 'timed', tempo: 0.8, range: [1, 8], hideOther: true },
        ],
      },
      {
        id: 'l-jingle', title: 'Jingle Bells', icon: '★', song: 'jingle-bells',
        steps: [
          { t: 'play', title: 'First half: your own pace', song: 'jingle-bells', hands: 'R', mode: 'wait', range: [1, 8], hideOther: true },
          { t: 'play', title: 'Second half: your own pace', song: 'jingle-bells', hands: 'R', mode: 'wait', range: [9, 16], hideOther: true },
          { t: 'play', title: 'The whole chorus with the beat', song: 'jingle-bells', hands: 'R', mode: 'timed', tempo: 0.8, hideOther: true },
        ],
      },
      {
        id: 'l-saints', title: 'Rests & Pickups', icon: '𝄽', song: 'saints',
        steps: [
          { t: 'learn', title: 'Silence counts too', text: 'A <b>rest</b> means “don’t play”, but keep counting! This song also starts with a <b>pickup</b>: a few notes before the first full bar.', staff: 'C4 E4 F4 | G4/1 | r C4 E4 F4 |' },
          { t: 'play', title: 'When the Saints: your own pace', song: 'saints', hands: 'R', mode: 'wait', hideOther: true },
          { t: 'play', title: 'When the Saints: with the beat', song: 'saints', hands: 'R', mode: 'timed', tempo: 0.8, hideOther: true },
        ],
      },
    ],
  },
  {
    id: 'u3', title: 'A, B and the Octave', subtitle: 'Stretch past five fingers', color: '#EC4899',
    lessons: [
      {
        id: 'l-a', title: 'Meet A', icon: '♪',
        steps: [
          { t: 'learn', title: 'Meet A', text: '<b>A</b> sits between the 2nd and 3rd black keys of the group of 3. To reach it, keep your thumb on C and let your hand open up: <b>finger 5 stretches to A</b> and finger 4 takes G.', keys: [60, 62, 64, 65, 67, 69], range: [55, 76], labels: true },
          { t: 'learn', title: 'A on the staff', text: 'A sits in the <b>second space</b> of the staff, right above G.', staff: 'F4 G4 A4/2 |' },
          { t: 'play', title: 'G and A', song: ex('G4@4 A4@5 G4@4 A4@5 | G4@4/2 A4@5/2 | A4@5 G4@4 F4@3 E4@2 | D4@1/2 C4@1/2 |'), mode: 'wait' },
          { t: 'play', title: 'Twinkle, Twinkle: first line', song: 'twinkle', hands: 'R', mode: 'wait', range: [1, 4], hideOther: true },
        ],
      },
      {
        id: 'l-twinkle', title: 'Twinkle, Twinkle', icon: '★', song: 'twinkle',
        steps: [
          { t: 'play', title: 'Twinkle: your own pace', song: 'twinkle', hands: 'R', mode: 'wait', hideOther: true },
          { t: 'play', title: 'Twinkle: with the beat', song: 'twinkle', hands: 'R', mode: 'timed', tempo: 0.85, hideOther: true },
        ],
      },
      {
        id: 'l-b-scale', title: 'B & the C Major Scale', icon: '↗',
        steps: [
          { t: 'learn', title: 'Meet B', text: '<b>B</b> is the last white key before the next C, just to the <b>right of the group of 3</b> black keys. Now you know all seven letters: <b>C D E F G A B</b>, then it starts over.', keys: [60, 62, 64, 65, 67, 69, 71, 72], range: [55, 76], labels: true },
          { t: 'learn', title: 'Thumb under!', text: 'To play all eight notes from C to C, play <b>C D E</b> with fingers 1-2-3, then <b>tuck your thumb under</b> to land on F. Continue <b>G A B C</b> with 2-3-4-5. Coming down, cross finger 3 over your thumb.', keys: [60, 62, 64, 65, 67, 69, 71, 72], fingers: { 60: 1, 62: 2, 64: 3, 65: 1, 67: 2, 69: 3, 71: 4, 72: 5 }, range: [55, 76] },
          { t: 'play', title: 'C major scale, your own pace', song: ex('C4@1 D4@2 E4@3 F4@1 | G4@2 A4@3 B4@4 C5@5 | C5@5 B4@4 A4@3 G4@2 | F4@1 E4@3 D4@2 C4@1 |'), mode: 'wait' },
          { t: 'play', title: 'C major scale with the beat', song: ex('C4@1 D4@2 E4@3 F4@1 | G4@2 A4@3 B4@4 C5@5 | C5@5 B4@4 A4@3 G4@2 | F4@1 E4@3 D4@2 C4@1 |', { bpm: 66 }), mode: 'timed' },
        ],
      },
      {
        id: 'l-london', title: 'London Bridge', icon: '★', song: 'london-bridge',
        steps: [
          { t: 'play', title: 'London Bridge: your own pace', song: 'london-bridge', hands: 'R', mode: 'wait', hideOther: true },
          { t: 'play', title: 'London Bridge: with the beat', song: 'london-bridge', hands: 'R', mode: 'timed', tempo: 0.85, hideOther: true },
        ],
      },
      {
        id: 'l-row', title: 'Row Your Boat (6/8)', icon: '⛵', song: 'row-row',
        steps: [
          { t: 'learn', title: 'A new time signature: 6/8', text: 'In <b>6/8</b> time, each bar has <b>six eighth notes</b>, felt in two big swaying beats: <b>1</b>-2-3-<b>4</b>-5-6. It reaches up to <b>high C</b>, an octave above Middle C.', staff: 'C4/4. C4/4. | C5/8 C5/8 C5/8 G4/8 G4/8 G4/8 |', time: [6, 8] },
          { t: 'play', title: 'Row, Row: your own pace', song: 'row-row', hands: 'R', mode: 'wait', hideOther: true },
          { t: 'play', title: 'Row, Row: with the beat', song: 'row-row', hands: 'R', mode: 'timed', tempo: 0.85, hideOther: true },
        ],
      },
      {
        id: 'l-birthday', title: 'Happy Birthday', icon: '🎂', song: 'happy-birthday',
        steps: [
          { t: 'learn', title: 'On the move', text: 'This one climbs all the way up to <b>high G</b>, so your hand has to travel. Follow the highlighted keys. It’s in <b>3/4</b> time: three beats per bar, like a waltz.', keys: [67, 69, 71, 72, 74, 76, 77, 79], range: [60, 84], labels: true },
          { t: 'play', title: 'Part 1, your own pace', song: 'happy-birthday', hands: 'R', mode: 'wait', range: [0, 4], hideOther: true },
          { t: 'play', title: 'Part 2, your own pace', song: 'happy-birthday', hands: 'R', mode: 'wait', range: [5, 8], hideOther: true },
          { t: 'play', title: 'The whole song with the beat', song: 'happy-birthday', hands: 'R', mode: 'timed', tempo: 0.85, hideOther: true },
        ],
      },
    ],
  },
  {
    id: 'u4', title: 'The Left Hand', subtitle: 'Bass clef and left-hand C position', color: '#F97316',
    lessons: [
      {
        id: 'l-bass-clef', title: 'Bass Clef', icon: '𝄢',
        steps: [
          { t: 'learn', title: 'Hello, left hand', text: 'Your left hand usually reads the <b>bass clef</b>: the lower staff. Its two dots wrap around the line for <b>F</b>.', staff: 'C3/2 F3/2 | G3/1 |', clef: 'bass' },
          { t: 'learn', title: 'Left-hand C position', text: 'Find the C <b>below</b> Middle C. Put your left <b>pinky (5)</b> on it and let your other fingers fall on D, E, F and G. Your <b>thumb (1)</b> lands on G. The numbers run backwards compared to your right hand!', keys: [48, 50, 52, 53, 55], fingers: LH_C, hand: 'L', range: [43, 64], labels: true },
          { t: 'play', title: 'Walk up and down with your left hand', song: exL('C3@5 D3@4 E3@3 F3@2 | G3@1/1 | G3@1 F3@2 E3@3 D3@4 | C3@5/1 |'), hands: 'L', mode: 'wait' },
          { t: 'play', title: 'Now with the beat', song: exL('C3@5 D3@4 E3@3 F3@2 | G3@1/1 | G3@1 F3@2 E3@3 D3@4 | C3@5/1 |', { bpm: 76 }), hands: 'L', mode: 'timed' },
        ],
      },
      {
        id: 'l-lh-melody', title: 'Left-Hand Melodies', icon: '♫',
        steps: [
          { t: 'play', title: 'Hot Cross Buns, left hand', song: exL('E3@3 D3@4 C3@5/2 | E3@3 D3@4 C3@5/2 | C3@5/8 C3/8 C3/8 C3/8 D3@4/8 D3/8 D3/8 D3/8 | E3@3 D3@4 C3@5/2 |'), hands: 'L', mode: 'wait' },
          { t: 'play', title: 'Mary, left hand', song: exL('E3@3 D3@4 C3@5 D3@4 | E3 E3 E3/2 | D3 D3 D3/2 | E3@3 G3@1 G3/2 | E3@3 D3@4 C3@5 D3@4 | E3 E3 E3 E3 | D3 D3 E3 D3 | C3@5/1 |'), hands: 'L', mode: 'wait' },
          { t: 'play', title: 'Mary, left hand, with the beat', song: exL('E3@3 D3@4 C3@5 D3@4 | E3 E3 E3/2 | D3 D3 D3/2 | E3@3 G3@1 G3/2 | E3@3 D3@4 C3@5 D3@4 | E3 E3 E3 E3 | D3 D3 E3 D3 | C3@5/1 |', { bpm: 84 }), hands: 'L', mode: 'timed' },
        ],
      },
      {
        id: 'l-lh-ode', title: 'Ode to Joy, Left Hand', icon: '★',
        steps: [
          { t: 'play', title: 'Ode to Joy, left hand: your own pace', song: exL('E3@3 E3 F3@2 G3@1 | G3 F3 E3 D3@4 | C3@5 C3 D3 E3 | E3/4. D3/8 D3/2 | E3@3 E3 F3 G3 | G3 F3 E3 D3 | C3@5 C3 D3 E3 | D3/4. C3/8 C3/2 |'), hands: 'L', mode: 'wait' },
          { t: 'play', title: 'With the beat', song: exL('E3@3 E3 F3@2 G3@1 | G3 F3 E3 D3@4 | C3@5 C3 D3 E3 | E3/4. D3/8 D3/2 | E3@3 E3 F3 G3 | G3 F3 E3 D3 | C3@5 C3 D3 E3 | D3/4. C3/8 C3/2 |', { bpm: 84 }), hands: 'L', mode: 'timed' },
        ],
      },
      {
        id: 'l-lh-bass', title: 'Bass Notes', icon: '♩',
        steps: [
          { t: 'learn', title: 'The left hand’s job', text: 'In most music the left hand plays <b>low, long notes</b> that support the melody. C and G (pinky and thumb) are the most common pair.', keys: [48, 55], fingers: { 48: 5, 55: 1 }, hand: 'L', range: [43, 64], labels: true },
          { t: 'play', title: 'Hold each bass note', song: exL('C3@5/1 | G3@1/1 | C3@5/2 G3@1/2 | C3@5/1 |', { bpm: 80 }), hands: 'L', mode: 'timed' },
          { t: 'play', title: 'Steady quarter notes', song: exL('C3@5 G3@1 C3 G3 | C3 G3 C3 G3 | G3 C3 G3 C3 | C3/1 |', { bpm: 84 }), hands: 'L', mode: 'timed' },
        ],
      },
    ],
  },
  {
    id: 'u5', title: 'Hands Together', subtitle: 'Coordinate both hands', color: '#10B981',
    lessons: [
      {
        id: 'l-turns', title: 'Taking Turns', icon: '⇄',
        steps: [
          { t: 'learn', title: 'Two hands, one song', text: 'Start with the hands taking turns: the right hand plays a phrase, then the left hand answers. Notes on the <b>top staff</b> are for your right hand and notes on the <b>bottom staff</b> are for your left.', keys: [48, 55, 60, 67], range: [43, 76] },
          { t: 'play', title: 'Question and answer', song: ex('C4@1 D4@2 E4@3/2 | r/1 | E4@3 D4@2 C4@1/2 | r/1 |', { lh: 'r/1 | G3@1 F3@2 E3@3/2 | r/1 | E3@3 D3@4 C3@5/2 |' }), hands: 'both', mode: 'wait' },
          { t: 'play', title: 'Question and answer, with the beat', song: ex('C4@1 D4@2 E4@3/2 | r/1 | E4@3 D4@2 C4@1/2 | r/1 |', { lh: 'r/1 | G3@1 F3@2 E3@3/2 | r/1 | E3@3 D3@4 C3@5/2 |', bpm: 76 }), hands: 'both', mode: 'timed' },
        ],
      },
      {
        id: 'l-mary-both', title: 'Mary, Both Hands', icon: '★', song: 'mary',
        steps: [
          { t: 'learn', title: 'Together at last', text: 'The left hand plays one long note per bar while the right hand plays the melody. Press both notes <b>at the same time</b> at the start of each bar.', keys: [48, 55, 64], range: [43, 76] },
          { t: 'play', title: 'Left hand alone first', song: 'mary', hands: 'L', mode: 'wait' },
          { t: 'play', title: 'Both hands, your own pace', song: 'mary', hands: 'both', mode: 'wait' },
          { t: 'play', title: 'Both hands with the beat', song: 'mary', hands: 'both', mode: 'timed', tempo: 0.75 },
        ],
      },
      {
        id: 'l-ode-both', title: 'Ode to Joy, Both Hands', icon: '★', song: 'ode',
        steps: [
          { t: 'play', title: 'Parts 1–2, both hands', song: 'ode', hands: 'both', mode: 'wait', range: [1, 8] },
          { t: 'play', title: 'Parts 3–4, both hands', song: 'ode', hands: 'both', mode: 'wait', range: [9, 16] },
          { t: 'play', title: 'The whole piece with the beat', song: 'ode', hands: 'both', mode: 'timed', tempo: 0.75 },
        ],
      },
      { id: 'l-jingle-both', title: 'Jingle Bells, Both Hands', icon: '★', song: 'jingle-bells', steps: [{ t: 'plan', song: 'jingle-bells', only: 'both' }] },
      { id: 'l-frere', title: 'Frère Jacques', icon: '★', song: 'frere-jacques', steps: [{ t: 'plan', song: 'frere-jacques' }] },
    ],
  },
  {
    id: 'u6', title: 'Sharps & Flats', subtitle: 'The black keys and new key signatures', color: '#0EA5E9',
    lessons: [
      {
        id: 'l-black-keys', title: 'The Black Keys', icon: '♯',
        steps: [
          { t: 'learn', title: 'Sharps ♯ and flats ♭', text: 'A <b>sharp ♯</b> raises a note to the very next key on the <b>right</b>. A <b>flat ♭</b> lowers it to the next key on the <b>left</b>. So most black keys have two names: <b>C♯ is the same key as D♭</b>.', keys: [60, 61, 62], range: [55, 72], labels: true },
          { t: 'learn', title: 'Half steps', text: 'Moving from any key to the <b>very next key</b>, black or white, is a <b>half step</b>. Playing every key in a row is called the <b>chromatic scale</b>. Use your thumb on white keys and finger 3 on black keys.', staff: 'C4 C#4 D4 D#4 | E4 F4 F#4 G4 |' },
          { t: 'play', title: 'Chromatic scale, your own pace', song: ex('C4@1 C#4@3 D4@1 D#4@3 | E4@1 F4@2 F#4@3 G4@1 | G4@1 F#4@3 F4@2 E4@1 | D#4@3 D4@1 C#4@3 C4@1 |'), mode: 'wait' },
          { t: 'play', title: 'Spot the sharps', song: ex('C4@1 D4@2 E4@3 F#4@4 | G4@5/1 | G4@5 F#4@4 E4@3 D4@2 | C4@1/1 |'), mode: 'wait' },
        ],
      },
      {
        id: 'l-g-major', title: 'G Position & F♯', icon: 'G',
        steps: [
          { t: 'learn', title: 'Key signatures', text: 'In <b>G major</b>, every F is played as <b>F♯</b>. Instead of writing ♯ on every F, the sharp appears once at the start of each line: the <b>key signature</b>.', staff: 'G4 A4 B4 C5 | D5 E5 F#5 G5 |', key: 1 },
          { t: 'play', title: 'G major scale', song: ex('G4@1 A4@2 B4@3 C5@1 | D5@2 E5@3 F#5@4 G5@5 | G5@5 F#5@4 E5@3 D5@2 | C5@1 B4@3 A4@2 G4@1 |', { key: 1 }), mode: 'wait' },
          { t: 'play', title: 'Old MacDonald in G', song: 'old-macdonald', hands: 'R', mode: 'wait', hideOther: true },
          { t: 'play', title: 'Minuet in G: the opening', song: 'minuet-g', hands: 'R', mode: 'wait', range: [1, 4], hideOther: true },
        ],
      },
      {
        id: 'l-f-major', title: 'F Position & B♭', icon: '♭',
        steps: [
          { t: 'learn', title: 'F major', text: 'Put your right thumb on <b>F</b>. Your fingers cover <b>F G A B♭ C</b>. In F major every B is <b>B♭</b>: the black key just left of B. The key signature shows one flat.', keys: [65, 67, 69, 70, 72], fingers: { 65: 1, 67: 2, 69: 3, 70: 4, 72: 5 }, range: [60, 77], labels: true },
          { t: 'play', title: 'Ode to Joy in F: your own pace', song: 'ode-in-f', hands: 'R', mode: 'wait', hideOther: true },
          { t: 'play', title: 'Ode to Joy in F: with the beat', song: 'ode-in-f', hands: 'R', mode: 'timed', tempo: 0.8, hideOther: true },
        ],
      },
      {
        id: 'l-fur-elise', title: 'Für Elise', icon: '★', song: 'fur-elise',
        steps: [
          { t: 'learn', title: 'E and D♯', text: 'Für Elise famously rocks between <b>E</b> and <b>D♯</b>. Use fingers <b>5 and 4</b>. The left hand plays quick broken chords between the melody notes.', keys: [75, 76], fingers: { 76: 5, 75: 4 }, range: [57, 81], labels: true },
          { t: 'plan', song: 'fur-elise' },
        ],
      },
      {
        id: 'l-greensleeves', title: 'Greensleeves', icon: '★', song: 'greensleeves',
        steps: [
          { t: 'learn', title: 'Minor keys', text: '<b>Greensleeves</b> is in <b>A minor</b>, which has no sharps or flats in its key signature. But watch for <b>G♯</b>: it gives the melody its haunting pull.', keys: [68], range: [57, 81], labels: true },
          { t: 'play', title: 'Melody, your own pace', song: 'greensleeves', hands: 'R', mode: 'wait', hideOther: true },
          { t: 'play', title: 'Both hands, your own pace', song: 'greensleeves', hands: 'both', mode: 'wait' },
          { t: 'play', title: 'Both hands with the beat', song: 'greensleeves', hands: 'both', mode: 'timed', tempo: 0.8 },
        ],
      },
    ],
  },
  {
    id: 'u7', title: 'Chords', subtitle: 'Triads, inversions and progressions', color: '#EAB308',
    lessons: [
      {
        id: 'l-first-chord', title: 'Your First Chord', icon: '♬',
        steps: [
          { t: 'learn', title: 'What is a chord?', text: 'A <b>chord</b> is three or more notes played <b>together</b>. The <b>C major chord</b> is <b>C, E and G</b>. See the pattern? Play a key, skip a key, play a key. Use fingers <b>1, 3 and 5</b>.', keys: [60, 64, 67], fingers: { 60: 1, 64: 3, 67: 5 }, range: [55, 76], chords: [{ label: 'C major', notes: [60, 64, 67] }] },
          { t: 'learn', title: 'Tip for chords', text: 'Press all three keys at <b>exactly the same moment</b>. With the microphone, play firmly so every note rings out. A MIDI connection hears chords perfectly.', staff: '(C4 E4 G4)/1 |' },
          { t: 'play', title: 'C major chord, your own pace', song: ex('(C4@1 E4@3 G4@5)/1 | (C4 E4 G4)/2 (C4 E4 G4)/2 | (C4 E4 G4) (C4 E4 G4) (C4 E4 G4)/2 | (C4 E4 G4)/1 |'), mode: 'wait' },
          { t: 'play', title: 'C major chord, with the beat', song: ex('(C4@1 E4@3 G4@5)/1 | (C4 E4 G4)/2 (C4 E4 G4)/2 | (C4 E4 G4) (C4 E4 G4) (C4 E4 G4)/2 | (C4 E4 G4)/1 |', { bpm: 70 }), mode: 'timed' },
        ],
      },
      {
        id: 'l-fg-chords', title: 'F and G Chords', icon: '♬',
        steps: [
          { t: 'learn', title: 'Same shape, new chords', text: 'Slide the same “skip a key” shape up: <b>F major = F A C</b> and <b>G major = G B D</b>. C, F and G are the three most important chords in C major.', keys: [65, 69, 72], fingers: { 65: 1, 69: 3, 72: 5 }, range: [55, 79], chords: [{ label: 'C', notes: [60, 64, 67] }, { label: 'F', notes: [65, 69, 72] }, { label: 'G', notes: [67, 71, 74] }] },
          { t: 'play', title: 'C – F – G – C', song: ex('(C4@1 E4@3 G4@5)/1 | (F4@1 A4@3 C5@5)/1 | (G4@1 B4@3 D5@5)/1 | (C4@1 E4@3 G4@5)/1 |'), mode: 'wait' },
          { t: 'play', title: 'With the beat', song: ex('(C4 E4 G4)/2 (C4 E4 G4)/2 | (F4 A4 C5)/2 (F4 A4 C5)/2 | (G4 B4 D5)/2 (G4 B4 D5)/2 | (C4 E4 G4)/1 |', { bpm: 70 }), mode: 'timed' },
        ],
      },
      {
        id: 'l-lh-chords', title: 'Left-Hand Chords', icon: '♬',
        steps: [
          { t: 'learn', title: 'Chords that barely move', text: 'Left hand <b>C chord</b>: C-E-G with fingers 5-3-1. For <b>F</b>, keep C and move the others: <b>C-F-A</b> (5-2-1). For <b>G7</b>: <b>B-F-G</b> (5-2-1). Tiny moves, big sound!', keys: [48, 52, 55], fingers: { 48: 5, 52: 3, 55: 1 }, hand: 'L', range: [43, 64], chords: [{ label: 'C', notes: [48, 52, 55] }, { label: 'F', notes: [48, 53, 57] }, { label: 'G7', notes: [47, 53, 55] }] },
          { t: 'play', title: 'C – F – C – G7 – C', song: exL('(C3@5 E3@3 G3@1)/1 | (C3@5 F3@2 A3@1)/1 | (C3@5 E3@3 G3@1)/1 | (B2@5 F3@2 G3@1)/1 | (C3@5 E3@3 G3@1)/1 |'), hands: 'L', mode: 'wait' },
          { t: 'play', title: 'With the beat', song: exL('(C3 E3 G3)/2 (C3 E3 G3)/2 | (C3 F3 A3)/2 (C3 F3 A3)/2 | (C3 E3 G3)/2 (C3 E3 G3)/2 | (B2 F3 G3)/2 (B2 F3 G3)/2 | (C3 E3 G3)/1 |', { bpm: 70 }), hands: 'L', mode: 'timed' },
        ],
      },
      {
        id: 'l-melody-chords', title: 'Melody + Chords', icon: '★', song: 'twinkle-chords',
        steps: [
          { t: 'play', title: 'Left-hand chords alone', song: 'twinkle-chords', hands: 'L', mode: 'wait', range: [1, 4] },
          { t: 'play', title: 'Both hands, first line', song: 'twinkle-chords', hands: 'both', mode: 'wait', range: [1, 4] },
          { t: 'play', title: 'Both hands, the whole song', song: 'twinkle-chords', hands: 'both', mode: 'wait' },
          { t: 'play', title: 'With the beat', song: 'twinkle-chords', hands: 'both', mode: 'timed', tempo: 0.8 },
        ],
      },
      {
        id: 'l-minor', title: 'Minor Chords', icon: '☾', song: 'four-chords',
        steps: [
          { t: 'learn', title: 'Major vs. minor', text: 'Lower the <b>middle note</b> of a major chord by one half step and it becomes <b>minor</b>: C-E-G becomes C-E♭-G. Tap both to hear the difference: bright vs. moody.', keys: [60, 63, 67], range: [55, 76], chords: [{ label: 'C major', notes: [60, 64, 67] }, { label: 'C minor', notes: [60, 63, 67] }, { label: 'A minor', notes: [57, 60, 64] }] },
          { t: 'learn', title: 'The four-chord progression', text: '<b>C – G – Am – F</b> powers a huge number of pop songs. <b>A minor = A C E</b>: all white keys. The right hand uses close <b>inversions</b> so it barely moves.', chords: [{ label: 'C', notes: [60, 64, 67] }, { label: 'G', notes: [59, 62, 67] }, { label: 'Am', notes: [60, 64, 69] }, { label: 'F', notes: [60, 65, 69] }] },
          { t: 'play', title: 'Right-hand chords', song: 'four-chords', hands: 'R', mode: 'wait', range: [1, 4] },
          { t: 'play', title: 'Both hands', song: 'four-chords', hands: 'both', mode: 'wait' },
          { t: 'play', title: 'With the beat', song: 'four-chords', hands: 'both', mode: 'timed', tempo: 0.85 },
        ],
      },
      {
        id: 'l-inversions', title: 'Inversions', icon: '⟳',
        steps: [
          { t: 'learn', title: 'Same notes, new order', text: 'A C chord can be stacked three ways: <b>C-E-G</b> (root position), <b>E-G-C</b> (1st inversion) and <b>G-C-E</b> (2nd inversion). Inversions let you change chords with tiny hand movements.', chords: [{ label: 'Root', notes: [60, 64, 67] }, { label: '1st inv.', notes: [64, 67, 72] }, { label: '2nd inv.', notes: [67, 72, 76] }], keys: [60, 64, 67, 72, 76], range: [55, 81] },
          { t: 'play', title: 'Climb the inversions', song: ex('(C4@1 E4@3 G4@5)/1 | (E4@1 G4@2 C5@5)/1 | (G4@1 C5@3 E5@5)/1 | (C5@1 E5@3 G5@5)/1 |'), mode: 'wait' },
          { t: 'play', title: 'Up and back down, with the beat', song: ex('(C4 E4 G4)/2 (E4 G4 C5)/2 | (G4 C5 E5)/2 (C5 E5 G5)/2 | (G4 C5 E5)/2 (E4 G4 C5)/2 | (C4 E4 G4)/1 |', { bpm: 66 }), mode: 'timed' },
        ],
      },
      {
        id: 'l-broken', title: 'Broken Chords', icon: '≋',
        steps: [
          { t: 'learn', title: 'Arpeggios & Alberti bass', text: 'Play chord notes one at a time and you get a <b>broken chord</b>. The <b>Alberti bass</b> pattern (bottom, top, middle, top) powers lots of classical music.', staff: 'C3/8 G3/8 E3/8 G3/8 C3/8 G3/8 E3/8 G3/8 |', clef: 'bass' },
          { t: 'play', title: 'Alberti bass, your own pace', song: exL('C3@5/8 G3@1/8 E3@3/8 G3@1/8 C3/8 G3/8 E3/8 G3/8 | C3@5/8 A3@1/8 F3@2/8 A3/8 C3/8 A3/8 F3/8 A3/8 | B2@5/8 G3@1/8 F3@2/8 G3/8 B2/8 G3/8 F3/8 G3/8 | C3@5/8 G3@1/8 E3@3/8 G3/8 C3/2 |'), hands: 'L', mode: 'wait' },
          { t: 'play', title: 'Alberti bass with the beat', song: exL('C3@5/8 G3@1/8 E3@3/8 G3@1/8 C3/8 G3/8 E3/8 G3/8 | C3@5/8 A3@1/8 F3@2/8 A3/8 C3/8 A3/8 F3/8 A3/8 | B2@5/8 G3@1/8 F3@2/8 G3/8 B2/8 G3/8 F3/8 G3/8 | C3@5/8 G3@1/8 E3@3/8 G3/8 C3/2 |', { bpm: 60 }), hands: 'L', mode: 'timed' },
        ],
      },
      {
        id: 'l-canon-chords', title: 'Canon in D Chords', icon: '★', song: 'canon-chords',
        steps: [
          { t: 'learn', title: 'Pachelbel’s progression', text: '<b>D – A – Bm – F♯m – G – D – G – A</b>. D major has two sharps: <b>F♯ and C♯</b>. The left hand walks the famous bass line while the right hand plays chords in close inversions.', chords: [{ label: 'D', notes: [66, 69, 74] }, { label: 'A', notes: [64, 69, 73] }, { label: 'Bm', notes: [62, 66, 71] }, { label: 'F♯m', notes: [61, 66, 69] }] },
          { t: 'plan', song: 'canon-chords' },
        ],
      },
    ],
  },
  {
    id: 'u9', title: 'Gospel Organ', subtitle: 'Church chords on your keyboard\u2019s organ mode', color: '#7C3AED',
    lessons: [
      {
        id: 'l-g-amen', title: 'The Amen', icon: '\u271D', song: 'gospel-amen',
        steps: [
          { t: 'learn', title: 'Switch to organ', text: 'Set your keyboard to <b>Organ</b> mode, and in the app\u2019s <b>Settings \u203a My keyboard\u2019s sound</b> choose <b>Organ</b> so the listener knows. Organ notes don\u2019t fade: they ring <b>exactly as long as you hold the key</b>, so hold every chord for its full length.' },
          { t: 'learn', title: 'IV \u2192 I: the Amen', text: 'Gospel and hymns end on the <b>\u201cAmen\u201d cadence</b>: F chord to C chord. Keep <b>C</b> on top in both chords and only two fingers move.', chords: [{ label: 'C', notes: [64, 67, 72] }, { label: 'F/C', notes: [65, 69, 72] }], keys: [64, 65, 67, 69, 72], range: [55, 79] },
          { t: 'play', title: 'The Amen, your own pace', song: 'gospel-amen', hands: 'both', mode: 'wait' },
          { t: 'play', title: 'The Amen with the beat', song: 'gospel-amen', hands: 'both', mode: 'timed', tempo: 0.85 },
        ],
      },
      {
        id: 'l-g-blues', title: 'Dominant 7ths', icon: '7', song: 'gospel-blues',
        steps: [
          { t: 'learn', title: 'The 7th', text: 'Add the <b>flat 7th</b> to a major chord and it gets that bluesy, churchy pull: <b>C7 = C E G B\u266d</b>. On the organ we play just the colorful top notes (E G B\u266d) and let the left hand take the root.', chords: [{ label: 'C7', notes: [48, 64, 67, 70] }, { label: 'F7', notes: [41, 63, 65, 69] }, { label: 'G7', notes: [43, 65, 67, 71] }] },
          { t: 'plan', song: 'gospel-blues' },
        ],
      },
      { id: 'l-g-walkup', title: 'Walk-Up Bass', icon: '\u2197', song: 'gospel-walkup', steps: [
        { t: 'learn', title: 'Walking into the next chord', text: 'Gospel bass lines <b>walk</b>: instead of jumping from C to F, the left hand climbs <b>C D E \u2192 F</b>. Then <b>F F\u266f G \u2192 C</b> brings it home.', keys: [48, 50, 52, 53, 54, 55], hand: 'L', range: [43, 64], labels: true },
        { t: 'plan', song: 'gospel-walkup' },
      ] },
      { id: 'l-g-passing', title: 'Passing Diminished', icon: '\u00B0', song: 'gospel-passing', steps: [
        { t: 'learn', title: 'The church passing chord', text: 'Between <b>C</b> and <b>Dm7</b>, gospel players slip in <b>C\u266fdim7</b>: the bass rises a half step (C \u2192 C\u266f \u2192 D) while the right hand barely moves. It\u2019s the sound of a thousand Sunday mornings.', chords: [{ label: 'C', notes: [48, 64, 67, 72] }, { label: 'C\u266fdim7', notes: [49, 64, 67, 70] }, { label: 'Dm7', notes: [50, 65, 69, 72] }, { label: 'G7', notes: [43, 65, 67, 71] }] },
        { t: 'plan', song: 'gospel-passing' },
      ] },
      { id: 'l-g-251', title: 'Gospel 2-5-1', icon: '\u266A', song: 'gospel-251', steps: [{ t: 'plan', song: 'gospel-251' }] },
      { id: 'l-g-saints', title: 'Saints on the Organ', icon: '\u2605', song: 'saints-organ', steps: [{ t: 'plan', song: 'saints-organ' }] },
    ],
  },
  {
    id: 'u8', title: 'Classics', subtitle: 'Real pieces, broken into parts', color: '#E11D48',
    lessons: [
      { id: 'l-c-saints', title: 'When the Saints, Both Hands', icon: '★', song: 'saints', steps: [{ t: 'plan', song: 'saints', only: 'both' }] },
      { id: 'l-c-canon', title: 'Canon in D', icon: '★', song: 'canon-d', steps: [{ t: 'plan', song: 'canon-d' }] },
      { id: 'l-c-minuet', title: 'Minuet in G', icon: '★', song: 'minuet-g', steps: [{ t: 'plan', song: 'minuet-g' }] },
      { id: 'l-c-birthday', title: 'Happy Birthday, Both Hands', icon: '★', song: 'happy-birthday', steps: [{ t: 'plan', song: 'happy-birthday', only: 'both' }] },
      { id: 'l-c-auclair', title: 'Au Clair de la Lune', icon: '★', song: 'au-clair', steps: [{ t: 'plan', song: 'au-clair' }] },
      { id: 'l-c-yankee', title: 'Yankee Doodle', icon: '★', song: 'yankee-doodle', steps: [{ t: 'plan', song: 'yankee-doodle' }] },
    ],
  },
];

// Boss battles: the last world of each galaxy. Pass (75%+, with the beat) to move on.
const BOSSES = {
  u1: ['boss-u1', 'The Keeper of Middle C'],
  u2: ['boss-u2', 'The Pentarch'],
  u3: ['boss-u3', 'Octavian the Wide'],
  u4: ['boss-u4', 'Lord of the Low End'],
  u5: ['boss-u5', 'The Twin Sentinels'],
  u6: ['boss-u6', 'The Chroma Warden'],
  u7: ['boss-u7', 'The Triad Monarch'],
  u9: ['boss-u9', 'The Choir Master'],
  u8: ['fur-elise', 'The Old Light Maestro'],
};
for (const unit of COURSE) {
  const b = BOSSES[unit.id];
  if (!b || unit.lessons.some((l) => l.boss)) continue;
  unit.lessons.push({ id: `boss-${unit.id}`, title: b[0] === 'fur-elise' ? 'Final Exam: F\u00fcr Elise' : 'Boss Battle', icon: '\u2694', song: b[0], boss: true, guardian: b[1], steps: [{ t: 'boss', song: b[0] }] });
}

export function allLessons() {
  return COURSE.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u })));
}
