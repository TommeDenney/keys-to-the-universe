// Knowledge checks: a short test in every galaxy, on what that galaxy teaches
// (reading the staff, rhythm, keys, chords, musical words…). Not a boss: no song,
// just questions. Pass with 60% to complete the world; 75% and 90% earn more stars.
//
// Question kinds:
//   { q, c: [right, wrong, wrong, wrong], why, staff?, clef?, key? }   multiple choice
//                                                                     (shuffled; the first is right)
//   { q, play: [midi, …], any?: true, why, keys?, range? }            play it on your piano
//                                                                     (any: any octave; several = a chord)

const C = (q, c, why, extra = {}) => ({ q, c, why, ...extra });
const PLAY = (q, play, why, extra = {}) => ({ q, play, why, ...extra });
const STAFF = (staff, clef = 'treble', key = 0) => ({ staff, clef, key });

export const QUIZZES = {
  u1: [
    C('Black keys come in groups of…', ['2 and 3', '1 and 2', '3 and 4', '4 and 5'], 'The 2-and-3 pattern repeats all the way up the keyboard. It’s your map for finding notes.'),
    C('Which finger is number 1?', ['Your thumb', 'Your pinky', 'Your pointer finger', 'Your middle finger'], 'Thumbs are 1 and pinkies are 5, on both hands.'),
    PLAY('Play any C on your piano.', [60], 'C is the white key just to the left of every group of 2 black keys.', { any: true }),
    C('What note is this?', ['C', 'D', 'E', 'G'], 'Middle C gets its own short line below the staff.', STAFF('C4/1 |')),
    C('What note is this?', ['E', 'D', 'F', 'C'], 'E sits right on the bottom line of the staff.', STAFF('E4/1 |')),
    PLAY('Play D. Hint: it sits between the two black keys.', [62], 'D is right between the 2 black keys.', { any: true }),
    C('Where is E?', ['Just right of the 2 black keys', 'Between the 2 black keys', 'Just left of the 2 black keys', 'Just left of the 3 black keys'], 'E is the white key just to the right of the group of 2.'),
  ],
  u2: [
    C('What note is this?', ['F', 'G', 'E', 'A'], 'F sits in the first space of the staff.', STAFF('F4/1 |')),
    C('What note is this?', ['G', 'F', 'A', 'B'], 'G sits on the second line.', STAFF('G4/1 |')),
    C('How many beats does a half note get?', ['2', '1', '4', '3'], 'A half note (hollow, with a stem) lasts 2 beats.'),
    C('This note is hollow with no stem. How many beats does it last?', ['4', '2', '1', '3'], 'That’s a whole note: 4 beats.', STAFF('E4/1 |')),
    C('A dot after a note adds half its length. How long is a dotted half note?', ['3 beats', '2 beats', '4 beats', '2½ beats'], '2 beats + half of 2 = 3 beats.'),
    C('What does a rest mean?', ['Don’t play, but keep counting', 'Stop the song', 'Play softly', 'Hold the last note'], 'Silence counts too: keep the beat going through a rest.'),
    C('In C position, which finger plays G?', ['5 (pinky)', '4', '3', '1 (thumb)'], 'C position puts one finger on each key from C (thumb) to G (pinky).'),
    PLAY('Play F.', [65], 'F is the white key just to the left of the group of 3 black keys.', { any: true }),
  ],
  u3: [
    C('What note is this?', ['A', 'G', 'B', 'F'], 'A sits in the second space, right above G.', STAFF('A4/1 |')),
    C('What note is this?', ['B', 'A', 'C', 'G'], 'B sits on the middle line of the staff.', STAFF('B4/1 |')),
    C('What letter comes after B?', ['C', 'A', 'H', 'D'], 'The musical alphabet is C D E F G A B, then it starts over at C.'),
    C('Playing the C major scale up, which finger tucks under to reach F?', ['Your thumb', 'Your pinky', 'Finger 3', 'Finger 2'], 'Play C D E with 1-2-3, then tuck your thumb under to land on F.'),
    C('In 6/8 time, how many eighth notes fit in each bar?', ['6', '8', '3', '4'], '6/8 has six eighth notes per bar, felt in two big swaying beats.'),
    C('In 3/4 time, how many beats are in each bar?', ['3', '4', '2', '6'], 'Three beats per bar, like a waltz.'),
    C('An octave is…', ['The same letter, 8 notes higher or lower', 'Five notes in a row', 'Two notes played together', 'A very fast scale'], 'C to the next C is an octave: 8 white keys counting both ends.'),
    PLAY('Play A.', [69], 'A sits between the 2nd and 3rd black keys of the group of 3.', { any: true }),
  ],
  u4: [
    C('Which hand usually reads the bass clef?', ['The left hand', 'The right hand', 'Both hands at once', 'Neither: it’s for singers'], 'The bass clef is the lower staff, usually for the left hand.'),
    C('The bass clef’s two dots wrap around which line?', ['F', 'G', 'C', 'A'], 'That’s why it’s also called the F clef.'),
    C('In the bass clef, what note is this?', ['C', 'A', 'E', 'G'], 'The C below Middle C sits in the second space of the bass clef.', STAFF('C3/1 |', 'bass')),
    C('In the bass clef, what note is this?', ['G', 'F', 'B', 'E'], 'G sits in the top space of the bass clef.', STAFF('G3/1 |', 'bass')),
    C('In left-hand C position, which finger plays C?', ['5 (pinky)', '1 (thumb)', '3', '2'], 'The left-hand numbers run backwards: pinky on C, thumb on G.'),
    C('What does the left hand usually do?', ['Plays low notes that support the melody', 'Plays the melody', 'Plays only black keys', 'Rests the whole time'], 'Low, long notes under the melody, very often C and G.'),
    PLAY('Play the C just below Middle C.', [48], 'That’s where your left pinky goes in C position.', { range: [36, 72] }),
  ],
  u5: [
    C('Notes on the top staff are for…', ['Your right hand', 'Your left hand', 'Both hands', 'The pedal'], 'Top staff: right hand. Bottom staff: left hand.'),
    C('Two notes line up one above the other, one on each staff. You…', ['Play them at the same time', 'Play the top one first', 'Play the bottom one first', 'Skip them'], 'Notes lined up vertically are played together.'),
    C('The two staves joined by a brace make the…', ['Grand staff', 'Big bar', 'Double clef', 'Duet line'], 'Treble on top, bass below, joined by a brace: the grand staff.'),
    C('Which hand usually plays the melody?', ['The right hand', 'The left hand', 'Whichever is stronger', 'Neither'], 'Most of the time the right hand sings the tune and the left hand supports it.'),
    C('A great way to learn a new piece hands together:', ['Each hand alone first, then slowly together', 'Play it fast straight away', 'Only practise the left hand', 'Only practise the last line'], 'Hands separately, then together at a slow, steady tempo.'),
    PLAY('Play Middle C and the C below it at the same time.', [48, 60], 'One C in each hand: that’s playing hands together!', { range: [36, 72] }),
  ],
  u6: [
    C('A sharp ♯…', ['Raises a note to the very next key on the right', 'Lowers a note to the next key on the left', 'Makes a note louder', 'Makes a note shorter'], 'Sharp = up a half step. Flat ♭ = down a half step.'),
    C('C♯ is the same key as…', ['D♭', 'C♭', 'D♯', 'B♯'], 'Most black keys have two names: C♯ = D♭.'),
    C('Moving to the very next key (black or white) is a…', ['Half step', 'Whole step', 'Octave', 'Chord'], 'Every key in a row, in half steps, is the chromatic scale.'),
    C('This key signature has one sharp. Which notes are played sharp?', ['Every F', 'Every C', 'Every G', 'Every B'], 'One sharp in the key signature means G major: every F is F♯.', STAFF('G4/1 |', 'treble', 1)),
    C('In F major, every B is played as…', ['B♭', 'B♯', 'B (natural)', 'C'], 'F major’s key signature has one flat: B♭.'),
    C('How many sharps or flats does A minor have?', ['None', 'One sharp', 'One flat', 'Two sharps'], 'A minor shares C major’s key signature: no sharps or flats.'),
    PLAY('Play F♯.', [66], 'The black key just to the right of F.', { any: true }),
    PLAY('Play B♭.', [70], 'The black key just to the left of B.', { any: true }),
  ],
  u7: [
    C('The C major chord is…', ['C, E and G', 'C, D and E', 'C, F and A', 'C, E and A'], 'Play a key, skip a key, play a key: C-E-G.'),
    PLAY('Play a C major chord (all three notes together).', [60, 64, 67], 'C, E and G with fingers 1, 3 and 5.', { any: true }),
    C('Lower the middle note of a major chord by a half step and it becomes…', ['Minor', 'Louder', 'A scale', 'An octave'], 'C-E-G becomes C-E♭-G: bright becomes moody.'),
    C('E–G–C is the C chord in…', ['1st inversion', 'Root position', '2nd inversion', 'C minor'], 'Root position C-E-G, 1st inversion E-G-C, 2nd inversion G-C-E.'),
    C('Playing a chord’s notes one at a time is called…', ['A broken chord (arpeggio)', 'A cluster', 'A trill', 'A rest'], 'Broken chords and arpeggios spread a chord out in time.'),
    C('The Alberti bass pattern goes…', ['Bottom, top, middle, top', 'Top, middle, bottom', 'Bottom, middle, top', 'All three together'], 'It powers lots of classical music.'),
    PLAY('Play an F major chord.', [65, 69, 72], 'Same skip-a-key shape, starting on F: F-A-C.', { any: true }),
    C('The famous four-chord pop progression is…', ['C – G – Am – F', 'C – D – E – F', 'C – F – C – F', 'Am – Dm – Em – Am'], 'C – G – Am – F powers a huge number of songs.'),
  ],
  u9: [
    C('The “Amen” cadence moves from…', ['The F chord to the C chord (IV → I)', 'C to G', 'G to C', 'A minor to F'], 'IV to I: the sound at the end of a hymn.'),
    C('On the organ, a note…', ['Rings exactly as long as you hold the key', 'Fades away quickly', 'Only plays loudly', 'Needs the sustain pedal'], 'Organ notes don’t fade, so hold every chord for its full length.'),
    C('C7 adds which note to C, E and G?', ['B♭', 'B', 'A', 'D'], 'The flat 7th gives a dominant 7th its bluesy, churchy pull.'),
    PLAY('Play C7: C, E, G and B♭ together.', [60, 64, 67, 70], 'Or just the top notes E-G-B♭ with the left hand on C.', { any: true }),
    C('A walk-up bass from C to F climbs…', ['C, D, E → F', 'C, B, A → F', 'C, G → F', 'Straight from C to F'], 'Gospel bass lines walk step by step into the next chord.'),
    C('Between C and Dm7, gospel players slip in…', ['C♯dim7', 'G7', 'F major', 'A minor'], 'The bass rises C → C♯ → D while the right hand barely moves.'),
  ],
  u8: [
    C('Who wrote Für Elise?', ['Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Frédéric Chopin'], 'Beethoven wrote it around 1810.'),
    C('Für Elise rocks back and forth between E and…', ['D♯', 'F', 'C', 'G♯'], 'E – D♯ – E – D♯: fingers 5 and 4.'),
    C('The best way to learn a long piece is…', ['Section by section, then join them', 'Play it top to bottom every time', 'Start with the last page only', 'Memorise it before playing'], 'Small parts first, then put them together.'),
    C('Tempo means…', ['How fast the music goes', 'How loud it is', 'Which key it’s in', 'How many notes there are'], 'Tempo is the speed of the beat.'),
    C('“p” (piano) written under the music means…', ['Play softly', 'Play loudly', 'Play slowly', 'Use the pedal'], 'p = piano = soft. That’s where the piano’s name comes from: pianoforte, soft-loud.'),
    C('“f” (forte) means…', ['Play loudly', 'Play softly', 'Play faster', 'The finish'], 'f = forte = loud.'),
    C('A repeat sign 𝄇 means…', ['Go back and play that section again', 'Stop here', 'Play more softly', 'Skip to the end'], 'Repeat signs save writing the same music twice.'),
  ],

  // ---- Graded galaxies ---------------------------------------------------------
  g1: [
    C('“Allegro” at the top of a piece means…', ['Fast and lively', 'Slow and calm', 'Very soft', 'Very loud'], 'Allegro is Italian for cheerful: a quick tempo.'),
    C('“Andante” means…', ['At a walking pace', 'Very fast', 'Getting louder', 'Short and detached'], 'Andante comes from “to walk”.'),
    C('“mf” (mezzo forte) means…', ['Medium loud', 'Very loud', 'Medium soft', 'Very soft'], 'mezzo = medium: mp is medium soft, mf is medium loud.'),
    C('Legato means…', ['Smooth and connected', 'Short and detached', 'Loud and strong', 'Slower and slower'], 'Each note flows into the next with no gaps.'),
    C('A minuet is…', ['A graceful dance in 3/4 time', 'A fast march in 2/4', 'A slow song for voice', 'A piece for two pianos'], 'Minuets were favourite dances of the 1600s and 1700s.'),
    C('What note is this?', ['D', 'C', 'E', 'B'], 'D sits in the space just under the top line.', STAFF('D5/1 |')),
  ],
  g2: [
    C('A dot above or below a note (staccato) means…', ['Short and detached', 'Smooth and connected', 'Hold it longer', 'Play it louder'], 'Bounce off the key: short and light.'),
    C('A crescendo (<) means…', ['Gradually get louder', 'Gradually get softer', 'Speed up', 'Slow down'], 'The hairpin opens up as the sound grows.'),
    C('A diminuendo (>) means…', ['Gradually get softer', 'Gradually get louder', 'Speed up', 'Play staccato'], 'Also called decrescendo.'),
    C('“rit.” (ritardando) means…', ['Gradually slow down', 'Gradually speed up', 'Repeat', 'Play loudly'], 'Often found near the end of a piece.'),
    C('An étude (study) is…', ['A piece for practising a skill', 'A dance in 3/4', 'A song with words', 'A piece for orchestra'], 'Études build technique while still being music.'),
    C('In the bass clef, what note is this?', ['A', 'F', 'C', 'G'], 'A sits on the top line of the bass clef.', STAFF('A3/1 |', 'bass')),
  ],
  g3: [
    C('A tie (a curve joining two notes of the same pitch) means…', ['Play once and hold for both notes', 'Play both notes separately', 'Play them smoothly', 'Skip the second note'], 'The lengths add together.'),
    C('A slur (a curve over different notes) means…', ['Play them smoothly (legato)', 'Hold them all at once', 'Play them staccato', 'Repeat them'], 'Slurs show phrases to connect.'),
    C('The Notebook for Anna Magdalena is linked to which composer?', ['Johann Sebastian Bach', 'Frédéric Chopin', 'Claude Debussy', 'Scott Joplin'], 'A family music book from Bach’s household, full of short pieces.'),
    C('The Baroque era was roughly…', ['1600 – 1750', '1750 – 1820', '1820 – 1900', '1900 – 2000'], 'Bach and Handel are Baroque composers.'),
    C('“D.C. al Fine” means…', ['Go back to the start and play until “Fine”', 'Play faster to the end', 'Repeat the last bar', 'Stop immediately'], 'Da Capo = from the head (the start). Fine = the end.'),
    C('Marches are usually in…', ['2/4 or 4/4 time', '3/4 time', '6/8 only', 'No time signature'], 'Left, right, left, right: marches move in twos.'),
  ],
  g4: [
    C('A “character piece” is a short piece that…', ['Paints a mood, scene or story', 'Only practises scales', 'Has no melody', 'Is always in 4/4'], 'Like Schumann’s Album for the Young or Burgmüller’s studies.'),
    C('A fermata 𝄐 over a note means…', ['Hold it longer than its value', 'Play it short', 'Play it louder', 'Skip it'], 'Hold until it feels right, then carry on.'),
    C('An accent (>) on a note means…', ['Play that note with extra emphasis', 'Play it softer', 'Hold it twice as long', 'Play it an octave up'], 'Lean into that note.'),
    C('“dolce” means…', ['Sweetly', 'Angrily', 'Very fast', 'Very loudly'], 'Gentle and sweet in tone.'),
    C('“sfz” (sforzando) means…', ['A sudden, strong accent', 'Gradually softer', 'Sustain pedal', 'Slow down'], 'A sudden burst on one note or chord.'),
    C('Schumann’s Album for the Young was written for…', ['Young players', 'Orchestra', 'Church organ', 'Two pianos'], 'He wrote it for his daughters in 1848.'),
  ],
  g5: [
    C('A sonatina is…', ['A short, light sonata', 'A slow song', 'A dance for two', 'A fast study in octaves'], 'Clementi’s Op. 36 sonatinas are classics.'),
    C('Sonata form has three main parts:', ['Exposition, development, recapitulation', 'Verse, chorus, bridge', 'Intro, middle, outro', 'Prelude, fugue, coda'], 'Themes are shown, explored, then return.'),
    C('The Classical era was roughly…', ['1750 – 1820', '1600 – 1750', '1820 – 1900', '1900 – 1950'], 'Haydn, Mozart and early Beethoven.'),
    C('D major’s key signature has F♯ and…', ['C♯', 'G♯', 'B♭', 'D♯'], 'Two sharps: F♯ and C♯.', STAFF('D5/1 |', 'treble', 2)),
    C('“Étude” is French for…', ['Study', 'Song', 'Dance', 'Ending'], 'Chopin and Czerny wrote famous études.'),
    C('Practising scales mostly helps with…', ['Fingering, evenness and knowing your keys', 'Reading lyrics', 'Using the pedal', 'Tuning the piano'], 'Scales are the building blocks of most passages.'),
  ],
  g6: [
    C('Rubato means…', ['Flexible tempo: stretching and catching up', 'Strictly in time', 'Very loud', 'Play staccato'], 'Common in Romantic music, especially Chopin.'),
    C('The right-hand (sustain) pedal…', ['Keeps notes ringing after you let go', 'Makes the piano softer', 'Holds only some notes', 'Changes the key'], 'Lift and press again to clear the sound when the harmony changes.'),
    C('The Romantic era was roughly…', ['1820 – 1900', '1600 – 1750', '1750 – 1820', '1950 – 2000'], 'Chopin, Schumann, Liszt and Tchaikovsky.'),
    C('A nocturne is…', ['A dreamy “night piece”', 'A fast march', 'A piece for practising octaves', 'A church hymn'], 'Chopin made nocturnes famous.'),
    C('“cantabile” means…', ['In a singing style', 'Very short', 'Getting faster', 'Without pedal'], 'Make the melody sing above the accompaniment.'),
    C('“espressivo” means…', ['Expressively', 'Very fast', 'Quietly', 'Without feeling'], 'Play with feeling.'),
  ],
  g7: [
    C('Counterpoint is…', ['Two or more independent melodies at once', 'A melody with chords', 'A very fast scale', 'Playing in octaves'], 'Bach was its greatest master.'),
    C('Syncopation puts the accent…', ['Off the beat', 'Only on beat 1', 'On every beat equally', 'Nowhere'], 'That off-beat bounce is the heart of ragtime.'),
    C('Who is known as the “King of Ragtime”?', ['Scott Joplin', 'Johann Sebastian Bach', 'Erik Satie', 'Robert Schumann'], 'He wrote the Maple Leaf Rag (1899).'),
    C('The ragtime left hand usually plays…', ['A low bass note, then a chord (“oom-pah”)', 'The melody', 'Long whole notes', 'Only octaves'], 'Bass, chord, bass, chord: a steady stride.'),
    C('When one hand copies the other’s melody a moment later, it’s called…', ['Imitation', 'Syncopation', 'Rubato', 'A cadence'], 'Imitation is at the heart of Bach’s Inventions and canons.'),
    C('Bach’s Two-Part Inventions were written to teach…', ['Playing two independent lines', 'Using the pedal', 'Playing loudly', 'Improvising'], 'Each hand has its own melody.'),
  ],
  g8: [
    C('A phrase in music is like…', ['A sentence', 'A single letter', 'A full book', 'A punctuation mark'], 'Shape each phrase, then breathe before the next.'),
    C('“Presto” means…', ['Very fast', 'Very slow', 'Medium', 'Silent'], 'Faster than allegro.'),
    C('“Grave” means…', ['Very slow and solemn', 'Very fast', 'Bright and happy', 'Bouncy'], 'One of the slowest tempo marks.'),
    C('“pp” means…', ['Very soft (pianissimo)', 'Very loud', 'Pedal', 'Pause'], 'Even softer than p.'),
    C('“8va” above notes means…', ['Play an octave higher', 'Play eight times', 'Play an octave lower', 'Count eight beats'], '“8vb” means an octave lower.'),
    C('A coda is…', ['A closing section that ends the piece', 'The first theme', 'A tuning note', 'A kind of chord'], 'Coda is Italian for tail.'),
  ],
  g9: [
    C('A trill (tr) is…', ['A fast alternation with the note above', 'A slide across the keys', 'A rolled chord', 'A long rest'], 'Baroque trills often start on the upper note.'),
    C('A glissando is…', ['A slide across many keys', 'A repeated note', 'A held chord', 'A quiet ending'], 'Usually a fingernail or thumb sweep across the white keys.'),
    C('A wavy line before a chord means…', ['Roll it from bottom to top', 'Play it twice', 'Hold it longer', 'Play it staccato'], 'An arpeggiated chord.'),
    C('The left (una corda) pedal…', ['Softens and mutes the sound', 'Makes notes ring longer', 'Raises the pitch', 'Locks the keys'], 'Una corda = one string.'),
    C('Debussy is best known as an…', ['Impressionist composer', 'Baroque composer', 'Ragtime composer', 'Opera singer'], 'Clair de lune and Arabesque No. 1 are his.'),
    C('Who wrote the “Minute” Waltz?', ['Frédéric Chopin', 'Ludwig van Beethoven', 'Claude Debussy', 'Edvard Grieg'], 'Op. 64 No. 1. It takes closer to two minutes!'),
  ],
  g10: [
    C('A cadenza is…', ['A showy solo passage, often free in time', 'The last chord', 'A slow dance', 'A tuning exercise'], 'The performer’s moment to shine.'),
    C('Enharmonic notes are…', ['The same key with different names', 'Notes an octave apart', 'Notes in a chord', 'Out-of-tune notes'], 'F♯ and G♭ are enharmonic.'),
    C('The relative minor of C major is…', ['A minor', 'C minor', 'E minor', 'G minor'], 'Same key signature (no sharps or flats), different home note.'),
    C('A polyrhythm is…', ['Two different rhythms at once, like 3 against 2', 'A very fast tempo', 'A rhythm with rests', 'A drum solo'], 'Common in Chopin and Debussy.'),
    C('“a tempo” means…', ['Return to the original speed', 'Speed up a lot', 'Play without tempo', 'Stop'], 'Often after a ritardando.'),
    C('The middle (sostenuto) pedal…', ['Holds only the notes already pressed', 'Holds every note', 'Makes the piano softer', 'Has no use'], 'Great for holding a bass note while the hands play on.'),
  ],
};

/** The Knowledge Check world for a galaxy (inserted before its Guardian), or null. */
export function quizLesson(unitId) {
  const qs = QUIZZES[unitId];
  if (!qs) return null;
  return { id: `quiz-${unitId}`, title: 'Knowledge Check', icon: '?', quiz: true, steps: [{ t: 'quiz', questions: qs }] };
}
