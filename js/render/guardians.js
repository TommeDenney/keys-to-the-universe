// Guardian mascots: each boss is an explorer built from the same parts as the
// Shop (skin, hair, eyes, clothes, hats...), so they look like they belong in the
// same universe, plus a signature prop that matches their name. 100×100.

import { avatarSVG } from './avatar.js';

const A = (o) => ({ skin: 'skin-umber', hair: 'hair-none', hairColor: '#1B1210', hlMode: 'off', eyes: 'eyes-round', ears: 'ears-human', facial: 'facial-none', glasses: 'glasses-none', clothes: 'clothes-robe', clothesColor: '#4C1D95', hat: 'hat-none', expr: 'expr-determined', bg: '#1E1B4B', ...o });

// Props drawn over the portrait.
const P = {
  key: `<g transform="translate(76 52) rotate(20)"><circle r="7" fill="none" stroke="#FBBF24" stroke-width="3.5"/><path d="M0 7 V30 M0 22 H6 M0 28 H5" stroke="#FBBF24" stroke-width="3.5" stroke-linecap="round"/><text y="3" font-size="8" font-weight="900" text-anchor="middle" fill="#FBBF24">C</text></g>`,
  starCrown: `<path d="M50 2 L54 12 L65 12 L56 19 L60 30 L50 23 L40 30 L44 19 L35 12 L46 12 Z" fill="#F0ABFC" stroke="#A21CAF" stroke-width="1"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(50 + 44 * Math.cos((a - 90) * Math.PI / 180)).toFixed(1)}" cy="${(52 + 44 * Math.sin((a - 90) * Math.PI / 180)).toFixed(1)}" r="3" fill="#F5D0FE" class="g-orbit"/>`).join('')}`,
  bassHorns: `<path d="M30 30 Q14 24 16 10 Q24 18 32 22 M70 30 Q86 24 84 10 Q76 18 68 22" stroke="#E9D5FF" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="15" cy="10" r="3" fill="#E9D5FF"/><circle cx="85" cy="10" r="3" fill="#E9D5FF"/>`,
  twinShields: `<g><path d="M8 66 H24 V80 Q16 88 16 88 Q8 80 8 80 Z" fill="#34D399" stroke="#065F46" stroke-width="1.5"/><text x="16" y="79" font-size="9" font-weight="900" text-anchor="middle" fill="#065F46">L</text><path d="M76 66 H92 V80 Q84 88 84 88 Q76 80 76 80 Z" fill="#67E8F9" stroke="#155E75" stroke-width="1.5"/><text x="84" y="79" font-size="9" font-weight="900" text-anchor="middle" fill="#155E75">R</text></g>`,
  chromaShield: `<path d="M10 60 H30 V78 Q20 88 20 88 Q10 78 10 78 Z" fill="url(#chromaG)" stroke="#fff" stroke-width="1.5"/><text x="20" y="76" font-size="13" font-weight="900" text-anchor="middle" fill="#fff">♯</text><defs><linearGradient id="chromaG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F472B6"/><stop offset=".5" stop-color="#A78BFA"/><stop offset="1" stop-color="#22D3EE"/></linearGradient></defs>`,
  baton: `<path d="M80 74 L94 40" stroke="#F8FAFC" stroke-width="2.6" stroke-linecap="round"/><circle cx="94" cy="40" r="2.2" fill="#FDE68A" class="g-glow"/>`,
  halo: `<ellipse cx="50" cy="12" rx="17" ry="4.5" fill="none" stroke="#FDE68A" stroke-width="3" class="g-glow"/>`,
  candle: `<rect x="10" y="66" width="7" height="20" rx="1.5" fill="#FEF3C7"/><path d="M13.5 66 Q9 57 13.5 52 Q18 57 13.5 66" fill="#FBBF24" class="g-flame"/>`,
  gate: `<path d="M30 100 V82 Q50 70 70 82 V100" fill="#292524" opacity=".85"/><path d="M36 100 V82 M44 100 V77 M50 100 V76 M56 100 V77 M64 100 V82" stroke="#A8A29E" stroke-width="2"/>`,
  gear: `<g class="g-gear" transform="translate(82 78)"><circle r="10" fill="#B45309"/>${[...Array(8)].map((_, i) => `<rect x="-2" y="-14" width="4" height="6" fill="#B45309" transform="rotate(${i * 45})"/>`).join('')}<circle r="5" fill="#FDE68A"/></g>`,
  notebook: `<g transform="translate(68 64) rotate(10)"><rect width="22" height="28" rx="2" fill="#FFFBEB" stroke="#1E40AF" stroke-width="1.5"/><path d="M4 8 H18 M4 13 H18 M4 18 H14" stroke="#93C5FD" stroke-width="1.2"/></g><path d="M28 74 L14 56" stroke="#F8FAFC" stroke-width="2.4"/><path d="M14 56 Q8 48 16 46 Q16 52 14 56" fill="#F8FAFC"/>`,
  wizardHat: `<path d="M28 30 L50 -6 L72 30 Z" fill="#4338CA"/><path d="M24 30 Q50 22 76 30 Q50 36 24 30 Z" fill="#3730A3"/><circle cx="58" cy="8" r="2" fill="#FDE68A"/><circle cx="46" cy="18" r="1.6" fill="#FDE68A"/>`,
  book: `<path d="M26 82 Q50 74 74 82 L74 96 Q50 88 26 96 Z" fill="#FEF3C7" stroke="#92400E" stroke-width="1.2"/><path d="M50 78 V92" stroke="#92400E" stroke-width="1.2"/>`,
  nemes: `<path d="M24 40 Q22 14 50 12 Q78 14 76 40 Q66 26 50 26 Q34 26 24 40 Z" fill="#1D4ED8"/><path d="M24 40 L18 74 L32 66 L32 44 Z M76 40 L82 74 L68 66 L68 44 Z" fill="#1D4ED8"/>${[30, 40, 50, 60, 70].map((x) => `<path d="M${x} 15 Q${x + (x - 50) * .1} 21 ${x + (x - 50) * .2} 27" stroke="#FBBF24" stroke-width="2.4" fill="none"/>`).join('')}<path d="M20 50 L31 47 M19 58 L31 55 M18 66 L31 63 M80 50 L69 47 M81 58 L69 55 M82 66 L69 63" stroke="#FBBF24" stroke-width="2.4"/><path d="M46 14 L50 4 L54 14 Z" fill="#FBBF24"/>`,
  phantomMask: `<path d="M50 32 Q66 30 70 40 Q68 52 54 50 Q50 48 50 44 Z" fill="#F8FAFC" stroke="#C4B5FD" stroke-width="1"/><path d="M66 70 Q74 62 78 70 Q72 74 66 70 Z" fill="#E11D48"/><path d="M72 72 L74 90" stroke="#166534" stroke-width="2"/>`,
  bowler: `<ellipse cx="50" cy="24" rx="24" ry="4.5" fill="#1C1917"/><path d="M34 24 Q34 6 50 6 Q66 6 66 24 Z" fill="#1C1917"/><path d="M35 20 H65" stroke="#B91C1C" stroke-width="3"/><path d="M84 70 L84 98 M84 70 Q84 62 91 62" stroke="#78350F" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  wig: `${[[28, 34], [26, 44], [28, 54], [72, 34], [74, 44], [72, 54]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#F8FAFC"/>`).join('')}<path d="M32 30 Q50 14 68 30 Q60 24 50 24 Q40 24 32 30 Z" fill="#F8FAFC"/>`,
  gavel: `<rect x="72" y="76" width="18" height="12" rx="2" fill="#fff" stroke="#111827" stroke-width="1.5"/><text x="81" y="85.5" font-size="8" font-weight="900" text-anchor="middle" fill="#111827">10</text><path d="M12 84 L26 72" stroke="#78350F" stroke-width="3"/><rect x="6" y="80" width="12" height="7" rx="1.5" fill="#92400E" transform="rotate(-35 12 84)"/>`,
  sparkles: [[12, 34], [88, 34], [18, 14], [82, 14]].map(([x, y]) => `<path d="M${x} ${y - 4} L${x + 1.2} ${y - 1.2} L${x + 4} ${y} L${x + 1.2} ${y + 1.2} L${x} ${y + 4} L${x - 1.2} ${y + 1.2} L${x - 4} ${y} L${x - 1.2} ${y - 1.2} Z" fill="#FDE68A" class="g-glow"/>`).join(''),
  starBaton: `<path d="M80 74 L94 40" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/><path d="M94 32 L95.6 37 L100.6 38.6 L95.6 40.2 L94 45 L92.4 40.2 L87.4 38.6 L92.4 37 Z" fill="#FDE68A" class="g-glow"/>`,
};

// Each Guardian: an explorer look + props. A wide mix of people (and a few non-humans).
const G = {
  'boss-u1': [A({ skin: 'skin-chestnut', hair: 'hair-locs', clothes: 'clothes-robe', clothesColor: '#1D4ED8', eyes: 'eyes-glow', expr: 'expr-calm', bg: '#1E3A8A' }), P.key],
  'boss-u2': [A({ skin: 'skin-cocoa', hair: 'hair-highpuff', hairColor: '#2B1A12', clothes: 'clothes-robe', clothesColor: '#7C3AED', eyes: 'eyes-lashes', expr: 'expr-smirk', bg: '#4C1D95' }), P.starCrown],
  'boss-u3': [A({ skin: 'skin-honey', hair: 'hair-bigafro', hairColor: '#3B2416', facial: 'facial-fullbeard', clothes: 'clothes-sweater', clothesColor: '#0284C7', expr: 'expr-grin', bg: '#0C4A6E' })],
  'boss-u4': [A({ skin: 'skin-ebony', hair: 'hair-hightop', facial: 'facial-goatee', glasses: 'glasses-shades', clothes: 'clothes-tux', expr: 'expr-smirk', bg: '#3B0764' }), P.bassHorns],
  'boss-u5': [A({ skin: 'skin-amber', hair: 'hair-cornrows', clothes: 'clothes-armor', expr: 'expr-determined', bg: '#064E3B' }), P.twinShields],
  'boss-u6': [A({ skin: 'skin-sienna', hair: 'hair-mohawk', hairColor: '#7C3AED', facial: 'facial-beard', eyes: 'eyes-visor', clothes: 'clothes-armor', expr: 'expr-determined', bg: '#111827' }), P.chromaShield],
  'boss-u7': [A({ skin: 'skin-mahogany', hair: 'hair-boxbraids', clothes: 'clothes-robe', clothesColor: '#B91C1C', hat: 'hat-crown', eyes: 'eyes-lashes', expr: 'expr-smile', bg: '#7F1D1D' })],
  'boss-u9': [A({ skin: 'skin-espresso', hair: 'hair-waves', facial: 'facial-beard', clothes: 'clothes-robe', clothesColor: '#7F1D1D', expr: 'expr-singing', bg: '#450A0A' }), P.halo + P.baton],
  'boss-u8': [A({ skin: 'skin-ivory', hair: 'hair-curly', hairColor: '#F1F5F9', facial: 'facial-sideburns', glasses: 'glasses-round', clothes: 'clothes-tux', expr: 'expr-calm', bg: '#1C1917' }), P.candle],
  'boss-g1': [A({ skin: 'skin-robot', eyes: 'eyes-glow', ears: 'ears-none', clothes: 'clothes-armor', expr: 'expr-determined', bg: '#292524' }), P.gate],
  'boss-g2': [A({ skin: 'skin-gold', eyes: 'eyes-visor', ears: 'ears-robot', clothes: 'clothes-overalls', clothesColor: '#B45309', expr: 'expr-calm', bg: '#451A03' }), P.gear],
  'boss-g3': [A({ skin: 'skin-caramel', hair: 'hair-bun', hairColor: '#3B2416', glasses: 'glasses-cateye', clothes: 'clothes-collar', clothesColor: '#1E40AF', expr: 'expr-smile', bg: '#1E3A8A' }), P.notebook],
  'boss-g4': [A({ skin: 'skin-umber', hair: 'hair-locpony', facial: 'facial-fullbeard', hairColor: '#2B1A12', clothes: 'clothes-robe', clothesColor: '#4338CA', expr: 'expr-smile', bg: '#1E1B4B' }), P.wizardHat + P.book],
  'boss-g5': [A({ skin: 'skin-golden', ears: 'ears-cat', hairColor: '#B45309', eyes: 'eyes-glow', clothes: 'clothes-robe', clothesColor: '#D97706', expr: 'expr-smirk', bg: '#78350F', hat: 'hat-none' }), P.nemes],
  'boss-g6': [A({ skin: 'skin-porcelain', hair: 'hair-slick', hairColor: '#0E0A09', clothes: 'clothes-tux', expr: 'expr-calm', bg: '#1E1B4B' }), P.phantomMask],
  'boss-g7': [A({ skin: 'skin-cocoa', hair: 'hair-caesar', facial: 'facial-curlystache', clothes: 'clothes-jacket', clothesColor: '#065F46', expr: 'expr-grin', bg: '#022C22' }), P.bowler],
  'boss-g8': [A({ skin: 'skin-onyx', hair: 'hair-buzz', glasses: 'glasses-square', clothes: 'clothes-tux', expr: 'expr-determined', bg: '#111827' }), P.wig + P.gavel],
  'boss-g9': [A({ skin: 'skin-peach', hair: 'hair-twistout', hairColor: '#7B1E3A', hlMode: 'tips', hlColor: '#F472B6', hlLen: 50, clothes: 'clothes-tux', clothesColor: '#DB2777', expr: 'expr-singing', eyes: 'eyes-star', bg: '#831843' }), P.sparkles],
  'boss-g10': [A({ skin: 'skin-galaxy', hair: 'hair-nebula', hat: 'hat-crown', clothes: 'clothes-robe', clothesColor: '#1E1B4B', eyes: 'eyes-star', expr: 'expr-smile', bg: '#0F0A2E' }), P.starBaton],
};

/** The mascot SVG for a Guardian (a lesson id like "boss-u1"), or '' if none. */
export function guardianArt(id) {
  const g = G[id];
  if (!g) return '';
  const [look, props = ''] = g;
  const portrait = avatarSVG(look, { size: 100, uid: `g${id.replace(/\W/g, '')}` }).replace(/^<svg viewBox="0 0 100 100" width="100" height="100"/, '<svg x="0" y="0" width="100" height="100" viewBox="0 0 100 100"');
  return `<svg viewBox="0 0 100 100" class="g-mascot-art" aria-hidden="true" style="overflow:visible">${portrait}${props}</svg>`;
}
