// Shop items (all bought with Stardust ✦, earned by playing).

import { REWARD_ITEMS, PETS } from './rewards.js';
import { EVENT_ITEMS } from './events.js';

export const SHOP = [
  // Spaceships (your marker on the Learn map)
  { id: 'ship-classic', cat: 'ship', name: 'Classic Rocket', price: 0, desc: 'Trusty white-and-red rocket.' },
  { id: 'ship-ufo', cat: 'ship', name: 'Saucer', price: 150, desc: 'A wobbling flying saucer with blinking lights.' },
  { id: 'ship-comet', cat: 'ship', name: 'Comet Rider', price: 200, desc: 'Ride a blazing comet with a glowing tail.' },
  { id: 'ship-piano', cat: 'ship', name: 'Grand Piano Rocket', price: 300, desc: 'A rocket with keys down its side.' },
  { id: 'ship-fighter', cat: 'ship', name: 'Starfighter', price: 400, desc: 'Sleek wings and twin blue engines.' },
  { id: 'ship-seed', cat: 'ship', name: 'Seedship', price: 0, exclusive: 'Defeat a special boss', desc: 'A living seed-pod ship wrapped in leaves and blossoms. Exclusive.' },
  { id: 'ship-whale', cat: 'ship', name: 'Space Whale', price: 350, desc: 'A gentle whale swimming between the stars.' },
  { id: 'ship-guitar', cat: 'ship', name: 'Galaxy Guitar', price: 450, desc: 'Fly a starry guitar. Endless possibilities.' },
  { id: 'ship-bubble', cat: 'ship', name: 'Bubble Pod', price: 250, desc: 'A shimmering soap-bubble pod.' },
  { id: 'ship-gold', cat: 'ship', name: 'Golden Shuttle', price: 600, desc: 'For true champions. Shiny.' },

  // Learn-tab ambience (procedurally generated, soft attacks so the mic ignores it)
  { id: 'amb-none', cat: 'amb', name: 'Silence', price: 0, desc: 'No background sound.' },
  { id: 'amb-nebula', cat: 'amb', name: 'Nebula Drone', price: 120, desc: 'Slow, warm, drifting space pads.' },
  { id: 'amb-lofi', cat: 'amb', name: 'Lo-fi Orbit', price: 200, desc: 'Mellow electric-piano chords with gentle vinyl crackle.' },
  { id: 'amb-choir', cat: 'amb', name: 'Cosmic Choir', price: 250, desc: 'Airy voices from a faraway cathedral.' },
  { id: 'amb-ocean', cat: 'amb', name: 'Ocean Waves', price: 150, desc: 'Slow waves washing on an alien shore.' },
  { id: 'amb-dream', cat: 'amb', name: 'Dream Box', price: 220, desc: 'A sleepy music box floating in space.' },
  { id: 'amb-shimmer', cat: 'amb', name: 'Starfield Shimmer', price: 200, desc: 'High, glittering swells like starlight.' },

  // Planet completion effects
  { id: 'fx-check', cat: 'fx', name: 'Check Mark', price: 0, desc: 'A simple green check on completed worlds.' },
  { id: 'fx-supernova', cat: 'fx', name: 'Supernova', price: 250, desc: 'Completed worlds explode in a golden burst and glow forever after.' },
  { id: 'fx-heavenly', cat: 'fx', name: 'Heavenly', price: 300, desc: 'A halo, light rays and soft white clouds around every world you finish.' },
  { id: 'fx-galaxy', cat: 'fx', name: 'Spiral Galaxy', price: 350, desc: 'Completed worlds spin up their own little galaxy arms.' },
  { id: 'fx-notes', cat: 'fx', name: 'Orbiting Notes', price: 300, desc: 'Rings of music notes circle every world you finish.' },
  { id: 'fx-restore', cat: 'fx', name: 'Restoration', price: 400, desc: 'Unvisited worlds are corrupted. Complete them to heal them back to life.' },
  { id: 'fx-bloom', cat: 'fx', name: 'Bloom', price: 0, exclusive: 'Defeat a special boss', desc: 'Completed worlds bloom with vines and flowers. Exclusive: earned, never bought.' },

  // Keyboard themes (on-screen keyboard)
  { id: 'kb-classic', cat: 'kb', name: 'Classic Ivory', price: 0, desc: 'Ivory and ebony.' },
  { id: 'kb-midnight', cat: 'kb', name: 'Midnight', price: 120, desc: 'Inverted: dark keys, light sharps.' },
  { id: 'kb-wood', cat: 'kb', name: 'Upright Wood', price: 150, desc: 'Warm wood tones like an old upright.' },
  { id: 'kb-pastel', cat: 'kb', name: 'Pastel', price: 150, desc: 'Soft rainbow pastels.' },
  { id: 'kb-neon', cat: 'kb', name: 'Neon', price: 200, desc: 'Glowing synthwave outlines.' },
  { id: 'kb-ocean', cat: 'kb', name: 'Ocean', price: 180, desc: 'Sea-glass whites and deep-sea sharps.' },
  { id: 'kb-sunset', cat: 'kb', name: 'Sunset', price: 180, desc: 'Warm peach to violet, like dusk.' },
  { id: 'kb-galaxy', cat: 'kb', name: 'Galaxy', price: 300, desc: 'Keys full of stars.' },
  { id: 'kb-glass', cat: 'kb', name: 'Glass', price: 250, desc: 'Frosted glass keys.' },

  // Key press effects
  { id: 'press-glow', cat: 'press', name: 'Glow', price: 0, desc: 'A soft glow on each key you play.' },
  { id: 'press-sparks', cat: 'press', name: 'Sparks', price: 120, desc: 'Little sparks fly from each key.' },
  { id: 'press-ripple', cat: 'press', name: 'Ripple', price: 120, desc: 'Rings ripple out from your fingertips.' },
  { id: 'press-stars', cat: 'press', name: 'Starburst', price: 200, desc: 'Tiny stars burst upward.' },
  { id: 'press-rainbow', cat: 'press', name: 'Rainbow', price: 200, desc: 'Every key lights up in a different colour.' },
  { id: 'press-hearts', cat: 'press', name: 'Hearts', price: 150, desc: 'Little hearts float up from each key.' },
  { id: 'press-notes', cat: 'press', name: 'Music Notes', price: 180, desc: 'Notes fly up as you play.' },
  { id: 'press-lightning', cat: 'press', name: 'Lightning', price: 280, desc: 'Crackling bolts on every key.' },
  { id: 'press-fire', cat: 'press', name: 'Flames', price: 250, desc: 'Flames lick up from each key.' },

  // Completion star colours
  { id: 'star-gold', cat: 'starc', name: 'Gold', price: 0, desc: 'Classic golden stars.' },
  { id: 'star-silver', cat: 'starc', name: 'Silver', price: 100, desc: 'Cool, polished silver.' },
  { id: 'star-rose', cat: 'starc', name: 'Rose Quartz', price: 150, desc: 'Soft pink crystal.' },
  { id: 'star-emerald', cat: 'starc', name: 'Emerald', price: 150, desc: 'Deep green gems.' },
  { id: 'star-sapphire', cat: 'starc', name: 'Sapphire', price: 150, desc: 'Brilliant blue.' },
  { id: 'star-cosmic', cat: 'starc', name: 'Cosmic Violet', price: 250, desc: 'Glowing violet with a nebula sheen.' },
  { id: 'star-rainbow', cat: 'starc', name: 'Rainbow', price: 350, desc: 'Stars that shimmer through every colour.' },

  // Route trails (the path between planets on the Learn map)
  { id: 'trail-dots', cat: 'trail', name: 'Dotted', price: 0, desc: 'A twinkling dotted route.' },
  { id: 'trail-comet', cat: 'trail', name: 'Comet', price: 150, desc: 'A bright, glowing comet trail.' },
  { id: 'trail-rainbow', cat: 'trail', name: 'Rainbow', price: 250, desc: 'A shifting rainbow road.' },
  { id: 'trail-notes', cat: 'trail', name: 'Music Notes', price: 200, desc: 'Your route is written in notes.' },
  { id: 'trail-stars', cat: 'trail', name: 'Stardust', price: 200, desc: 'A path of little stars.' },

  // Sheet music themes (the paper in the player)
  { id: 'sheet-classic', cat: 'sheet', name: 'Classic', price: 0, desc: 'Crisp white paper.' },
  { id: 'sheet-parchment', cat: 'sheet', name: 'Parchment', price: 150, desc: 'Warm, old-world manuscript paper.' },
  { id: 'sheet-night', cat: 'sheet', name: 'Night', price: 200, desc: 'Dark paper, light notes: easy on the eyes.' },
  { id: 'sheet-blueprint', cat: 'sheet', name: 'Blueprint', price: 200, desc: 'Engineer\u2019s blue with white ink.' },
];

SHOP.push(...REWARD_ITEMS, ...PETS, ...EVENT_ITEMS);

// Prices are listed above in "base" units and scaled here, so the Shop is a real
// grind: everyday items ×6 (about 600–5,400 ✦), seasonal rares ×5 (5,000–25,000 ✦).
const nice = (x) => (x >= 1000 ? Math.round(x / 50) * 50 : Math.round(x / 10) * 10);
for (const it of SHOP) if (it.price > 0) it.price = nice(it.price * (it.rare ? 5 : 6));

export const CATEGORIES = [
  { id: 'pet', name: 'Pet shop', blurb: 'A companion who travels with your ship. Water friends live in a fish bowl; space creatures are found on the planets of each galaxy.' },
  { id: 'ship', name: 'Spaceships', blurb: 'Your ship on the Learn map.' },
  { id: 'fx', name: 'Completion effects', blurb: 'What happens to a world when you complete it.' },
  { id: 'amb', name: 'Ambience', blurb: 'Background sound on the Learn tab. Songs you unlock in the Songs tab can also be played as background music: tap the music bar at the bottom of the screen to pick them.' },
  { id: 'kb', name: 'Keyboard themes', blurb: 'The look of the on-screen keyboard.' },
  { id: 'press', name: 'Key presses', blurb: 'Effects when keys are played.' },
  { id: 'starc', name: 'Star colours', blurb: 'The colour of the stars you earn.' },
  { id: 'trail', name: 'Route trails', blurb: 'The path between planets on the Learn map.' },
  { id: 'sheet', name: 'Sheet music themes', blurb: 'The paper your music is printed on.' },
];

export const IMPORT_COST = 80;

/** Song prices in the Songs tab (Learn-path songs unlock for free as you reach them). */
export function songPrice(song) {
  if (song.grade) return 300 + song.grade * 200; // graded pieces: 500 – 2,300
  return [80, 150, 250, 400, 600][Math.min(4, Math.max(0, (song.level || 1) - 1))]; // built-in songs by level
}

export const item = (id) => SHOP.find((x) => x.id === id);
