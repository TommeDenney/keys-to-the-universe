// Explorer looks: the parts you can wear on your profile picture.
// Every human skin tone, every realistic hairstyle and all facial hair are free.
// Fantasy and whimsical pieces are bought with Stardust, earned by achievements,
// or arrive with seasonal packs (see js/data/events.js).

import { LOOKS } from '../render/avatar.js';

export const PARTS = [
  { id: 'skin', name: 'Skin' }, { id: 'hair', name: 'Hair' }, { id: 'eyes', name: 'Eyes' }, { id: 'ears', name: 'Ears' },
  { id: 'expr', name: 'Expressions' }, { id: 'facial', name: 'Facial hair' }, { id: 'glasses', name: 'Glasses' }, { id: 'clothes', name: 'Clothes' }, { id: 'hat', name: 'Hats & coverings' },
];

const HAIR_NAMES = [
  // Free starter set
  ['hair-none', 'Bald'], ['hair-buzz', 'Buzz cut'], ['hair-short', 'Short'], ['hair-twa', 'TWA'], ['hair-hightop', 'High-top fade'], ['hair-waves', '360 waves'], ['hair-cornrows', 'Cornrows'],
  ['hair-long', 'Long'], ['hair-puffs', 'Afro puffs'], ['hair-afro', 'Afro'], ['hair-boxbraids', 'Box braids'], ['hair-bantu', 'Bantu knots'],
  // Natural & protective styles
  ['hair-bigafro', 'Big afro', 90], ['hair-highpuff', 'High puff', 70], ['hair-pineapple', 'Pineapple updo', 80], ['hair-twistout', 'Twist-out', 90], ['hair-coils', 'Finger coils', 80],
  ['hair-curlybob', 'Curly bob', 80], ['hair-crochet', 'Crochet curls', 110], ['hair-halfup', 'Half-up puff', 90], ['hair-curly', 'Curly top', 60],
  ['hair-knotless', 'Knotless braids + beads', 130], ['hair-goddess', 'Goddess braids', 130], ['hair-fulani', 'Fulani braids', 140], ['hair-feedin', 'Feed-in braid', 100],
  ['hair-cornrowbun', 'Cornrows into a bun', 100], ['hair-cornrowzig', 'Zig-zag cornrows', 90], ['hair-pigtails', 'Two braids', 70], ['hair-crown', 'Braided crown', 110],
  ['hair-twists', 'Twists', 80], ['hair-passion', 'Passion twists', 130], ['hair-spongetwists', 'Sponge twists', 80], ['hair-starterlocs', 'Starter locs', 80],
  ['hair-locs', 'Locs', 100], ['hair-longlocs', 'Long locs', 130], ['hair-butterfly', 'Butterfly locs', 130], ['hair-freeform', 'Freeform locs', 110],
  ['hair-locknot', 'Loc top knot', 100], ['hair-locpony', 'Loc ponytail', 110],
  ['hair-caesar', 'Caesar with part', 70], ['hair-flattop', 'Flat top', 80], ['hair-frohawk', 'Frohawk', 90], ['hair-fingerwaves', 'Finger waves', 110],
  ['hair-silkpress', 'Silk press', 110], ['hair-wavy', 'Long waves', 100], ['hair-ponytail', 'Sleek ponytail', 90],
  // More cuts
  ['hair-bob', 'Bob', 60], ['hair-bluntbob', 'Blunt bob + bangs', 80], ['hair-hime', 'Long + bangs', 90], ['hair-pixie', 'Pixie', 70], ['hair-undercut', 'Side-swept undercut', 90],
  ['hair-asym', 'Asymmetric cut', 90], ['hair-quiff', 'Quiff', 80], ['hair-sidepart', 'Side part', 60], ['hair-slick', 'Slicked back', 70], ['hair-fauxhawk', 'Faux hawk', 80],
  ['hair-balding', 'Balding', 40], ['hair-manbun', 'Man bun', 80], ['hair-topknot', 'Top knot', 80], ['hair-bun', 'Bun', 60], ['hair-messybun', 'Messy bun', 80],
  ['hair-spacebuns', 'Space buns', 90], ['hair-chignon', 'Low chignon', 90], ['hair-sidepony', 'Side ponytail', 80], ['hair-curtain', 'Curtain bangs', 90],
  ['hair-shag', 'Layered shag', 90], ['hair-beachwaves', 'Beach waves', 100], ['hair-mohawk', 'Mohawk', 70], ['hair-spiky', 'Spiky', 60],
  // Whimsical
  // Composer looks
  ['hair-powdered', 'Powdered wig (Mozart)', 120], ['hair-baroque', 'Full-bottomed wig (Bach)', 140], ['hair-maestro', 'Wild maestro hair (Beethoven)', 120], ['hair-romantic', 'Romantic waves (Chopin)', 100], ['hair-liszt', 'Virtuoso long hair (Liszt)', 100],
  ['hair-flame', 'Flame hair', 250], ['hair-nebula', 'Nebula hair', 300, { kind: 'days', goal: 15 }], ['hair-tentacles', 'Alien tendrils', 200], ['hair-crystal', 'Crystal spikes', 350, { kind: 'rogues', goal: 3 }],
];

const A = (id, part, name, price = 0, req) => ({ id, cat: 'avatar', part, name, price, desc: `${name} for your explorer.`, ...(req ? { req } : {}) });
const free = (part, ids) => ids.map(([id, name]) => A(id, part, name));

export const AVATAR_ITEMS = [
  ...Object.entries(LOOKS.skin).filter(([id, s]) => !s.specialHead && !['skin-alien', 'skin-cosmic', 'skin-lilac', 'skin-coral', 'skin-robot', 'skin-gold', 'skin-galaxy'].includes(id)).map(([id, s]) => A(id, 'skin', s.name)),
  A('skin-alien', 'skin', 'Alien Green', 150), A('skin-cosmic', 'skin', 'Cosmic Blue', 150), A('skin-lilac', 'skin', 'Lilac', 150), A('skin-coral', 'skin', 'Coral', 150),
  A('skin-robot', 'skin', 'Chrome', 300, { kind: 'life', stat: 'perfect', goal: 3000 }), A('skin-gold', 'skin', 'Gold', 400, { kind: 'guardians', goal: 10 }), A('skin-galaxy', 'skin', 'Galaxy', 600, { kind: 'galaxies', goal: 5 }),
  // Space heads
  A('skin-alienhead', 'skin', 'Space Alien head', 350), A('skin-starhead', 'skin', 'Star head', 450, { kind: 'threeStar', goal: 10 }), A('skin-asteroid', 'skin', 'Asteroid head', 350), A('skin-comet', 'skin', 'Comet head', 500, { kind: 'rogues', goal: 3 }),
  // Hair: a free starter set (a few for every look); the rest are bought with Stardust.
  ...HAIR_NAMES.map(([id, name, price, req]) => A(id, 'hair', name, price, req)),
  ...free('eyes', [['eyes-round', 'Round'], ['eyes-happy', 'Happy'], ['eyes-sleepy', 'Sleepy'], ['eyes-wide', 'Wide'], ['eyes-lashes', 'Lashes']]),
  A('eyes-star', 'eyes', 'Star eyes', 150), A('eyes-heart', 'eyes', 'Heart eyes', 150), A('eyes-glow', 'eyes', 'Guardian glow', 300, { kind: 'guardians', goal: 3 }), A('eyes-cyclops', 'eyes', 'One big eye', 200), A('eyes-triple', 'eyes', 'Three eyes', 200), A('eyes-visor', 'eyes', 'Robot visor', 300, { kind: 'life', stat: 'notes', goal: 10000 }),
  ...free('ears', [['ears-human', 'Ears'], ['ears-none', 'Hidden']]),
  A('ears-elf', 'ears', 'Pointed ears', 120), A('ears-cat', 'ears', 'Cat ears', 150), A('ears-bunny', 'ears', 'Bunny ears', 150), A('ears-bear', 'ears', 'Bear ears', 120), A('ears-antennae', 'ears', 'Antennae', 180), A('ears-fins', 'ears', 'Fins', 180), A('ears-robot', 'ears', 'Robot ears', 250, { kind: 'life', stat: 'flawless', goal: 5 }),
  ...free('facial', [['facial-none', 'None'], ['facial-stubble', 'Stubble'], ['facial-mustache', 'Mustache'], ['facial-goatee', 'Goatee'], ['facial-beard', 'Beard'], ['facial-fullbeard', 'Full beard'], ['facial-sideburns', 'Sideburns'], ['facial-curlystache', 'Curly mustache']]),
  ...free('expr', [['expr-smile', 'Smile'], ['expr-grin', 'Big grin'], ['expr-calm', 'Calm'], ['expr-laugh', 'Laughing']]),
  A('expr-smirk', 'expr', 'Smirk', 80), A('expr-surprised', 'expr', 'Surprised', 80), A('expr-tongue', 'expr', 'Silly tongue', 100), A('expr-wink', 'expr', 'Wink', 120),
  A('expr-shy', 'expr', 'Shy', 100), A('expr-determined', 'expr', 'Determined', 150, { kind: 'guardians', goal: 5 }), A('expr-singing', 'expr', 'Singing along', 150, { kind: 'life', stat: 'mastered', goal: 3 }),
  ...free('glasses', [['glasses-none', 'None'], ['glasses-round', 'Round glasses'], ['glasses-square', 'Square glasses']]),
  A('glasses-cateye', 'glasses', 'Cat-eye glasses', 120), A('glasses-shades', 'glasses', 'Sunglasses', 150), A('glasses-heart', 'glasses', 'Heart shades', 150),
  ...free('clothes', [['clothes-tee', 'T-shirt'], ['clothes-hoodie', 'Hoodie'], ['clothes-sweater', 'Cozy sweater'], ['clothes-collar', 'Collared shirt']]),
  A('clothes-jacket', 'clothes', 'Denim jacket', 150),
  A('clothes-mozart', 'clothes', 'Mozart frock coat', 200), A('clothes-bach', 'clothes', 'Baroque cantor coat (Bach)', 200), A('clothes-beethoven', 'clothes', 'Romantic coat & cravat (Beethoven)', 200), A('clothes-chopin', 'clothes', 'Concert tailcoat (Chopin)', 180), A('clothes-liszt', 'clothes', 'Virtuoso velvet coat (Liszt)', 180), A('clothes-overalls', 'clothes', 'Overalls', 150), A('clothes-spacesuit', 'clothes', 'Space suit', 300, { kind: 'planets', goal: 10 }), A('clothes-tux', 'clothes', 'Concert tux', 350, { kind: 'life', stat: 'mastered', goal: 5 }), A('clothes-robe', 'clothes', 'Starry robe', 400, { kind: 'galaxies', goal: 3 }), A('clothes-armor', 'clothes', 'Guardian armour', 500, { kind: 'guardians', goal: 8 }),
  ...free('hat', [['hat-none', 'None'], ['hat-cap', 'Cap'], ['hat-beanie', 'Beanie'], ['hat-headband', 'Headband'], ['hat-headwrap', 'Head wrap'], ['hat-durag', 'Durag'], ['hat-hijab', 'Hijab'], ['hat-turban', 'Turban'], ['hat-kufi', 'Kufi'], ['hat-kippah', 'Kippah'], ['hat-keffiyeh', 'Keffiyeh']]),
  A('hat-headphones', 'hat', 'Headphones', 150), A('hat-flowers', 'hat', 'Flower crown', 150), A('hat-party', 'hat', 'Party hat', 120), A('hat-helmet', 'hat', 'Space helmet', 300, { kind: 'planets', goal: 25 }), A('hat-crown', 'hat', 'Royal crown', 600, { kind: 'boss', id: 'boss-g10' }),
];

export const DEFAULT_AVATAR = { skin: 'skin-umber', hair: 'hair-afro', hairColor: '#1B1210', hlMode: 'off', hlColor: '#C68642', hlLen: 40, expr: 'expr-smile', eyes: 'eyes-round', ears: 'ears-human', facial: 'facial-none', glasses: 'glasses-none', clothes: 'clothes-hoodie', clothesColor: '#6D28D9', hat: 'hat-none', bg: '#312E81' };
export const HIGHLIGHT_COLORS = ['#C68642', '#E0A96D', '#F2C57C', '#F5E6B3', '#A23B2A', '#C0502E', '#7B1E3A', '#B45309', '#D9D9D9', '#F1F5F9', '#F472B6', '#A78BFA', '#38BDF8', '#34D399'];
export const HAIR_COLORS = ['#0E0A09', '#1B1210', '#2B1A12', '#3B2416', '#55331F', '#6E4428', '#8A5A33', '#B07A45', '#D9A86C', '#E8C98A', '#A23B2A', '#C0502E', '#9CA3AF', '#F1F5F9', '#7C3AED', '#2563EB', '#DB2777', '#059669', '#F59E0B'];
export const CLOTHES_COLORS = ['#6D28D9', '#2563EB', '#0891B2', '#059669', '#65A30D', '#CA8A04', '#EA580C', '#DC2626', '#DB2777', '#7C2D12', '#111827', '#475569', '#E2E8F0', '#F5E6CC'];
export const BG_COLORS = ['#312E81', '#1E1B4B', '#0F766E', '#7C2D12', '#831843', '#1E3A8A', '#14532D', '#422006', '#4C1D95', '#0C4A6E'];
