// Drawn land animals for the Pet shop, in the same flat, chibi style as the space
// creatures: a big round head, a small body, shiny dark eyes. Each species is a
// short recipe of parts (ears, markings, wings, tail...). 64×64 viewBox.

const EYE = '#1E1B3A';
/** Mix a colour towards a warm cream (keeps the hue, never greys it out). */
function lighten(hx, k) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hx.slice(i, i + 2), 16));
  const to = [255, 247, 232];
  return `#${[r, g, b].map((v, i) => Math.round(v + (to[i] - v) * k).toString(16).padStart(2, '0')).join('')}`;
}

export function critterSVG(id, L) {
  const gid = `k${id.replace(/\W/g, '')}`;
  const fur = L.fur || '#C8A27A';
  const belly = L.belly || '#FFF4E6';
  const acc = L.accent || '#8B5A2B';
  // Shine: a lighter, warmer shade of the fur itself (white looks grey and ashy on warm colours).
  const shine = lighten(fur, 0.32);
  const defs = `<defs><radialGradient id="${gid}" cx=".38" cy=".3" r=".75"><stop offset="0" stop-color="${shine}"/><stop offset=".55" stop-color="${fur}"/><stop offset="1" stop-color="${fur}"/></radialGradient></defs>`;
  const F = `url(#${gid})`;
  const parts = [];
  const add = (s) => parts.push(s);
  const base = L.base || 'mammal';

  if (base === 'pom') return pomSVG(defs, F, L, fur, belly, acc);
  if (base === 'chibi') return chibiSVG(id, L);

  // ---- behind the body: tails, wings, shells, manes --------------------------------
  const tail = {
    thin: `<path d="M44 50 Q56 48 54 36" stroke="${fur}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    fluffy: `<ellipse cx="50" cy="46" rx="8" ry="11" fill="${fur}" transform="rotate(30 50 46)"/>${L.tailTip ? `<ellipse cx="54" cy="38" rx="4" ry="5" fill="${L.tailTip}" transform="rotate(30 54 38)"/>` : ''}`,
    puff: `<circle cx="47" cy="52" r="5" fill="${belly}"/>`,
    curl: `<path d="M44 52 C58 54 62 36 52 28 C46 24 42 32 48 34" stroke="${fur}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M46 50 C56 50 58 38 52 32" stroke="${belly}" stroke-width="2" fill="none" opacity=".5"/>`,
    fan: [0, 1, 2, 3, 4].map((i) => `<ellipse cx="32" cy="22" rx="6" ry="17" fill="${['#B45309', '#DC2626', '#F59E0B', '#DC2626', '#B45309'][i]}" transform="rotate(${(i - 2) * 26} 32 44)"/>`).join(''),
    dino: `<path d="M42 50 Q60 52 60 42 Q54 48 44 44 Z" fill="${fur}"/>`,
  }[L.tail];
  if (tail) add(tail);
  if (L.wings === 'bat') add(`<path d="M20 40 Q6 30 2 40 Q8 40 8 46 Q12 42 16 46 Q18 42 22 46 Z M44 40 Q58 30 62 40 Q56 40 56 46 Q52 42 48 46 Q46 42 42 46 Z" fill="${acc}"/>`);
  if (L.wings === 'dragon') add(`<path d="M22 38 Q4 22 4 40 Q10 36 12 44 Q16 38 22 44 Z M42 38 Q60 22 60 40 Q54 36 52 44 Q48 38 42 44 Z" fill="${acc}" opacity=".95"/>`);
  if (L.wings === 'insect') add(`<ellipse cx="22" cy="34" rx="9" ry="6" fill="#E0F2FE" opacity=".85" transform="rotate(-30 22 34)"/><ellipse cx="42" cy="34" rx="9" ry="6" fill="#E0F2FE" opacity=".85" transform="rotate(30 42 34)"/>`);
  if (L.wings === 'butterfly' || base === 'butterfly') add(`<path d="M30 34 C16 16 2 22 6 34 C8 42 20 42 30 38 Z M34 34 C48 16 62 22 58 34 C56 42 44 42 34 38 Z" fill="${acc}" class="wing"/><path d="M30 38 C20 42 14 52 20 56 C26 58 28 48 31 42 Z M34 38 C44 42 50 52 44 56 C38 58 36 48 33 42 Z" fill="${L.accent2 || fur}" class="wing"/><circle cx="14" cy="30" r="3" fill="#fff" opacity=".8"/><circle cx="50" cy="30" r="3" fill="#fff" opacity=".8"/>`);
  if (L.mane) add(`<circle cx="32" cy="26" r="22" fill="${L.mane}"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<circle cx="${32 + 20 * Math.cos(a * Math.PI / 180)}" cy="${26 + 20 * Math.sin(a * Math.PI / 180)}" r="6" fill="${L.mane}"/>`).join('')}`);
  if (L.spines) add([...Array(9)].map((_, i) => { const a = (-160 + i * 20) * Math.PI / 180; return `<path d="M${32 + 14 * Math.cos(a)} ${30 + 14 * Math.sin(a)} L${32 + 24 * Math.cos(a)} ${30 + 24 * Math.sin(a)} L${32 + 14 * Math.cos(a + 0.2)} ${30 + 14 * Math.sin(a + 0.2)} Z" fill="${acc}"/>`; }).join(''));
  if (L.antlers) add(`<path d="M22 14 L16 4 M18 8 L12 6 M19 10 L22 3 M42 14 L48 4 M46 8 L52 6 M45 10 L42 3" stroke="#92400E" stroke-width="2.6" stroke-linecap="round" fill="none"/>`);

  // ---- body ----------------------------------------------------------------------
  if (base === 'snowman') {
    add(`<circle cx="32" cy="46" r="15" fill="#F8FAFC" stroke="#CBD5E1"/><circle cx="32" cy="24" r="12" fill="#F8FAFC" stroke="#CBD5E1"/><circle cx="32" cy="42" r="1.6" fill="${EYE}"/><circle cx="32" cy="48" r="1.6" fill="${EYE}"/>`);
    add(`<rect x="22" y="7" width="20" height="4" rx="1" fill="#1F2937"/><rect x="25" y="-1" width="14" height="9" rx="1.5" fill="#1F2937"/><rect x="25" y="5" width="14" height="2" fill="#DC2626"/>`);
    add(`<path d="M22 33 Q32 37 42 33" stroke="#DC2626" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M38 34 L42 42" stroke="#DC2626" stroke-width="4" stroke-linecap="round"/>`);
    add(eyes(22, 6, 2.4) + `<path d="M32 25 L40 27 L32 28 Z" fill="#F97316"/>`);
    return wrap(defs, parts, L);
  }
  if (base === 'turtle') {
    add(`<ellipse cx="32" cy="44" rx="20" ry="14" fill="${acc}"/><path d="M20 44 L26 36 L38 36 L44 44 L38 52 L26 52 Z" fill="${L.accent2 || '#A16207'}" opacity=".8"/><path d="M26 36 L32 44 L38 36 M26 52 L32 44 L38 52 M20 44 H44" stroke="${acc}" stroke-width="1.5" fill="none"/>`);
    add(`<ellipse cx="14" cy="54" rx="5" ry="3" fill="${fur}"/><ellipse cx="50" cy="54" rx="5" ry="3" fill="${fur}"/>`);
    add(`<circle cx="32" cy="22" r="12" fill="${F}"/>${eyes(21, 5, 2.6)}${smile(27)}${cheeks(25, 8)}`);
    return wrap(defs, parts, L);
  }
  // Body
  if (base === 'insect') {
    add(`<ellipse cx="32" cy="42" rx="14" ry="13" fill="${F}"/>`);
    if (L.marks === 'stripes') add(`<path d="M20 38 H44 M19 45 H45" stroke="${acc}" stroke-width="4"/>`);
    if (L.marks === 'spots') add(`<path d="M32 30 V55" stroke="${acc}" stroke-width="1.5"/><circle cx="25" cy="38" r="3" fill="${acc}"/><circle cx="39" cy="38" r="3" fill="${acc}"/><circle cx="26" cy="48" r="2.5" fill="${acc}"/><circle cx="38" cy="48" r="2.5" fill="${acc}"/>`);
    add(`<circle cx="32" cy="22" r="11" fill="${L.head || acc}"/>${eyes(21, 5, 2.4, '#fff')}<path d="M27 12 Q24 4 20 4 M37 12 Q40 4 44 4" stroke="${L.head || acc}" stroke-width="1.6" fill="none"/><circle cx="20" cy="4" r="2" fill="${L.head || acc}"/><circle cx="44" cy="4" r="2" fill="${L.head || acc}"/>${smile(26, '#fff')}`);
    return wrap(defs, parts, L);
  }
  if (base === 'butterfly') {
    add(`<ellipse cx="32" cy="38" rx="4.5" ry="14" fill="${EYE}"/><circle cx="32" cy="22" r="7" fill="${EYE}"/><circle cx="29.5" cy="21" r="1.6" fill="#fff"/><circle cx="34.5" cy="21" r="1.6" fill="#fff"/><path d="M30 16 Q26 8 22 8 M34 16 Q38 8 42 8" stroke="${EYE}" stroke-width="1.4" fill="none"/>`);
    return wrap(defs, parts, L);
  }
  const bird = base === 'bird';
  add(`<ellipse cx="32" cy="47" rx="${bird ? 14 : 13}" ry="${bird ? 13 : 11}" fill="${F}"/><ellipse cx="32" cy="49" rx="8" ry="7" fill="${belly}"/>`);
  if (!bird && base !== 'frog') add(`<ellipse cx="24" cy="56" rx="5" ry="3" fill="${L.paws || fur}"/><ellipse cx="40" cy="56" rx="5" ry="3" fill="${L.paws || fur}"/>`);
  if (bird) add(`<path d="M18 44 Q12 50 18 56 Q22 52 22 46 Z M46 44 Q52 50 46 56 Q42 52 42 46 Z" fill="${acc}"/><path d="M26 59 l-2 4 M28 59 v4 M36 59 v4 M38 59 l2 4" stroke="${L.feet || '#F59E0B'}" stroke-width="2" stroke-linecap="round"/>`);
  if (base === 'frog') add(`<ellipse cx="20" cy="56" rx="7" ry="3.5" fill="${fur}"/><ellipse cx="44" cy="56" rx="7" ry="3.5" fill="${fur}"/>`);
  if (base === 'dino') add(`<path d="M22 44 l-6 2 M42 44 l6 2" stroke="${fur}" stroke-width="4" stroke-linecap="round"/>${L.spikes ? '<path d="M26 34 l3 -5 l3 5 l3 -5 l3 5" fill="' + acc + '"/>' : ''}`);

  // ---- ears (behind the head) ------------------------------------------------------
  const inner = L.inner || '#FBCFE8';
  const ears = {
    pointy: `<path d="M16 22 L15 4 L28 14 Z M48 22 L49 4 L36 14 Z" fill="${L.earColor || fur}"/><path d="M18 18 L17 9 L24 14 Z M46 18 L47 9 L40 14 Z" fill="${inner}"/>`,
    big: `<path d="M14 24 L10 0 L28 14 Z M50 24 L54 0 L36 14 Z" fill="${L.earColor || fur}"/><path d="M16 18 L14 6 L24 14 Z M48 18 L50 6 L40 14 Z" fill="${inner}"/>`,
    round: `<circle cx="16" cy="12" r="7" fill="${L.earColor || fur}"/><circle cx="48" cy="12" r="7" fill="${L.earColor || fur}"/><circle cx="16" cy="12" r="3.5" fill="${inner}"/><circle cx="48" cy="12" r="3.5" fill="${inner}"/>`,
    fluffy: `<circle cx="13" cy="16" r="9" fill="${L.earColor || fur}"/><circle cx="51" cy="16" r="9" fill="${L.earColor || fur}"/><circle cx="13" cy="16" r="5" fill="${inner}"/><circle cx="51" cy="16" r="5" fill="${inner}"/>`,
    floppy: `<path d="M16 16 C6 16 4 32 10 36 C14 30 16 24 20 22 Z M48 16 C58 16 60 32 54 36 C50 30 48 24 44 22 Z" fill="${L.earColor || acc}"/>`,
    long: `<ellipse cx="23" cy="2" rx="5" ry="14" fill="${L.earColor || fur}"/><ellipse cx="41" cy="2" rx="5" ry="14" fill="${L.earColor || fur}"/><ellipse cx="23" cy="3" rx="2.4" ry="10" fill="${inner}"/><ellipse cx="41" cy="3" rx="2.4" ry="10" fill="${inner}"/>`,
    tufts: `<path d="M18 14 L14 2 L26 10 Z M46 14 L50 2 L38 10 Z" fill="${acc}"/>`,
  }[L.ears];
  if (ears) add(ears);
  if (L.horns) add(`<path d="M22 12 Q18 4 22 0 Q24 6 26 10 Z M42 12 Q46 4 42 0 Q40 6 38 10 Z" fill="${L.horns}"/>`);

  // ---- head ------------------------------------------------------------------------
  const frog = base === 'frog';
  add(frog ? `<ellipse cx="32" cy="27" rx="19" ry="14" fill="${F}"/><circle cx="22" cy="15" r="7" fill="${fur}"/><circle cx="42" cy="15" r="7" fill="${fur}"/>` : `<circle cx="32" cy="26" r="${L.headR || 17}" fill="${F}"/>`);
  if (L.marks === 'panda') add(`<ellipse cx="24" cy="27" rx="5" ry="6.5" fill="${acc}" transform="rotate(-20 24 27)"/><ellipse cx="40" cy="27" rx="5" ry="6.5" fill="${acc}" transform="rotate(20 40 27)"/>`);
  if (L.marks === 'mask') add(`<path d="M15 26 Q32 18 49 26 Q46 34 32 32 Q18 34 15 26 Z" fill="${L.maskColor || belly}" opacity=".9"/>`);
  if (L.marks === 'patch') add(`<ellipse cx="40" cy="25" rx="6.5" ry="7" fill="${acc}" opacity=".85"/>`);
  if (L.marks === 'tabby') add(`<path d="M26 11 l2 6 M32 10 v7 M38 11 l-2 6" stroke="${acc}" stroke-width="2.2" stroke-linecap="round"/>`);
  if (L.mane2) add(`<path d="M30 9 Q36 0 44 6 Q38 8 40 14 Q34 10 30 14 Z" fill="${L.mane2}"/><path d="M42 12 Q50 14 48 24" stroke="${L.mane3 || L.mane2}" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  if (L.horn) add(`<path d="M30 11 L32 -4 L34 11 Z" fill="${L.horn}"/><path d="M31 6 L33 5 M30.6 2 L33.4 1" stroke="#fff" stroke-width=".8" opacity=".7"/>`);
  if (L.tuftTop) add(`<path d="M28 10 Q32 0 36 10" stroke="${acc}" stroke-width="3" fill="none"/>`);

  // ---- face --------------------------------------------------------------------
  if (frog) {
    add(`<circle cx="22" cy="15" r="3.6" fill="${EYE}"/><circle cx="42" cy="15" r="3.6" fill="${EYE}"/><circle cx="20.8" cy="13.8" r="1.4" fill="#fff"/><circle cx="40.8" cy="13.8" r="1.4" fill="#fff"/>`);
    add(`<path d="M20 30 Q32 38 44 30" stroke="${EYE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>${cheeks(30, 13)}`);
    return wrap(defs, parts, L);
  }
  if (L.eyeRings) add(`<circle cx="24" cy="26" r="7" fill="${belly}"/><circle cx="40" cy="26" r="7" fill="${belly}"/>`);
  add(L.sleepy ? `<path d="M20 27 Q24 30 28 27 M36 27 Q40 30 44 27" stroke="${EYE}" stroke-width="2" fill="none" stroke-linecap="round"/>` : eyes(26, L.eyeRings ? 8 : 7.5, L.eyeRings ? 3.6 : 3.2));
  if (bird) add(L.beak === 'hook' ? `<path d="M29 31 Q32 28 36 31 Q36 38 31 39 Q33 35 29 33 Z" fill="${L.beakColor || '#1F2937'}"/>` : `<path d="M28 31 L32 37 L36 31 Z" fill="${L.beakColor || '#F59E0B'}"/>`);
  else if (L.snout !== false) add(`<ellipse cx="32" cy="${base === 'dino' ? 33 : 34}" rx="${L.bigSnout ? 8 : 6}" ry="${L.bigSnout ? 6 : 4.5}" fill="${L.snoutColor || belly}"/><ellipse cx="32" cy="${base === 'dino' ? 31 : 32}" rx="${L.bigNose ? 3.6 : 2.4}" ry="${L.bigNose ? 2.8 : 1.8}" fill="${L.nose || EYE}"/><path d="M30 36 Q32 37.5 34 36" stroke="${EYE}" stroke-width="1.2" fill="none"/>`);
  if (L.fangs) add(`<path d="M29 37 l1 3 l1 -3 M33 37 l1 3 l1 -3" fill="#fff"/>`);
  if (L.whiskers) add(`<path d="M22 33 H14 M22 35 L15 38 M42 33 H50 M42 35 L49 38" stroke="${EYE}" stroke-width=".8" opacity=".5"/>`);
  if (L.wattle) add(`<path d="M34 36 Q38 42 34 46 Q32 42 33 37 Z" fill="#DC2626"/>`);
  if (base === 'dino' && L.teeth) add(`<path d="M27 37 l1.5 2.5 l1.5 -2.5 l1.5 2.5 l1.5 -2.5 l1.5 2.5 l1.5 -2.5" stroke="#fff" stroke-width="1" fill="none"/>`);
  add(cheeks(32, 14));
  return wrap(defs, parts, L);
}

function eyes(cy, spread, r, col = EYE) {
  return [32 - spread, 32 + spread].map((x) => `<ellipse cx="${x}" cy="${cy}" rx="${r}" ry="${r * 1.15}" fill="${col}"/><circle cx="${x - r / 3}" cy="${cy - r / 3}" r="${r / 2.6}" fill="${col === EYE ? '#fff' : EYE}"/>`).join('');
}
const smile = (y, col = EYE) => `<path d="M29 ${y} Q32 ${y + 3} 35 ${y}" stroke="${col}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
const cheeks = (y, dx) => `<ellipse cx="${32 - dx}" cy="${y}" rx="3" ry="2" fill="#FB7185" opacity=".4"/><ellipse cx="${32 + dx}" cy="${y}" rx="3" ry="2" fill="#FB7185" opacity=".4"/>`;
const wrap = (defs, parts, L) => `<svg viewBox="-4 -6 72 72" aria-hidden="true" class="critter"${L.glow ? ` style="--glow:${L.glow}"` : ''}>${defs}${parts.join('')}</svg>`;

// ---- Fluffy dogs (Pomeranians, pom-poodles…) ---------------------------------------
// A cloud of fur: a scalloped ruff around the face, a plume tail over the back,
// and big two-highlight eyes. Look: fur, belly (chest/cheeks), muzzle, ears
// ('pointy' | 'floppy'), shaggy (bangs + beard), blaze (forehead stripe), tongue.
const puffs = (cx, cy, r, n, pr, col, start = 0) => [...Array(n)].map((_, i) => { const a = start + (i / n) * Math.PI * 2; return `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="${pr}" fill="${col}"/>`; }).join('');
function bigEyes(cy, spread, r, col = EYE) {
  return [32 - spread, 32 + spread].map((x) => `<ellipse cx="${x}" cy="${cy}" rx="${r}" ry="${r * 1.2}" fill="${col}"/><circle cx="${x - r * 0.35}" cy="${cy - r * 0.42}" r="${r * 0.42}" fill="#fff"/><circle cx="${x + r * 0.35}" cy="${cy + r * 0.4}" r="${r * 0.18}" fill="#fff" opacity=".9"/>`).join('');
}
function pomSVG(defs, F, L, fur, belly, acc) {
  const p = [];
  const muzzle = L.muzzle || belly;
  const dark = L.dark || acc;
  // Plume tail curled over the back
  p.push(`<g>${puffs(48, 36, 6, 7, 5.5, fur)}<circle cx="48" cy="36" r="6" fill="${fur}"/>${L.tailTip ? puffs(50, 33, 3, 5, 3, L.tailTip) : ''}</g>`);
  // Fluffy body + chest ruff
  p.push(`${puffs(32, 48, 11, 10, 5, fur)}<ellipse cx="32" cy="48" rx="12" ry="10" fill="${F}"/>`);
  p.push(`${puffs(32, 44, 5, 6, 4.2, belly, 0.3)}`);
  p.push(`<ellipse cx="25" cy="57" rx="4.5" ry="3" fill="${L.paws || fur}"/><ellipse cx="39" cy="57" rx="4.5" ry="3" fill="${L.paws || fur}"/>`);
  // Ears
  if (L.ears === 'floppy') p.push(`${puffs(14, 26, 4, 6, 4.4, L.earColor || dark)}${puffs(50, 26, 4, 6, 4.4, L.earColor || dark)}`);
  else p.push(`<path d="M16 17 L18.5 1 L29 11 Z M48 17 L45.5 1 L35 11 Z" fill="${L.earColor || fur}"/><path d="M19.5 13 L20.5 5.5 L25.5 10.5 Z M44.5 13 L43.5 5.5 L38.5 10.5 Z" fill="${L.inner || '#F9C5A8'}"/>${puffs(18.5, 3, 1.4, 4, 1.8, L.earColor || fur)}${puffs(45.5, 3, 1.4, 4, 1.8, L.earColor || fur)}`);
  // Head: a ruff of fur puffs, then the face (pointy ears poke up through the ruff)
  const earsSVG = p.pop();
  p.push(`${puffs(32, 26, 16.5, 16, 4.6, L.ruff || fur)}`);
  p.push(earsSVG);
  p.push(`<circle cx="32" cy="26" r="16.5" fill="${F}"/>`);
  if (L.cheeks) p.push(`<ellipse cx="22" cy="31" rx="6" ry="5" fill="${L.cheeks}" opacity=".9"/><ellipse cx="42" cy="31" rx="6" ry="5" fill="${L.cheeks}" opacity=".9"/>`);
  if (L.blaze) p.push(`<path d="M30 9 Q32 7 34 9 L33.5 27 Q32 28 30.5 27 Z" fill="${L.blaze}"/>`);
  if (L.shaggy) p.push(`${puffs(32, 12, 7, 7, 3.4, L.bangs || fur, Math.PI * 0.9)}`); // bangs over the brow
  // Muzzle (a beard on shaggy dogs)
  if (L.shaggy) p.push(`${puffs(32, 35, 4.5, 8, 3.6, muzzle)}<ellipse cx="32" cy="34" rx="7" ry="5.5" fill="${muzzle}"/>`);
  else p.push(`<ellipse cx="32" cy="34" rx="6.5" ry="5" fill="${muzzle}"/>`);
  p.push(bigEyes(26, 7.2, 3.3));
  if (L.brows) p.push(`<path d="M22 20 q3 -2 5 0 M37 20 q2 -2 5 0" stroke="${L.brows}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`);
  p.push(`<ellipse cx="32" cy="31.6" rx="2.7" ry="2" fill="${L.nose || EYE}"/><circle cx="31.2" cy="31" r=".7" fill="#fff" opacity=".7"/>`);
  p.push(L.tongue
    ? `<path d="M29 35 Q32 37.5 35 35" stroke="${EYE}" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M30.6 36 Q32 41 33.4 36 Z" fill="#F472B6"/>`
    : `<path d="M29 35 Q30.5 36.6 32 35 Q33.5 36.6 35 35" stroke="${EYE}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`);
  p.push(cheeks(31.5, 12));
  if (L.bow) p.push(`<path d="M40 12 l-5 -3 v6 Z M40 12 l5 -3 v6 Z" fill="${L.bow}"/><circle cx="40" cy="12" r="1.6" fill="${L.bow}"/>`);
  return wrap(defs, p, L);
}

// ---- Chibi people ------------------------------------------------------------------
// A tiny person: a big round head, huge shiny eyes, rosy cheeks and a small body.
// Look: skin, hair, hairStyle ('braids' | 'puff' | 'bob'), iris, top, crown?, lips.
function chibiSVG(id, L) {
  const gid = `ch${id.replace(/\W/g, '')}`;
  const skin = L.skin || '#8D5524';
  const hair = L.hair || '#1B1210';
  const top = L.top || '#DC2626';
  const iris = L.iris || '#5B3416';
  const shine = lighten(skin, 0.18);
  const defs = `<defs><radialGradient id="${gid}" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="${shine}"/><stop offset=".6" stop-color="${skin}"/><stop offset="1" stop-color="${skin}"/></radialGradient></defs>`;
  const S = `url(#${gid})`;
  const p = [];
  const braid = (x, y0, len, sway) => { let d = ''; for (let k = 0; k < len; k += 3.2) d += `<ellipse cx="${(x + Math.sin(k / 6) * sway).toFixed(1)}" cy="${(y0 + k).toFixed(1)}" rx="1.9" ry="2.1" fill="${hair}"/>`; return d; };
  if (L.hairStyle === 'braids') {
    // Long braids fall behind the shoulders on both sides
    for (const [x, len, sw] of [[12, 40, 1], [15, 44, -1], [18, 40, 1], [46, 40, -1], [49, 44, 1], [52, 40, -1]]) p.push(braid(x, 22, len, sw));
  }
  // Body
  p.push(`<path d="M20 64 Q20 48 32 47 Q44 48 44 64 Z" fill="${top}"/><path d="M27 48 Q32 52 37 48" stroke="${lighten(top, 0.25)}" stroke-width="1.4" fill="none"/>`);
  p.push(`<ellipse cx="19" cy="57" rx="3.4" ry="5" fill="${top}" transform="rotate(14 19 57)"/><ellipse cx="45" cy="57" rx="3.4" ry="5" fill="${top}" transform="rotate(-14 45 57)"/><circle cx="18" cy="61.5" r="2.6" fill="${S}"/><circle cx="46" cy="61.5" r="2.6" fill="${S}"/>`);
  p.push(`<rect x="29" y="42" width="6" height="6" rx="2" fill="${skin}"/>`);
  // Head
  p.push(`<ellipse cx="12.5" cy="28" rx="3" ry="3.8" fill="${skin}"/><ellipse cx="51.5" cy="28" rx="3" ry="3.8" fill="${skin}"/>`);
  p.push(`<ellipse cx="32" cy="26" rx="20" ry="19" fill="${S}"/>`);
  // Hair on top (with a middle part for braids)
  if (L.hairStyle === 'braids') {
    p.push(`<path d="M12 27 Q11 6 32 5 Q53 6 52 27 Q50 15 44 13 Q38 11 33 12 L32 9 L31 12 Q26 11 20 13 Q14 16 12 27 Z" fill="${hair}"/>`);
    p.push(`<path d="M32 6 V12" stroke="${lighten(skin, 0.1)}" stroke-width="1" opacity=".8"/>`);
    p.push([16, 21, 26, 38, 43, 48].map((x) => `<path d="M${x} ${x < 32 ? 15 : 15} q1 -4 ${x < 32 ? 3 : -3} -6" stroke="${lighten(hair, 0.18)}" stroke-width=".8" fill="none" opacity=".6"/>`).join(''));
  } else if (L.hairStyle === 'puff') {
    p.push(`${puffs(32, 8, 9, 10, 6, hair)}<circle cx="32" cy="8" r="10" fill="${hair}"/><path d="M12 26 Q12 10 32 11 Q52 10 52 26 Q48 17 32 16 Q16 17 12 26 Z" fill="${hair}"/>`);
  } else {
    p.push(`<path d="M11 32 Q8 6 32 5 Q56 6 53 32 Q50 18 32 16 Q14 18 11 32 Z" fill="${hair}"/>`);
  }
  if (L.crown) p.push(`<path d="M22 9 L24 3 L28 7 L32 1 L36 7 L40 3 L42 9 Q32 6 22 9 Z" fill="#FBBF24" stroke="#B45309" stroke-width=".6"/><circle cx="32" cy="3.5" r="1.2" fill="#F472B6"/><circle cx="24" cy="5" r=".9" fill="#60A5FA"/><circle cx="40" cy="5" r=".9" fill="#60A5FA"/>`);
  // Face: huge shiny eyes with lashes, blush and a happy little smile
  for (const x of [24, 40]) {
    p.push(`<ellipse cx="${x}" cy="29" rx="4.6" ry="5.6" fill="#fff"/><ellipse cx="${x}" cy="29.6" rx="3.9" ry="4.9" fill="${iris}"/><ellipse cx="${x}" cy="30.4" rx="2.2" ry="2.8" fill="#1E1B3A"/>`);
    p.push(`<circle cx="${x - 1.6}" cy="27.2" r="1.5" fill="#fff"/><circle cx="${x + 1.5}" cy="31.8" r=".7" fill="#fff"/>`);
    p.push(`<path d="M${x - 5} 25.2 Q${x} 22.2 ${x + 5} 25.2" stroke="#1E1B3A" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M${x + (x < 32 ? -5 : 5)} 25.2 l${x < 32 ? -1.6 : 1.6} -1.4" stroke="#1E1B3A" stroke-width="1.1" stroke-linecap="round"/>`);
  }
  p.push(`<ellipse cx="17.5" cy="35" rx="3.4" ry="2" fill="#FB7185" opacity=".45"/><ellipse cx="46.5" cy="35" rx="3.4" ry="2" fill="#FB7185" opacity=".45"/>`);
  p.push(`<path d="M28.5 36 Q32 40 35.5 36 Q32 37.4 28.5 36 Z" fill="${L.lips || '#7F1D1D'}"/>`);
  return wrap(defs, p, L);
}
