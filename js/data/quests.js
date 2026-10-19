// Rogue planets: side quests drifting between galaxies. Pay a one-time
// launch cost, then beat the challenge (as many tries as you like) for a
// big first-clear reward.

export const QUESTS = [
  { id: 'q-comet', name: 'Comet Run', kind: 'ice', cost: 50, reward: 150, after: 1, song: 'jingle-bells', hands: 'R', mode: 'timed', tempo: 1.15, need: 3,
    desc: 'Jingle Bells, right hand, at 115% speed. Score 2★ or more.' },
  { id: 'q-ghost', name: 'Ghost Planet', kind: 'rocky', cost: 60, reward: 180, after: 2, song: 'ode', hands: 'R', mode: 'timed', tempo: 0.9, names: false, need: 4, range: [1, 8],
    desc: 'Ode to Joy (first half) with no note names: read the notes and score 3★.' },
  { id: 'q-twins', name: 'Twin Moons', kind: 'ocean', cost: 60, reward: 180, after: 3, song: 'mary', hands: 'both', mode: 'timed', tempo: 1, need: 3,
    desc: 'Mary Had a Little Lamb, both hands, with the beat. Score 2★.' },
  { id: 'q-saints', name: 'The Marching Planet', kind: 'desert', cost: 80, reward: 220, after: 4, song: 'saints', hands: 'both', mode: 'timed', tempo: 1, need: 3,
    desc: 'When the Saints, both hands, full speed. Score 2★.' },
  { id: 'q-gravity', name: 'Gravity Well', kind: 'lava', cost: 120, reward: 350, after: 6, song: 'fur-elise', hands: 'R', mode: 'timed', tempo: 1, need: 3,
    desc: 'Für Elise, right hand, at full speed. Score 2★.' },
  { id: 'q-organ', name: 'Organ Nebula', kind: 'gas', cost: 100, reward: 300, after: 7, song: 'gospel-blues', hands: 'both', mode: 'timed', tempo: 1, need: 3,
    desc: '12-bar gospel blues on the organ, both hands. Score 2★.' },
  { id: 'q-light', name: 'Speed of Light', kind: 'terran', cost: 150, reward: 400, after: 8, song: 'minuet-g', hands: 'R', mode: 'timed', tempo: 1.2, need: 3,
    desc: 'Minuet in G, right hand, at 120% speed. Score 2★.' },
];
