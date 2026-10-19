// Explorer looks: the parts you can wear on your profile picture.
// Every human skin tone, every realistic hairstyle and all facial hair are free.
// Fantasy and whimsical pieces are bought with Stardust, earned by achievements,
// or arrive with seasonal packs (see js/data/events.js).

import { LOOKS } from '../render/avatar.js';

export const PARTS = [
  { id: 'skin', name: 'Skin' }, { id: 'hair', name: 'Hair' }, { id: 'eyes', name: 'Eyes' }, { id: 'ears', name: 'Ears' },
  { id: 'facial', name: 'Facial hair' }, { id: 'clothes', name: 'Clothes' }, { id: 'hat', name: 'Hats & wraps' },
];

const A = (id, part, name, price = 0, req) => ({ id, cat: 'avatar', part, name, price, desc: `${name} for your explorer.`, ...(req ? { req } : {}) });
const free = (part, ids) => ids.map(([id, name]) => A(id, part, name));

export const AVATAR_ITEMS = [
  ...Object.entries(LOOKS.skin).filter(([id]) => !['skin-alien', 'skin-cosmic', 'skin-lilac', 'skin-coral', 'skin-robot', 'skin-gold', 'skin-galaxy'].includes(id)).map(([id, s]) => A(id, 'skin', s.name)),
  A('skin-alien', 'skin', 'Alien Green', 150), A('skin-cosmic', 'skin', 'Cosmic Blue', 150), A('skin-lilac', 'skin', 'Lilac', 150), A('skin-coral', 'skin', 'Coral', 150),
  A('skin-robot', 'skin', 'Chrome', 300, { kind: 'life', stat: 'perfect', goal: 3000 }), A('skin-gold', 'skin', 'Gold', 400, { kind: 'guardians', goal: 10 }), A('skin-galaxy', 'skin', 'Galaxy', 600, { kind: 'galaxies', goal: 5 }),
  ...free('hair', [['hair-none', 'Bald'], ['hair-twa', 'TWA'], ['hair-afro', 'Afro'], ['hair-bigafro', 'Big afro'], ['hair-puffs', 'Afro puffs'], ['hair-hightop', 'High-top fade'], ['hair-waves', '360 waves'], ['hair-cornrows', 'Cornrows'], ['hair-boxbraids', 'Box braids'], ['hair-locs', 'Locs'], ['hair-twists', 'Twists'], ['hair-bantu', 'Bantu knots'], ['hair-coils', 'Finger coils'], ['hair-short', 'Short'], ['hair-curly', 'Curly'], ['hair-buzz', 'Buzz cut'], ['hair-long', 'Long'], ['hair-bob', 'Bob'], ['hair-bun', 'Bun'], ['hair-mohawk', 'Mohawk'], ['hair-spiky', 'Spiky']]),
  A('hair-flame', 'hair', 'Flame hair', 250), A('hair-nebula', 'hair', 'Nebula hair', 300, { kind: 'days', goal: 15 }), A('hair-tentacles', 'hair', 'Alien tendrils', 200), A('hair-crystal', 'hair', 'Crystal spikes', 350, { kind: 'rogues', goal: 3 }),
  ...free('eyes', [['eyes-round', 'Round'], ['eyes-happy', 'Happy'], ['eyes-sleepy', 'Sleepy'], ['eyes-wide', 'Wide'], ['eyes-lashes', 'Lashes']]),
  A('eyes-star', 'eyes', 'Star eyes', 150), A('eyes-heart', 'eyes', 'Heart eyes', 150), A('eyes-glow', 'eyes', 'Guardian glow', 300, { kind: 'guardians', goal: 3 }), A('eyes-cyclops', 'eyes', 'One big eye', 200), A('eyes-triple', 'eyes', 'Three eyes', 200), A('eyes-visor', 'eyes', 'Robot visor', 300, { kind: 'life', stat: 'notes', goal: 10000 }),
  ...free('ears', [['ears-human', 'Ears'], ['ears-none', 'Hidden']]),
  A('ears-elf', 'ears', 'Pointed ears', 120), A('ears-cat', 'ears', 'Cat ears', 150), A('ears-bunny', 'ears', 'Bunny ears', 150), A('ears-bear', 'ears', 'Bear ears', 120), A('ears-antennae', 'ears', 'Antennae', 180), A('ears-fins', 'ears', 'Fins', 180), A('ears-robot', 'ears', 'Robot ears', 250, { kind: 'life', stat: 'flawless', goal: 5 }),
  ...free('facial', [['facial-none', 'None'], ['facial-stubble', 'Stubble'], ['facial-mustache', 'Mustache'], ['facial-goatee', 'Goatee'], ['facial-beard', 'Beard'], ['facial-fullbeard', 'Full beard'], ['facial-sideburns', 'Sideburns'], ['facial-curlystache', 'Curly mustache']]),
  ...free('clothes', [['clothes-tee', 'T-shirt'], ['clothes-hoodie', 'Hoodie'], ['clothes-sweater', 'Cozy sweater'], ['clothes-collar', 'Collared shirt'], ['clothes-dashiki', 'Dashiki']]),
  A('clothes-jacket', 'clothes', 'Denim jacket', 150), A('clothes-overalls', 'clothes', 'Overalls', 150), A('clothes-kente', 'clothes', 'Kente stripes', 200), A('clothes-spacesuit', 'clothes', 'Space suit', 300, { kind: 'planets', goal: 10 }), A('clothes-tux', 'clothes', 'Concert tux', 350, { kind: 'life', stat: 'mastered', goal: 5 }), A('clothes-robe', 'clothes', 'Starry robe', 400, { kind: 'galaxies', goal: 3 }), A('clothes-armor', 'clothes', 'Guardian armour', 500, { kind: 'guardians', goal: 8 }),
  ...free('hat', [['hat-none', 'None'], ['hat-cap', 'Cap'], ['hat-beanie', 'Beanie'], ['hat-headwrap', 'Head wrap'], ['hat-durag', 'Durag']]),
  A('hat-headphones', 'hat', 'Headphones', 150), A('hat-flowers', 'hat', 'Flower crown', 150), A('hat-party', 'hat', 'Party hat', 120), A('hat-helmet', 'hat', 'Space helmet', 300, { kind: 'planets', goal: 25 }), A('hat-crown', 'hat', 'Royal crown', 600, { kind: 'boss', id: 'boss-g10' }),
];

export const DEFAULT_AVATAR = { skin: 'skin-umber', hair: 'hair-afro', hairColor: '#1B1210', eyes: 'eyes-round', ears: 'ears-human', facial: 'facial-none', clothes: 'clothes-hoodie', clothesColor: '#6D28D9', hat: 'hat-none', bg: '#312E81' };
export const HAIR_COLORS = ['#0E0A09', '#1B1210', '#2B1A12', '#3B2416', '#55331F', '#6E4428', '#8A5A33', '#B07A45', '#D9A86C', '#E8C98A', '#A23B2A', '#C0502E', '#9CA3AF', '#F1F5F9', '#7C3AED', '#2563EB', '#DB2777', '#059669', '#F59E0B'];
export const CLOTHES_COLORS = ['#6D28D9', '#2563EB', '#0891B2', '#059669', '#65A30D', '#CA8A04', '#EA580C', '#DC2626', '#DB2777', '#7C2D12', '#111827', '#475569', '#E2E8F0', '#F5E6CC'];
export const BG_COLORS = ['#312E81', '#1E1B4B', '#0F766E', '#7C2D12', '#831843', '#1E3A8A', '#14532D', '#422006', '#4C1D95', '#0C4A6E'];
