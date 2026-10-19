// The bigger wardrobe: dozens of glasses (frame shapes × colours × lens tints) and
// outfits for your explorer. Avatar grid: 100 × 100, eyes at (41, 45) and (59, 45),
// shoulders from y ≈ 72. Outfits mostly take your chosen clothes colour (c.cloth).

const shoulders = (c, extra = '', fill = c.cloth) => `<path d="M8 100 Q10 76 36 72 Q50 80 64 72 Q90 76 92 100 Z" fill="${fill}"/>${extra}`;
const BODY = 'M8 100 Q10 76 36 72 Q50 80 64 72 Q90 76 92 100 Z';
const clip = (c, id, inner) => `<defs><clipPath id="${c.g(id)}"><path d="${BODY}"/></clipPath></defs><g clip-path="url(#${c.g(id)})">${inner}</g>`;

// ---- Glasses -----------------------------------------------------------------------
// Lens outlines centred on an eye at x (y = 45).
const LENS = {
  round: (x) => `M${x - 6} 45a6 6 0 1 0 12 0a6 6 0 1 0 -12 0`,
  small: (x) => `M${x - 4.6} 45a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0`,
  big: (x) => `M${x - 7.8} 45a7.8 7.6 0 1 0 15.6 0a7.8 7.6 0 1 0 -15.6 0`,
  oval: (x) => `M${x - 7} 45a7 5 0 1 0 14 0a7 5 0 1 0 -14 0`,
  square: (x) => `M${x - 6.5} 40h13v10h-13z`,
  rounded: (x) => `M${x - 6.5} 43.5q0-4 4-4h5q4 0 4 4v3q0 4-4 4h-5q-4 0-4-4z`,
  wayfarer: (x) => (x < 50 ? `M${x - 7} 40h14l-1.5 9q-.5 1.5-2 1.5h-7q-1.5 0-2-1.5z` : `M${x - 7} 40h14l-1.5 9q-.5 1.5-2 1.5h-7q-1.5 0-2-1.5z`),
  aviator: (x) => (x < 50 ? `M${x - 7} 41q7-2.5 14 0q0 8-7 9q-7-1-7-9z` : `M${x - 7} 41q7-2.5 14 0q0 8-7 9q-7-1-7-9z`),
  cateye: (x) => (x < 50 ? `M${x - 8} 41q8-3.5 14 0.5q-1 8.5-7 8.5q-6 0-7-6z` : `M${x + 8} 41q-8-3.5-14 0.5q1 8.5 7 8.5q6 0 7-6z`),
  hex: (x) => `M${x - 3.5} 39.5h7l3.5 5.5-3.5 5.5h-7l-3.5-5.5z`,
  octagon: (x) => `M${x - 3} 39.5h6l3.5 3.5v5l-3.5 3.5h-6l-3.5-3.5v-5z`,
  diamond: (x) => `M${x} 38.5l7 6.5-7 6.5-7-6.5z`,
  heart: (x) => `M${x} 50.5C${x - 7.5} 46 ${x - 5} 38.5 ${x} 41.5C${x + 5} 38.5 ${x + 7.5} 46 ${x} 50.5z`,
  star: (x) => { const pts = [...Array(10)].map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const d = i % 2 ? 3.3 : 7.2; return `${(x + d * Math.cos(a)).toFixed(2)} ${(45.5 + d * Math.sin(a)).toFixed(2)}`; }); return `M${pts.join('L')}z`; },
  flower: (x) => [...Array(6)].map((_, i) => { const a = (i * Math.PI) / 3; return `M${(x + 3.6 * Math.cos(a) - 3).toFixed(2)} ${(45 + 3.6 * Math.sin(a)).toFixed(2)}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0`; }).join(''),
  butterfly: (x) => (x < 50 ? `M${x - 8} 39q8-1 14 2l-1 6q-2 4-7 4q-5 0-6-5z` : `M${x + 8} 39q-8-1-14 2l1 6q2 4 7 4q5 0 6-5z`),
  halfmoon: (x) => `M${x - 6.5} 45h13q0 5.5-6.5 5.5t-6.5-5.5z`,
};
const FRAMES = {
  black: '#111827', gold: '#D4A017', silver: '#CBD5E1', tortoise: '#7C4A1E', rose: '#E8A39A', red: '#DC2626', blue: '#2563EB',
  white: '#F8FAFC', green: '#16A34A', purple: '#7C3AED', pink: '#EC4899', teal: '#0D9488', orange: '#EA580C', clear: '#CBD5E1',
};
const TINTS = { clear: ['#FFFFFF', 0.14], shade: ['#111827', 0.88], rose: ['#F472B6', 0.4], blue: ['#38BDF8', 0.38], amber: ['#F59E0B', 0.4], green: ['#22C55E', 0.34], violet: ['#A78BFA', 0.42], mirror: ['mirror', 1] };
const bridge = (f, w = 1.6, y = 44) => `<path d="M47 ${y} Q50 ${y - 2.2} 53 ${y} M34 43 L29.5 41.5 M66 43 L70.5 41.5" stroke="${f}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
function lenses(c, shape, frame, tint, w = 1.7) {
  const d = LENS[shape](41) + LENS[shape](59);
  const [t, op] = TINTS[tint];
  let fill = `fill="${t}" fill-opacity="${op}"`;
  let defs = '';
  if (t === 'mirror') {
    defs = `<defs><linearGradient id="${c.g('mir')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C4B5FD"/><stop offset=".45" stop-color="#60A5FA"/><stop offset=".55" stop-color="#F0ABFC"/><stop offset="1" stop-color="#FDE68A"/></linearGradient></defs>`;
    fill = `fill="url(#${c.g('mir')})"`;
  }
  const shine = tint === 'clear' ? '' : `<path d="M36 42.5 l3 -1.5 M54 42.5 l3 -1.5" stroke="#fff" stroke-width="1.1" opacity=".55" stroke-linecap="round"/>`;
  return `${defs}<path d="${d}" ${fill} stroke="${frame}" stroke-width="${w}" stroke-linejoin="round"/>${shine}`;
}
const pair = (shape, frame, tint, w) => (c) => lenses(c, shape, FRAMES[frame], tint, w) + bridge(FRAMES[frame], Math.max(1.3, (w || 1.7) - 0.2));

// Specials that aren't just two lenses.
const SPECIAL = {
  browline: (f) => (c) => `${lenses(c, 'rounded', FRAMES.gold, 'clear', 1)}<path d="M34 41.5 Q40.5 38.5 47.5 41 M52.5 41 Q59.5 38.5 66 41.5" stroke="${FRAMES[f]}" stroke-width="3" fill="none" stroke-linecap="round"/>${bridge(FRAMES.gold, 1.2)}`,
  halfrim: (f) => (c) => `<path d="${LENS.rounded(41)}${LENS.rounded(59)}" fill="#fff" fill-opacity=".1"/><path d="M34.5 44 Q34.5 39.5 41 39.5 Q47.5 39.5 47.5 44 M52.5 44 Q52.5 39.5 59 39.5 Q65.5 39.5 65.5 44" stroke="${FRAMES[f]}" stroke-width="2.2" fill="none"/>${bridge(FRAMES[f], 1.4)}`,
  rimless: (t) => () => `<path d="${LENS.rounded(41)}${LENS.rounded(59)}" fill="${TINTS[t][0]}" fill-opacity="${Math.max(0.18, TINTS[t][1] * 0.7)}" stroke="#E2E8F0" stroke-width=".5"/>${bridge('#CBD5E1', 1.1)}`,
  monocle: (f) => () => `<circle cx="59" cy="45" r="6.4" fill="#fff" fill-opacity=".14" stroke="${FRAMES[f]}" stroke-width="1.8"/><path d="M63 50 Q66 62 60 72" stroke="${FRAMES[f]}" stroke-width=".9" fill="none" stroke-dasharray="1.6 1"/>`,
  visor: (t) => (c) => `<path d="M31 41 Q50 36 69 41 L67 49 Q50 52 33 49 Z" fill="${TINTS[t][0] === 'mirror' ? `url(#${c.g('vmir')})` : TINTS[t][0]}" fill-opacity="${TINTS[t][0] === 'mirror' ? 1 : TINTS[t][1]}" stroke="#111827" stroke-width="1.4"/>${TINTS[t][0] === 'mirror' ? `<defs><linearGradient id="${c.g('vmir')}"><stop offset="0" stop-color="#22D3EE"/><stop offset=".5" stop-color="#A78BFA"/><stop offset="1" stop-color="#F472B6"/></linearGradient></defs>` : ''}<path d="M36 42 Q50 39 64 42" stroke="#fff" stroke-width="1" opacity=".5" fill="none"/>`,
  goggles: (f) => () => `<path d="M27 44 H73" stroke="${FRAMES[f]}" stroke-width="3.5"/><rect x="33" y="38.5" width="15" height="13" rx="6" fill="#7DD3FC" fill-opacity=".55" stroke="${FRAMES[f]}" stroke-width="2.4"/><rect x="52" y="38.5" width="15" height="13" rx="6" fill="#7DD3FC" fill-opacity=".55" stroke="${FRAMES[f]}" stroke-width="2.4"/><path d="M36 42 l3 -1.5 M55 42 l3 -1.5" stroke="#fff" stroke-width="1.2" opacity=".7"/>`,
  steampunk: () => () => `<path d="M27 44 H73" stroke="#78350F" stroke-width="3"/>${[41, 59].map((x) => `<circle cx="${x}" cy="45" r="7" fill="#F59E0B" fill-opacity=".5" stroke="#B45309" stroke-width="2.6"/><circle cx="${x}" cy="45" r="4.5" fill="none" stroke="#FDE68A" stroke-width=".8"/>${[0, 60, 120, 180, 240, 300].map((a) => `<circle cx="${(x + 7 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(45 + 7 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" r=".9" fill="#FDE68A"/>`).join('')}`).join('')}`,
  threeD: () => () => `<rect x="33" y="40" width="14" height="10" rx="1.5" fill="#EF4444" fill-opacity=".6" stroke="#F8FAFC" stroke-width="2"/><rect x="53" y="40" width="14" height="10" rx="1.5" fill="#3B82F6" fill-opacity=".6" stroke="#F8FAFC" stroke-width="2"/>${bridge('#F8FAFC', 2)}`,
  pixel: () => () => `<path d="M31 41h38v3h-3v3h-3v3h-6v-3h-3v-3h-4v3h-3v3h-6v-3h-3v-3h-4z" fill="#111827"/><path d="M36 43h3v3h-3zM55 43h3v3h-3z" fill="#fff" opacity=".85"/>`,
  sport: (t) => () => `<path d="M30 42 Q50 37 70 42 Q69 50 60 50 Q53 49 50 46 Q47 49 40 50 Q31 50 30 42 Z" fill="${TINTS[t][0]}" fill-opacity="${TINTS[t][1]}" stroke="#111827" stroke-width="1.4"/><path d="M34 42.5 Q42 40 46 42" stroke="#fff" stroke-width="1" opacity=".55" fill="none"/>`,
  readers: (f) => (c) => `${lenses(c, 'halfmoon', FRAMES[f], 'clear', 1.6)}${bridge(FRAMES[f], 1.3, 46.5)}<path d="M29 44 Q22 62 30 74 M71 44 Q78 62 70 74" stroke="${FRAMES[f]}" stroke-width=".8" fill="none" opacity=".8"/>`,
  partystar: () => (c) => lenses(c, 'star', '#F59E0B', 'amber', 1.6) + bridge('#F59E0B', 1.5) + `<circle cx="34" cy="38" r="1" fill="#FDE68A"/><circle cx="66" cy="38" r="1" fill="#FDE68A"/>`,
};

// The new glasses: [id, name, price, draw]
export const NEW_GLASSES = [
  ['glasses-round-gold', 'Gold round glasses', 90, pair('round', 'gold', 'clear')],
  ['glasses-round-tort', 'Tortoiseshell round glasses', 90, pair('round', 'tortoise', 'clear', 2)],
  ['glasses-round-rose', 'Rose gold round glasses', 110, pair('round', 'rose', 'clear', 1.5)],
  ['glasses-lennon', 'Little round specs', 90, pair('small', 'silver', 'clear', 1.4)],
  ['glasses-lennon-blue', 'Blue little round shades', 120, pair('small', 'gold', 'blue', 1.4)],
  ['glasses-oversized', 'Oversized glasses', 110, pair('big', 'black', 'clear', 2)],
  ['glasses-oversized-pink', 'Oversized pink shades', 140, pair('big', 'pink', 'rose', 2)],
  ['glasses-oval', 'Oval glasses', 80, pair('oval', 'black', 'clear')],
  ['glasses-oval-silver', 'Silver oval glasses', 90, pair('oval', 'silver', 'clear', 1.4)],
  ['glasses-square-tort', 'Tortoiseshell square glasses', 90, pair('square', 'tortoise', 'clear', 2.2)],
  ['glasses-square-red', 'Red square glasses', 90, pair('square', 'red', 'clear', 2.2)],
  ['glasses-square-blue', 'Blue square glasses', 90, pair('square', 'blue', 'clear', 2.2)],
  ['glasses-rounded-black', 'Thick rounded frames', 90, pair('rounded', 'black', 'clear', 2.8)],
  ['glasses-rounded-white', 'White rounded frames', 100, pair('rounded', 'white', 'clear', 2.6)],
  ['glasses-rounded-green', 'Green rounded frames', 100, pair('rounded', 'green', 'clear', 2.4)],
  ['glasses-wayfarer', 'Classic wayfarers', 120, pair('wayfarer', 'black', 'shade', 2)],
  ['glasses-wayfarer-tort', 'Tortoiseshell wayfarers', 130, pair('wayfarer', 'tortoise', 'amber', 2)],
  ['glasses-wayfarer-clear', 'Clear-frame wayfarers', 120, pair('wayfarer', 'clear', 'clear', 2)],
  ['glasses-aviator-gold', 'Gold aviators', 150, pair('aviator', 'gold', 'shade', 1.3)],
  ['glasses-aviator-silver', 'Silver aviators', 150, pair('aviator', 'silver', 'shade', 1.3)],
  ['glasses-aviator-mirror', 'Mirrored aviators', 220, pair('aviator', 'gold', 'mirror', 1.3)],
  ['glasses-aviator-rose', 'Rose-tint aviators', 160, pair('aviator', 'rose', 'rose', 1.3)],
  ['glasses-cateye-black', 'Black cat-eye glasses', 120, pair('cateye', 'black', 'clear', 2)],
  ['glasses-cateye-red', 'Red cat-eye shades', 150, pair('cateye', 'red', 'shade', 2)],
  ['glasses-cateye-pearl', 'Pearl cat-eye glasses', 140, pair('cateye', 'white', 'clear', 2)],
  ['glasses-hex-gold', 'Gold hexagon glasses', 130, pair('hex', 'gold', 'clear', 1.4)],
  ['glasses-hex-teal', 'Teal hexagon shades', 150, pair('hex', 'teal', 'green', 1.6)],
  ['glasses-octagon', 'Octagon glasses', 120, pair('octagon', 'silver', 'clear', 1.4)],
  ['glasses-octagon-amber', 'Amber octagon shades', 150, pair('octagon', 'gold', 'amber', 1.4)],
  ['glasses-diamond', 'Diamond shades', 160, pair('diamond', 'purple', 'violet', 1.6)],
  ['glasses-heart-pink', 'Pink heart glasses', 140, pair('heart', 'pink', 'rose', 1.6)],
  ['glasses-heart-gold', 'Gold heart glasses', 150, pair('heart', 'gold', 'clear', 1.4)],
  ['glasses-star', 'Superstar shades', 180, SPECIAL.partystar()],
  ['glasses-flower', 'Flower power glasses', 160, pair('flower', 'orange', 'amber', 1.2)],
  ['glasses-butterfly', 'Butterfly glasses', 150, pair('butterfly', 'purple', 'violet', 1.8)],
  ['glasses-butterfly-shade', 'Butterfly shades', 160, pair('butterfly', 'black', 'shade', 1.8)],
  ['glasses-browline', 'Browline glasses', 140, SPECIAL.browline('black')],
  ['glasses-browline-tort', 'Tortoiseshell browlines', 140, SPECIAL.browline('tortoise')],
  ['glasses-halfrim', 'Half-rim glasses', 110, SPECIAL.halfrim('black')],
  ['glasses-halfrim-gold', 'Gold half-rim glasses', 120, SPECIAL.halfrim('gold')],
  ['glasses-rimless', 'Rimless glasses', 100, SPECIAL.rimless('clear')],
  ['glasses-rimless-blue', 'Rimless blue-light glasses', 110, SPECIAL.rimless('blue')],
  ['glasses-readers', 'Half-moon readers', 110, SPECIAL.readers('gold')],
  ['glasses-readers-red', 'Red half-moon readers', 110, SPECIAL.readers('red')],
  ['glasses-monocle', 'Monocle', 180, SPECIAL.monocle('gold')],
  ['glasses-monocle-silver', 'Silver monocle', 180, SPECIAL.monocle('silver')],
  ['glasses-visor', 'Space visor', 220, SPECIAL.visor('blue')],
  ['glasses-visor-mirror', 'Mirror visor', 260, SPECIAL.visor('mirror')],
  ['glasses-visor-shade', 'Night visor', 220, SPECIAL.visor('shade')],
  ['glasses-goggles', 'Swim goggles', 120, SPECIAL.goggles('teal')],
  ['glasses-goggles-ski', 'Ski goggles', 140, SPECIAL.goggles('orange')],
  ['glasses-steampunk', 'Steampunk goggles', 240, SPECIAL.steampunk()],
  ['glasses-3d', '3D glasses', 120, SPECIAL.threeD()],
  ['glasses-pixel', 'Pixel shades', 200, SPECIAL.pixel()],
  ['glasses-sport', 'Sport shades', 140, SPECIAL.sport('shade')],
  ['glasses-sport-mirror', 'Mirrored sport shades', 200, SPECIAL.sport('violet')],
  ['glasses-round-mirror', 'Mirrored round shades', 200, pair('round', 'silver', 'mirror', 1.4)],
  ['glasses-square-green', 'Green-tint square shades', 140, pair('square', 'black', 'green', 2.2)],
];

// ---- Outfits ----------------------------------------------------------------------
const stripes = (c, col, ys, w = 3) => ys.map((y) => `<rect x="0" y="${y}" width="100" height="${w}" fill="${col}"/>`).join('');
const vstripes = (col, xs, w = 3) => xs.map((x) => `<rect x="${x}" y="70" width="${w}" height="30" fill="${col}"/>`).join('');
const dots = (pts, r, col) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`).join('');
const crew = (col, w = 2.4) => `<path d="M40 72 Q50 82 60 72" stroke="${col}" stroke-width="${w}" fill="none"/>`;
const vneck = (c, col = c.clothDark) => `<path d="M40 72 L50 86 L60 72" fill="${c.tone || '#000'}" opacity="0"/><path d="M40 72 L50 86 L60 72" stroke="${col}" stroke-width="2.2" fill="none"/>`;
const lapels = (col, inner = '#F8FAFC') => `<path d="M42 72 L50 100 L58 72 Z" fill="${inner}"/><path d="M36 72 L46 90 L44 100 M64 72 L54 90 L56 100" stroke="${col}" stroke-width="2.4" fill="none"/>`;
const zipper = (col = '#CBD5E1') => `<path d="M50 78 V100" stroke="${col}" stroke-width="1.6" stroke-dasharray="1.5 1"/>`;
const buttons = (col, ys = [84, 90, 96]) => ys.map((y) => `<circle cx="50" cy="${y}" r="1.1" fill="${col}"/>`).join('');
const pocket = (x, y, col) => `<rect x="${x}" y="${y}" width="9" height="7" rx="1" fill="none" stroke="${col}" stroke-width="1.2"/>`;
const collarPts = (col) => `<path d="M40 70 L46 78 L50 74 L54 78 L60 70" fill="${col}" stroke="${col}" stroke-width="1" stroke-linejoin="round"/>`;
const starPath = (x, y, r) => { const pts = [...Array(10)].map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const d = i % 2 ? r * 0.45 : r; return `${(x + d * Math.cos(a)).toFixed(1)},${(y + d * Math.sin(a)).toFixed(1)}`; }); return `<polygon points="${pts.join(' ')}"`; };

// [id, name, price, draw(c), collar?(c)]
export const NEW_CLOTHES = [
  // Tees and tops
  ['clothes-stripetee', 'Striped tee', 80, (c) => shoulders(c) + clip(c, 'st', stripes(c, '#F8FAFC', [78, 85, 92, 99])), (c) => crew(c.clothDark)],
  ['clothes-ringer', 'Ringer tee', 80, (c) => shoulders(c, '', '#F8FAFC') + `<path d="M8 100 Q10 76 36 72" stroke="${c.cloth}" stroke-width="4" fill="none"/><path d="M92 100 Q90 76 64 72" stroke="${c.cloth}" stroke-width="4" fill="none"/>`, (c) => crew(c.cloth, 3)],
  ['clothes-vneck', 'V-neck tee', 70, (c) => shoulders(c), (c) => vneck(c)],
  ['clothes-pockettee', 'Pocket tee', 70, (c) => shoulders(c, pocket(56, 84, c.clothDark)), (c) => crew(c.clothDark)],
  ['clothes-raglan', 'Raglan tee', 90, (c) => shoulders(c, '', '#F8FAFC') + clip(c, 'rg', `<path d="M0 72 L36 72 L26 100 L0 100 Z M100 72 L64 72 L74 100 L100 100 Z" fill="${c.cloth}"/>`), (c) => crew(c.clothDark)],
  ['clothes-tank', 'Tank top', 70, (c) => `<path d="M30 100 Q30 80 36 74 L42 74 Q50 84 58 74 L64 74 Q70 80 70 100 Z" fill="${c.cloth}"/>`],
  ['clothes-startee', 'Star tee', 100, (c) => shoulders(c, `${starPath(50, 90, 7)} fill="#FDE68A"/>`), (c) => crew(c.clothDark)],
  ['clothes-planettee', 'Planet tee', 110, (c) => shoulders(c, `<ellipse cx="50" cy="90" rx="11" ry="3" fill="none" stroke="#FDE68A" stroke-width="1.4" transform="rotate(-15 50 90)"/><circle cx="50" cy="90" r="6" fill="#A855F7"/>`), (c) => crew(c.clothDark)],
  ['clothes-rockettee', 'Rocket tee', 110, (c) => shoulders(c, `<path d="M50 80 q5 4 5 11v4h-10v-4q0-7 5-11z" fill="#F1F5F9"/><circle cx="50" cy="88" r="1.8" fill="#60A5FA"/><path d="M45 92l-3 4h3zM55 92l3 4h-3z" fill="#EF4444"/><path d="M47.5 95h5l-1 4h-3z" fill="#F97316"/>`), (c) => crew(c.clothDark)],
  ['clothes-alientee', 'Alien tee', 110, (c) => shoulders(c, `<ellipse cx="50" cy="90" rx="6" ry="7" fill="#86EFAC"/><ellipse cx="47.5" cy="90" rx="1.8" ry="1.2" fill="#111827" transform="rotate(25 47.5 90)"/><ellipse cx="52.5" cy="90" rx="1.8" ry="1.2" fill="#111827" transform="rotate(-25 52.5 90)"/>`), (c) => crew(c.clothDark)],
  ['clothes-pianotee', 'Piano keys tee', 120, (c) => shoulders(c, `<rect x="36" y="84" width="28" height="11" rx="1.5" fill="#F8FAFC"/>${[40, 44, 52, 56, 60].map((x) => `<rect x="${x - 1}" y="84" width="2" height="6.5" fill="#111827"/>`).join('')}`), (c) => crew(c.clothDark)],
  ['clothes-notetee', 'Music note tee', 100, (c) => shoulders(c, `<ellipse cx="46" cy="94" rx="3" ry="2.2" fill="#FDE68A" transform="rotate(-20 46 94)"/><path d="M48.6 93V83l7 2v8" stroke="#FDE68A" stroke-width="1.8" fill="none"/><ellipse cx="53.4" cy="93" rx="3" ry="2.2" fill="#FDE68A" transform="rotate(-20 53.4 93)"/>`), (c) => crew(c.clothDark)],
  ['clothes-galaxytee', 'Galaxy tee', 140, (c) => shoulders(c, '', '#1E1B4B') + clip(c, 'gx', `<ellipse cx="50" cy="90" rx="34" ry="9" fill="#7C3AED" opacity=".55" transform="rotate(-12 50 90)"/>${dots([[24, 84], [40, 95], [62, 82], [76, 92], [54, 98], [32, 90], [70, 98]], 0.9, '#fff')}`), () => crew('#312E81')],
  ['clothes-tiedye', 'Tie-dye tee', 120, (c) => shoulders(c) + clip(c, 'td', ['#F472B6', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA'].map((col, i) => `<circle cx="50" cy="94" r="${34 - i * 6}" fill="none" stroke="${col}" stroke-width="5" opacity=".75"/>`).join('')), (c) => crew(c.clothDark)],
  // Knits
  ['clothes-turtleneck', 'Turtleneck', 100, (c) => shoulders(c, `<path d="M14 90 H86" stroke="${c.clothDark}" stroke-width="1.4" opacity=".5"/>`), (c) => `<path d="M40 64 Q50 68 60 64 L61 76 Q50 81 39 76 Z" fill="${c.clothDark}"/><path d="M40 68 Q50 72 60 68 M40 72 Q50 76 60 72" stroke="${c.cloth}" stroke-width="1" fill="none" opacity=".6"/>`],
  ['clothes-cableknit', 'Cable-knit sweater', 120, (c) => shoulders(c, [30, 42, 58, 70].map((x) => `<path d="M${x} 76 q3 3 0 6 q-3 3 0 6 q3 3 0 6" stroke="${c.clothDark}" stroke-width="2" fill="none"/>`).join('')), (c) => crew(c.clothDark, 3.2)],
  ['clothes-cardigan', 'Cardigan', 110, (c) => shoulders(c, `<path d="M50 74 V100" stroke="${c.clothDark}" stroke-width="2"/>${buttons(c.clothDark, [82, 88, 94])}<path d="M44 72 L50 82 L56 72" fill="#F8FAFC"/>`), null],
  ['clothes-argyle', 'Argyle sweater', 130, (c) => shoulders(c) + clip(c, 'ar', [30, 50, 70].map((x) => `<path d="M${x} 78 l8 10 -8 10 -8 -10z" fill="${c.clothDark}"/>`).join('') + `<path d="M22 78 L78 100 M78 78 L22 100" stroke="#FDE68A" stroke-width=".8" opacity=".7"/>`), (c) => vneck(c)],
  ['clothes-fairisle', 'Snowflake knit', 130, (c) => shoulders(c, `<path d="M14 82 H86 M14 96 H86" stroke="#F8FAFC" stroke-width="2.2" stroke-dasharray="2 2"/>${[30, 50, 70].map((x) => `<path d="M${x} 85v8M${x - 4} 89h8M${x - 3} 86l6 6M${x + 3} 86l-6 6" stroke="#F8FAFC" stroke-width="1.1"/>`).join('')}`), (c) => crew(c.clothDark, 3)],
  ['clothes-quarterzip', 'Quarter-zip pullover', 120, (c) => shoulders(c, `<path d="M50 72 V88" stroke="#CBD5E1" stroke-width="1.6"/><rect x="48.8" y="86" width="2.4" height="3" rx=".6" fill="#CBD5E1"/>`), (c) => `<path d="M40 70 L50 74 L60 70 L58 76 L50 79 L42 76 Z" fill="${c.clothDark}"/>`],
  ['clothes-sweatervest', 'Sweater vest', 110, (c) => shoulders(c, '', '#F8FAFC') + `<path d="M28 100 Q28 80 38 74 L50 90 L62 74 Q72 80 72 100 Z" fill="${c.cloth}"/>`, () => collarPts('#F8FAFC')],
  // Shirts
  ['clothes-buttonup', 'Button-up shirt', 90, (c) => shoulders(c, `<path d="M50 78 V100" stroke="${c.clothDark}" stroke-width="1.2"/>${buttons(c.clothDark, [82, 88, 94, 99])}${pocket(32, 82, c.clothDark)}`), (c) => collarPts(c.clothDark)],
  ['clothes-plaid', 'Plaid shirt', 120, (c) => shoulders(c) + clip(c, 'pl', vstripes(c.clothDark, [16, 30, 44, 58, 72, 86], 4) + stripes(c, c.clothDark, [80, 92], 4) + `<rect x="0" y="70" width="100" height="30" fill="#000" opacity=".08"/>`), (c) => collarPts(c.clothDark)],
  ['clothes-hawaiian', 'Tropical shirt', 130, (c) => shoulders(c, [[26, 84], [44, 92], [62, 82], [76, 94], [34, 96], [56, 98]].map(([x, y]) => `${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${(x + 2.4 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(y + 2.4 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" rx="2" ry="1.4" fill="#F8FAFC" transform="rotate(${a} ${(x + 2.4 * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(y + 2.4 * Math.sin((a * Math.PI) / 180)).toFixed(1)})"/>`).join('')}<circle cx="${x}" cy="${y}" r="1" fill="#FBBF24"/>`).join('') + `<path d="M50 78 V100" stroke="${c.clothDark}" stroke-width="1.2"/>`), (c) => collarPts(c.clothDark)],
  ['clothes-polo', 'Polo shirt', 90, (c) => shoulders(c, buttons(c.clothDark, [78, 82])), (c) => collarPts(c.clothDark)],
  ['clothes-denimshirt', 'Denim shirt', 110, (c) => shoulders(c, `<path d="M50 76 V100" stroke="#F59E0B" stroke-width=".8" stroke-dasharray="1.4 1"/>${pocket(30, 80, '#F59E0B')}${pocket(61, 80, '#F59E0B')}${buttons('#CBD5E1')}`, '#3B6FB6'), () => collarPts('#2F5A96')],
  ['clothes-shirttie', 'Shirt & tie', 120, (c) => shoulders(c, '', '#F8FAFC') + `<path d="M48 76 L52 76 L54 96 L50 100 L46 96 Z" fill="${c.cloth}"/><path d="M48 76 L52 76 L51 79 L49 79 Z" fill="${c.clothDark}"/>`, () => collarPts('#E2E8F0')],
  ['clothes-jersey', 'Baseball jersey', 120, (c) => shoulders(c, '', '#F8FAFC') + clip(c, 'bj', vstripes('#CBD5E1', [20, 32, 44, 56, 68, 80], 0.8)) + `<path d="M50 74 V100" stroke="${c.cloth}" stroke-width="2"/>${buttons(c.cloth, [82, 89, 96])}<text x="34" y="92" font-size="9" font-weight="900" fill="${c.cloth}" font-family="system-ui">88</text>`, (c) => vneck(c, c.cloth)],
  ['clothes-sportjersey', 'Sports jersey', 120, (c) => shoulders(c, `<path d="M8 100 Q10 76 36 72" stroke="#F8FAFC" stroke-width="3" fill="none"/><path d="M92 100 Q90 76 64 72" stroke="#F8FAFC" stroke-width="3" fill="none"/><text x="50" y="96" font-size="15" font-weight="900" text-anchor="middle" fill="#F8FAFC" font-family="system-ui">7</text>`), (c) => vneck(c, '#F8FAFC')],
  // Jackets and coats
  ['clothes-bomber', 'Bomber jacket', 150, (c) => shoulders(c, `${zipper()}<path d="M8 99 H92" stroke="${c.clothDark}" stroke-width="3"/>`), (c) => `<path d="M38 70 Q50 76 62 70 L62 75 Q50 81 38 75 Z" fill="${c.clothDark}"/>`],
  ['clothes-leather', 'Leather jacket', 180, (c) => shoulders(c, `<path d="M42 74 L50 100 L58 74" fill="#F8FAFC"/><path d="M36 72 L50 92 M64 72 L56 82" stroke="#0F172A" stroke-width="2.2" fill="none"/><path d="M58 82 V100" stroke="#94A3B8" stroke-width="1.2"/>${dots([[30, 76], [70, 76]], 1, '#CBD5E1')}`, '#1F2937'), null],
  ['clothes-puffer', 'Puffer jacket', 170, (c) => shoulders(c, `${[80, 88, 96].map((y) => `<path d="M10 ${y} Q50 ${y + 3} 90 ${y}" stroke="${c.clothDark}" stroke-width="1.6" fill="none"/>`).join('')}${zipper()}`), (c) => `<path d="M38 66 Q50 72 62 66 L63 76 Q50 82 37 76 Z" fill="${c.cloth}" stroke="${c.clothDark}" stroke-width="1"/>`],
  ['clothes-varsity', 'Varsity jacket', 180, (c) => shoulders(c, '', '#F8FAFC') + `<path d="M36 72 Q50 80 64 72 L64 100 L36 100 Z" fill="${c.cloth}"/>${buttons('#F8FAFC', [80, 86, 92, 98])}<text x="70" y="90" font-size="10" font-weight="900" fill="${c.cloth}" font-family="system-ui">K</text>`, () => `<path d="M38 70 Q50 76 62 70 L62 75 Q50 81 38 75 Z" fill="#F8FAFC" stroke="#94A3B8" stroke-width=".6" stroke-dasharray="1 1"/>`],
  ['clothes-windbreaker', 'Windbreaker', 140, (c) => shoulders(c) + clip(c, 'wb', `<path d="M0 84 L100 76 L100 86 L0 94 Z" fill="#F8FAFC" opacity=".85"/>`) + zipper(), (c) => `<path d="M39 70 Q50 75 61 70 L61 75 Q50 80 39 75 Z" fill="${c.clothDark}"/>`],
  ['clothes-raincoat', 'Raincoat', 140, (c) => shoulders(c, `${buttons('#F8FAFC', [80, 87, 94])}${pocket(28, 88, c.clothDark)}${pocket(63, 88, c.clothDark)}`, c.cloth), (c) => `<path d="M30 64 Q50 56 70 64 L64 74 Q50 80 36 74 Z" fill="${c.clothDark}"/>`],
  ['clothes-blazer', 'Blazer', 160, (c) => shoulders(c, lapels(c.clothDark) + buttons(c.clothDark, [92, 97]) + pocket(62, 90, c.clothDark)), null],
  ['clothes-trackjacket', 'Track jacket', 130, (c) => shoulders(c, `<path d="M8 100 Q10 76 36 72" stroke="#F8FAFC" stroke-width="2" fill="none"/><path d="M92 100 Q90 76 64 72" stroke="#F8FAFC" stroke-width="2" fill="none"/>${zipper('#F8FAFC')}`), (c) => `<path d="M39 70 Q50 76 61 70 L61 74 Q50 79 39 74 Z" fill="#F8FAFC"/>`],
  ['clothes-trench', 'Trench coat', 170, (c) => shoulders(c, `${lapels('#9A6B3C', '#F8FAFC')}<path d="M8 92 H92" stroke="#9A6B3C" stroke-width="3"/>${dots([[40, 84], [60, 84], [40, 96], [60, 96]], 1.3, '#78350F')}`, '#C8A170'), null],
  ['clothes-peacoat', 'Peacoat', 170, (c) => shoulders(c, `${lapels(c.clothDark, c.clothDark)}${dots([[40, 86], [60, 86], [40, 94], [60, 94]], 1.6, '#CBD5E1')}`), null],
  ['clothes-scarfcoat', 'Coat & scarf', 160, (c) => shoulders(c, buttons(c.clothDark)), () => `<path d="M38 70 Q50 78 62 70 L63 77 Q50 84 37 77 Z" fill="#DC2626"/><path d="M56 76 L60 96 L54 96 L52 78 Z" fill="#B91C1C"/><path d="M54 92 h6 M54 94 h6" stroke="#FCA5A5" stroke-width=".7"/>`],
  // Formal and stage
  ['clothes-suit', 'Suit & tie', 180, (c) => shoulders(c, `${lapels(c.clothDark)}<path d="M48.5 74 L51.5 74 L53 94 L50 98 L47 94 Z" fill="#DC2626"/>`), null],
  ['clothes-vestbow', 'Waistcoat & bow tie', 170, (c) => shoulders(c, '', '#F8FAFC') + `<path d="M30 100 Q30 82 40 74 L50 92 L60 74 Q70 82 70 100 Z" fill="${c.cloth}"/>${buttons('#FDE68A', [92, 97])}`, () => `<path d="M44 73 l6 3 -6 3z M56 73 l-6 3 6 3z" fill="#111827"/><circle cx="50" cy="76" r="1.4" fill="#111827"/>`],
  ['clothes-gown', 'Sparkle gown', 220, (c) => `<path d="M14 100 Q16 84 34 80 Q50 76 66 80 Q84 84 86 100 Z" fill="${c.cloth}"/><path d="M34 80 Q50 74 66 80" stroke="#FDE68A" stroke-width="1.4" fill="none"/>${dots([[30, 90], [44, 96], [58, 88], [72, 94], [50, 86], [38, 84], [64, 98]], 0.9, '#FDE68A')}`],
  ['clothes-conductor', 'Conductor’s coat', 200, (c) => shoulders(c, `${lapels('#0F172A')}<path d="M36 72 Q40 74 42 78 M64 72 Q60 74 58 78" stroke="#FDE68A" stroke-width="1.2" fill="none"/>`, '#111827'), () => `<path d="M45 73 l5 2.4 -5 2.4z M55 73 l-5 2.4 5 2.4z" fill="#F8FAFC"/>`],
  ['clothes-bandjacket', 'Marching band jacket', 210, (c) => shoulders(c, `${[78, 84, 90, 96].map((y) => `<path d="M42 ${y} H58" stroke="#FDE68A" stroke-width="1.4"/>`).join('')}${dots([[42, 78], [58, 78], [42, 84], [58, 84], [42, 90], [58, 90]], 1, '#FDE68A')}<path d="M8 100 Q10 76 36 72 L30 78 Q16 82 14 100" fill="#FDE68A" opacity=".85"/>`), () => `<path d="M40 68 H60 V75 Q50 79 40 75 Z" fill="#FDE68A"/>`],
  ['clothes-rockstar', 'Rock star jacket', 200, (c) => shoulders(c, `${dots([[20, 82], [26, 78], [32, 76], [80, 82], [74, 78], [68, 76]], 1.1, '#CBD5E1')}<path d="M42 74 L50 100 L58 74" fill="#DC2626"/><path d="M38 72 L48 94 M62 72 L52 94" stroke="#0F172A" stroke-width="2" fill="none"/>`, '#111827'), null],
  ['clothes-cape', 'Hero cape', 190, (c) => `<path d="M10 100 Q14 80 36 72 L64 72 Q86 80 90 100 Z" fill="${c.cloth}"/><path d="M28 100 Q30 82 40 76 Q50 84 60 76 Q70 82 72 100 Z" fill="#F8FAFC"/>${starPath(50, 90, 6)} fill="${c.cloth}"/>`, () => `<path d="M36 72 Q50 66 64 72" stroke="#FDE68A" stroke-width="2.4" fill="none"/>`],
  ['clothes-wizard', 'Wizard cloak', 200, (c) => shoulders(c, `${dots([[24, 88], [40, 96], [62, 86], [76, 94]], 1.2, '#FDE68A')}<path d="M44 82 l2 -4 2 4 -4 -2.5 h4z" fill="#FDE68A"/>`), (c) => `<path d="M34 72 Q50 64 66 72 L60 80 Q50 74 40 80 Z" fill="${c.clothDark}"/>`],
  ['clothes-knight', 'Knight tabard', 200, (c) => shoulders(c, '', '#94A3B8') + `<path d="M34 74 L66 74 L64 100 L36 100 Z" fill="${c.cloth}"/>${starPath(50, 87, 7)} fill="#FDE68A"/>${dots([[22, 84], [78, 84], [18, 92], [82, 92]], 1, '#CBD5E1')}`],
  // Space and work
  ['clothes-flightsuit', 'Flight suit', 170, (c) => shoulders(c, `${zipper('#475569')}<rect x="26" y="80" width="12" height="6" rx="1" fill="#1E3A8A"/><path d="M28 83h8" stroke="#F8FAFC" stroke-width=".9"/><circle cx="68" cy="83" r="3.4" fill="#F97316"/><path d="M65.6 83h4.8M68 80.6v4.8" stroke="#fff" stroke-width=".8"/>`, '#5B7A3A'), (c) => collarPts('#4A6630')],
  ['clothes-galaxyhoodie', 'Galaxy hoodie', 170, (c) => `<path d="M24 76 Q26 58 50 58 Q74 58 76 76" fill="#312E81"/>` + shoulders(c, '', '#1E1B4B') + clip(c, 'gh', `<ellipse cx="50" cy="88" rx="38" ry="10" fill="#A855F7" opacity=".5" transform="rotate(10 50 88)"/><ellipse cx="50" cy="88" rx="22" ry="5" fill="#F0ABFC" opacity=".55" transform="rotate(10 50 88)"/>${dots([[22, 82], [36, 96], [64, 80], [80, 94], [50, 98]], 0.9, '#fff')}`), () => `<path d="M38 74 Q50 86 62 74" stroke="#312E81" stroke-width="3" fill="none"/>`],
  ['clothes-labcoat', 'Lab coat', 150, (c) => shoulders(c, `${lapels('#CBD5E1', c.cloth)}${pocket(28, 88, '#CBD5E1')}<path d="M30 87 v-4 M32 87 v-5" stroke="#3B82F6" stroke-width="1"/>`, '#F8FAFC'), null],
  ['clothes-chef', 'Chef jacket', 150, (c) => shoulders(c, `${dots([[44, 80], [56, 80], [44, 87], [56, 87], [44, 94], [56, 94]], 1.3, '#94A3B8')}<path d="M38 74 Q50 86 62 74" fill="none" stroke="#E2E8F0" stroke-width="2"/>`, '#F8FAFC'), () => `<path d="M39 68 H61 V75 Q50 79 39 75 Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>`],
  ['clothes-scrubs', 'Scrubs', 120, (c) => shoulders(c, pocket(28, 84, c.clothDark)), (c) => vneck(c)],
  ['clothes-pilot', 'Pilot jacket', 190, (c) => shoulders(c, `${lapels('#0F172A', '#F8FAFC')}<path d="M24 82 q4 -2 8 0 q-4 1 -8 0z M68 82 q4 -2 8 0 q-4 1 -8 0z" fill="#FDE68A"/><path d="M28 82 h0" /><path d="M20 77 H32 M68 77 H80" stroke="#FDE68A" stroke-width="1.6"/>`, '#1E3A8A'), null],
  ['clothes-sailor', 'Sailor top', 140, (c) => shoulders(c, '', '#F8FAFC') + `<path d="M36 72 L50 90 L64 72 L74 76 L62 84 L50 92 L38 84 L26 76 Z" fill="${c.cloth}"/><path d="M28 78 L38 85 M72 78 L62 85" stroke="#F8FAFC" stroke-width="1"/><path d="M47 88 l3 4 3 -4 -3 1.5z" fill="#DC2626"/>`],
  ['clothes-apron', 'Baker’s apron', 120, (c) => shoulders(c, '', '#F8FAFC') + `<path d="M34 80 Q50 76 66 80 L64 100 L36 100 Z" fill="${c.cloth}"/><path d="M38 74 L38 82 M62 74 L62 82" stroke="${c.cloth}" stroke-width="2.4"/>${pocket(45.5, 88, c.clothDark)}`, () => crew('#E2E8F0')],
];
