// Shop items (all bought with Stardust ✦, earned by playing).

export const SHOP = [
  // Spaceships (your marker on the Learn map)
  { id: 'ship-classic', cat: 'ship', name: 'Classic Rocket', price: 0, desc: 'Trusty white-and-red rocket.' },
  { id: 'ship-ufo', cat: 'ship', name: 'Saucer', price: 150, desc: 'A wobbling flying saucer with blinking lights.' },
  { id: 'ship-comet', cat: 'ship', name: 'Comet Rider', price: 200, desc: 'Ride a blazing comet with a glowing tail.' },
  { id: 'ship-piano', cat: 'ship', name: 'Grand Piano Rocket', price: 300, desc: 'A rocket with keys down its side.' },
  { id: 'ship-fighter', cat: 'ship', name: 'Starfighter', price: 400, desc: 'Sleek wings and twin blue engines.' },
  { id: 'ship-gold', cat: 'ship', name: 'Golden Shuttle', price: 600, desc: 'For true champions. Shiny.' },

  // Learn-tab ambience (procedurally generated, soft attacks so the mic ignores it)
  { id: 'amb-none', cat: 'amb', name: 'Silence', price: 0, desc: 'No background sound.' },
  { id: 'amb-nebula', cat: 'amb', name: 'Nebula Drone', price: 120, desc: 'Slow, warm, drifting space pads.' },
  { id: 'amb-lofi', cat: 'amb', name: 'Lo-fi Orbit', price: 200, desc: 'Mellow electric-piano chords with gentle vinyl crackle.' },
  { id: 'amb-choir', cat: 'amb', name: 'Cosmic Choir', price: 250, desc: 'Airy voices from a faraway cathedral.' },
  { id: 'amb-shimmer', cat: 'amb', name: 'Starfield Shimmer', price: 200, desc: 'High, glittering swells like starlight.' },

  // Planet completion effects
  { id: 'fx-check', cat: 'fx', name: 'Check Mark', price: 0, desc: 'A simple green check on completed worlds.' },
  { id: 'fx-supernova', cat: 'fx', name: 'Supernova', price: 250, desc: 'Completed worlds explode in a golden burst and glow forever after.' },
  { id: 'fx-heavenly', cat: 'fx', name: 'Heavenly', price: 300, desc: 'A halo, light rays and soft white clouds around every world you finish.' },
  { id: 'fx-restore', cat: 'fx', name: 'Restoration', price: 400, desc: 'Unvisited worlds are corrupted. Complete them to heal them back to life.' },
  { id: 'fx-bloom', cat: 'fx', name: 'Divinae\u2019s Bloom', price: 0, exclusive: 'Defeat The Nature Goddess Divinae', desc: 'Completed worlds bloom with vines and flowers. Exclusive: earned, never bought.' },

  // Keyboard themes (on-screen keyboard)
  { id: 'kb-classic', cat: 'kb', name: 'Classic Ivory', price: 0, desc: 'Ivory and ebony.' },
  { id: 'kb-midnight', cat: 'kb', name: 'Midnight', price: 120, desc: 'Inverted: dark keys, light sharps.' },
  { id: 'kb-wood', cat: 'kb', name: 'Upright Wood', price: 150, desc: 'Warm wood tones like an old upright.' },
  { id: 'kb-pastel', cat: 'kb', name: 'Pastel', price: 150, desc: 'Soft rainbow pastels.' },
  { id: 'kb-neon', cat: 'kb', name: 'Neon', price: 200, desc: 'Glowing synthwave outlines.' },
  { id: 'kb-glass', cat: 'kb', name: 'Glass', price: 250, desc: 'Frosted glass keys.' },

  // Key press effects
  { id: 'press-glow', cat: 'press', name: 'Glow', price: 0, desc: 'A soft glow on each key you play.' },
  { id: 'press-sparks', cat: 'press', name: 'Sparks', price: 120, desc: 'Little sparks fly from each key.' },
  { id: 'press-ripple', cat: 'press', name: 'Ripple', price: 120, desc: 'Rings ripple out from your fingertips.' },
  { id: 'press-stars', cat: 'press', name: 'Starburst', price: 200, desc: 'Tiny stars burst upward.' },
  { id: 'press-rainbow', cat: 'press', name: 'Rainbow', price: 200, desc: 'Every key lights up in a different colour.' },
  { id: 'press-fire', cat: 'press', name: 'Flames', price: 250, desc: 'Flames lick up from each key.' },
];

export const CATEGORIES = [
  { id: 'ship', name: 'Spaceships', blurb: 'Your ship on the Learn map.' },
  { id: 'fx', name: 'Completion effects', blurb: 'What happens to a world when you complete it.' },
  { id: 'amb', name: 'Ambience', blurb: 'Background sound on the Learn tab.' },
  { id: 'kb', name: 'Keyboard themes', blurb: 'The look of the on-screen keyboard.' },
  { id: 'press', name: 'Key presses', blurb: 'Effects when keys are played.' },
];

export const IMPORT_COST = 80;

/** Song prices in the Songs tab (Learn-path songs unlock for free as you reach them). */
export function songPrice(song) {
  if (song.grade) return 60 + song.grade * 25;
  return 40 + (song.level || 1) * 20;
}

export const item = (id) => SHOP.find((x) => x.id === id);
