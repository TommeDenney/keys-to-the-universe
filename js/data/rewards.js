// Achievement rewards: special Shop items that still cost Stardust, but can only
// be bought once you've earned the right (see js/achievements.js for the
// requirement kinds). Each category has ten, plus the Pet shop.
//
// Visuals are described by small parameter sets, so one renderer per category
// draws them all (ships.js, pets.js, cosmetics.js CSS, ambient.js, keyboard.js).

import { EVENT_ITEMS } from './events.js';

const R = (id, cat, name, price, req, desc, look) => ({ id, cat, name, price, req, desc, look });

export const REWARD_ITEMS = [
  // ---- Spaceships ---------------------------------------------------------------
  R('ship-crown', 'ship', 'Crown Cruiser', 450, { kind: 'guardians', goal: 10 }, 'A royal flagship forged from the crowns of fallen Guardians.',
    { shape: 'rocket', hull: '#4C1D95', hull2: '#6D28D9', wing: '#7C3AED', cockpit: '#FDE68A', flame: '#C4B5FD', deco: 'crown' }),
  R('ship-phoenix', 'ship', 'Phoenix', 500, { kind: 'planets', goal: 50 }, 'A firebird reborn from every world you’ve finished.',
    { shape: 'bird', hull: '#EA580C', hull2: '#FDE047', wing: '#F97316', cockpit: '#FEF9C3', flame: '#FDBA74' }),
  R('ship-baton', 'ship', 'Maestro’s Baton', 900, { kind: 'boss', id: 'boss-g10' }, 'Conduct the cosmos. Only for those who beat the final Guardian.',
    { shape: 'baton', hull: '#F8FAFC', hull2: '#78350F', wing: '#FDE68A', cockpit: '#FDE68A', flame: '#FDE68A', deco: 'star' }),
  R('ship-manta', 'ship', 'Nebula Manta', 380, { kind: 'rogues', goal: 3 }, 'Glides through nebulae on wide, glowing fins.',
    { shape: 'manta', hull: '#0E7490', hull2: '#22D3EE', wing: '#155E75', cockpit: '#A5F3FC', flame: '#67E8F9' }),
  R('ship-koi', 'ship', 'Koi Lantern', 350, { kind: 'dailyDone', goal: 30 }, 'A paper-lantern koi that swims between the planets.',
    { shape: 'orb', hull: '#FFF7ED', hull2: '#F97316', wing: '#EA580C', cockpit: '#FB923C', flame: '#FDBA74', deco: 'spots' }),
  R('ship-aurora', 'ship', 'Aurora Sailer', 420, { kind: 'weeklyDone', goal: 10 }, 'A solar sail woven from the northern lights.',
    { shape: 'sail', hull: '#1E293B', hull2: '#2DD4BF', wing: '#A78BFA', cockpit: '#99F6E4', flame: '#5EEAD4' }),
  R('ship-obsidian', 'ship', 'Obsidian Interceptor', 520, { kind: 'life', stat: 'flawless', goal: 25 }, 'Black glass and molten seams. For flawless players.',
    { shape: 'arrow', hull: '#18181B', hull2: '#3F3F46', wing: '#27272A', cockpit: '#F97316', flame: '#FB923C', deco: 'seams' }),
  R('ship-sakura', 'ship', 'Sakura Glider', 360, { kind: 'days', goal: 60 }, 'Petal wings that scatter blossoms as you fly.',
    { shape: 'glider', hull: '#FCE7F3', hull2: '#F9A8D4', wing: '#F472B6', cockpit: '#FFFFFF', flame: '#FBCFE8', deco: 'petals' }),
  R('ship-organ', 'ship', 'Cathedral Organ', 480, { kind: 'galaxy', unit: 'u9' }, 'Pipes for engines, keys down the hull. It hums in chords.',
    { shape: 'rocket', hull: '#7C2D12', hull2: '#B45309', wing: '#92400E', cockpit: '#FDE68A', flame: '#FCD34D', deco: 'pipes' }),
  R('ship-express', 'ship', 'Starlight Express', 650, { kind: 'life', stat: 'notes', goal: 50000 }, 'A locomotive of light that runs on every note you’ve played.',
    { shape: 'train', hull: '#1D4ED8', hull2: '#FBBF24', wing: '#1E3A8A', cockpit: '#FEF3C7', flame: '#BFDBFE' }),

  // ---- Completion effects (a ring of glyphs + an aura around finished worlds) -------
  R('fx-sakura', 'fx', 'Sakura Storm', 320, { kind: 'threeStar', goal: 20 }, 'Cherry blossoms swirl around every world you finish.', { glyphs: '❀✿❀✿❀', color: '#F9A8D4', aura: '#EC4899' }),
  R('fx-frost', 'fx', 'Frostbound', 300, { kind: 'dailyDone', goal: 20 }, 'Finished worlds freeze over with sparkling snowflakes.', { glyphs: '❄❅❆❄❅', color: '#BAE6FD', aura: '#38BDF8' }),
  R('fx-crown', 'fx', 'Coronation', 380, { kind: 'guardians', goal: 5 }, 'A ring of golden crowns for every world you rule.', { glyphs: '♛♛♛♛', color: '#FCD34D', aura: '#F59E0B' }),
  R('fx-hearts', 'fx', 'Beloved', 280, { kind: 'days', goal: 30 }, 'Hearts orbit the worlds you’ve loved enough to finish.', { glyphs: '♥♡♥♡♥♡', color: '#FDA4AF', aura: '#F43F5E' }),
  R('fx-storm', 'fx', 'Storm Ring', 400, { kind: 'life', stat: 'perfect', goal: 5000 }, 'Crackling bolts circle finished worlds.', { glyphs: 'ϟϟϟϟϟ', color: '#FDE68A', aura: '#EAB308', spin: 5 }),
  R('fx-butterfly', 'fx', 'Flutter', 340, { kind: 'planets', goal: 25 }, 'Butterflies drift around every world you complete.', { glyphs: '\u{1F98B}\u{1F98B}\u{1F98B}', color: '#C4B5FD', aura: '#8B5CF6', spin: 16 }),
  R('fx-rings', 'fx', 'Golden Rings', 360, { kind: 'monthlyDone', goal: 2 }, 'Finished worlds wear shining Saturn rings.', { glyphs: '', color: '#FCD34D', aura: '#F59E0B', rings: true }),
  R('fx-runes', 'fx', 'Ancient Runes', 420, { kind: 'rogues', goal: 4 }, 'Glowing runes from the rogue planets circle your worlds.', { glyphs: 'ᚠᚢᚦᚨᚱᚷ', color: '#C4B5FD', aura: '#7C3AED' }),
  R('fx-eclipse', 'fx', 'Eclipse', 450, { kind: 'boss', id: 'boss-g5' }, 'Worlds go dark with a blazing white corona.', { glyphs: '', color: '#FFFFFF', aura: '#FFFFFF', eclipse: true }),
  R('fx-constellation', 'fx', 'Constellation', 480, { kind: 'galaxies', goal: 5 }, 'Every finished world joins a little constellation.', { glyphs: '✦✧✦✧✦✧✦', color: '#A5F3FC', aura: '#22D3EE', spin: 30 }),

  // ---- Ambience -------------------------------------------------------------------
  R('amb-hall', 'amb', 'Guardian’s Hall', 300, { kind: 'boss', id: 'boss-u9' }, 'A great organ breathing slow chords in an empty hall.',
    { chords: [[36, 48, 55, 60, 64], [41, 48, 53, 57, 65], [43, 50, 55, 59, 62], [36, 48, 55, 60, 67]], types: ['square', 'sine'], len: 9, peak: 0.03, lp: 1400, attack: 2.4 }),
  R('amb-rain', 'amb', 'Rain on the Hull', 260, { kind: 'days', goal: 14 }, 'Soft rain pattering on your ship’s windows.', { noise: { lp: 2600, gain: 0.07, lfo: 0.3, depth: 0.03, drops: true } }),
  R('amb-caves', 'amb', 'Crystal Caves', 320, { kind: 'rogues', goal: 2 }, 'Glassy bell chords ringing through crystal caverns.',
    { chords: [[76, 81, 86, 88], [74, 79, 83, 86], [72, 76, 81, 84], [71, 76, 79, 83]], types: ['sine', 'sine'], len: 7, peak: 0.03, lp: 7000, attack: 1.4 }),
  R('amb-lounge', 'amb', 'Midnight Lounge', 300, { kind: 'life', stat: 'mastered', goal: 10 }, 'Smoky seventh chords from a jazz bar on the moon.',
    { chords: [[50, 57, 60, 65], [55, 59, 62, 65], [48, 52, 55, 59], [57, 60, 64, 67]], types: ['triangle', 'sine'], len: 5, peak: 0.05, lp: 1200, attack: 1.2 }),
  R('amb-gospel', 'amb', 'Sunday Morning', 340, { kind: 'galaxyWorlds', unit: 'u9', goal: 3 }, 'Warm gospel organ chords, like the church down the street.',
    { chords: [[48, 55, 64, 67, 72], [53, 57, 65, 69, 72], [45, 52, 60, 64, 69], [43, 55, 62, 65, 71]], types: ['square', 'triangle'], len: 6, peak: 0.028, lp: 1600, attack: 1.3 }),
  R('amb-forest', 'amb', 'Enchanted Forest', 280, { kind: 'planets', goal: 30 }, 'Gentle, magical pads under a canopy of stars.',
    { chords: [[60, 67, 69, 74], [57, 64, 67, 72], [55, 62, 64, 69], [53, 60, 64, 67]], types: ['sine', 'triangle'], len: 7, peak: 0.04, lp: 2200, attack: 2 }),
  R('amb-deep', 'amb', 'Deep Space Hum', 260, { kind: 'monthlyDone', goal: 1 }, 'A low, endless engine hum at the edge of the universe.',
    { chords: [[33, 40, 45], [31, 38, 43], [29, 36, 41], [31, 38, 45]], types: ['sawtooth', 'sawtooth'], len: 12, peak: 0.05, lp: 380, attack: 3 }),
  R('amb-sunrise', 'amb', 'Sunrise', 240, { kind: 'dailyDone', goal: 10 }, 'Bright, hopeful chords as a new sun comes up.',
    { chords: [[60, 64, 67, 72], [55, 62, 67, 71], [57, 60, 64, 69], [53, 60, 65, 69]], types: ['triangle', 'sine'], len: 6, peak: 0.04, lp: 2600, attack: 1.6 }),
  R('amb-moonlit', 'amb', 'Moonlit', 360, { kind: 'boss', id: 'boss-u8' }, 'Hushed minor chords for late-night practice.',
    { chords: [[49, 56, 61, 64], [45, 57, 61, 64], [42, 54, 57, 62], [44, 56, 60, 63]], types: ['sine', 'triangle'], len: 8, peak: 0.04, lp: 1500, attack: 2.2 }),
  R('amb-solarwind', 'amb', 'Solar Wind', 280, { kind: 'life', stat: 'minutes', goal: 600 }, 'Whooshing gusts of solar wind rolling past.', { noise: { lp: 900, gain: 0.1, lfo: 0.07, depth: 0.09 } }),

  // ---- Keyboard themes ---------------------------------------------------------------
  R('kb-royal', 'kb', 'Royal Gold', 350, { kind: 'boss', id: 'boss-u8' }, 'Ivory and gold leaf, fit for a concert hall.', { w: ['#FFFDF5', '#F3E3B5'], border: '#B8892B', lip: '#D4A84A', b: ['#1A1208', '#000000'], bglow: '#D4A84A', label: '#8A6A1E' }),
  R('kb-aurora', 'kb', 'Aurora', 350, { kind: 'rogues', goal: 5 }, 'Northern lights ripple across the keys.', { w: ['#0B1B2B', '#1C3A5A'], border: '#2DD4BF', lip: '#6D28D9', b: ['#050B14', '#0B1020'], bglow: '#A78BFA', label: '#99F6E4' }),
  R('kb-lava', 'kb', 'Lava Flow', 380, { kind: 'life', stat: 'notes', goal: 20000 }, 'Cooled basalt keys with molten cracks.', { w: ['#3F3F46', '#18181B'], border: '#F97316', lip: '#EA580C', b: ['#0C0A09', '#1C1917'], bglow: '#F97316', label: '#FDBA74' }),
  R('kb-ice', 'kb', 'Glacier', 320, { kind: 'dailyDone', goal: 40 }, 'Frosted ice keys with a cold blue glow.', { w: ['#F0F9FF', '#BAE6FD'], border: '#7DD3FC', lip: '#38BDF8', b: ['#0C4A6E', '#082F49'], bglow: '#7DD3FC', label: '#0369A1' }),
  R('kb-candy', 'kb', 'Candy Shop', 300, { kind: 'days', goal: 21 }, 'Sweet strawberry-and-mint keys.', { w: ['#FFF1F2', '#FBCFE8'], border: '#F472B6', lip: '#6EE7B7', b: ['#BE185D', '#831843'], bglow: '#F9A8D4', label: '#BE185D' }),
  R('kb-matrix', 'kb', 'Terminal', 340, { kind: 'life', stat: 'perfect', goal: 2000 }, 'Green-on-black hacker keys.', { w: ['#03130A', '#000000'], border: '#22C55E', lip: '#16A34A', b: ['#000000', '#000000'], bglow: '#4ADE80', label: '#4ADE80' }),
  R('kb-sakura', 'kb', 'Sakura', 330, { kind: 'threeStar', goal: 40 }, 'Pale blossom pink with dark cherry-wood sharps.', { w: ['#FFF5F7', '#FCE7F3'], border: '#F9A8D4', lip: '#F472B6', b: ['#4A1D1F', '#2A0F10'], bglow: '#F9A8D4', label: '#9D174D' }),
  R('kb-marble', 'kb', 'Marble Palace', 420, { kind: 'guardians', goal: 15 }, 'Veined white marble and polished onyx.', { w: ['#FFFFFF', '#E7E5E4'], border: '#A8A29E', lip: '#78716C', b: ['#292524', '#0C0A09'], bglow: '#D6D3D1', label: '#57534E', veins: true }),
  R('kb-sunburst', 'kb', 'Sunburst', 300, { kind: 'weeklyDone', goal: 5 }, 'Keys that glow like a summer sunset.', { w: ['#FEF3C7', '#FDBA74'], border: '#FB923C', lip: '#F43F5E', b: ['#7C2D12', '#431407'], bglow: '#FB923C', label: '#9A3412' }),
  R('kb-void', 'kb', 'The Void', 500, { kind: 'galaxies', goal: 10 }, 'Keys made of empty space, outlined in starlight.', { w: ['#020617', '#0F0B2A'], border: '#818CF8', lip: '#4338CA', b: ['#000000', '#000000'], bglow: '#C7D2FE', label: '#C7D2FE', stars: true }),

  // ---- Key presses (particles that fly from the key) --------------------------------
  R('press-snow', 'press', 'Snowfall', 220, { kind: 'dailyDone', goal: 15 }, 'Snowflakes drift up from every key.', { glyphs: ['❄', '❅', '❆'], color: '#E0F2FE', glow: '#7DD3FC', n: 3 }),
  R('press-petals', 'press', 'Petals', 220, { kind: 'threeStar', goal: 10 }, 'Blossom petals scatter as you play.', { glyphs: ['❀', '✿'], color: '#F9A8D4', glow: '#EC4899', n: 3 }),
  R('press-bubbles', 'press', 'Bubbles', 200, { kind: 'rogues', goal: 1 }, 'Little bubbles float up and pop.', { glyphs: ['○', '◌', '◦'], color: '#A5F3FC', glow: '#22D3EE', n: 4 }),
  R('press-coins', 'press', 'Gold Coins', 260, { kind: 'life', stat: 'mastered', goal: 5 }, 'Every note pays out in shiny coins.', { glyphs: ['●'], color: '#FCD34D', glow: '#F59E0B', n: 3, size: 12 }),
  R('press-crowns', 'press', 'Crowns', 300, { kind: 'guardians', goal: 3 }, 'Tiny golden crowns for a royal performance.', { glyphs: ['♛'], color: '#FDE68A', glow: '#F59E0B', n: 2 }),
  R('press-butterflies', 'press', 'Butterflies', 300, { kind: 'planets', goal: 40 }, 'Butterflies flutter out of the keys.', { glyphs: ['\u{1F98B}'], color: '#C4B5FD', glow: '#8B5CF6', n: 2, size: 16 }),
  R('press-confetti', 'press', 'Confetti', 260, { kind: 'weeklyDone', goal: 3 }, 'A party in every keystroke.', { glyphs: ['■', '▲', '◆', '●'], color: 'rainbow', glow: 'transparent', n: 6, size: 9 }),
  R('press-runes', 'press', 'Rune Sparks', 340, { kind: 'rogues', goal: 6 }, 'Ancient runes flare up from the keys.', { glyphs: ['ᚠ', 'ᚢ', 'ᚦ', 'ᚱ'], color: '#DDD6FE', glow: '#7C3AED', n: 2 }),
  R('press-ghosts', 'press', 'Phantoms', 320, { kind: 'boss', id: 'boss-g6' }, 'Friendly ghosts drift up from the Romantic Phantom’s keys.', { glyphs: ['\u{1F47B}'], color: '#FFFFFF', glow: '#C4B5FD', n: 1, size: 18 }),
  R('press-comets', 'press', 'Comets', 380, { kind: 'life', stat: 'notes', goal: 30000 }, 'Comets streak off with every note.', { glyphs: ['☄'], color: '#FDE68A', glow: '#FB923C', n: 2, size: 16 }),

  // ---- Key glow colours: the colour a played key lights up (pairs with any press effect) ----
  ...[['glow-blue', 'Ocean Blue', '#38BDF8', 60], ['glow-violet', 'Violet', '#A78BFA', 60], ['glow-gold', 'Gold', '#FBBF24', 90],
    ['glow-pink', 'Hot Pink', '#F472B6', 70], ['glow-ruby', 'Ruby', '#F43F5E', 80], ['glow-orange', 'Sunset Orange', '#FB923C', 70],
    ['glow-teal', 'Teal', '#2DD4BF', 60], ['glow-ice', 'Ice White', '#E0F2FE', 100], ['glow-lime', 'Lime', '#A3E635', 60], ['glow-indigo', 'Indigo', '#6366F1', 120]]
    .map(([id, name, keyColor, price]) => R(id, 'glow', name, price, null, `Played keys light up ${name.toLowerCase()}.`, { keyColor })),

  // ---- Completion star colours ---------------------------------------------------------
  R('star-obsidian', 'starc', 'Obsidian Flame', 250, { kind: 'dailyDone', goal: 50 }, 'Black glass stars with a burning edge.', { color: '#1C1917', glow: ['#F97316', '#EA580C'] }),
  R('star-aurora', 'starc', 'Aurora', 300, { kind: 'weeklyDone', goal: 15 }, 'Teal-to-violet stars that ripple like the northern lights.', { color: '#2DD4BF', shift: '#A78BFA' }),
  R('star-nova', 'starc', 'White Nova', 300, { kind: 'threeStar', goal: 30 }, 'Blinding white-hot stars with a pulsing glow.', { color: '#FFFFFF', glow: ['#FFFFFF', '#7DD3FC'], pulse: true }),
  R('star-ruby', 'starc', 'Ruby', 260, { kind: 'guardians', goal: 8 }, 'Deep red gemstones.', { color: '#E11D48', glow: ['#FB7185'] }),
  R('star-amber', 'starc', 'Amber', 240, { kind: 'days', goal: 45 }, 'Warm honey-gold amber.', { color: '#F59E0B', glow: ['#FCD34D'] }),
  R('star-jade', 'starc', 'Jade', 260, { kind: 'planets', goal: 60 }, 'Smooth, carved green jade.', { color: '#10B981', glow: ['#6EE7B7'] }),
  R('star-pearl', 'starc', 'Pearl', 280, { kind: 'life', stat: 'mastered', goal: 15 }, 'Soft, iridescent pearls.', { color: '#F5F5F4', shift: '#FBCFE8', glow: ['#E7E5E4'] }),
  R('star-plasma', 'starc', 'Plasma', 380, { kind: 'life', stat: 'perfect', goal: 10000 }, 'Electric pink-and-cyan plasma.', { color: '#F0ABFC', shift: '#22D3EE', glow: ['#E879F9'], pulse: true }),
  R('star-sunfire', 'starc', 'Sunfire', 340, { kind: 'boss', id: 'boss-g7' }, 'Stars that burn like the core of a sun.', { color: '#FBBF24', shift: '#EF4444', glow: ['#F97316', '#DC2626'] }),
  R('star-void', 'starc', 'Void Star', 420, { kind: 'galaxies', goal: 8 }, 'Pure black, haloed in violet starlight.', { color: '#000000', glow: ['#A78BFA', '#6D28D9'] }),

  // ---- Route trails ------------------------------------------------------------------
  R('trail-gold', 'trail', 'Golden Road', 300, { kind: 'monthlyDone', goal: 3 }, 'A gleaming road of gold between your worlds.', { stroke: '#FBBF24', glow: '#F59E0B', width: 4 }),
  R('trail-aurora', 'trail', 'Aurora Ribbon', 350, { kind: 'rogues', goal: 7 }, 'A ribbon of shifting northern lights.', { stroke: '#2DD4BF', shift: '#A78BFA', glow: '#2DD4BF', width: 5 }),
  R('trail-fire', 'trail', 'Trail of Fire', 340, { kind: 'life', stat: 'minutes', goal: 900 }, 'Your path burns behind you.', { stroke: '#F97316', shift: '#EF4444', glow: '#FB923C', width: 4 }),
  R('trail-ice', 'trail', 'Ice Bridge', 280, { kind: 'dailyDone', goal: 25 }, 'A frozen bridge glittering with frost.', { stroke: '#BAE6FD', glow: '#38BDF8', width: 4, glyph: '❄ ' }),
  R('trail-hearts', 'trail', 'Heartstrings', 260, { kind: 'days', goal: 40 }, 'A path of little hearts.', { stroke: 'transparent', glow: '#F43F5E', glyph: '♥ ', glyphColor: '#FDA4AF' }),
  R('trail-vines', 'trail', 'Vines', 300, { kind: 'planets', goal: 35 }, 'Leafy vines grow between your worlds.', { stroke: '#16A34A', glow: '#4ADE80', width: 3, glyph: '❦ ', glyphColor: '#86EFAC' }),
  R('trail-lightning', 'trail', 'Lightning', 360, { kind: 'life', stat: 'perfect', goal: 3000 }, 'A crackling bolt from world to world.', { stroke: '#FDE68A', glow: '#EAB308', width: 3, glyph: 'ϟ ', glyphColor: '#FEF08A', dash: '2 10' }),
  R('trail-constellation', 'trail', 'Constellation Lines', 320, { kind: 'galaxies', goal: 3 }, 'Thin star-chart lines with twinkling stars.', { stroke: '#C7D2FE', glow: '#818CF8', width: 1.5, glyph: '✧       ', glyphColor: '#E0E7FF' }),
  R('trail-sakura', 'trail', 'Petal Path', 300, { kind: 'threeStar', goal: 25 }, 'Cherry petals drift along your route.', { stroke: '#FBCFE8', glow: '#F472B6', width: 2, glyph: '❀ ', glyphColor: '#F9A8D4' }),
  R('trail-runes', 'trail', 'Rune Road', 380, { kind: 'guardians', goal: 12 }, 'A road carved with glowing runes.', { stroke: '#7C3AED', glow: '#A78BFA', width: 2, glyph: 'ᚠ ᚢ ᚦ ᚨ ', glyphColor: '#DDD6FE' }),

  // ---- Sheet music themes -----------------------------------------------------------
  R('sheet-gilded', 'sheet', 'Gilded Manuscript', 300, { kind: 'boss', id: 'boss-g8' }, 'Cream paper with gold staves, like a winner’s score.', { paper: '#FFF8E6', ink: '#3A2A0A', line: '#D4A84A', faint: '#E9D6A6' }),
  R('sheet-cosmos', 'sheet', 'Cosmos', 300, { kind: 'life', stat: 'minutes', goal: 1200 }, 'Deep-space paper with starlight ink.', { paper: '#0B0A24', ink: '#E9E4FF', line: '#5B4FA8', faint: '#2E2866' }),
  R('sheet-sakura', 'sheet', 'Sakura', 260, { kind: 'threeStar', goal: 15 }, 'Blossom-pink paper with plum ink.', { paper: '#FFF1F5', ink: '#5B1A3A', line: '#F5B5CC', faint: '#FAD3E1' }),
  R('sheet-forest', 'sheet', 'Forest', 260, { kind: 'planets', goal: 20 }, 'Moss-green paper, like a woodland songbook.', { paper: '#ECF5E6', ink: '#1F3A1A', line: '#9DC08B', faint: '#C8DDBC' }),
  R('sheet-midnightgold', 'sheet', 'Midnight Gold', 380, { kind: 'guardians', goal: 18 }, 'Black paper and gold ink, for the Guardians’ hall.', { paper: '#0E0B07', ink: '#F5D68A', line: '#6B5626', faint: '#3A2F18' }),
  R('sheet-ocean', 'sheet', 'Deep Ocean', 300, { kind: 'rogues', goal: 3 }, 'Ink that glows like sea creatures in the deep.', { paper: '#062A3A', ink: '#A5F3FC', line: '#1E6A82', faint: '#124A5E' }),
  R('sheet-candy', 'sheet', 'Candy', 240, { kind: 'dailyDone', goal: 35 }, 'Mint paper with strawberry notes.', { paper: '#EFFFF8', ink: '#C0265E', line: '#9BE7C8', faint: '#C9F4E2' }),
  R('sheet-terminal', 'sheet', 'Terminal', 340, { kind: 'life', stat: 'notes', goal: 40000 }, 'Green phosphor on black.', { paper: '#020A04', ink: '#4ADE80', line: '#14532D', faint: '#0B2E17' }),
  R('sheet-rose', 'sheet', 'Rosewood', 280, { kind: 'days', goal: 50 }, 'Warm rose paper with rich brown ink.', { paper: '#FBEDE8', ink: '#4A2318', line: '#DDB2A3', faint: '#EED3C9' }),
  R('sheet-aurora', 'sheet', 'Aurora', 360, { kind: 'weeklyDone', goal: 20 }, 'Night-teal paper with violet ink.', { paper: '#071B22', ink: '#C4B5FD', line: '#1F5A63', faint: '#123A42' }),
];

// ---- Pets: a companion who travels with your ship -------------------------------------
// type: 'land' (drawn animals), 'water' (drawn sea friends in a fish bowl, see render/aqua.js), 'space' (drawn creatures).
const P = (id, name, type, price, look, desc, req) => ({ id, cat: 'pet', name, type, price, look, desc, req });

export const PETS = [
  P('pet-none', 'No pet', 'none', 0, null, 'Travel solo.'),
  // Land, air and everything in between
  P('pet-puppy', 'Puppy', 'land', 150, { fur: '#D9A066', belly: '#FFF1DC', accent: '#8B5A2B', ears: 'floppy', tail: 'thin', marks: 'patch' }, 'A loyal puppy who wags along on every flight.'),
  P('pet-kitten', 'Kitten', 'land', 150, { fur: '#A8A29E', belly: '#F5F5F4', accent: '#57534E', ears: 'pointy', tail: 'thin', marks: 'tabby', whiskers: true, inner: '#FBCFE8', snout: true }, 'Naps on the piano. Wakes up for the good bits.'),
  P('pet-bunny', 'Bunny', 'land', 170, { fur: '#F3F4F6', belly: '#FFFFFF', accent: '#D1D5DB', ears: 'long', tail: 'puff', nose: '#F472B6' }, 'Hops in time with your rhythm.'),
  P('pet-fox', 'Fox', 'land', 220, { fur: '#F97316', belly: '#FFF7ED', accent: '#7C2D12', ears: 'big', tail: 'fluffy', tailTip: '#FFF7ED', inner: '#7C2D12', paws: '#7C2D12' }, 'Clever and quick, like your fingers.'),
  P('pet-panda', 'Panda', 'land', 240, { fur: '#FAFAFA', belly: '#FFFFFF', accent: '#1F2937', ears: 'round', earColor: '#1F2937', inner: '#374151', marks: 'panda', paws: '#1F2937' }, 'Very chill. Loves slow songs.'),
  P('pet-koala', 'Koala', 'land', 220, { fur: '#9CA3AF', belly: '#E5E7EB', accent: '#4B5563', ears: 'fluffy', inner: '#F3F4F6', bigNose: true, snoutColor: '#9CA3AF' }, 'Clings to your ship for dear life.'),
  P('pet-owl', 'Owl', 'land', 200, { base: 'bird', fur: '#A16207', belly: '#FEF3C7', accent: '#78350F', ears: 'tufts', eyeRings: true, beakColor: '#F59E0B' }, 'A wise night-practice buddy.'),
  P('pet-parrot', 'Parrot', 'land', 220, { base: 'bird', fur: '#22C55E', belly: '#FDE047', accent: '#DC2626', beak: 'hook', beakColor: '#1F2937', tuftTop: true }, 'Sings back whatever you play. Badly.'),
  P('pet-frog', 'Frog', 'land', 160, { base: 'frog', fur: '#4ADE80', belly: '#DCFCE7' }, 'Ribbit means encore.'),
  P('pet-turtle', 'Turtle', 'land', 180, { base: 'turtle', fur: '#86EFAC', accent: '#15803D', accent2: '#A16207' }, 'Slow and steady wins the song.'),
  P('pet-bee', 'Bumblebee', 'land', 160, { base: 'insect', fur: '#FACC15', accent: '#1F2937', head: '#1F2937', marks: 'stripes', wings: 'insect' }, 'Buzzes in perfect pitch.'),
  P('pet-hedgehog', 'Hedgehog', 'land', 200, { fur: '#D6B48C', belly: '#FFF7ED', accent: '#78350F', spines: true, ears: 'round', inner: '#FBCFE8', bigNose: false }, 'Small, spiky and very proud of you.'),
  // The developer's own dogs, drawn for the app.
  P('pet-zeus', 'Zeus', 'land', 300, { base: 'pom', fur: '#E39A4C', belly: '#FBE3C0', muzzle: '#F6D3A3', ruff: '#EDA95E', accent: '#B9692A', ears: 'pointy', inner: '#F3B98A', tailTip: '#F8D6A6', cheeks: '#F2BE85' }, 'A fluffy orange Pomeranian. King of the couch and, apparently, the gods.'),
  P('pet-ace', 'Ace', 'land', 300, { base: 'pom', fur: '#4A4850', belly: '#C9C7CE', muzzle: '#E9E7EC', ruff: '#56545C', dark: '#3A3840', bangs: '#6B6972', ears: 'floppy', shaggy: true, blaze: '#ECEAF0', tongue: true }, 'A shaggy grey-and-white pom-poodle. Always happy to see you.'),
  P('pet-mini', 'Mini', 'land', 260, { base: 'pom', fur: '#2B2830', belly: '#47424F', muzzle: '#5E5868', ruff: '#34303A', dark: '#1F1C23', bangs: '#423D49', ears: 'floppy', shaggy: true, bow: '#F472B6' }, 'A tiny black pom-poodle. Ace’s niece, and just as cute.'),
  P('pet-sloth', 'Sloth', 'land', 200, { fur: '#A78B6D', belly: '#E7D8C4', accent: '#5B4636', marks: 'mask', maskColor: '#E7D8C4', sleepy: true, snout: false }, 'For players who take things at their own pace.', { kind: 'days', goal: 10 }),
  P('pet-penguin', 'Penguin', 'land', 220, { base: 'bird', fur: '#1F2937', belly: '#FFFFFF', accent: '#111827', beakColor: '#F59E0B', feet: '#F59E0B', marks: 'mask', maskColor: '#FFFFFF' }, 'Dressed for the concert hall.', { kind: 'dailyDone', goal: 5 }),
  P('pet-lion', 'Lion Cub', 'land', 350, { fur: '#FBBF24', belly: '#FEF3C7', accent: '#B45309', mane: '#C2410C', ears: 'round', inner: '#FDE68A', tail: 'thin' }, 'Brave enough to face any Guardian.', { kind: 'guardians', goal: 4 }),
  P('pet-unicorn', 'Unicorn', 'land', 500, { fur: '#FFFFFF', belly: '#FDF4FF', accent: '#E9D5FF', ears: 'pointy', inner: '#FBCFE8', horn: '#FBBF24', mane2: '#F472B6', mane3: '#60A5FA', tail: 'fluffy', tailTip: '#A78BFA', snoutColor: '#FDF4FF', nose: '#F9A8D4', glow: '#E9D5FF' }, 'Rare and magical, like a flawless run.', { kind: 'life', stat: 'flawless', goal: 10 }),
  P('pet-trex', 'Tiny T-Rex', 'land', 450, { base: 'dino', fur: '#4ADE80', belly: '#D9F99D', accent: '#15803D', tail: 'dino', spikes: true, teeth: true, snoutColor: '#86EFAC' }, 'Short arms. Still practises every day.', { kind: 'life', stat: 'notes', goal: 25000 }),
  P('pet-dragon', 'Dragon', 'land', 900, { base: 'dino', fur: '#8B5CF6', belly: '#DDD6FE', accent: '#5B21B6', wings: 'dragon', horns: '#FDE68A', tail: 'dino', spikes: true, snoutColor: '#A78BFA', glow: '#A78BFA' }, 'Only follows those who beat the Grand Maestro.', { kind: 'boss', id: 'boss-g10' }),
  // Water friends live in a fish bowl
  P('pet-goldfish', 'Goldfish', 'water', 100, '\u{1F41F}', 'A classic. Lives in a bowl on your dashboard.'),
  P('pet-tropical', 'Tropical Fish', 'water', 150, '\u{1F420}', 'Bright stripes for a bright player.'),
  P('pet-puffer', 'Pufferfish', 'water', 180, '\u{1F421}', 'Puffs up when you hit a wrong note.'),
  P('pet-crab', 'Crab', 'water', 160, '\u{1F980}', 'Plays piano sideways.'),
  P('pet-jelly', 'Jellyfish', 'water', 220, '\u{1FABC}', 'Glows softly in its bowl.'),
  P('pet-octopus', 'Octopus', 'water', 260, '\u{1F419}', 'Eight arms, eighty-eight keys. Show-off.'),
  P('pet-shrimp', 'Shrimp', 'water', 140, '\u{1F990}', 'Tiny, pink and surprisingly good at rhythm.'),
  P('pet-dolphin', 'Dolphin', 'water', 400, '\u{1F42C}', 'A very small, very happy dolphin.', { kind: 'rogues', goal: 2 }),
  P('pet-shark', 'Shark', 'water', 480, '\u{1F988}', 'Smells a wrong note from a light year away.', { kind: 'life', stat: 'flawless', goal: 15 }),
  P('pet-whale', 'Pocket Whale', 'water', 520, '\u{1F433}', 'Sings whale songs in the key of C.', { kind: 'life', stat: 'minutes', goal: 600 }),
];

// Space creatures: one lives in each galaxy. Find it by completing worlds there.
const SPACE = [
  ['u1', 'Glimmerpup', { body: '#7DD3FC', belly: '#E0F2FE', eyes: 2, shape: 'blob', ears: 'pointy', glow: '#38BDF8' }, 'A friendly star-pup from Primera.'],
  ['u2', 'Blossomite', { body: '#F9A8D4', belly: '#FCE7F3', eyes: 2, shape: 'blob', ears: 'leaf', glow: '#EC4899' }, 'A tiny flower spirit that hums along.'],
  ['u3', 'Octopip', { body: '#A78BFA', belly: '#EDE9FE', eyes: 1, shape: 'squid', glow: '#8B5CF6' }, 'Eight wiggly arms, one big curious eye.'],
  ['u4', 'Rumblebug', { body: '#F59E0B', belly: '#FEF3C7', eyes: 3, shape: 'bug', glow: '#F97316' }, 'Loves bass notes. Feels them in its shell.'],
  ['u5', 'Twinkletwins', { body: '#34D399', belly: '#D1FAE5', eyes: 2, shape: 'twins', glow: '#10B981' }, 'Two halves of one creature. Always in sync.'],
  ['u6', 'Chromaflit', { body: '#F472B6', belly: '#FDF2F8', eyes: 2, shape: 'moth', glow: '#A855F7' }, 'Its wings shimmer through every sharp and flat.'],
  ['u7', 'Triadon', { body: '#FBBF24', belly: '#FEF9C3', eyes: 3, shape: 'blob', ears: 'crown', glow: '#F59E0B' }, 'Three eyes, three notes, one chord.'],
  ['u9', 'Hymnling', { body: '#FDE68A', belly: '#FFFBEB', eyes: 2, shape: 'ghost', glow: '#FCD34D' }, 'A choir spirit that sways to gospel.'],
  ['u8', 'Lumenmoth', { body: '#E0E7FF', belly: '#FFFFFF', eyes: 2, shape: 'moth', glow: '#A5B4FC' }, 'Drawn to the old light of the classics.'],
  ['g1', 'Mossling', { body: '#4ADE80', belly: '#DCFCE7', eyes: 2, shape: 'blob', ears: 'leaf', glow: '#22C55E' }, 'A sprout with legs, from the Verdant Reach.'],
  ['g2', 'Tidebell', { body: '#22D3EE', belly: '#CFFAFE', eyes: 2, shape: 'squid', glow: '#06B6D4' }, 'A jellyfish that rings like a bell.'],
  ['g3', 'Veilwisp', { body: '#60A5FA', belly: '#DBEAFE', eyes: 2, shape: 'ghost', glow: '#3B82F6' }, 'Shy. Peeks out from behind sapphire mist.'],
  ['g4', 'Pagewing', { body: '#FCA5A5', belly: '#FEF2F2', eyes: 2, shape: 'moth', glow: '#F87171' }, 'Its wings are pages from a storybook.'],
  ['g5', 'Cogsy', { body: '#94A3B8', belly: '#E2E8F0', eyes: 1, shape: 'bug', glow: '#CBD5E1' }, 'A clockwork beetle that ticks in tempo.'],
  ['g6', 'Velvetail', { body: '#C084FC', belly: '#F3E8FF', eyes: 2, shape: 'blob', ears: 'pointy', glow: '#9333EA' }, 'Soft as velvet, sleepy as dusk.'],
  ['g7', 'Syncopup', { body: '#FB923C', belly: '#FFEDD5', eyes: 2, shape: 'blob', ears: 'floppy', glow: '#EA580C' }, 'Always lands on the off-beat.'],
  ['g8', 'Ringlet', { body: '#FDE047', belly: '#FEFCE8', eyes: 2, shape: 'ringed', glow: '#EAB308' }, 'A tiny planet with a face and a ring.'],
  ['g9', 'Virtuo', { body: '#F43F5E', belly: '#FFE4E6', eyes: 3, shape: 'squid', glow: '#E11D48' }, 'Plays ten instruments at once.'],
  ['g10', 'Starling Rex', { body: '#FFFFFF', belly: '#FEF9C3', eyes: 2, shape: 'blob', ears: 'crown', glow: '#FDE68A' }, 'Royalty of the Crown of Stars.'],
];
SPACE.forEach(([unit, name, look, desc], i) => {
  PETS.push(P(`pet-sp${unit}`, name, 'space', 250 + i * 20, look, desc, { kind: 'galaxyWorlds', unit, goal: 3 }));
});

// Cosmic pets: little pieces of the universe that follow you around.
PETS.push(
  P('pet-blackhole', 'Baby Black Hole', 'space', 1200, { shape: 'blackhole', body: '#F97316', belly: '#FDE68A', glow: '#F97316', eyes: 2 }, 'Tiny, hungry and very cuddly. Don’t let it near your socks.', { kind: 'guardians', goal: 6 }),
  P('pet-asteroid', 'Asteroid Buddy', 'space', 600, { shape: 'asteroid', body: '#78716C', belly: '#D6D3D1', glow: '#A8A29E', eyes: 2 }, 'A lumpy little rock with its own pebble moon.', { kind: 'rogues', goal: 1 }),
  P('pet-newstar', 'Newborn Star', 'space', 900, { shape: 'star', body: '#FDE68A', belly: '#FFFBEB', glow: '#FBBF24', eyes: 2 }, 'Just switched on. Twinkles when you play well.', { kind: 'threeStar', goal: 10 }),
  P('pet-nebula', 'Nebula Puff', 'space', 800, { shape: 'nebula', body: '#A78BFA', belly: '#F472B6', glow: '#C084FC', eyes: 2 }, 'A soft cloud of stardust that hums.', { kind: 'days', goal: 20 }),
  P('pet-pulsar', 'Pulsar Pup', 'space', 1000, { shape: 'pulsar', body: '#93C5FD', belly: '#E0F2FE', glow: '#38BDF8', eyes: 2 }, 'Spins and beeps exactly on the beat.', { kind: 'life', stat: 'perfect', goal: 2000 }),
  P('pet-moonlet', 'Moonlet', 'space', 700, { shape: 'moonlet', body: '#E2E8F0', belly: '#94A3B8', glow: '#CBD5E1', eyes: 2 }, 'A sleepy little moon. Always napping.', { kind: 'planets', goal: 15 }),
  P('pet-bigbang', 'Mini Big Bang', 'space', 4000, { shape: 'bigbang', body: '#FDE68A', belly: '#A78BFA', glow: '#FDE68A', eyes: 2 }, 'Super rare. A whole tiny universe, being born over and over.', { kind: 'badges', goal: 50 }),
);

export const rewardLook = (id) => (REWARD_ITEMS.find((x) => x.id === id) || PETS.find((x) => x.id === id) || EVENT_ITEMS.find((x) => x.id === id) || {}).look || null;
