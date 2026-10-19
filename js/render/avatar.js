// Your explorer: a shoulders-up portrait in the same flat style as the pets and
// ships. Everything is optional and mixable, for every kind of person, alien or
// otherwise: skin, eyes, ears, hair (+ colour), facial hair, clothes (+ colour), hats.
//
// Skin shading never uses white or grey (that looks ashy on deep tones): shadows are
// a deeper shade of the same tone, highlights a warm glow, and blush and lips are
// drawn from the skin itself.

import { NEW_GLASSES, NEW_CLOTHES } from './wardrobe.js';
import { HAIR } from './hair.js';

/**
 * Space-helmet size for a hairstyle: from how high the hair reaches (span) plus a
 * per-style "volume" for wide, fluffy styles. Centred a little higher for tall hair.
 */
function helmetFor(hair) {
  const top = hair.span ? hair.span[0] : 30;
  const r = Math.max(29, Math.min(46, 30 + Math.max(0, 22 - top) * 0.55 + (hair.volume || 0)));
  return { cx: 50, cy: 46 - (r - 30) * 0.42, r };
}

const mixc = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
};
const lum = (hx) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hx.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

/** Draw an explorer. `a` = { skin, eyes, ears, hair, hairColor, facial, clothes, clothesColor, hat, bg }. */
export function avatarSVG(a, { size = 100, uid = 'av' } = {}) {
  const L = LOOKS;
  const skin = (L.skin[a.skin] || L.skin['skin-umber']);
  const tone = skin.color;
  const deep = lum(tone) < 0.35;
  const shade = mixc(tone, '#2A0F05', deep ? 0.28 : 0.18);
  const glow = mixc(tone, '#FFD9B0', deep ? 0.22 : 0.3);
  const blush = mixc(tone, deep ? '#9F1239' : '#F43F5E', deep ? 0.32 : 0.28);
  const lip = mixc(tone, '#5B1A0B', deep ? 0.35 : 0.3);
  const hairC = a.hairColor || '#1B1210';
  const hairHi = mixc(hairC, '#FFE7C7', 0.18);
  const hair = L.hair[a.hair] || L.hair['hair-none'];
  const hat = L.hat[a.hat] || L.hat['hat-none'];
  const cloth = a.clothesColor || '#6D28D9';
  const clothDark = mixc(cloth, '#000000', 0.25);
  const g = (id) => `${uid}-${id}`;
  // Hair paint: base colour, plus an optional highlight from the tips up or the roots down.
  const hl = a.hlMode === 'tips' || a.hlMode === 'roots' ? a.hlMode : null;
  const len = Math.max(0.05, Math.min(1, (a.hlLen ?? 40) / 100));
  const hlC = a.hlColor || '#C68642';
  // Styles that grow upwards (high-tops, puffs, buns...) have their tips at the top.
  const [y1, y2] = hair.up ? [...(hair.span || [10, 90])].reverse() : (hair.span || [10, 90]);
  const stop = (o, col) => `<stop offset="${Math.max(0, Math.min(1, o)).toFixed(3)}" stop-color="${col}"/>`;
  const stops = !hl ? stop(0, hairC) + stop(1, hairC)
    : hl === 'tips' ? stop(0, hairC) + stop(1 - len - 0.08, hairC) + stop(1 - len + 0.08, hlC) + stop(1, hlC)
      : stop(0, hlC) + stop(len - 0.08, hlC) + stop(len + 0.08, hairC) + stop(1, hairC);
  const defs = `<defs>
    <linearGradient id="${g('hair')}" gradientUnits="userSpaceOnUse" x1="0" y1="${y1}" x2="0" y2="${y2}">${stops}</linearGradient>
    <radialGradient id="${g('sk')}" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="${glow}"/><stop offset=".55" stop-color="${tone}"/><stop offset="1" stop-color="${shade}"/></radialGradient>
    <clipPath id="${g('frame')}"><circle cx="50" cy="50" r="50"/></clipPath>
    ${skin.galaxy ? `<radialGradient id="${g('gx')}" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#A78BFA"/><stop offset=".6" stop-color="#4338CA"/><stop offset="1" stop-color="#1E1B4B"/></radialGradient>` : ''}
  </defs>`;
  const SK = skin.galaxy ? `url(#${g('gx')})` : `url(#${g('sk')})`;
  const eyeC = a.eyeColor || '#3B2416';
  const ctx = { tone, shade, glow, blush, lip, hairC, hairHi, cloth, clothDark, SK, deep, g, eyeC, eyeSet: !!a.eyeColor,
    F: `url(#${g('hair')})`, hi: hairHi, dark: mixc(hairC, '#000000', 0.35), skinLine: shade, accent: cloth,
    helmet: helmetFor(hair) };
  const out = [];
  out.push(`<circle cx="50" cy="50" r="50" fill="${a.bg || '#312E81'}"/>`);
  // Hair that falls behind you goes first: big curls and long styles sit behind the neck and clothes.
  if (hair.back && !hat.hidesHair) out.push(hair.back(ctx));
  // Clothes (shoulders), neck
  out.push((L.clothes[a.clothes] || L.clothes['clothes-tee']).draw(ctx));
  out.push(`<path d="M41 66 L41 78 Q50 84 59 78 L59 66 Z" fill="${shade}"/>`);
  out.push((L.clothes[a.clothes] || L.clothes['clothes-tee']).collar ? (L.clothes[a.clothes] || L.clothes['clothes-tee']).collar(ctx) : '');
  // Hair behind the head (some head coverings hide the hair and ears)
  if (hat.back) out.push(hat.back(ctx));
  // Ears (behind the head shape)
  const ears = hat.hidesEars || skin.noEars ? {} : (L.ears[a.ears] || L.ears['ears-human']);
  if (ears.back) out.push(ears.back(ctx));
  // Head (special heads draw their own shape, and some bring their own face)
  if (skin.behind) out.push(skin.behind(ctx));
  out.push(skin.head ? skin.head(ctx) : `<ellipse cx="50" cy="46" rx="20" ry="22" fill="${SK}"/>`);
  if (skin.galaxy) out.push([[40, 34], [58, 30], [62, 52], [36, 56], [50, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#fff" opacity=".9"/>`).join(''));
  if (skin.robot) out.push(`<path d="M30 46 H70" stroke="${shade}" stroke-width="1" opacity=".5"/><circle cx="33" cy="58" r="1.3" fill="${shade}"/><circle cx="67" cy="58" r="1.3" fill="${shade}"/>`);
  if (ears.front) out.push(ears.front(ctx));
  // Face
  if (!skin.noEyes) out.push((L.eyes[a.eyes] || L.eyes['eyes-round']).draw(ctx));
  if (!skin.noFace) {
    out.push(`<ellipse cx="37" cy="54" rx="4" ry="2.4" fill="${blush}" opacity=".55"/><ellipse cx="63" cy="54" rx="4" ry="2.4" fill="${blush}" opacity=".55"/>`);
    out.push(`<path d="M48.5 51.5 Q50 53.5 51.5 51.5" stroke="${shade}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
  }
  if (!skin.noExpr) out.push((L.expr[a.expr] || L.expr['expr-smile']).draw(ctx));
  if (!skin.noFacial) out.push((L.facial[a.facial] || L.facial['facial-none']).draw(ctx));
  if (skin.face) out.push(skin.face(ctx));
  out.push((L.glasses[a.glasses] || L.glasses['glasses-none']).draw(ctx));
  // Hair in front, then hats
  if (hair.front && !hat.hidesHair) out.push(hair.front(ctx));
  out.push(hat.draw(ctx));
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="avatar-svg" aria-hidden="true">${defs}<g clip-path="url(#${g('frame')})">${out.join('')}</g></svg>`;
}

// ---- Parts ------------------------------------------------------------------------------
const hairCap = (c, extra = '') => `<path d="M29 44 Q28 22 50 21 Q72 22 71 44 Q67 32 50 31 Q33 32 29 44 Z" fill="${c.hairC}"/>${extra}`;
const strands = (c, xs, y0, y1, w = 3) => xs.map((x) => `<path d="M${x} ${y0} V${y1}" stroke="${c.hairC}" stroke-width="${w}" stroke-linecap="round"/>`).join('');

export const LOOKS = {
  skin: {},
  eyes: {
    'eyes-round': { draw: (c) => eyesPair((x) => `<ellipse cx="${x}" cy="45" rx="3" ry="3.6" fill="${c.eyeC}"/><ellipse cx="${x}" cy="45.3" rx="1.6" ry="2" fill="#1E1B3A"/><circle cx="${x - 1}" cy="43.8" r="1.1" fill="#fff"/>`) + brows(c) },
    'eyes-happy': { draw: (c) => eyesPair((x) => `<path d="M${x - 3.5} 46 Q${x} 41.5 ${x + 3.5} 46" stroke="#1E1B3A" stroke-width="2" fill="none" stroke-linecap="round"/>`) + brows(c) },
    'eyes-sleepy': { draw: (c) => eyesPair((x) => `<path d="M${x - 3.5} 45 Q${x} 48 ${x + 3.5} 45" stroke="#1E1B3A" stroke-width="2" fill="none" stroke-linecap="round"/>`) + brows(c, 1) },
    'eyes-wide': { draw: (c) => eyesPair((x) => `<ellipse cx="${x}" cy="45" rx="4.4" ry="5" fill="#fff"/><ellipse cx="${x}" cy="45.5" rx="2.8" ry="3.2" fill="${c.eyeC}"/><ellipse cx="${x}" cy="45.7" rx="1.4" ry="1.7" fill="#1E1B3A"/><circle cx="${x - 1}" cy="44" r="1" fill="#fff"/>`) + brows(c) },
    'eyes-lashes': { draw: (c) => eyesPair((x) => `<ellipse cx="${x}" cy="45" rx="3" ry="3.6" fill="${c.eyeC}"/><ellipse cx="${x}" cy="45.3" rx="1.6" ry="2" fill="#1E1B3A"/><circle cx="${x - 1}" cy="43.8" r="1.1" fill="#fff"/><path d="M${x - 3.6} 42.4 l-1.6 -1.4 M${x - 1.6} 41.6 l-.8 -1.8 M${x + 1} 41.6 l.6 -1.8" stroke="#1E1B3A" stroke-width="1" stroke-linecap="round"/>`) + brows(c) },
    'eyes-star': { draw: (c) => eyesPair((x) => `<path d="M${x} 40.5 L${x + 1.4} 43.8 L${x + 4.6} 44.5 L${x + 2.2} 46.7 L${x + 2.8} 50 L${x} 48.3 L${x - 2.8} 50 L${x - 2.2} 46.7 L${x - 4.6} 44.5 L${x - 1.4} 43.8 Z" fill="#FDE68A" stroke="#B45309" stroke-width=".6"/>`) },
    'eyes-heart': { draw: () => eyesPair((x) => `<path d="M${x} 49 C${x - 6} 45 ${x - 3.5} 40 ${x} 43 C${x + 3.5} 40 ${x + 6} 45 ${x} 49 Z" fill="#F43F5E"/>`) },
    'eyes-glow': { draw: () => eyesPair((x) => `<ellipse cx="${x}" cy="45" rx="5.6" ry="6" fill="#86EFAC" opacity=".25"/><ellipse cx="${x}" cy="45" rx="3" ry="3.6" fill="#BBF7D0"/>`) },
    'eyes-cyclops': { draw: (c) => `<ellipse cx="50" cy="44" rx="7" ry="7.5" fill="#fff"/><ellipse cx="50" cy="44.6" rx="4.4" ry="4.8" fill="${c.eyeSet ? c.eyeC : '#7C3AED'}"/><circle cx="50" cy="44.6" r="2.2" fill="#1E1B3A"/><circle cx="48.4" cy="43" r="1.2" fill="#fff"/>` },
    'eyes-triple': { draw: () => [38, 50, 62].map((x, i) => `<ellipse cx="${x}" cy="${i === 1 ? 40 : 46}" rx="2.8" ry="3.2" fill="#1E1B3A"/><circle cx="${x - .9}" cy="${(i === 1 ? 40 : 46) - 1.1}" r="1" fill="#fff"/>`).join('') },
    'eyes-visor': { draw: () => `<rect x="32" y="40" width="36" height="10" rx="5" fill="#0F172A"/><rect x="34" y="42" width="32" height="6" rx="3" fill="#22D3EE" opacity=".85"/><path d="M38 45 H62" stroke="#ECFEFF" stroke-width="1.2" opacity=".7"/>` },
  },
  ears: {
    'ears-human': { back: (c) => `<ellipse cx="30" cy="48" rx="4" ry="6" fill="${c.SK}"/><ellipse cx="70" cy="48" rx="4" ry="6" fill="${c.SK}"/><path d="M29.5 46 Q31 48 29.5 51 M70.5 46 Q69 48 70.5 51" stroke="${c.shade}" stroke-width="1" fill="none"/>` },
    'ears-none': {},
    'ears-elf': { back: (c) => `<path d="M31 44 L18 34 L30 54 Z M69 44 L82 34 L70 54 Z" fill="${c.SK}"/><path d="M29 46 L22 39 M71 46 L78 39" stroke="${c.shade}" stroke-width="1"/>` },
    'ears-cat': { front: (c) => `<path d="M32 30 L30 12 L44 24 Z M68 30 L70 12 L56 24 Z" fill="${c.hairC}"/><path d="M33 26 L32 16 L40 23 Z M67 26 L68 16 L60 23 Z" fill="${c.blush}"/>` },
    'ears-bunny': { front: (c) => `<ellipse cx="41" cy="12" rx="5" ry="15" fill="${c.SK}"/><ellipse cx="59" cy="12" rx="5" ry="15" fill="${c.SK}"/><ellipse cx="41" cy="13" rx="2.4" ry="11" fill="${c.blush}"/><ellipse cx="59" cy="13" rx="2.4" ry="11" fill="${c.blush}"/>` },
    'ears-bear': { back: (c) => `<circle cx="32" cy="28" r="7" fill="${c.SK}"/><circle cx="68" cy="28" r="7" fill="${c.SK}"/><circle cx="32" cy="28" r="3.4" fill="${c.shade}"/><circle cx="68" cy="28" r="3.4" fill="${c.shade}"/>` },
    'ears-antennae': { front: () => `<path d="M42 26 Q38 12 34 8 M58 26 Q62 12 66 8" stroke="#A3E635" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="34" cy="8" r="3.4" fill="#D9F99D"/><circle cx="66" cy="8" r="3.4" fill="#D9F99D"/>` },
    'ears-fins': { back: (c) => `<path d="M30 42 Q14 40 16 56 Q24 50 31 54 Z M70 42 Q86 40 84 56 Q76 50 69 54 Z" fill="${c.glow}" opacity=".9"/><path d="M28 45 L19 50 M72 45 L81 50" stroke="${c.shade}" stroke-width="1"/>` },
    'ears-robot': { back: () => `<rect x="25" y="42" width="7" height="12" rx="2" fill="#94A3B8"/><rect x="68" y="42" width="7" height="12" rx="2" fill="#94A3B8"/><circle cx="28.5" cy="48" r="1.8" fill="#22D3EE"/><circle cx="71.5" cy="48" r="1.8" fill="#22D3EE"/>` },
  },
  hair: HAIR,
  facial: {
    'facial-none': { draw: () => '' },
    'facial-stubble': { draw: (c) => `<path d="M34 56 Q36 66 50 68 Q64 66 66 56 Q62 62 50 63 Q38 62 34 56 Z" fill="${c.hairC}" opacity=".28"/>` },
    'facial-mustache': { draw: (c) => `<path d="M42 56.5 Q46 53.5 50 56 Q54 53.5 58 56.5 Q54 58.5 50 57 Q46 58.5 42 56.5 Z" fill="${c.hairC}"/>` },
    'facial-goatee': { draw: (c) => `<path d="M45 61.5 Q50 70 55 61.5 Q52 63.5 50 63.5 Q48 63.5 45 61.5 Z" fill="${c.hairC}"/><path d="M43 56.5 Q47 54 50 56 Q53 54 57 56.5" stroke="${c.hairC}" stroke-width="1.6" fill="none"/>` },
    'facial-beard': { draw: (c) => `<path d="M30 48 Q30 70 50 74 Q70 70 70 48 Q66 60 58 60 Q54 62 50 62 Q46 62 42 60 Q34 60 30 48 Z" fill="${c.hairC}"/><path d="M44 58 Q50 62 56 58" stroke="${c.lip}" stroke-width="2" fill="none" stroke-linecap="round"/>` },
    'facial-fullbeard': { draw: (c) => `<path d="M29 44 Q28 76 50 80 Q72 76 71 44 Q68 62 58 62 Q54 64 50 64 Q46 64 42 62 Q32 62 29 44 Z" fill="${c.hairC}"/>${coils(c, 36, 64, 66, 76, 1.8)}<path d="M44 58 Q50 62 56 58" stroke="${c.lip}" stroke-width="2" fill="none" stroke-linecap="round"/>` },
    'facial-sideburns': { draw: (c) => `<path d="M30 42 L30 56 Q32 58 34 56 L34 44 Z M70 42 L70 56 Q68 58 66 56 L66 44 Z" fill="${c.hairC}"/>` },
    'facial-curlystache': { draw: (c) => `<path d="M50 56 Q44 53 40 56 Q37 58 38 54 M50 56 Q56 53 60 56 Q63 58 62 54" stroke="${c.hairC}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` },
  },
  clothes: {},
  // Facial expressions: the mouth (and sometimes a wink, brows or cheeks).
  expr: {
    'expr-smile': { draw: (c) => `<path d="M44 58 Q50 62.5 56 58" stroke="${c.lip}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` },
    'expr-grin': { draw: (c) => `<path d="M42 57 Q50 66 58 57 Z" fill="#3B0D0D"/><path d="M43.4 57.6 Q50 60 56.6 57.6 L56 59 Q50 61 44 59 Z" fill="#fff"/><path d="M42 57 Q50 66 58 57" stroke="${c.lip}" stroke-width="1.6" fill="none"/>` },
    'expr-laugh': { draw: (c) => `<path d="M42 56 Q50 69 58 56 Z" fill="#3B0D0D"/><ellipse cx="50" cy="62.5" rx="4" ry="2" fill="#F87171"/><path d="M42 56 H58" stroke="#fff" stroke-width="1.8"/>` },
    'expr-calm': { draw: (c) => `<path d="M45 59 Q50 60.5 55 59" stroke="${c.lip}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` },
    'expr-smirk': { draw: (c) => `<path d="M45 59.5 Q51 61 56 57" stroke="${c.lip}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` },
    'expr-surprised': { draw: () => `<ellipse cx="50" cy="60" rx="3.2" ry="4" fill="#3B0D0D"/>` },
    'expr-tongue': { draw: (c) => `<path d="M43 57.5 Q50 63 57 57.5" stroke="${c.lip}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M48 60 Q50 66 53 60 Z" fill="#F472B6"/>` },
    'expr-wink': { draw: (c) => `<path d="M44 58 Q50 63 56 58" stroke="${c.lip}" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="59" cy="45" rx="4.6" ry="5" fill="${c.SK}"/><path d="M55.5 45.5 Q59 43 62.5 45.5" stroke="#1E1B3A" stroke-width="2" fill="none" stroke-linecap="round"/>` },
    'expr-shy': { draw: (c) => `<path d="M46.5 59 Q50 61 53.5 59" stroke="${c.lip}" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="37" cy="54" rx="5" ry="3" fill="${c.blush}" opacity=".7"/><ellipse cx="63" cy="54" rx="5" ry="3" fill="${c.blush}" opacity=".7"/>` },
    'expr-determined': { draw: (c) => `<path d="M45 59.5 H55" stroke="${c.lip}" stroke-width="2.4" stroke-linecap="round"/><path d="M37 37 L45 39.5 M63 37 L55 39.5" stroke="${c.hairC}" stroke-width="2.4" stroke-linecap="round"/>` },
    'expr-singing': { draw: (c) => `<ellipse cx="50" cy="60" rx="4.4" ry="3.6" fill="#3B0D0D"/><path d="M62 54 l4 -6 v6" stroke="#FDE68A" stroke-width="1.6" fill="none"/><circle cx="61.5" cy="54.5" r="1.6" fill="#FDE68A"/>` },
    // Seasonal
    'expr-fangs': { draw: (c) => `<path d="M43 57.5 Q50 62 57 57.5" stroke="${c.lip}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M45.5 58.6 L46.6 62.4 L47.8 59.2 Z M52.2 59.2 L53.4 62.4 L54.5 58.6 Z" fill="#fff"/>` },
    'expr-jackolantern': { draw: () => `<path d="M41 56 L44 59 L47 56.5 L50 59.5 L53 56.5 L56 59 L59 56 Q55 64 50 64 Q45 64 41 56 Z" fill="#F97316" stroke="#7C2D12" stroke-width=".8"/>` },
    'expr-jolly': { draw: (c) => `<path d="M42 57 Q50 66 58 57 Z" fill="#3B0D0D"/><path d="M43.4 57.6 Q50 60 56.6 57.6 L56 59 Q50 61 44 59 Z" fill="#fff"/><circle cx="36" cy="54" r="4.4" fill="#F43F5E" opacity=".45"/><circle cx="64" cy="54" r="4.4" fill="#F43F5E" opacity=".45"/>` },
    'expr-cozy': { draw: (c) => `<path d="M45 58.5 Q50 61.5 55 58.5" stroke="${c.lip}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M60 62 q2 -3 0 -6 q-2 -3 0 -6" stroke="#E2E8F0" stroke-width="1.2" fill="none" opacity=".75"/>` },
    'expr-kiss': { draw: () => `<path d="M48 58 Q50 56 52 58 Q50 60.5 48 58 Z M48 60 Q50 62 52 60 Q50 63.5 48 60 Z" fill="#DB2777"/><path d="M60 52 C57 49 58 46 60 48 C62 46 63 49 60 52 Z" fill="#F472B6"/>` },
    'expr-starstruck': { draw: (c) => `<path d="M43 57 Q50 65 57 57 Z" fill="#3B0D0D"/><path d="M38 40 l1 2.4 2.6.3 -2 1.7.6 2.6 -2.2-1.4 -2.2 1.4.6-2.6 -2-1.7 2.6-.3 Z M62 40 l1 2.4 2.6.3 -2 1.7.6 2.6 -2.2-1.4 -2.2 1.4.6-2.6 -2-1.7 2.6-.3 Z" fill="#FDE68A"/>` },
  },
  glasses: {
    'glasses-none': { draw: () => '' },
    'glasses-round': { draw: () => `<circle cx="41" cy="45" r="6" fill="#fff" fill-opacity=".12" stroke="#1F2937" stroke-width="1.6"/><circle cx="59" cy="45" r="6" fill="#fff" fill-opacity=".12" stroke="#1F2937" stroke-width="1.6"/><path d="M47 45 H53 M35 44 L30 43 M65 44 L70 43" stroke="#1F2937" stroke-width="1.4"/>` },
    'glasses-square': { draw: () => `<rect x="34" y="40" width="13" height="10" rx="2.5" fill="#fff" fill-opacity=".12" stroke="#111827" stroke-width="2"/><rect x="53" y="40" width="13" height="10" rx="2.5" fill="#fff" fill-opacity=".12" stroke="#111827" stroke-width="2"/><path d="M47 44 H53 M34 43 L30 42 M66 43 L70 42" stroke="#111827" stroke-width="1.6"/>` },
    'glasses-cateye': { draw: () => `<path d="M33 42 Q40 38 47 42 Q46 50 40 50 Q34 50 33 42 Z M53 42 Q60 38 67 42 Q66 50 60 50 Q54 50 53 42 Z" fill="#fff" fill-opacity=".12" stroke="#7C2D12" stroke-width="1.8"/><path d="M33 42 L30 39 M67 42 L70 39 M47 44 H53" stroke="#7C2D12" stroke-width="1.6"/>` },
    'glasses-shades': { draw: () => `<path d="M33 41 H47 Q47 50 40 50 Q33 50 33 41 Z M53 41 H67 Q67 50 60 50 Q53 50 53 41 Z" fill="#111827"/><path d="M47 42 H53 M33 41 L30 40 M67 41 L70 40" stroke="#111827" stroke-width="1.6"/><path d="M36 43 L39 46" stroke="#fff" stroke-width="1" opacity=".6"/>` },
    'glasses-heart': { draw: () => `<path d="M40 50 C33 46 34 40 40 42 C46 40 47 46 40 50 Z M60 50 C53 46 54 40 60 42 C66 40 67 46 60 50 Z" fill="#F43F5E" stroke="#BE123C" stroke-width="1"/><path d="M45 44 H55" stroke="#BE123C" stroke-width="1.4"/>` },
  },
  hat: {
    'hat-none': { draw: () => '' },
    'hat-beanie': { draw: (c) => `<path d="M28 34 Q28 12 50 12 Q72 12 72 34 Z" fill="${c.cloth}"/><rect x="26" y="30" width="48" height="8" rx="3" fill="${c.clothDark}"/><circle cx="50" cy="10" r="4" fill="${c.clothDark}"/>` },
    'hat-cap': { draw: (c) => `<path d="M29 34 Q29 14 50 14 Q71 14 71 34 Z" fill="${c.cloth}"/><path d="M50 33 Q66 30 80 36 Q70 40 50 38 Z" fill="${c.clothDark}"/>` },
    'hat-headwrap': { draw: (c) => `<path d="M27 40 Q24 14 50 12 Q76 14 73 40 Q66 30 50 30 Q34 30 27 40 Z" fill="${c.cloth}"/><path d="M38 14 Q50 4 62 14 Q58 22 50 20 Q42 22 38 14 Z" fill="${c.clothDark}"/><path d="M30 30 Q50 22 70 30 M32 24 Q50 16 68 24" stroke="${c.clothDark}" stroke-width="1.6" fill="none" opacity=".7"/>` },
    'hat-durag': { draw: (c) => `<path d="M29 42 Q27 20 50 19 Q73 20 71 42 Q66 32 50 32 Q34 32 29 42 Z" fill="${c.cloth}"/><path d="M50 19 V32" stroke="${c.clothDark}" stroke-width="1.6"/><path d="M70 40 Q78 54 74 70" stroke="${c.cloth}" stroke-width="4" fill="none" stroke-linecap="round"/>` },
    'hat-headphones': { draw: () => `<path d="M28 44 Q28 16 50 16 Q72 16 72 44" stroke="#1F2937" stroke-width="4.5" fill="none"/><rect x="22" y="40" width="10" height="16" rx="4" fill="#8B5CF6"/><rect x="68" y="40" width="10" height="16" rx="4" fill="#8B5CF6"/>` },
    'hat-crown': { draw: () => `<path d="M34 26 L36 12 L43 20 L50 8 L57 20 L64 12 L66 26 Z" fill="#FBBF24" stroke="#92400E" stroke-width="1"/><circle cx="50" cy="20" r="2.2" fill="#F472B6"/>` },
    // The bubble grows to fit the hair: snug for short styles, big for afros (long hair may spill out below).
    'hat-helmet': { draw: (c) => { const { cx, cy, r } = c.helmet; return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#E0F2FE" fill-opacity=".06" stroke="#E0F2FE" stroke-width="2.4" stroke-opacity=".9"/><path d="M${cx - r * 0.66} ${cy - r * 0.55} Q${cx - r * 0.3} ${cy - r * 0.9} ${cx + r * 0.08} ${cy - r * 0.9}" stroke="#fff" stroke-width="2.4" opacity=".7" fill="none" stroke-linecap="round"/><path d="M${cx - r * 0.75} ${cy + r * 0.62} Q${cx} ${cy + r * 0.86} ${cx + r * 0.75} ${cy + r * 0.62}" stroke="#94A3B8" stroke-width="3" fill="none" opacity=".8"/>`; } },
    'hat-flowers': { draw: () => [30, 38, 46, 54, 62, 70].map((x, i) => `<circle cx="${x}" cy="${26 - Math.sin((i / 5) * Math.PI) * 8}" r="4" fill="${['#F472B6', '#FDE68A', '#A78BFA', '#F9A8D4', '#86EFAC', '#FDBA74'][i]}"/><circle cx="${x}" cy="${26 - Math.sin((i / 5) * Math.PI) * 8}" r="1.4" fill="#FEF3C7"/>`).join('') },
    // Seasonal
  'hat-witch': { draw: () => `<path d="M20 30 Q50 22 80 30 Q50 36 20 30 Z" fill="#1F2937"/><path d="M34 29 L52 -2 Q56 10 66 28 Z" fill="#1F2937"/><path d="M36 26 Q50 22 64 26" stroke="#F97316" stroke-width="3" fill="none"/>` },
  'hat-pumpkin': { draw: () => `<path d="M28 34 Q26 14 50 14 Q74 14 72 34 Z" fill="#F97316"/><path d="M40 16 Q38 26 40 34 M50 14 V34 M60 16 Q62 26 60 34" stroke="#C2410C" stroke-width="1.4" fill="none"/><path d="M50 14 Q50 6 56 4" stroke="#166534" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  'hat-pinkbeanie': { draw: () => `<path d="M28 34 Q28 12 50 12 Q72 12 72 34 Z" fill="#F472B6"/><rect x="26" y="30" width="48" height="8" rx="3" fill="#DB2777"/><path d="M50 14 Q46 22 50 26 Q54 22 50 14 Z M50 14 L44 30 M50 14 L56 30" stroke="#FCE7F3" stroke-width="2" fill="none"/>` },
  'hat-leafcrown': { draw: () => [28, 36, 44, 52, 60, 68].map((x, i) => `<ellipse cx="${x + 2}" cy="${26 - Math.sin((i / 5) * Math.PI) * 8}" rx="5" ry="3" fill="${['#D97706', '#DC2626', '#F59E0B', '#B45309', '#EA580C', '#CA8A04'][i]}" transform="rotate(${-30 + i * 12} ${x + 2} ${26 - Math.sin((i / 5) * Math.PI) * 8})"/>`).join('') },
  'hat-santa': { draw: () => `<path d="M28 34 Q34 8 60 10 Q76 14 80 34 Z" fill="#DC2626"/><circle cx="80" cy="34" r="5" fill="#F8FAFC"/><rect x="24" y="30" width="54" height="8" rx="4" fill="#F8FAFC"/>` },
  'hat-earmuffs': { draw: () => `<path d="M30 46 Q30 18 50 18 Q70 18 70 46" stroke="#E0F2FE" stroke-width="3.5" fill="none"/><circle cx="29" cy="48" r="8" fill="#F8FAFC"/><circle cx="71" cy="48" r="8" fill="#F8FAFC"/>` },
  // Head coverings (free; drawn with care: they cover the hair, and the hijab the ears and neck)
  'hat-hijab': { hidesHair: true, hidesEars: true, back: (c) => `<path d="M24 52 Q20 18 50 16 Q80 18 76 52 Q78 70 70 82 Q60 90 50 90 Q40 90 30 82 Q22 70 24 52 Z" fill="${c.cloth}"/>`, draw: (c) => `<path d="M30 50 Q28 24 50 22 Q72 24 70 50 Q70 40 62 32 Q50 26 38 32 Q30 40 30 50 Z" fill="${c.cloth}"/><path d="M30 52 Q30 70 42 76 Q50 80 58 76 Q70 70 70 52 Q72 74 60 82 Q50 86 40 82 Q28 74 30 52 Z" fill="${c.clothDark}" opacity=".55"/>` },
  'hat-turban': { hidesHair: true, draw: (c) => `<path d="M27 40 Q24 14 50 10 Q76 14 73 40 Q66 34 50 33 Q34 34 27 40 Z" fill="${c.cloth}"/><path d="M28 36 Q40 16 64 18 M30 30 Q46 12 70 24 M32 40 Q48 24 72 34" stroke="${c.clothDark}" stroke-width="1.8" fill="none" opacity=".7"/><path d="M47 16 Q50 26 53 16" stroke="${c.clothDark}" stroke-width="2" fill="none"/>` },
  'hat-kufi': { draw: (c) => `<path d="M31 32 Q32 16 50 15 Q68 16 69 32 Z" fill="${c.cloth}"/><path d="M31 32 H69" stroke="${c.clothDark}" stroke-width="2.2"/><path d="M38 22 H62 M35 27 H65" stroke="${c.clothDark}" stroke-width="1" stroke-dasharray="2 2" opacity=".7"/>` },
  'hat-kippah': { draw: (c) => `<path d="M38 24 Q50 14 62 24 Q50 22 38 24 Z" fill="${c.cloth}"/><path d="M40 22 Q50 17 60 22" stroke="${c.clothDark}" stroke-width="1" fill="none"/>` },
  'hat-keffiyeh': { hidesHair: true, back: (c) => `<path d="M22 40 Q20 14 50 12 Q80 14 78 40 L82 84 L68 72 L64 50 L36 50 L32 72 L18 84 Z" fill="#F8FAFC"/>${[30, 40, 50, 60, 70].map((x) => `<path d="M${x} 18 V60" stroke="${c.cloth}" stroke-width=".8" opacity=".4"/>`).join('')}`, draw: () => `<path d="M28 42 Q26 18 50 16 Q74 18 72 42 Q66 30 50 30 Q34 30 28 42 Z" fill="#F8FAFC"/><path d="M26 30 Q50 22 74 30" stroke="#111827" stroke-width="3.4" fill="none"/><path d="M27 35 Q50 27 73 35" stroke="#111827" stroke-width="2.4" fill="none"/>` },
  'hat-headband': { draw: (c) => `<path d="M30 34 Q50 24 70 34" stroke="${c.cloth}" stroke-width="5" fill="none" stroke-linecap="round"/>` },
  'hat-party': { draw: () => `<path d="M40 24 L50 0 L60 24 Z" fill="#F472B6"/><path d="M43 18 L57 18 M46 10 L54 10" stroke="#FDE68A" stroke-width="2"/><circle cx="50" cy="0" r="3" fill="#FDE68A"/>` },
  },
};

// Coils / curls texture: little loops over an area (natural hair texture).
function coils(c, x0, x1, y0, y1, r, filled = false) {
  const out = [];
  for (let y = y0; y <= y1; y += r * 2.2) for (let x = x0 + ((y / (r * 2.2)) % 2) * r; x <= x1; x += r * 2.4) {
    out.push(filled ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c.hairC}"/>` : `<path d="M${(x - r).toFixed(1)} ${y.toFixed(1)} a${r} ${r} 0 1 1 ${(r * 2).toFixed(1)} 0" stroke="${c.hairHi}" stroke-width=".9" fill="none" opacity=".55"/>`);
  }
  return out.join('');
}
const eyesPair = (f) => f(41) + f(59);
const brows = (c, low = 0) => `<path d="M37 ${38 + low} Q41 ${36 + low} 45 ${38 + low} M55 ${38 + low} Q59 ${36 + low} 63 ${38 + low}" stroke="${c.hairC}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".85"/>`;

// Skin tones: a deep range with warm, red and neutral undertones; then fantasy skins.
const TONES = [
  ['skin-porcelain', 'Porcelain', '#F8DECB'], ['skin-ivory', 'Ivory', '#F1CBAE'], ['skin-peach', 'Peach', '#EBB794'], ['skin-sand', 'Sand', '#DDA67C'],
  ['skin-honey', 'Honey', '#CF925F'], ['skin-golden', 'Golden', '#C3854F'], ['skin-caramel', 'Caramel', '#B2733F'], ['skin-amber', 'Amber', '#A66632'],
  ['skin-chestnut', 'Chestnut', '#965A30'], ['skin-mahogany', 'Mahogany', '#86492A'], ['skin-cocoa', 'Cocoa', '#7A4628'], ['skin-umber', 'Umber', '#6E3E22'],
  ['skin-sienna', 'Sienna', '#6A3420'], ['skin-espresso', 'Espresso', '#5A321C'], ['skin-mocha', 'Mocha', '#4F2C1B'], ['skin-ebony', 'Ebony', '#422516'], ['skin-onyx', 'Deep Ebony', '#361D12'],
];
for (const [id, name, color] of TONES) LOOKS.skin[id] = { name, color };
Object.assign(LOOKS.skin, {
  'skin-alien': { name: 'Alien Green', color: '#7DD87A' }, 'skin-cosmic': { name: 'Cosmic Blue', color: '#6CA6F0' }, 'skin-lilac': { name: 'Lilac', color: '#B9A3F0' },
  'skin-coral': { name: 'Coral', color: '#F59A8A' }, 'skin-robot': { name: 'Chrome', color: '#B8C2CF', robot: true }, 'skin-gold': { name: 'Gold', color: '#E9B949' }, 'skin-galaxy': { name: 'Galaxy', color: '#4338CA', galaxy: true },
});

// Special heads: space and seasonal. They replace the head shape; some bring their own
// face (noEyes / noExpr / noFace hide the parts you picked) and none show ears.
const starPts = (cx, cy, R, r, n = 5) => [...Array(n * 2)].map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / n; const d = i % 2 ? r : R; return `${(cx + d * Math.cos(a)).toFixed(1)},${(cy + d * Math.sin(a)).toFixed(1)}`; }).join(' ');
Object.assign(LOOKS.skin, {
  'skin-alienhead': {
    name: 'Space Alien', color: '#8EE07E', specialHead: true, noEars: true, noEyes: true,
    head: (c) => `<path d="M40 22 L33 7 M60 22 L67 7" stroke="#5FB04F" stroke-width="2" stroke-linecap="round"/><circle cx="33" cy="7" r="3" fill="#F0ABFC"/><circle cx="67" cy="7" r="3" fill="#F0ABFC"/><ellipse cx="50" cy="42" rx="23" ry="25" fill="${c.SK}"/>`,
    face: () => `<ellipse cx="40.5" cy="45" rx="6.6" ry="4.2" transform="rotate(28 40.5 45)" fill="#111827"/><ellipse cx="59.5" cy="45" rx="6.6" ry="4.2" transform="rotate(-28 59.5 45)" fill="#111827"/><circle cx="38.4" cy="43.2" r="1.4" fill="#fff"/><circle cx="57.4" cy="43.2" r="1.4" fill="#fff"/>`,
  },
  'skin-starhead': {
    name: 'Star', color: '#FCD34D', specialHead: true, noEars: true,
    head: (c) => `<polygon points="${starPts(50, 47, 30, 16)}" fill="${c.SK}" stroke="#F59E0B" stroke-width="1.5" stroke-linejoin="round"/><polygon points="${starPts(50, 47, 30, 16)}" fill="none" stroke="#FEF3C7" stroke-width="5" opacity=".25" stroke-linejoin="round"/>`,
  },
  'skin-asteroid': {
    name: 'Asteroid', color: '#A8A29E', specialHead: true, noEars: true,
    head: (c) => `<path d="M31 32 Q34 22 46 23 Q54 19 62 25 Q72 27 71 38 Q75 47 70 56 Q67 66 55 67 Q46 71 38 65 Q28 62 29 52 Q25 41 31 32 Z" fill="${c.SK}"/><circle cx="62" cy="33" r="3.4" fill="${c.shade}" opacity=".6"/><circle cx="35" cy="58" r="2.6" fill="${c.shade}" opacity=".55"/><circle cx="66" cy="57" r="2" fill="${c.shade}" opacity=".5"/><circle cx="40" cy="29" r="1.8" fill="${c.shade}" opacity=".5"/>`,
  },
  'skin-comet': {
    name: 'Comet', color: '#BFDBFE', specialHead: true, noEars: true,
    behind: (c) => `<defs><linearGradient id="${c.g('tail')}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#93C5FD" stop-opacity=".9"/><stop offset=".5" stop-color="#C4B5FD" stop-opacity=".55"/><stop offset="1" stop-color="#C4B5FD" stop-opacity="0"/></linearGradient></defs><path d="M38 34 Q66 2 106 -8 Q76 22 66 58 Z" fill="url(#${c.g('tail')})"/><path d="M46 30 Q72 8 100 0" stroke="#fff" stroke-width="1.2" opacity=".5" fill="none"/>`,
    head: (c) => `<circle cx="50" cy="46" r="27" fill="#BFDBFE" opacity=".25"/><ellipse cx="50" cy="46" rx="20.5" ry="22" fill="${c.SK}"/><circle cx="58" cy="34" r="3" fill="#fff" opacity=".7"/>`,
  },
  'skin-skull': {
    name: 'Skeleton', color: '#F1EFE6', specialHead: true, noEars: true, noEyes: true, noExpr: true, noFace: true, noFacial: true,
    head: (c) => `<ellipse cx="50" cy="43" rx="21" ry="21" fill="${c.SK}"/><rect x="38" y="54" width="24" height="13" rx="5" fill="${c.SK}"/>`,
    face: () => `<ellipse cx="41" cy="45" rx="5.6" ry="6.2" fill="#231D33"/><ellipse cx="59" cy="45" rx="5.6" ry="6.2" fill="#231D33"/><path d="M50 51 L47.5 56 H52.5 Z" fill="#231D33"/><path d="M40 61 H60" stroke="#231D33" stroke-width="1.2"/>${[43, 47, 51, 55].map((x) => `<path d="M${x + 1} 58.5 V63.5" stroke="#231D33" stroke-width="1"/>`).join('')}<path d="M35 34 Q38 30 43 31" stroke="#fff" stroke-width="1.4" opacity=".6" fill="none" stroke-linecap="round"/>`,
  },
  'skin-witch': {
    name: 'Witch', color: '#93C572', specialHead: true,
    face: (c) => `<path d="M49 47 Q53 51 56 58 Q52 59 49.5 56" fill="${c.shade}"/><circle cx="58" cy="54" r="1.4" fill="#4D7C0F"/>`,
  },
  'skin-snowman': {
    name: 'Snowman', color: '#F8FAFC', specialHead: true, noEars: true, noEyes: true, noExpr: true, noFace: true, noFacial: true,
    head: (c) => `<circle cx="50" cy="46" r="22" fill="${c.SK}"/><circle cx="50" cy="46" r="22" fill="none" stroke="#CBD5E1" stroke-width="1"/>`,
    face: () => `<circle cx="42" cy="42" r="2.7" fill="#1F2937"/><circle cx="58" cy="42" r="2.7" fill="#1F2937"/><circle cx="41.2" cy="41.2" r=".8" fill="#fff" opacity=".7"/><circle cx="57.2" cy="41.2" r=".8" fill="#fff" opacity=".7"/><path d="M50 47 L66 50 L50 52 Z" fill="#F97316"/><path d="M50 49 L60 50.2" stroke="#C2410C" stroke-width=".6"/>${[[40, 56], [44, 58.6], [50, 59.6], [56, 58.6], [60, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#1F2937"/>`).join('')}`,
  },
});

// Clothes: shoulders + collar, all in the chosen colour.
const shoulders = (c, extra = '') => `<path d="M8 100 Q10 76 36 72 Q50 80 64 72 Q90 76 92 100 Z" fill="${c.cloth}"/>${extra}`;
Object.assign(LOOKS.clothes, {
  'clothes-tee': { name: 'T-shirt', draw: (c) => shoulders(c), collar: (c) => `<path d="M40 72 Q50 82 60 72" stroke="${c.clothDark}" stroke-width="2.4" fill="none"/>` },
  'clothes-hoodie': { name: 'Hoodie', draw: (c) => `<path d="M24 76 Q26 58 50 58 Q74 58 76 76" fill="${c.clothDark}"/>${shoulders(c)}`, collar: (c) => `<path d="M38 74 Q50 86 62 74" stroke="${c.clothDark}" stroke-width="3" fill="none"/><path d="M45 80 V92 M55 80 V92" stroke="#F8FAFC" stroke-width="1.6" stroke-linecap="round"/>` },
  'clothes-sweater': { name: 'Cozy sweater', draw: (c) => shoulders(c, `<path d="M14 92 H86" stroke="${c.clothDark}" stroke-width="2" stroke-dasharray="3 2"/>`), collar: (c) => `<path d="M38 72 Q50 80 62 72 L62 76 Q50 84 38 76 Z" fill="${c.clothDark}"/>` },
  'clothes-collar': { name: 'Collared shirt', draw: (c) => shoulders(c, `<path d="M50 80 V100" stroke="${c.clothDark}" stroke-width="1.4"/><circle cx="50" cy="86" r="1.1" fill="${c.clothDark}"/><circle cx="50" cy="93" r="1.1" fill="${c.clothDark}"/>`), collar: (c) => `<path d="M40 70 L50 80 L44 84 Z M60 70 L50 80 L56 84 Z" fill="#F8FAFC"/>` },
  'clothes-spacesuit': { name: 'Space suit', draw: (c) => shoulders({ ...c, cloth: '#E2E8F0' }, `<rect x="56" y="84" width="14" height="9" rx="2" fill="${c.cloth}"/><circle cx="30" cy="88" r="3" fill="#F87171"/><circle cx="38" cy="88" r="3" fill="#4ADE80"/>`), collar: (c) => `<path d="M34 72 Q50 84 66 72 L66 76 Q50 88 34 76 Z" fill="${c.cloth}"/>` },
  'clothes-jacket': { name: 'Denim jacket', draw: (c) => shoulders(c, `<path d="M50 80 V100" stroke="${c.clothDark}" stroke-width="2"/><path d="M30 86 H42 M58 86 H70" stroke="${c.clothDark}" stroke-width="1.6"/>`), collar: (c) => `<path d="M38 72 L46 84 L50 80 L54 84 L62 72" fill="${c.clothDark}"/><path d="M44 74 Q50 80 56 74" fill="#F8FAFC"/>` },
  'clothes-tux': { name: 'Concert tux', draw: (c) => shoulders({ ...c, cloth: '#111827' }, `<path d="M42 74 L50 100 L58 74 Z" fill="#F8FAFC"/><path d="M45 78 L50 76 L55 78 L50 80 Z" fill="${c.cloth}"/>`) },
  'clothes-robe': { name: 'Starry robe', draw: (c) => shoulders(c, [[24, 88], [40, 94], [62, 90], [76, 86], [52, 86]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#FDE68A"/>`).join('')), collar: (c) => `<path d="M38 72 Q50 92 62 72" stroke="#FDE68A" stroke-width="2.4" fill="none"/>` },
  'clothes-overalls': { name: 'Overalls', draw: (c) => shoulders({ ...c, cloth: '#F8FAFC' }, `<path d="M30 84 H70 V100 H30 Z" fill="${c.cloth}"/><path d="M34 84 L32 74 M66 84 L68 74" stroke="${c.cloth}" stroke-width="4"/><circle cx="36" cy="88" r="1.6" fill="#FDE68A"/><circle cx="64" cy="88" r="1.6" fill="#FDE68A"/>`) },
  'clothes-armor': { name: 'Guardian armour', draw: (c) => shoulders({ ...c, cloth: '#94A3B8' }, `<path d="M14 84 Q22 72 36 72 L36 86 Q24 88 14 84 Z M86 84 Q78 72 64 72 L64 86 Q76 88 86 84 Z" fill="${c.cloth}"/><path d="M50 82 L54 88 L50 96 L46 88 Z" fill="#FDE68A"/>`) },
  // Composer costumes (the coat takes your clothes colour)
  'clothes-mozart': { name: 'Mozart frock coat', draw: (c) => shoulders(c, `<path d="M40 74 L50 100 L60 74 Z" fill="#F5D67B"/>${[82, 88, 94].map((y) => `<circle cx="${50 + (y - 74) * 0.32}" cy="${y}" r="1.3" fill="#B45309"/><circle cx="${50 - (y - 74) * 0.32}" cy="${y}" r="1.3" fill="#B45309"/>`).join('')}<path d="M10 92 Q22 84 34 86 M90 92 Q78 84 66 86" stroke="#F5D67B" stroke-width="2.4" fill="none"/>`), collar: () => `<path d="M44 70 Q50 74 56 70 Q58 76 54 80 Q50 84 46 80 Q42 76 44 70 Z" fill="#FFFFFF"/><path d="M45 74 Q50 77 55 74 M46 78 Q50 80 54 78" stroke="#E2E8F0" stroke-width="1" fill="none"/>` },
  'clothes-bach': { name: 'Baroque cantor coat', draw: (c) => shoulders({ ...c, cloth: c.clothDark }, `<path d="M36 72 Q50 82 64 72 L64 100 L36 100 Z" fill="${c.cloth}" opacity=".55"/>`), collar: () => `<path d="M45 70 L47 86 L50 86 L50 72 Z M55 70 L53 86 L50 86 L50 72 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width=".6"/>` },
  'clothes-beethoven': { name: 'Romantic coat & cravat', draw: (c) => shoulders(c, `<path d="M30 74 L40 92 L46 74 Z M70 74 L60 92 L54 74 Z" fill="${c.clothDark}"/>`), collar: () => `<path d="M40 66 Q50 72 60 66 L61 74 Q50 80 39 74 Z" fill="#F8FAFC"/><path d="M46 74 Q50 86 54 74 Q50 78 46 74 Z" fill="#F1F5F9" stroke="#CBD5E1" stroke-width=".6"/>` },
  'clothes-chopin': { name: 'Concert tailcoat & bow', draw: (c) => shoulders({ ...c, cloth: '#111827' }, `<path d="M42 74 L50 100 L58 74 Z" fill="#F8FAFC"/><path d="M36 74 L44 100 M64 74 L56 100" stroke="#374151" stroke-width="1.6"/>`), collar: (c) => `<path d="M43 74 L50 77 L57 74 L57 79 L50 77 L43 79 Z" fill="${c.cloth}"/><circle cx="50" cy="77" r="1.4" fill="${c.clothDark}"/>` },
  'clothes-liszt': { name: 'Virtuoso velvet coat', draw: (c) => shoulders(c, `<path d="M8 100 Q10 76 36 72 Q50 80 64 72 Q90 76 92 100" fill="none" stroke="${c.clothDark}" stroke-width="3"/><path d="M50 80 V100" stroke="${c.clothDark}" stroke-width="2"/>`), collar: () => `<path d="M42 70 L50 78 L58 70 L58 76 L50 82 L42 76 Z" fill="#F8FAFC"/><circle cx="50" cy="84" r="1.8" fill="#FBBF24"/>` },
  'clothes-pinkribbon': { name: 'Pink ribbon tee', draw: (c) => shoulders({ ...c, cloth: '#F9A8D4' }, `<path d="M50 80 Q44 86 47 94 L50 89 L53 94 Q56 86 50 80 Z" fill="#DB2777"/>`), collar: () => `<path d="M40 72 Q50 82 60 72" stroke="#DB2777" stroke-width="2.4" fill="none"/>` },
  'clothes-flannel': { name: 'Fall flannel', draw: (c) => shoulders({ ...c, cloth: '#B91C1C' }, `${[16, 28, 40, 52, 64, 76].map((x) => `<rect x="${x}" y="72" width="5" height="28" fill="#7F1D1D" opacity=".55"/>`).join('')}<path d="M8 84 H92 M8 94 H92" stroke="#7F1D1D" stroke-width="3" opacity=".55"/>`), collar: () => `<path d="M40 70 L50 80 L44 84 Z M60 70 L50 80 L56 84 Z" fill="#7F1D1D"/>` },
  'clothes-spooky': { name: 'Pumpkin sweater', draw: (c) => shoulders({ ...c, cloth: '#1F2937' }, `<circle cx="50" cy="90" r="8" fill="#F97316"/><path d="M46 88 L48 86 L50 88 Z M52 88 L54 86 L54 88 Z M46 92 Q50 95 54 92" fill="#FDE047" stroke="#FDE047" stroke-width=".8"/>`), collar: () => `<path d="M40 72 Q50 82 60 72" stroke="#F97316" stroke-width="2.4" fill="none"/>` },
  'clothes-holiday': { name: 'Holiday sweater', draw: (c) => shoulders({ ...c, cloth: '#15803D' }, `<path d="M12 86 H88" stroke="#F8FAFC" stroke-width="3" stroke-dasharray="4 3"/><path d="M50 80 L45 90 H55 Z" fill="#F8FAFC"/><circle cx="50" cy="80" r="1.6" fill="#FDE68A"/>`), collar: () => `<path d="M38 72 Q50 80 62 72 L62 76 Q50 84 38 76 Z" fill="#DC2626"/>` },
});

// The bigger wardrobe (render/wardrobe.js): dozens more glasses and outfits.
for (const [id, name, , draw] of NEW_GLASSES) LOOKS.glasses[id] = { name, draw };
for (const [id, name, , draw, collar] of NEW_CLOTHES) LOOKS.clothes[id] = { name, draw, ...(collar ? { collar } : {}) };
