// Your explorer: a shoulders-up portrait in the same flat style as the pets and
// ships. Everything is optional and mixable, for every kind of person, alien or
// otherwise: skin, eyes, ears, hair (+ colour), facial hair, clothes (+ colour), hats.
//
// Skin shading never uses white or grey (that looks ashy on deep tones): shadows are
// a deeper shade of the same tone, highlights a warm glow, and blush and lips are
// drawn from the skin itself.

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
  const cloth = a.clothesColor || '#6D28D9';
  const clothDark = mixc(cloth, '#000000', 0.25);
  const g = (id) => `${uid}-${id}`;
  const defs = `<defs>
    <radialGradient id="${g('sk')}" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="${glow}"/><stop offset=".55" stop-color="${tone}"/><stop offset="1" stop-color="${shade}"/></radialGradient>
    <clipPath id="${g('frame')}"><circle cx="50" cy="50" r="50"/></clipPath>
    ${skin.galaxy ? `<radialGradient id="${g('gx')}" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#A78BFA"/><stop offset=".6" stop-color="#4338CA"/><stop offset="1" stop-color="#1E1B4B"/></radialGradient>` : ''}
  </defs>`;
  const SK = skin.galaxy ? `url(#${g('gx')})` : `url(#${g('sk')})`;
  const ctx = { tone, shade, glow, blush, lip, hairC, hairHi, cloth, clothDark, SK, deep, g };
  const hair = L.hair[a.hair] || L.hair['hair-none'];
  const out = [];
  out.push(`<circle cx="50" cy="50" r="50" fill="${a.bg || '#312E81'}"/>`);
  // Clothes (shoulders), neck
  out.push((L.clothes[a.clothes] || L.clothes['clothes-tee']).draw(ctx));
  out.push(`<path d="M41 66 L41 78 Q50 84 59 78 L59 66 Z" fill="${shade}"/>`);
  out.push((L.clothes[a.clothes] || L.clothes['clothes-tee']).collar ? (L.clothes[a.clothes] || L.clothes['clothes-tee']).collar(ctx) : '');
  // Hair behind the head
  if (hair.back) out.push(hair.back(ctx));
  // Ears (behind the head shape)
  const ears = L.ears[a.ears] || L.ears['ears-human'];
  if (ears.back) out.push(ears.back(ctx));
  // Head
  out.push(`<ellipse cx="50" cy="46" rx="20" ry="22" fill="${SK}"/>`);
  if (skin.galaxy) out.push([[40, 34], [58, 30], [62, 52], [36, 56], [50, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#fff" opacity=".9"/>`).join(''));
  if (skin.robot) out.push(`<path d="M30 46 H70" stroke="${shade}" stroke-width="1" opacity=".5"/><circle cx="33" cy="58" r="1.3" fill="${shade}"/><circle cx="67" cy="58" r="1.3" fill="${shade}"/>`);
  if (ears.front) out.push(ears.front(ctx));
  // Face
  out.push((L.eyes[a.eyes] || L.eyes['eyes-round']).draw(ctx));
  out.push(`<ellipse cx="37" cy="54" rx="4" ry="2.4" fill="${blush}" opacity=".55"/><ellipse cx="63" cy="54" rx="4" ry="2.4" fill="${blush}" opacity=".55"/>`);
  out.push(`<path d="M48.5 51.5 Q50 53.5 51.5 51.5" stroke="${shade}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
  out.push(`<path d="M44 58 Q50 62.5 56 58" stroke="${lip}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`);
  out.push((L.facial[a.facial] || L.facial['facial-none']).draw(ctx));
  // Hair in front, then hats
  if (hair.front) out.push(hair.front(ctx));
  out.push((L.hat[a.hat] || L.hat['hat-none']).draw(ctx));
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="avatar-svg" aria-hidden="true">${defs}<g clip-path="url(#${g('frame')})">${out.join('')}</g></svg>`;
}

// ---- Parts ------------------------------------------------------------------------------
const hairCap = (c, extra = '') => `<path d="M29 44 Q28 22 50 21 Q72 22 71 44 Q67 32 50 31 Q33 32 29 44 Z" fill="${c.hairC}"/>${extra}`;
const strands = (c, xs, y0, y1, w = 3) => xs.map((x) => `<path d="M${x} ${y0} V${y1}" stroke="${c.hairC}" stroke-width="${w}" stroke-linecap="round"/>`).join('');

export const LOOKS = {
  skin: {},
  eyes: {
    'eyes-round': { draw: (c) => eyesPair((x) => `<ellipse cx="${x}" cy="45" rx="3" ry="3.6" fill="#1E1B3A"/><circle cx="${x - 1}" cy="43.8" r="1.1" fill="#fff"/>`) + brows(c) },
    'eyes-happy': { draw: (c) => eyesPair((x) => `<path d="M${x - 3.5} 46 Q${x} 41.5 ${x + 3.5} 46" stroke="#1E1B3A" stroke-width="2" fill="none" stroke-linecap="round"/>`) + brows(c) },
    'eyes-sleepy': { draw: (c) => eyesPair((x) => `<path d="M${x - 3.5} 45 Q${x} 48 ${x + 3.5} 45" stroke="#1E1B3A" stroke-width="2" fill="none" stroke-linecap="round"/>`) + brows(c, 1) },
    'eyes-wide': { draw: (c) => eyesPair((x) => `<ellipse cx="${x}" cy="45" rx="4.4" ry="5" fill="#fff"/><ellipse cx="${x}" cy="45.5" rx="2.8" ry="3.2" fill="#3B2416"/><circle cx="${x - 1}" cy="44" r="1" fill="#fff"/>`) + brows(c) },
    'eyes-lashes': { draw: (c) => eyesPair((x) => `<ellipse cx="${x}" cy="45" rx="3" ry="3.6" fill="#1E1B3A"/><circle cx="${x - 1}" cy="43.8" r="1.1" fill="#fff"/><path d="M${x - 3.6} 42.4 l-1.6 -1.4 M${x - 1.6} 41.6 l-.8 -1.8 M${x + 1} 41.6 l.6 -1.8" stroke="#1E1B3A" stroke-width="1" stroke-linecap="round"/>`) + brows(c) },
    'eyes-star': { draw: (c) => eyesPair((x) => `<path d="M${x} 40.5 L${x + 1.4} 43.8 L${x + 4.6} 44.5 L${x + 2.2} 46.7 L${x + 2.8} 50 L${x} 48.3 L${x - 2.8} 50 L${x - 2.2} 46.7 L${x - 4.6} 44.5 L${x - 1.4} 43.8 Z" fill="#FDE68A" stroke="#B45309" stroke-width=".6"/>`) },
    'eyes-heart': { draw: () => eyesPair((x) => `<path d="M${x} 49 C${x - 6} 45 ${x - 3.5} 40 ${x} 43 C${x + 3.5} 40 ${x + 6} 45 ${x} 49 Z" fill="#F43F5E"/>`) },
    'eyes-glow': { draw: () => eyesPair((x) => `<ellipse cx="${x}" cy="45" rx="5.6" ry="6" fill="#86EFAC" opacity=".25"/><ellipse cx="${x}" cy="45" rx="3" ry="3.6" fill="#BBF7D0"/>`) },
    'eyes-cyclops': { draw: () => `<ellipse cx="50" cy="44" rx="7" ry="7.5" fill="#fff"/><ellipse cx="50" cy="44.6" rx="4.4" ry="4.8" fill="#7C3AED"/><circle cx="50" cy="44.6" r="2.2" fill="#1E1B3A"/><circle cx="48.4" cy="43" r="1.2" fill="#fff"/>` },
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
  hair: {
    'hair-none': {},
    // Textured and natural styles
    'hair-twa': { front: (c) => `<path d="M30 42 Q29 22 50 22 Q71 22 70 42 Q66 30 50 30 Q34 30 30 42 Z" fill="${c.hairC}"/>${coils(c, 32, 68, 25, 30, 2.2)}` },
    'hair-afro': { back: (c) => `<circle cx="50" cy="34" r="27" fill="${c.hairC}"/>${coils(c, 26, 74, 12, 50, 3)}`, front: (c) => `<path d="M30 40 Q32 26 50 26 Q68 26 70 40 Q64 32 50 32 Q36 32 30 40 Z" fill="${c.hairC}"/>` },
    'hair-bigafro': { back: (c) => `<circle cx="50" cy="32" r="34" fill="${c.hairC}"/>${coils(c, 20, 80, 4, 56, 3.4)}`, front: (c) => `<path d="M29 40 Q32 25 50 25 Q68 25 71 40 Q64 31 50 31 Q36 31 29 40 Z" fill="${c.hairC}"/>` },
    'hair-puffs': { back: (c) => `<circle cx="26" cy="22" r="12" fill="${c.hairC}"/><circle cx="74" cy="22" r="12" fill="${c.hairC}"/>${coils(c, 16, 36, 12, 32, 2.6)}${coils(c, 64, 84, 12, 32, 2.6)}`, front: (c) => hairCap(c, `<path d="M36 30 Q50 26 64 30" stroke="${c.hairHi}" stroke-width="1" fill="none" opacity=".6"/>`) },
    'hair-hightop': { front: (c) => `<path d="M31 44 Q30 30 33 26 L33 4 Q50 0 67 4 L67 26 Q70 30 69 44 Q66 32 50 31 Q34 32 31 44 Z" fill="${c.hairC}"/>${coils(c, 35, 65, 6, 24, 2.2)}<path d="M31 44 Q30 36 32 30" stroke="${c.shade}" stroke-width="2" opacity=".6" fill="none"/>` },
    'hair-waves': { front: (c) => `${hairCap(c)}<path d="M33 37 Q41 33 50 35 Q59 33 67 37 M35 31 Q42 27 50 29 Q58 27 65 31 M39 26 Q45 23 50 24 Q55 23 61 26" stroke="${c.hairHi}" stroke-width="1.2" fill="none" opacity=".75"/>` },
    'hair-cornrows': { front: (c) => `${hairCap(c)}${[36, 42, 48, 54, 60, 66].map((x) => `<path d="M${x} 22 Q${x + (x < 50 ? -2 : 2)} 32 ${x + (x < 50 ? -4 : 4)} 42" stroke="${c.hairHi}" stroke-width="1" stroke-dasharray="2.2 1.4" fill="none" opacity=".8"/>`).join('')}` },
    'hair-boxbraids': { back: (c) => strands(c, [27, 31, 35, 65, 69, 73], 40, 92, 4) + [27, 31, 35, 65, 69, 73].map((x) => `<path d="M${x} 44 V90" stroke="${c.hairHi}" stroke-width="1" stroke-dasharray="1.5 2.5" opacity=".6"/>`).join(''), front: (c) => hairCap(c, `<path d="M50 21 V31" stroke="${c.shade}" stroke-width="1" opacity=".5"/>`) },
    'hair-locs': { back: (c) => strands(c, [26, 30, 34, 38, 62, 66, 70, 74], 36, 88, 5) + [26, 34, 66, 74].map((x) => `<path d="M${x} 44 V84" stroke="${c.hairHi}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".5"/>`).join(''), front: (c) => `${hairCap(c)}${strands(c, [34, 40, 46, 54, 60, 66], 24, 36, 4.4)}` },
    'hair-twists': { back: (c) => [28, 33, 67, 72].map((x) => `<path d="M${x} 34 Q${x + 2} 42 ${x} 50 Q${x - 2} 58 ${x} 66" stroke="${c.hairC}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join(''), front: (c) => `${hairCap(c)}${[36, 43, 50, 57, 64].map((x) => `<path d="M${x} 22 Q${x + 2} 27 ${x} 32" stroke="${c.hairHi}" stroke-width="1.2" fill="none" opacity=".6"/>`).join('')}` },
    'hair-bantu': { front: (c) => `${hairCap(c)}${[[36, 22], [50, 16], [64, 22], [42, 28], [58, 28]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.4" fill="${c.hairC}"/><path d="M${x - 3} ${y} Q${x} ${y - 4} ${x + 3} ${y}" stroke="${c.hairHi}" stroke-width="1" fill="none" opacity=".7"/>`).join('')}` },
    'hair-coils': { back: (c) => `<ellipse cx="50" cy="38" rx="26" ry="24" fill="${c.hairC}"/>`, front: (c) => `${coils(c, 28, 72, 18, 44, 3.2, true)}<path d="M30 40 Q34 28 50 28 Q66 28 70 40 Q64 33 50 33 Q36 33 30 40 Z" fill="${c.hairC}"/>` },
    // Everyday styles
    'hair-short': { front: (c) => `${hairCap(c)}<path d="M30 40 Q36 28 52 28 Q46 32 44 38" fill="${c.hairC}"/>` },
    'hair-curly': { front: (c) => `${hairCap(c)}${coils(c, 30, 70, 20, 34, 3.4, true)}` },
    'hair-buzz': { front: (c) => `<path d="M30 42 Q29 24 50 24 Q71 24 70 42 Q66 32 50 32 Q34 32 30 42 Z" fill="${c.hairC}" opacity=".85"/>` },
    'hair-long': { back: (c) => `<path d="M28 40 Q26 70 30 92 L70 92 Q74 70 72 40 Q72 22 50 21 Q28 22 28 40 Z" fill="${c.hairC}"/>`, front: (c) => `<path d="M29 46 Q28 22 50 21 Q72 22 71 46 Q66 30 56 30 Q50 38 42 32 Q34 34 29 46 Z" fill="${c.hairC}"/>` },
    'hair-bob': { back: (c) => `<path d="M27 40 Q26 64 32 68 L68 68 Q74 64 73 40 Q72 21 50 20 Q28 21 27 40 Z" fill="${c.hairC}"/>`, front: (c) => `<path d="M29 44 Q28 22 50 21 Q72 22 71 44 Q64 30 50 32 Q36 30 29 44 Z" fill="${c.hairC}"/>` },
    'hair-bun': { front: (c) => `<circle cx="50" cy="14" r="9" fill="${c.hairC}"/>${hairCap(c, `<path d="M42 16 Q50 12 58 16" stroke="${c.hairHi}" stroke-width="1" fill="none" opacity=".6"/>`)}` },
    'hair-mohawk': { front: (c) => `<path d="M44 38 Q42 14 46 4 Q50 10 54 4 Q58 14 56 38 Z" fill="${c.hairC}"/><path d="M30 42 Q30 30 44 27 M70 42 Q70 30 56 27" stroke="${c.shade}" stroke-width="3" opacity=".5" fill="none"/>` },
    'hair-spiky': { front: (c) => `<path d="M29 44 L28 26 L35 30 L36 16 L43 25 L48 10 L53 24 L60 14 L62 28 L70 22 L71 44 Q66 32 50 31 Q34 32 29 44 Z" fill="${c.hairC}"/>` },
    // Whimsical
    'hair-flame': { front: () => `<path d="M30 42 Q24 26 34 18 Q34 26 40 26 Q38 12 50 4 Q50 16 58 18 Q58 8 66 14 Q74 24 70 42 Q64 30 50 30 Q36 30 30 42 Z" fill="#F97316"/><path d="M36 36 Q34 26 42 22 Q42 28 48 28 Q48 18 54 14 Q56 22 62 24 Q66 30 64 36 Q58 30 50 30 Q42 30 36 36 Z" fill="#FDE047"/>` },
    'hair-nebula': { front: () => `<path d="M28 44 Q24 18 50 16 Q76 18 72 44 Q66 30 50 30 Q34 30 28 44 Z" fill="#7C3AED"/><path d="M32 34 Q40 20 54 22 Q66 24 68 36 Q60 28 50 28 Q40 28 32 34 Z" fill="#EC4899" opacity=".8"/>${[[38, 24], [56, 20], [64, 30], [46, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="#fff"/>`).join('')}` },
    'hair-tentacles': { front: () => `${[34, 42, 50, 58, 66].map((x, i) => `<path d="M${x} 30 Q${x + (i - 2) * 4} 14 ${x + (i - 2) * 8} 10" stroke="#34D399" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="${x + (i - 2) * 8}" cy="10" r="2.4" fill="#A7F3D0"/>`).join('')}` },
    'hair-crystal': { front: () => `<path d="M30 42 L32 22 L38 30 L42 12 L48 26 L54 8 L58 26 L64 14 L66 30 L70 24 L70 42 Q64 32 50 31 Q36 32 30 42 Z" fill="#67E8F9"/><path d="M42 12 L44 28 M54 8 L54 26 M64 14 L62 28" stroke="#ECFEFF" stroke-width="1" opacity=".8"/>` },
  },
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
  hat: {
    'hat-none': { draw: () => '' },
    'hat-beanie': { draw: (c) => `<path d="M28 34 Q28 12 50 12 Q72 12 72 34 Z" fill="${c.cloth}"/><rect x="26" y="30" width="48" height="8" rx="3" fill="${c.clothDark}"/><circle cx="50" cy="10" r="4" fill="${c.clothDark}"/>` },
    'hat-cap': { draw: (c) => `<path d="M29 34 Q29 14 50 14 Q71 14 71 34 Z" fill="${c.cloth}"/><path d="M50 33 Q66 30 80 36 Q70 40 50 38 Z" fill="${c.clothDark}"/>` },
    'hat-headwrap': { draw: (c) => `<path d="M27 40 Q24 14 50 12 Q76 14 73 40 Q66 30 50 30 Q34 30 27 40 Z" fill="${c.cloth}"/><path d="M38 14 Q50 4 62 14 Q58 22 50 20 Q42 22 38 14 Z" fill="${c.clothDark}"/><path d="M30 30 Q50 22 70 30 M32 24 Q50 16 68 24" stroke="${c.clothDark}" stroke-width="1.6" fill="none" opacity=".7"/>` },
    'hat-durag': { draw: (c) => `<path d="M29 42 Q27 20 50 19 Q73 20 71 42 Q66 32 50 32 Q34 32 29 42 Z" fill="${c.cloth}"/><path d="M50 19 V32" stroke="${c.clothDark}" stroke-width="1.6"/><path d="M70 40 Q78 54 74 70" stroke="${c.cloth}" stroke-width="4" fill="none" stroke-linecap="round"/>` },
    'hat-headphones': { draw: () => `<path d="M28 44 Q28 16 50 16 Q72 16 72 44" stroke="#1F2937" stroke-width="4.5" fill="none"/><rect x="22" y="40" width="10" height="16" rx="4" fill="#8B5CF6"/><rect x="68" y="40" width="10" height="16" rx="4" fill="#8B5CF6"/>` },
    'hat-crown': { draw: () => `<path d="M34 26 L36 12 L43 20 L50 8 L57 20 L64 12 L66 26 Z" fill="#FBBF24" stroke="#92400E" stroke-width="1"/><circle cx="50" cy="20" r="2.2" fill="#F472B6"/>` },
    'hat-helmet': { draw: () => `<circle cx="50" cy="46" r="31" fill="#BAE6FD" opacity=".22" stroke="#E0F2FE" stroke-width="2.4"/><path d="M30 28 Q40 18 52 18" stroke="#fff" stroke-width="2.4" opacity=".7" fill="none" stroke-linecap="round"/>` },
    'hat-flowers': { draw: () => [30, 38, 46, 54, 62, 70].map((x, i) => `<circle cx="${x}" cy="${26 - Math.sin((i / 5) * Math.PI) * 8}" r="4" fill="${['#F472B6', '#FDE68A', '#A78BFA', '#F9A8D4', '#86EFAC', '#FDBA74'][i]}"/><circle cx="${x}" cy="${26 - Math.sin((i / 5) * Math.PI) * 8}" r="1.4" fill="#FEF3C7"/>`).join('') },
    // Seasonal
  'hat-witch': { draw: () => `<path d="M20 30 Q50 22 80 30 Q50 36 20 30 Z" fill="#1F2937"/><path d="M34 29 L52 -2 Q56 10 66 28 Z" fill="#1F2937"/><path d="M36 26 Q50 22 64 26" stroke="#F97316" stroke-width="3" fill="none"/>` },
  'hat-pumpkin': { draw: () => `<path d="M28 34 Q26 14 50 14 Q74 14 72 34 Z" fill="#F97316"/><path d="M40 16 Q38 26 40 34 M50 14 V34 M60 16 Q62 26 60 34" stroke="#C2410C" stroke-width="1.4" fill="none"/><path d="M50 14 Q50 6 56 4" stroke="#166534" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  'hat-pinkbeanie': { draw: () => `<path d="M28 34 Q28 12 50 12 Q72 12 72 34 Z" fill="#F472B6"/><rect x="26" y="30" width="48" height="8" rx="3" fill="#DB2777"/><path d="M50 14 Q46 22 50 26 Q54 22 50 14 Z M50 14 L44 30 M50 14 L56 30" stroke="#FCE7F3" stroke-width="2" fill="none"/>` },
  'hat-leafcrown': { draw: () => [28, 36, 44, 52, 60, 68].map((x, i) => `<ellipse cx="${x + 2}" cy="${26 - Math.sin((i / 5) * Math.PI) * 8}" rx="5" ry="3" fill="${['#D97706', '#DC2626', '#F59E0B', '#B45309', '#EA580C', '#CA8A04'][i]}" transform="rotate(${-30 + i * 12} ${x + 2} ${26 - Math.sin((i / 5) * Math.PI) * 8})"/>`).join('') },
  'hat-santa': { draw: () => `<path d="M28 34 Q34 8 60 10 Q76 14 80 34 Z" fill="#DC2626"/><circle cx="80" cy="34" r="5" fill="#F8FAFC"/><rect x="24" y="30" width="54" height="8" rx="4" fill="#F8FAFC"/>` },
  'hat-earmuffs': { draw: () => `<path d="M30 46 Q30 18 50 18 Q70 18 70 46" stroke="#E0F2FE" stroke-width="3.5" fill="none"/><circle cx="29" cy="48" r="8" fill="#F8FAFC"/><circle cx="71" cy="48" r="8" fill="#F8FAFC"/>` },
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
  'clothes-kente': { name: 'Kente stripes', draw: (c) => shoulders({ ...c, cloth: '#FBBF24' }, `${[18, 30, 42, 54, 66, 78].map((x, i) => `<rect x="${x}" y="76" width="6" height="24" fill="${['#16A34A', '#DC2626', '#111827'][i % 3]}"/>`).join('')}<path d="M10 90 H90" stroke="#111827" stroke-width="2"/>`), collar: () => `<path d="M40 72 Q50 82 60 72" stroke="#111827" stroke-width="2.4" fill="none"/>` },
  'clothes-pinkribbon': { name: 'Pink ribbon tee', draw: (c) => shoulders({ ...c, cloth: '#F9A8D4' }, `<path d="M50 80 Q44 86 47 94 L50 89 L53 94 Q56 86 50 80 Z" fill="#DB2777"/>`), collar: () => `<path d="M40 72 Q50 82 60 72" stroke="#DB2777" stroke-width="2.4" fill="none"/>` },
  'clothes-flannel': { name: 'Fall flannel', draw: (c) => shoulders({ ...c, cloth: '#B91C1C' }, `${[16, 28, 40, 52, 64, 76].map((x) => `<rect x="${x}" y="72" width="5" height="28" fill="#7F1D1D" opacity=".55"/>`).join('')}<path d="M8 84 H92 M8 94 H92" stroke="#7F1D1D" stroke-width="3" opacity=".55"/>`), collar: () => `<path d="M40 70 L50 80 L44 84 Z M60 70 L50 80 L56 84 Z" fill="#7F1D1D"/>` },
  'clothes-spooky': { name: 'Pumpkin sweater', draw: (c) => shoulders({ ...c, cloth: '#1F2937' }, `<circle cx="50" cy="90" r="8" fill="#F97316"/><path d="M46 88 L48 86 L50 88 Z M52 88 L54 86 L54 88 Z M46 92 Q50 95 54 92" fill="#FDE047" stroke="#FDE047" stroke-width=".8"/>`), collar: () => `<path d="M40 72 Q50 82 60 72" stroke="#F97316" stroke-width="2.4" fill="none"/>` },
  'clothes-holiday': { name: 'Holiday sweater', draw: (c) => shoulders({ ...c, cloth: '#15803D' }, `<path d="M12 86 H88" stroke="#F8FAFC" stroke-width="3" stroke-dasharray="4 3"/><path d="M50 80 L45 90 H55 Z" fill="#F8FAFC"/><circle cx="50" cy="80" r="1.6" fill="#FDE68A"/>`), collar: () => `<path d="M38 72 Q50 80 62 72 L62 76 Q50 84 38 76 Z" fill="#DC2626"/>` },
  'clothes-dashiki': { name: 'Dashiki', draw: (c) => shoulders(c, `<path d="M38 74 Q50 96 62 74" fill="#FDE68A"/><path d="M41 76 Q50 92 59 76" fill="${c.clothDark}"/><path d="M44 78 L50 88 L56 78" stroke="#FDE68A" stroke-width="1.4" fill="none"/>`) },
});
