// Seasonal events: limited-time rare Shop items. Releases are manual: an event's
// rares can only be bought once its `released` flag is set to true here (and
// deployed). Until then the Shop shows them as "coming soon" silhouettes with a
// countdown to the planned `buy` date. They leave on their `leaves` date; unbought
// rares disappear, but anything you own is yours forever. Visuals use the same parameter sets as
// js/data/rewards.js.

export const SEASON = { name: 'Seasonal rares' };

// start/end: when the holiday is "on" (banner, decorations).
// buy: planned release date (for the countdown). released: flip to true to launch.
// leaves: the first day its rares are gone.
const d = (y, m, day) => new Date(y, m - 1, day);
export const EVENTS = [
  { id: 'pink', name: 'Pink October', emoji: '\u{1F380}', start: d(2026, 10, 1), end: d(2026, 11, 1), buy: d(2026, 10, 1), leaves: d(2026, 11, 16), released: true, deco: ['\u{1F380}', '\u2661', '\u2740'], tint: '#EC4899', blurb: 'Breast Cancer Awareness Month: pink rares to show support. Get checked, and check on the people you love.' },
  { id: 'fall', name: 'Fall', emoji: '\u{1F341}', start: d(2026, 9, 22), end: d(2026, 12, 1), buy: d(2026, 10, 19), leaves: d(2026, 12, 1), released: true, deco: ['\u{1F341}', '\u{1F342}', '\u{1F343}'], tint: '#D97706', blurb: 'Crisp air and falling leaves. The Fall pack is here until winter.' },
  { id: 'winter', name: 'Winter', emoji: '\u2744\uFE0F', start: d(2026, 12, 1), end: d(2027, 3, 20), buy: d(2026, 12, 1), leaves: d(2027, 3, 20), released: false, deco: ['\u2744\uFE0F', '\u2745', '\u2746'], tint: '#38BDF8', blurb: 'Frost, snow and cosy nights: the Winter pack, here until spring.' },
  { id: 'easter', name: 'Easter', emoji: '\u{1F423}', start: d(2027, 3, 14), end: d(2027, 4, 12), buy: d(2027, 3, 14), leaves: d(2027, 4, 12), released: false, deco: ['\u{1F423}', '\u{1F95A}', '\u{1F337}'], tint: '#A78BFA', blurb: 'Pastel eggs, chicks and spring blossoms.' },
  { id: 'spring', name: 'Spring', emoji: '\u{1F338}', start: d(2027, 3, 20), end: d(2027, 6, 21), buy: d(2027, 3, 20), leaves: d(2027, 6, 21), released: false, deco: ['\u{1F338}', '\u2740', '\u{1F33C}'], tint: '#F472B6', blurb: 'Everything is blooming: the Spring pack, here until summer.' },
  { id: 'summer', name: 'Summer', emoji: '\u2600\uFE0F', start: d(2027, 6, 21), end: d(2027, 9, 23), buy: d(2027, 6, 21), leaves: d(2027, 9, 23), released: false, deco: ['\u2600\uFE0F', '\u{1F334}', '\u{1F30A}'], tint: '#F59E0B', blurb: 'Sunshine, waves and long evenings: the Summer pack.' },
  { id: 'halloween', name: 'Halloween', emoji: '\u{1F383}', start: d(2026, 10, 1), end: d(2026, 11, 2), buy: d(2026, 10, 1), leaves: d(2026, 11, 16), released: true, deco: ['\u{1F987}', '\u{1F987}', '\u{1F383}', '\u{1F47B}'], tint: '#F97316', blurb: 'Spooky season is here. Bats over the galaxies and haunted rares in the Shop.' },
  { id: 'muertos', name: 'Día de los Muertos', emoji: '\u{1F33C}', start: d(2026, 10, 28), end: d(2026, 11, 3), buy: d(2026, 10, 28), leaves: d(2026, 11, 16), released: false, deco: ['\u{1F33C}', '\u{1F338}', '\u{1F56F}️'], tint: '#F59E0B', blurb: 'Marigolds and candlelight to remember loved ones.' },
  { id: 'diwali', name: 'Diwali', emoji: '\u{1FA94}', start: d(2026, 11, 1), end: d(2026, 11, 12), buy: d(2026, 11, 1), leaves: d(2026, 12, 8), released: false, deco: ['\u{1FA94}', '✨', '\u{1FA94}'], tint: '#FBBF24', blurb: 'The Festival of Lights: diyas, rangoli colours and golden sparks.' },
  { id: 'thanksgiving', name: 'Thanksgiving', emoji: '\u{1F983}', start: d(2026, 11, 16), end: d(2026, 11, 27), buy: d(2026, 11, 16), leaves: d(2026, 12, 8), released: false, deco: ['\u{1F342}', '\u{1F341}', '\u{1F342}'], tint: '#EA580C', blurb: 'Falling leaves and a harvest of cosy rares.' },
  { id: 'blackfriday', name: 'Black Friday', emoji: '\u{1F3F7}️', start: d(2026, 11, 27), end: d(2026, 12, 1), buy: d(2026, 11, 20), leaves: d(2026, 12, 8), released: false, deco: ['✦', '✦'], tint: '#FBBF24', sale: 0.25, blurb: '25% off everything in the Shop through Cyber Monday, plus midnight-gold rares.' },
  { id: 'hanukkah', name: 'Hanukkah', emoji: '\u{1F54E}', start: d(2026, 12, 4), end: d(2026, 12, 13), buy: d(2026, 12, 4), leaves: d(2027, 1, 16), released: false, deco: ['✨', '\u{1F54E}', '✨'], tint: '#60A5FA', blurb: 'Eight nights of light: blue and silver rares.' },
  { id: 'christmas', name: 'Christmas', emoji: '\u{1F384}', start: d(2026, 12, 1), end: d(2026, 12, 27), buy: d(2026, 12, 1), leaves: d(2027, 1, 16), released: false, deco: ['❄️', '❅', '❆', '❄️'], tint: '#22C55E', blurb: 'Snow over the universe, sleigh bells and festive rares.' },
  { id: 'solstice', name: 'Winter Solstice', emoji: '☀️', start: d(2026, 12, 18), end: d(2026, 12, 23), buy: d(2026, 12, 18), leaves: d(2027, 1, 16), released: false, deco: ['✦', '✧'], tint: '#FDE68A', blurb: 'The longest night, and the light returning.' },
  { id: 'kwanzaa', name: 'Kwanzaa', emoji: '\u{1F56F}️', start: d(2026, 12, 26), end: d(2027, 1, 2), buy: d(2026, 12, 26), leaves: d(2027, 1, 16), released: false, deco: ['\u{1F56F}️', '✨'], tint: '#16A34A', blurb: 'Seven principles, seven candles: red, black and green rares.' },
  { id: 'newyear', name: 'New Year', emoji: '\u{1F386}', start: d(2026, 12, 28), end: d(2027, 1, 16), buy: d(2026, 12, 28), leaves: d(2027, 1, 16), released: false, deco: ['\u{1F386}', '✨', '\u{1F387}'], tint: '#FDE68A', blurb: 'Fireworks for 2027! Last chance for every holiday rare: they leave on Jan 15.' },
];

const R = (id, event, cat, name, price, desc, look, type) => ({ id, event, cat, name, price, desc, look, ...(type ? { type } : {}), rare: true });

export const EVENT_ITEMS = [
  // Halloween
  R('ship-pumpkin', 'halloween', 'ship', 'Pumpkin Coach', 4000, 'A jack-o’-lantern with rockets. It glows from the inside.', { shape: 'orb', hull: '#F97316', hull2: '#FDBA74', wing: '#7C2D12', cockpit: '#FDE047', flame: '#FDBA74', deco: 'pumpkin' }),
  R('pet-bat', 'halloween', 'pet', 'Bat', 1500, 'Hangs upside down from your ship. Loves minor keys.', { fur: '#6B5B95', belly: '#C4B5FD', accent: '#3B2F5C', wings: 'bat', ears: 'big', inner: '#F9A8D4', fangs: true, snout: false }, 'land'),
  R('pet-boo', 'halloween', 'pet', 'Boo', 3000, 'A shy little ghost who followed you home.', { body: '#F5F3FF', belly: '#FFFFFF', eyes: 2, shape: 'ghost', glow: '#A78BFA' }, 'space'),
  R('fx-haunted', 'halloween', 'fx', 'Haunted', 2500, 'Bats and pumpkins circle every world you finish.', { glyphs: '\u{1F383}\u{1F987}\u{1F383}\u{1F987}', color: '#FDBA74', aura: '#F97316', spin: 14 }),
  R('press-bats', 'halloween', 'press', 'Bat Swarm', 1400, 'Bats burst out of every key.', { glyphs: ['\u{1F987}'], color: '#FFFFFF', glow: '#7C3AED', n: 2, size: 16 }),
  R('kb-spooky', 'halloween', 'kb', 'Spooky', 1800, 'Black keys with a pumpkin-orange glow.', { w: ['#1C1917', '#0C0A09'], border: '#F97316', lip: '#EA580C', b: ['#F97316', '#C2410C'], bglow: '#FDBA74', label: '#FDBA74' }),
  R('amb-haunted', 'halloween', 'amb', 'Haunted Manor', 1200, 'Creaky, eerie chords drifting down a dark hall.', { chords: [[45, 48, 51, 54], [44, 47, 50, 53], [42, 45, 48, 51], [41, 44, 47, 50]], types: ['triangle', 'sine'], len: 8, peak: 0.04, lp: 900, attack: 2.4 }),
  // Día de los Muertos
  R('fx-marigold', 'muertos', 'fx', 'Marigold Path', 2200, 'A ring of marigolds to guide spirits home.', { glyphs: '\u{1F33C}❀\u{1F33C}❀\u{1F33C}', color: '#FDBA74', aura: '#F59E0B' }),
  R('trail-papel', 'muertos', 'trail', 'Papel Picado', 1300, 'Bright cut-paper flags strung between worlds.', { stroke: '#EC4899', shift: '#F59E0B', glow: '#F472B6', width: 2, glyph: '▼ ', glyphColor: '#FDE68A' }),
  R('sheet-ofrenda', 'muertos', 'sheet', 'Ofrenda', 1000, 'Marigold paper with deep plum ink.', { paper: '#FFF4E0', ink: '#4C1D3D', line: '#F2B66D', faint: '#F8D9A8' }),
  // Diwali
  R('fx-diya', 'diwali', 'fx', 'Diya Lights', 2500, 'Little oil lamps glow around your worlds.', { glyphs: '\u{1FA94}✨\u{1FA94}✨\u{1FA94}✨', color: '#FDE68A', aura: '#F59E0B', spin: 18 }),
  R('trail-lanterns', 'diwali', 'trail', 'Lantern Road', 1400, 'A road lined with lamps.', { stroke: '#F59E0B', glow: '#FBBF24', width: 2, glyph: '\u{1FA94}   ', glyphColor: '#FDE68A' }),
  R('star-rangoli', 'diwali', 'starc', 'Rangoli', 1200, 'Stars in shifting rangoli magenta and gold.', { color: '#DB2777', shift: '#F59E0B', glow: ['#F472B6'] }),
  R('amb-festival', 'diwali', 'amb', 'Festival of Lights', 1200, 'A warm drone with bright, glowing chords.', { chords: [[48, 55, 60, 64, 67], [48, 55, 62, 65, 69], [48, 55, 60, 64, 71], [48, 55, 59, 62, 67]], types: ['sawtooth', 'sine'], len: 7, peak: 0.025, lp: 1800, attack: 1.8 }),
  // Thanksgiving
  R('pet-turkey', 'thanksgiving', 'pet', 'Turkey', 1500, 'Very grateful to be your pet instead of dinner.', { base: 'bird', fur: '#92400E', belly: '#D6A274', accent: '#78350F', tail: 'fan', beakColor: '#F59E0B', wattle: true }, 'land'),
  R('press-leaves', 'thanksgiving', 'press', 'Autumn Leaves', 1200, 'Maple leaves tumble from each key.', { glyphs: ['\u{1F341}', '\u{1F342}'], color: '#FB923C', glow: '#EA580C', n: 2, size: 15 }),
  R('trail-autumn', 'thanksgiving', 'trail', 'Harvest Trail', 1100, 'A path of fallen leaves.', { stroke: '#B45309', glow: '#F59E0B', width: 2, glyph: '\u{1F342} ', glyphColor: '#FDBA74' }),
  R('sheet-harvest', 'thanksgiving', 'sheet', 'Harvest', 1000, 'Warm pumpkin paper with cocoa ink.', { paper: '#FFF1E0', ink: '#4A2511', line: '#E2A66B', faint: '#F2CFA6' }),
  // Black Friday
  R('ship-midnight', 'blackfriday', 'ship', 'Midnight Gold', 5000, 'Matte black with gold trim. Only on Black Friday.', { shape: 'arrow', hull: '#0A0A0A', hull2: '#27272A', wing: '#18181B', cockpit: '#FBBF24', flame: '#FDE68A', deco: 'seams' }),
  R('star-blackgold', 'blackfriday', 'starc', 'Black & Gold', 1500, 'Black stars rimmed in gold.', { color: '#0A0A0A', glow: ['#FBBF24', '#B45309'] }),
  R('kb-blackgold', 'blackfriday', 'kb', 'Black Label', 2000, 'Black keys, gold edges, very fancy.', { w: ['#18181B', '#09090B'], border: '#FBBF24', lip: '#B45309', b: ['#FBBF24', '#B45309'], bglow: '#FDE68A', label: '#FDE68A' }),
  // Hanukkah
  R('fx-menorah', 'hanukkah', 'fx', 'Festival of Lights', 2500, 'Nine little flames circle every finished world.', { glyphs: '\u{1F54E}✨✨✨✨', color: '#BFDBFE', aura: '#3B82F6', spin: 16 }),
  R('kb-hanukkah', 'hanukkah', 'kb', 'Blue & Silver', 1800, 'Silver keys with deep-blue sharps.', { w: ['#F8FAFC', '#CBD5E1'], border: '#93C5FD', lip: '#3B82F6', b: ['#1E3A8A', '#172554'], bglow: '#93C5FD', label: '#1E40AF' }),
  R('star-hanukkah', 'hanukkah', 'starc', 'Candlelight Blue', 1200, 'Blue stars with a silver flame.', { color: '#3B82F6', glow: ['#E0E7FF', '#93C5FD'] }),
  R('press-sparkles', 'hanukkah', 'press', 'Candle Sparks', 1200, 'Blue and silver sparks rise from each key.', { glyphs: ['✦', '✧', '✨'], color: '#BFDBFE', glow: '#3B82F6', n: 3 }),
  // Christmas
  R('ship-sleigh', 'christmas', 'ship', 'Rocket Sleigh', 5000, 'A red-and-gold sleigh with jet runners.', { shape: 'sleigh', hull: '#DC2626', hull2: '#FBBF24', wing: '#991B1B', cockpit: '#FDE68A', flame: '#FDE68A' }),
  R('pet-reindeer', 'christmas', 'pet', 'Reindeer', 3000, 'Its nose glows when you hit a perfect note.', { fur: '#A16207', belly: '#FDE68A', accent: '#78350F', ears: 'pointy', inner: '#FDE68A', antlers: true, nose: '#DC2626', bigNose: true }, 'land'),
  R('pet-snowman', 'christmas', 'pet', 'Snowman', 1800, 'Doesn’t melt in space. Probably.', { base: 'snowman' }, 'land'),
  R('fx-snowglobe', 'christmas', 'fx', 'Snow Globe', 3000, 'Snowflakes and trees swirl around your worlds.', { glyphs: '\u{1F384}❄❅\u{1F384}❄❆', color: '#E0F2FE', aura: '#22C55E', spin: 18 }),
  R('press-presents', 'christmas', 'press', 'Presents', 1500, 'Every note is a gift.', { glyphs: ['\u{1F381}', '❄'], color: '#FFFFFF', glow: '#DC2626', n: 2, size: 15 }),
  R('kb-candycane', 'christmas', 'kb', 'Candy Cane', 1800, 'Peppermint-striped keys.', { w: ['#FFFFFF', '#FEE2E2'], border: '#DC2626', lip: '#DC2626', b: ['#DC2626', '#991B1B'], bglow: '#FCA5A5', label: '#B91C1C' }),
  R('trail-tinsel', 'christmas', 'trail', 'Tinsel', 1400, 'Shimmering red and green tinsel.', { stroke: '#DC2626', shift: '#16A34A', glow: '#FDE68A', width: 4, dash: '10 6' }),
  R('amb-sleighbells', 'christmas', 'amb', 'Silent Night Sky', 1200, 'Soft, twinkling carol chords under the snow.', { chords: [[65, 69, 72, 77], [60, 64, 70, 72], [65, 69, 72, 77], [60, 65, 69, 72]], types: ['sine', 'triangle'], len: 7, peak: 0.035, lp: 5000, attack: 1.6 }),
  // Winter Solstice
  R('fx-sunreturn', 'solstice', 'fx', 'Return of the Sun', 2000, 'A small sun ring for the longest night.', { glyphs: '☀✦☀✦', color: '#FDE68A', aura: '#F59E0B', spin: 24 }),
  R('amb-solstice', 'solstice', 'amb', 'Longest Night', 1200, 'Cold, shimmering stillness.', { chords: [[62, 69, 74, 76], [60, 67, 72, 74], [57, 64, 69, 71], [55, 62, 67, 69]], types: ['sine', 'sine'], len: 10, peak: 0.03, lp: 6000, attack: 3 }),
  // Kwanzaa
  R('fx-kinara', 'kwanzaa', 'fx', 'Kinara', 2500, 'Seven candles in red, black and green.', { glyphs: '\u{1F56F}●\u{1F56F}●\u{1F56F}●\u{1F56F}', color: '#4ADE80', aura: '#DC2626', spin: 20 }),
  R('trail-kwanzaa', 'kwanzaa', 'trail', 'Unity Road', 1300, 'A red, black and green road.', { stroke: '#DC2626', shift: '#16A34A', glow: '#22C55E', width: 4 }),
  R('star-kwanzaa', 'kwanzaa', 'starc', 'Harvest Light', 1200, 'Stars glowing red to green.', { color: '#DC2626', shift: '#16A34A', glow: ['#4ADE80'] }),
  // New Year
  R('ship-2027', 'newyear', 'ship', 'Countdown Rocket', 4500, 'A silver-and-gold rocket for the first launch of 2027.', { shape: 'rocket', hull: '#CBD5E1', hull2: '#F8FAFC', wing: '#FBBF24', cockpit: '#FDE68A', flame: '#FDE68A', deco: 'star' }),
  R('fx-fireworks', 'newyear', 'fx', 'Fireworks', 3500, 'Fireworks burst around every world you finish.', { glyphs: '\u{1F386}✨\u{1F387}✨\u{1F386}✨', color: '#FDE68A', aura: '#A855F7', spin: 10 }),
  R('press-fireworks', 'newyear', 'press', 'Firework Keys', 1800, 'Every note pops like a firework.', { glyphs: ['✦', '✷', '✹', '✺'], color: 'rainbow', glow: '#FDE68A', n: 5 }),
  R('star-champagne', 'newyear', 'starc', 'Champagne', 1500, 'Bubbly gold stars that sparkle.', { color: '#FDE68A', glow: ['#FFFFFF', '#FBBF24'], pulse: true }),
  R('sheet-midnight', 'newyear', 'sheet', 'Midnight Countdown', 1000, 'Deep midnight paper with gold ink.', { paper: '#0B1026', ink: '#FDE68A', line: '#3B3F6B', faint: '#22264A' }),
  // ---- More rares, so every holiday has a full set ----
  // Halloween
  R('trail-cobweb', 'halloween', 'trail', 'Cobweb Trail', 1300, 'Spiderwebs strung between your worlds.', { stroke: '#A8A29E', glow: '#7C3AED', width: 1.5, glyph: '\u{1F578} ', glyphColor: '#E7E5E4', dash: '2 6' }),
  R('star-pumpkin', 'halloween', 'starc', 'Jack-o’-Lantern', 1200, 'Stars that glow like carved pumpkins.', { color: '#F97316', glow: ['#FDE047', '#EA580C'], pulse: true }),
  R('sheet-haunted', 'halloween', 'sheet', 'Haunted Score', 1000, 'Midnight-purple paper with ghostly ink.', { paper: '#160F24', ink: '#E9D5FF', line: '#4C3A6B', faint: '#2C2240' }),
  // Día de los Muertos
  R('pet-xolo', 'muertos', 'pet', 'Xolo', 2000, 'A loyal Xoloitzcuintli who guides you home.', { fur: '#4B5563', belly: '#6B7280', accent: '#1F2937', ears: 'big', inner: '#9CA3AF', tail: 'thin', snoutColor: '#6B7280' }, 'land'),
  R('star-marigold', 'muertos', 'starc', 'Marigold', 1100, 'Stars the colour of cempasúchil petals.', { color: '#F59E0B', glow: ['#FDBA74'] }),
  R('press-marigold', 'muertos', 'press', 'Petal Shower', 1200, 'Marigold petals drift up from each key.', { glyphs: ['\u{1F33C}', '❀'], color: '#FDBA74', glow: '#F59E0B', n: 2, size: 14 }),
  R('kb-calavera', 'muertos', 'kb', 'Calavera', 1800, 'Sugar-skull white with bright painted sharps.', { w: ['#FFFFFF', '#FCE7F3'], border: '#EC4899', lip: '#14B8A6', b: ['#7C3AED', '#4C1D95'], bglow: '#F472B6', label: '#BE185D' }),
  // Diwali
  R('kb-diwali', 'diwali', 'kb', 'Golden Diya', 1800, 'Gold keys with deep magenta sharps.', { w: ['#FFFBEB', '#FDE68A'], border: '#F59E0B', lip: '#DB2777', b: ['#9D174D', '#500724'], bglow: '#FBBF24', label: '#9D174D' }),
  R('press-diya', 'diwali', 'press', 'Sparklers', 1300, 'Golden sparks crackle from every key.', { glyphs: ['✨', '✦', '\u{1FA94}'], color: '#FDE68A', glow: '#F59E0B', n: 3 }),
  R('sheet-rangoli', 'diwali', 'sheet', 'Saffron', 1000, 'Saffron paper with deep maroon ink.', { paper: '#FFF3DC', ink: '#5B1530', line: '#F0B46A', faint: '#F7D5A3' }),
  // Thanksgiving
  R('amb-hearth', 'thanksgiving', 'amb', 'By the Hearth', 1200, 'Warm, cosy chords by a crackling fire.', { chords: [[48, 55, 64, 67], [53, 57, 64, 69], [45, 52, 60, 67], [43, 50, 59, 65]], types: ['triangle', 'sine'], len: 6, peak: 0.045, lp: 1300, attack: 1.4 }),
  R('star-harvest', 'thanksgiving', 'starc', 'Harvest Amber', 1100, 'Deep amber stars, warm as cider.', { color: '#D97706', glow: ['#FBBF24'] }),
  R('kb-maple', 'thanksgiving', 'kb', 'Maple', 1600, 'Warm maple-wood keys with walnut sharps.', { w: ['#FDF4E3', '#E9C99A'], border: '#B45309', lip: '#92400E', b: ['#5B3A1E', '#3B2412'], bglow: '#D97706', label: '#7C2D12' }),
  // Black Friday
  R('trail-blackgold', 'blackfriday', 'trail', 'Gold Rush', 1400, 'A thin gold line on midnight black.', { stroke: '#FBBF24', glow: '#B45309', width: 2.5, glyph: '✦      ', glyphColor: '#FDE68A' }),
  R('press-gold', 'blackfriday', 'press', 'Gold Rain', 1500, 'Gold flecks shower from every key.', { glyphs: ['✦', '◆'], color: '#FBBF24', glow: '#B45309', n: 4, size: 11 }),
  R('sheet-blacklabel', 'blackfriday', 'sheet', 'Black Label', 1200, 'Black paper with gold-foil notes.', { paper: '#070707', ink: '#FBBF24', line: '#3F3420', faint: '#211B10' }),
  // Hanukkah
  R('trail-hanukkah', 'hanukkah', 'trail', 'Silver Road', 1300, 'A blue-and-silver road of light.', { stroke: '#93C5FD', shift: '#E2E8F0', glow: '#3B82F6', width: 3, glyph: '✦    ', glyphColor: '#DBEAFE' }),
  R('sheet-hanukkah', 'hanukkah', 'sheet', 'Blue & White', 1000, 'Pale-blue paper with navy ink.', { paper: '#EFF6FF', ink: '#172554', line: '#A9C5F0', faint: '#D3E2FA' }),
  R('amb-candles', 'hanukkah', 'amb', 'Candlelight', 1200, 'Gentle, glowing chords for long winter nights.', { chords: [[57, 64, 69, 72], [55, 62, 67, 71], [53, 60, 65, 69], [52, 59, 64, 68]], types: ['sine', 'triangle'], len: 8, peak: 0.035, lp: 2400, attack: 2 }),
  // Christmas
  R('star-holly', 'christmas', 'starc', 'Holly', 1200, 'Stars shifting from berry red to holly green.', { color: '#DC2626', shift: '#16A34A', glow: ['#FCA5A5'] }),
  R('sheet-christmas', 'christmas', 'sheet', 'Carol Book', 1000, 'Cream paper with red and green staves.', { paper: '#FFFCF2', ink: '#14532D', line: '#E9A3A3', faint: '#F3D3D3' }),
  // Winter Solstice
  R('star-solstice', 'solstice', 'starc', 'First Light', 1200, 'Pale gold stars for the returning sun.', { color: '#FEF3C7', glow: ['#FDE68A', '#F59E0B'], pulse: true }),
  R('trail-solstice', 'solstice', 'trail', 'Dawn Road', 1300, 'Night blue fading to sunrise gold.', { stroke: '#93C5FD', shift: '#FDE68A', glow: '#FDE68A', width: 3 }),
  R('kb-solstice', 'solstice', 'kb', 'Longest Night', 1700, 'Midnight-blue keys with sunrise sharps.', { w: ['#1E293B', '#0F172A'], border: '#FDE68A', lip: '#F59E0B', b: ['#FDE68A', '#F59E0B'], bglow: '#FEF3C7', label: '#FDE68A' }),
  // Kwanzaa
  R('kb-kwanzaa', 'kwanzaa', 'kb', 'Bendera', 1800, 'Red, black and green keys.', { w: ['#FEF2F2', '#DCFCE7'], border: '#16A34A', lip: '#DC2626', b: ['#0A0A0A', '#000000'], bglow: '#22C55E', label: '#14532D' }),
  R('press-kwanzaa', 'kwanzaa', 'press', 'Seven Lights', 1200, 'Red and green flames rise from each key.', { glyphs: ['●', '✦'], color: 'rainbow', glow: '#22C55E', n: 3, size: 10 }),
  R('sheet-kente', 'kwanzaa', 'sheet', 'Kente Gold', 1000, 'Golden paper with deep green ink.', { paper: '#FFF7D6', ink: '#14532D', line: '#E3B341', faint: '#F2D98A' }),
  // New Year
  R('pet-sparky', 'newyear', 'pet', 'Sparky', 2500, 'A tiny star creature born from a firework.', { body: '#FDE68A', belly: '#FFFBEB', eyes: 2, shape: 'blob', ears: 'crown', glow: '#F59E0B' }, 'space'),
  R('trail-confetti', 'newyear', 'trail', 'Confetti Road', 1400, 'A path of falling confetti.', { stroke: '#A855F7', shift: '#F472B6', glow: '#FDE68A', width: 2, glyph: '■ ▲ ● ', glyphColor: '#FDE68A' }),
  R('kb-gala', 'newyear', 'kb', 'Gala', 1800, 'Black-tie keys in silver and gold.', { w: ['#F8FAFC', '#CBD5E1'], border: '#94A3B8', lip: '#FBBF24', b: ['#0F172A', '#020617'], bglow: '#FDE68A', label: '#334155' }),
  R('amb-midnight', 'newyear', 'amb', 'Midnight Countdown', 1200, 'Bright, hopeful chords for a brand-new year.', { chords: [[60, 64, 67, 72], [57, 64, 69, 72], [53, 60, 65, 69], [55, 62, 67, 71]], types: ['triangle', 'sine'], len: 5, peak: 0.04, lp: 3500, attack: 1.2 }),
  // ---- Pink October (Breast Cancer Awareness Month) ----
  R('ship-pinkribbon', 'pink', 'ship', 'Pink Ribbon Glider', 3500, 'A pink glider flying for awareness.', { shape: 'glider', hull: '#FBCFE8', hull2: '#F472B6', wing: '#EC4899', cockpit: '#FFFFFF', flame: '#FBCFE8', deco: 'petals' }),
  R('pet-flamingo', 'pink', 'pet', 'Flamingo', 2000, 'The pinkest friend in the galaxy.', { base: 'bird', fur: '#F472B6', belly: '#FBCFE8', accent: '#DB2777', beak: 'hook', beakColor: '#1F2937', feet: '#EC4899' }, 'land'),
  R('fx-pinkribbon', 'pink', 'fx', 'Pink Ribbons', 2200, 'Pink bows and hearts circle every world you finish.', { glyphs: '\u{1F380}♡\u{1F380}♡\u{1F380}♡', color: '#F9A8D4', aura: '#EC4899', spin: 16 }),
  R('kb-pink', 'pink', 'kb', 'Think Pink', 1600, 'Soft pink keys with rose sharps.', { w: ['#FFF1F5', '#FBCFE8'], border: '#F472B6', lip: '#EC4899', b: ['#BE185D', '#831843'], bglow: '#F9A8D4', label: '#9D174D' }),
  R('star-pink', 'pink', 'starc', 'Hope Pink', 1000, 'Bright pink stars.', { color: '#EC4899', glow: ['#F9A8D4'] }),
  R('trail-pink', 'pink', 'trail', 'Ribbon Road', 1200, 'A pink ribbon from world to world.', { stroke: '#F472B6', glow: '#EC4899', width: 4, glyph: '♡   ', glyphColor: '#FBCFE8' }),
  R('press-pink', 'pink', 'press', 'Pink Hearts', 1100, 'Keys glow pink and hearts float up from every note.', { glyphs: ['\u2665', '\u2661', '\u2665'], color: '#F472B6', glow: '#EC4899', n: 3, size: 16, keyColor: '#F472B6' }),
  R('sheet-pink', 'pink', 'sheet', 'Pink Paper', 1000, 'Blush-pink paper with deep rose ink.', { paper: '#FFF0F5', ink: '#831843', line: '#F5B5CC', faint: '#FAD3E1' }),
  // ---- Fall ----
  R('ship-acorn', 'fall', 'ship', 'Acorn Pod', 3000, 'A snug acorn with a leafy rudder.', { shape: 'orb', hull: '#92400E', hull2: '#D97706', wing: '#78350F', cockpit: '#FDE68A', flame: '#FDBA74', deco: 'spots' }),
  R('pet-squirrel', 'fall', 'pet', 'Squirrel', 1500, 'Hides acorns all over your ship.', { fur: '#C2410C', belly: '#FED7AA', accent: '#7C2D12', ears: 'pointy', inner: '#FDBA74', tail: 'curl' }, 'land'),
  R('pet-hedgefox', 'fall', 'pet', 'Autumn Fox', 1800, 'A fox in its fluffiest fall coat.', { fur: '#C2410C', belly: '#FFF7ED', accent: '#431407', ears: 'big', tail: 'fluffy', tailTip: '#FFF7ED', inner: '#431407', paws: '#431407' }, 'land'),
  R('fx-autumn', 'fall', 'fx', 'Falling Leaves', 2000, 'Leaves drift around every world you finish.', { glyphs: '\u{1F341}\u{1F342}\u{1F343}\u{1F341}\u{1F342}', color: '#FDBA74', aura: '#D97706', spin: 20 }),
  R('kb-fall', 'fall', 'kb', 'Cinnamon', 1500, 'Spiced orange keys with chestnut sharps.', { w: ['#FFF7ED', '#FED7AA'], border: '#EA580C', lip: '#C2410C', b: ['#7C2D12', '#431407'], bglow: '#FB923C', label: '#9A3412' }),
  R('amb-fall', 'fall', 'amb', 'Autumn Rain', 1100, 'Gentle rain on fallen leaves.', { noise: { lp: 1800, gain: 0.07, lfo: 0.2, depth: 0.03, drops: true } }),
  R('star-fall', 'fall', 'starc', 'Copper', 1000, 'Burnished copper stars.', { color: '#C2410C', glow: ['#FDBA74'] }),
  // ---- Winter ----
  R('ship-iceshard', 'winter', 'ship', 'Ice Shard', 4000, 'A starship carved from a single glacier.', { shape: 'arrow', hull: '#E0F2FE', hull2: '#7DD3FC', wing: '#38BDF8', cockpit: '#FFFFFF', flame: '#BAE6FD', deco: 'seams' }),
  R('pet-polar', 'winter', 'pet', 'Polar Bear', 2500, 'A fluffy polar bear cub.', { fur: '#F8FAFC', belly: '#FFFFFF', accent: '#CBD5E1', ears: 'round', inner: '#E2E8F0', bigNose: true, snoutColor: '#F1F5F9' }, 'land'),
  R('pet-yeti', 'winter', 'pet', 'Little Yeti', 3000, 'Spotted on a frozen planet. Very huggable.', { body: '#F1F5F9', belly: '#FFFFFF', eyes: 2, shape: 'blob', ears: 'pointy', glow: '#7DD3FC' }, 'space'),
  R('fx-frostbite', 'winter', 'fx', 'Blizzard', 2500, 'A swirling blizzard around your worlds.', { glyphs: '❄❅❆❄❅❆❄', color: '#E0F2FE', aura: '#38BDF8', spin: 8 }),
  R('kb-frost', 'winter', 'kb', 'Frostbite', 1700, 'Keys rimmed with frost.', { w: ['#FFFFFF', '#E0F2FE'], border: '#7DD3FC', lip: '#0EA5E9', b: ['#0C4A6E', '#082F49'], bglow: '#BAE6FD', label: '#075985' }),
  R('trail-snow', 'winter', 'trail', 'Snowdrift', 1300, 'A path of fresh snow.', { stroke: '#F0F9FF', glow: '#7DD3FC', width: 3, glyph: '❅  ', glyphColor: '#E0F2FE' }),
  R('amb-winter', 'winter', 'amb', 'Snowfall', 1200, 'Hushed, sparkling chords as the snow falls.', { chords: [[64, 71, 76, 79], [62, 69, 74, 78], [60, 67, 72, 76], [59, 66, 71, 74]], types: ['sine', 'sine'], len: 9, peak: 0.03, lp: 5500, attack: 2.5 }),
  // ---- Easter ----
  R('ship-egg', 'easter', 'ship', 'Egg Pod', 3500, 'A painted egg with tiny rocket boosters.', { shape: 'orb', hull: '#DDD6FE', hull2: '#FBCFE8', wing: '#A78BFA', cockpit: '#FEF08A', flame: '#FDE68A', deco: 'spots' }),
  R('pet-bunny-ea', 'easter', 'pet', 'Easter Bunny', 2000, 'Leaves surprise eggs on every planet.', { fur: '#E9D5FF', belly: '#FFFFFF', accent: '#C4B5FD', ears: 'long', inner: '#FBCFE8', tail: 'puff', nose: '#F472B6' }, 'land'),
  R('pet-chick', 'easter', 'pet', 'Chick', 1500, 'Just hatched, already humming.', { base: 'bird', fur: '#FDE047', belly: '#FEF9C3', accent: '#FACC15', beakColor: '#F97316', feet: '#F97316', tuftTop: true }, 'land'),
  R('fx-eggs', 'easter', 'fx', 'Egg Hunt', 2200, 'Painted eggs circle the worlds you finish.', { glyphs: '\u{1F95A}\u{1F337}\u{1F95A}\u{1F337}\u{1F95A}', color: '#DDD6FE', aura: '#A78BFA', spin: 18 }),
  R('kb-pastelegg', 'easter', 'kb', 'Pastel Eggs', 1500, 'Soft pastel keys.', { w: ['#FEFCE8', '#E9D5FF'], border: '#C4B5FD', lip: '#F9A8D4', b: ['#A78BFA', '#7C3AED'], bglow: '#DDD6FE', label: '#6D28D9' }),
  R('star-easter', 'easter', 'starc', 'Lilac', 1000, 'Soft lilac stars.', { color: '#C4B5FD', glow: ['#F5D0FE'] }),
  // ---- Spring ----
  R('ship-blossom', 'spring', 'ship', 'Cherry Blossom', 3500, 'Petals for wings, spring for fuel.', { shape: 'glider', hull: '#FFFFFF', hull2: '#FBCFE8', wing: '#F9A8D4', cockpit: '#86EFAC', flame: '#FBCFE8', deco: 'petals' }),
  R('pet-butterfly', 'spring', 'pet', 'Butterfly', 1500, 'Flutters along beside your ship.', { base: 'butterfly', fur: '#A855F7', accent: '#F472B6', accent2: '#60A5FA' }, 'land'),
  R('pet-ladybug', 'spring', 'pet', 'Ladybug', 1200, 'Lucky spots, lucky notes.', { base: 'insect', fur: '#EF4444', accent: '#1F2937', head: '#1F2937', marks: 'spots' }, 'land'),
  R('fx-bloomring', 'spring', 'fx', 'Spring Bloom', 2200, 'Tulips and blossoms ring your worlds.', { glyphs: '\u{1F337}\u{1F338}\u{1F33C}\u{1F337}\u{1F338}', color: '#FBCFE8', aura: '#4ADE80', spin: 20 }),
  R('trail-spring', 'spring', 'trail', 'Meadow Path', 1300, 'Wildflowers along your route.', { stroke: '#86EFAC', glow: '#22C55E', width: 2, glyph: '❀ ', glyphColor: '#F9A8D4' }),
  R('amb-spring', 'spring', 'amb', 'Morning Meadow', 1200, 'Bright, gentle chords like birdsong at dawn.', { chords: [[67, 71, 74, 79], [64, 67, 72, 76], [65, 69, 72, 77], [62, 67, 71, 74]], types: ['sine', 'triangle'], len: 6, peak: 0.035, lp: 4500, attack: 1.4 }),
  R('sheet-spring', 'spring', 'sheet', 'Pressed Flowers', 1000, 'Mint paper with plum ink.', { paper: '#F0FDF4', ink: '#581C87', line: '#A7D9B5', faint: '#D1EFD9' }),
  // ---- Summer ----
  R('ship-surf', 'summer', 'ship', 'Surf Rocket', 4000, 'A surfboard with thrusters. Catch a cosmic wave.', { shape: 'sail', hull: '#0EA5E9', hull2: '#FDE047', wing: '#F97316', cockpit: '#FFFFFF', flame: '#FDE68A' }),
  R('pet-crab-su', 'summer', 'pet', 'Beach Crab', 1500, 'Brought a tiny sandcastle.', '\u{1F980}', 'water'),
  R('pet-dolphin-su', 'summer', 'pet', 'Summer Dolphin', 2500, 'Jumps through waves of starlight.', '\u{1F42C}', 'water'),
  R('fx-sunny', 'summer', 'fx', 'Sunny Days', 2200, 'Suns and palms circle every world you finish.', { glyphs: '☀\u{1F334}\u{1F30A}☀\u{1F334}', color: '#FDE68A', aura: '#F59E0B', spin: 18 }),
  R('kb-tropical', 'summer', 'kb', 'Tropical', 1600, 'Sea-blue keys with coral sharps.', { w: ['#ECFEFF', '#A5F3FC'], border: '#06B6D4', lip: '#F97316', b: ['#F97316', '#C2410C'], bglow: '#67E8F9', label: '#0E7490' }),
  R('amb-waves', 'summer', 'amb', 'Beach Waves', 1100, 'Warm waves rolling onto the shore.', { noise: { lp: 900, gain: 0.11, lfo: 0.12, depth: 0.08 } }),
  R('star-summer', 'summer', 'starc', 'Sunburst', 1100, 'Hot, golden summer stars.', { color: '#FBBF24', shift: '#F97316', glow: ['#FDE68A'] }),
];

// ---- Dates ------------------------------------------------------------------------
// For testing: add ?eventdate=2026-12-24 to the URL to see the app on another day.
export function today() {
  try {
    const q = new URLSearchParams(location.search).get('eventdate');
    if (q) { const [y, m, dd] = q.split('-').map(Number); return new Date(y, m - 1, dd, 12); }
  } catch { /* not in a browser */ }
  return new Date();
}
const ev = (id) => EVENTS.find((e) => e.id === id);
/** Holidays happening right now (for banners and decorations). */
export const activeEvents = (now = today()) => EVENTS.filter((e) => e.released && now >= e.start && now < e.end);
/** The one to feature: the most recently started. */
export const featuredEvent = (now = today()) => activeEvents(now).sort((a, b) => b.start - a.start)[0] || null;
/** Can this rare be bought today? (its holiday has started, and the season hasn't ended) */
export const eventItemAvailable = (it, now = today()) => !!ev(it.event) && ev(it.event).released && now < ev(it.event).leaves;
/** Countdown to an unreleased event's planned date. */
export function releaseCountdown(e, now = today()) {
  const ms = e.buy - now;
  if (ms <= 0) return 'Arriving any day now';
  const days = Math.floor(ms / 864e5);
  const hours = Math.floor((ms % 864e5) / 36e5);
  return days > 0 ? `Arrives in ${days}d ${hours}h` : `Arrives in ${hours}h ${Math.floor((ms % 36e5) / 6e4)}m`;
}
/** "Nov 15": the last day an event's rares can be bought. */
export const leavesText = (e) => new Date(e.leaves - 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
/** Current Shop discount (Black Friday). */
export const shopSale = (now = today()) => activeEvents(now).reduce((s, e) => Math.max(s, e.sale || 0), 0);
export const eventOf = (it) => ev(it.event) || null;
