import { rewardLook } from '../data/rewards.js';
// Spaceship designs (SVG). The `.flame` / `.glow` parts animate via CSS.

const SHIPS = {
  'ship-classic': `
    <path class="flame" d="M26 46 Q32 64 38 46 Z"/>
    <path d="M32 4 C44 14 46 30 42 44 L22 44 C18 30 20 14 32 4 Z" fill="#F5F4FB"/>
    <path d="M22 44 L14 52 L16 38 Z M42 44 L50 52 L48 38 Z" fill="#F04461"/>
    <circle cx="32" cy="22" r="6" fill="#3D7BFF" stroke="#1E1B3A" stroke-width="2"/>
    <path d="M32 4 C38 9 41 14 42 18 L22 18 C23 14 26 9 32 4 Z" fill="#F04461"/>`,
  'ship-ufo': `
    <ellipse class="glow" cx="32" cy="50" rx="14" ry="4" fill="#7CF7FF" opacity=".6"/>
    <ellipse cx="32" cy="36" rx="26" ry="9" fill="#A5B4FC"/>
    <ellipse cx="32" cy="34" rx="26" ry="6" fill="#C7D2FE"/>
    <path d="M18 32 Q32 8 46 32 Z" fill="#7CF7FF" opacity=".75" stroke="#E0F2FE" stroke-width="1.5"/>
    <circle class="blink" cx="14" cy="38" r="2.2" fill="#FDE047"/><circle class="blink b2" cx="32" cy="42" r="2.2" fill="#F472B6"/><circle class="blink" cx="50" cy="38" r="2.2" fill="#4ADE80"/>`,
  'ship-comet': `
    <path class="flame" d="M22 40 Q32 70 42 40 Z" fill="#FFB547"/>
    <path class="flame f2" d="M26 42 Q32 60 38 42 Z" fill="#FFF3B0"/>
    <circle cx="32" cy="30" r="13" fill="#FB923C"/>
    <circle cx="32" cy="30" r="9" fill="#FDBA74"/>
    <circle cx="28" cy="26" r="3" fill="#FFF7ED"/>`,
  'ship-piano': `
    <path class="flame" d="M26 46 Q32 64 38 46 Z"/>
    <path d="M32 4 C44 14 46 30 42 44 L22 44 C18 30 20 14 32 4 Z" fill="#1E1B3A"/>
    <rect x="25" y="24" width="14" height="16" rx="2" fill="#F5F4FB"/>
    <path d="M29 24v16M32 24v16M35 24v16" stroke="#C9C6DE" stroke-width="1"/>
    <rect x="28" y="24" width="2" height="9" fill="#1E1B3A"/><rect x="34" y="24" width="2" height="9" fill="#1E1B3A"/>
    <path d="M22 44 L14 52 L16 38 Z M42 44 L50 52 L48 38 Z" fill="#FFC43D"/>
    <circle cx="32" cy="15" r="4" fill="#FFC43D"/>`,
  'ship-fighter': `
    <path class="flame" d="M20 48 Q23 62 26 48 Z" fill="#60A5FA"/><path class="flame f2" d="M38 48 Q41 62 44 48 Z" fill="#60A5FA"/>
    <path d="M32 2 L40 30 L58 44 L40 44 L38 48 L26 48 L24 44 L6 44 L24 30 Z" fill="#E2E8F0"/>
    <path d="M32 2 L36 26 L28 26 Z" fill="#3B82F6"/>
    <path d="M6 44 L24 30 L24 44 Z M58 44 L40 30 L40 44 Z" fill="#94A3B8"/>
    <circle cx="32" cy="30" r="4" fill="#38BDF8" stroke="#0F172A" stroke-width="1.5"/>`,
  'ship-seed': `
    <path class="flame" d="M27 46 Q32 62 37 46 Z" fill="#86EFAC"/>
    <path d="M32 4 C46 16 46 34 40 46 L24 46 C18 34 18 16 32 4 Z" fill="#16A34A"/>
    <path d="M32 8 C40 18 40 32 36 44 L28 44 C24 32 24 18 32 8 Z" fill="#4ADE80"/>
    <path d="M24 40 C14 40 10 32 12 26 C18 30 22 34 24 40 Z M40 40 C50 40 54 32 52 26 C46 30 42 34 40 40 Z" fill="#22C55E"/>
    <circle cx="32" cy="20" r="5" fill="#F9A8D4"/><circle cx="32" cy="20" r="2" fill="#FDE68A"/>
    <circle class="glow" cx="26" cy="32" r="2" fill="#F9A8D4"/><circle class="glow" cx="38" cy="30" r="2" fill="#FDE68A"/>`,
  'ship-whale': `
    <path class="glow" d="M10 44 Q32 54 54 44" stroke="#93C5FD" stroke-width="2" fill="none" opacity=".6"/>
    <path d="M6 32 C6 20 22 14 34 16 C46 18 54 26 54 34 C54 42 44 46 32 46 C18 46 6 42 6 32 Z" fill="#3B82F6"/>
    <path d="M10 36 C20 42 40 44 52 36 C48 44 40 46 32 46 C20 46 12 42 10 36 Z" fill="#BFDBFE"/>
    <path d="M54 30 L62 22 L60 32 L63 40 L54 36 Z" fill="#2563EB"/>
    <circle cx="16" cy="28" r="2" fill="#0F172A"/><circle cx="16.6" cy="27.4" r=".6" fill="#fff"/>
    <path class="blink" d="M26 14 Q24 6 20 4 M26 14 Q28 6 32 4" stroke="#BFDBFE" stroke-width="1.5" fill="none"/>`,
  'ship-guitar': `
    <path class="flame" d="M27 56 Q32 66 37 56 Z"/>
    <ellipse cx="32" cy="44" rx="12" ry="11" fill="#F472B6"/>
    <ellipse cx="32" cy="32" rx="9" ry="8" fill="#F472B6"/>
    <circle cx="32" cy="40" r="4" fill="#1E1B3A"/>
    <rect x="30" y="4" width="4" height="30" rx="1.5" fill="#7C3AED"/>
    <rect x="28" y="2" width="8" height="6" rx="2" fill="#A78BFA"/>
    <path d="M31 8v42M33 8v42" stroke="#FDE68A" stroke-width=".5"/>
    <circle class="glow" cx="26" cy="46" r="1" fill="#fff"/><circle class="glow" cx="38" cy="36" r="1" fill="#fff"/>`,
  'ship-bubble': `
    <circle cx="32" cy="32" r="22" fill="rgba(186,230,253,.25)" stroke="#E0F2FE" stroke-width="1.5"/>
    <path d="M18 22 Q24 14 34 14" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
    <circle class="glow" cx="32" cy="32" r="22" fill="none" stroke="#F0ABFC" stroke-width="1" opacity=".6"/>
    <circle cx="32" cy="36" r="6" fill="#FDE68A"/><circle cx="30" cy="35" r="1" fill="#1E1B3A"/><circle cx="34" cy="35" r="1" fill="#1E1B3A"/>`,
  'ship-gold': `
    <path class="flame" d="M26 46 Q32 66 38 46 Z" fill="#FDE68A"/>
    <path d="M32 4 C44 14 46 30 42 44 L22 44 C18 30 20 14 32 4 Z" fill="url(#gold)"/>
    <path d="M22 44 L12 54 L15 36 Z M42 44 L52 54 L49 36 Z" fill="#B45309"/>
    <circle cx="32" cy="22" r="6" fill="#FFFBEB" stroke="#92400E" stroke-width="2"/>
    <path class="glow" d="M32 0 L33.5 4 L37 4 L34 6.5 L35 10 L32 8 L29 10 L30 6.5 L27 4 L30.5 4 Z" fill="#FFF7D6"/>
    <defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FDE68A"/><stop offset=".5" stop-color="#F59E0B"/><stop offset="1" stop-color="#B45309"/></linearGradient></defs>`,
};

export function shipSVG(id = 'ship-classic') {
  const look = !SHIPS[id] && rewardLook(id);
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><g class="ship-body">${look ? buildShip(id, look) : SHIPS[id] || SHIPS['ship-classic']}</g></svg>`;
}

// ---- Achievement ships, drawn from a few parameters (js/data/rewards.js) ---------------
function buildShip(id, L) {
  const g = `g${id.replace(/\W/g, '')}`;
  const grad = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${L.hull2}"/><stop offset="1" stop-color="${L.hull}"/></linearGradient></defs>`;
  const flame = (x = 32, w = 6, len = 16, y = 46) => `<path class="flame" d="M${x - w} ${y} Q${x} ${y + len} ${x + w} ${y} Z" fill="${L.flame}"/>`;
  const deco = {
    crown: `<path d="M22 20 L26 12 L29 18 L32 8 L35 18 L38 12 L42 20 Z" fill="#FBBF24" stroke="#92400E" stroke-width="1"/><circle class="glow" cx="32" cy="13" r="1.6" fill="#F472B6"/>`,
    star: `<path class="glow" d="M32 0 L34.5 8 L42 8 L36 12.5 L38.5 20 L32 15.5 L25.5 20 L28 12.5 L22 8 L29.5 8 Z" fill="${L.cockpit}"/>`,
    spots: `<circle cx="26" cy="26" r="3" fill="${L.hull2}"/><circle cx="38" cy="34" r="4" fill="${L.hull2}"/><circle cx="30" cy="38" r="2" fill="${L.wing}"/>`,
    seams: `<path class="glow" d="M32 10 L30 22 L34 30 L31 42 M24 30 L30 32 M40 28 L34 30" stroke="${L.cockpit}" stroke-width="1.2" fill="none"/>`,
    petals: `<g class="glow" fill="#FBCFE8"><circle cx="14" cy="18" r="2"/><circle cx="52" cy="22" r="1.6"/><circle cx="10" cy="40" r="1.4"/></g>`,
    pumpkin: `<path d="M24 22 Q22 30 24 40 M40 22 Q42 30 40 40 M32 12 V48" stroke="#C2410C" stroke-width="1.2" fill="none" opacity=".7"/><path class="glow" d="M24 26 L28 29 L24 31 Z M40 26 L36 29 L40 31 Z" fill="#FDE047"/><path class="glow" d="M24 36 Q32 42 40 36 L37 37 L35 35 L33 37 L31 35 L29 37 L27 35 Z" fill="#FDE047"/><path d="M31 11 Q33 6 37 6" stroke="#166534" stroke-width="2.5" fill="none"/>`,
    pipes: `<g fill="#FDE68A"><rect x="24" y="12" width="3" height="14" rx="1.5"/><rect x="28.5" y="8" width="3" height="18" rx="1.5"/><rect x="33" y="10" width="3" height="16" rx="1.5"/><rect x="37.5" y="14" width="3" height="12" rx="1.5"/></g><g fill="#fff"><rect x="23" y="34" width="3" height="7"/><rect x="27" y="34" width="3" height="7"/><rect x="31" y="34" width="3" height="7"/><rect x="35" y="34" width="3" height="7"/><rect x="39" y="34" width="3" height="7"/></g>`,
  }[L.deco] || '';
  const cockpit = (cy = 24, r = 5) => `<circle cx="32" cy="${cy}" r="${r}" fill="${L.cockpit}" stroke="#0F172A" stroke-opacity=".35" stroke-width="1.5"/><circle cx="${32 - r / 3}" cy="${cy - r / 3}" r="${r / 3}" fill="#fff" opacity=".7"/>`;
  switch (L.shape) {
    case 'bird': return `${grad}${flame(32, 6, 18, 44)}
      <path d="M32 6 C38 14 38 24 36 32 L44 26 C50 22 58 22 60 18 C58 30 50 38 40 42 L36 46 L28 46 L24 42 C14 38 6 30 4 18 C6 22 14 22 20 26 L28 32 C26 24 26 14 32 6 Z" fill="url(#${g})"/>
      <path d="M32 10 C35 16 35 24 34 30 L30 30 C29 24 29 16 32 10 Z" fill="${L.hull2}"/>
      <path d="M40 40 C48 36 54 30 56 24 M24 40 C16 36 10 30 8 24" stroke="${L.flame}" stroke-width="2" fill="none"/>
      <circle class="glow" cx="32" cy="18" r="2" fill="${L.cockpit}"/>`;
    case 'baton': return `${flame(32, 3, 14, 48)}
      <path d="M30 14 L34 14 L35 48 L29 48 Z" fill="${L.hull}" stroke="#CBD5E1" stroke-width="1"/>
      <path d="M28 40 L36 40 L37 50 L27 50 Z" fill="${L.hull2}"/>${deco}
      <path class="glow" d="M14 30 Q20 26 22 32 M50 30 Q44 26 42 32 M16 38 l2 -6 M48 38 l-2 -6" stroke="${L.wing}" stroke-width="1.6" fill="none"/>`;
    case 'manta': return `${grad}${flame(26, 3, 12, 42)}${flame(38, 3, 12, 42)}
      <path d="M32 8 C36 8 40 16 42 22 C50 24 58 30 60 38 C52 36 46 38 42 42 L22 42 C18 38 12 36 4 38 C6 30 14 24 22 22 C24 16 28 8 32 8 Z" fill="url(#${g})"/>
      <path d="M22 22 C26 26 38 26 42 22" stroke="${L.hull2}" stroke-width="2" fill="none" class="glow"/>
      <path d="M30 42 Q32 56 34 42" fill="${L.wing}"/>${cockpit(18, 4)}`;
    case 'orb': return `${grad}${flame(32, 5, 14, 48)}
      <path d="M20 44 L14 54 L24 48 Z M44 44 L50 54 L40 48 Z" fill="${L.wing}"/>
      <ellipse cx="32" cy="30" rx="16" ry="19" fill="url(#${g})" stroke="${L.wing}" stroke-width="1.5"/>
      <path d="M17 24 H47 M16 32 H48 M18 40 H46" stroke="${L.wing}" stroke-opacity=".45" stroke-width="1"/>${deco}${cockpit(22, 4)}
      <rect x="28" y="8" width="8" height="4" rx="1.5" fill="${L.wing}"/>`;
    case 'sail': return `${flame(32, 4, 14, 48)}
      <path d="M32 4 L33 48 L31 48 Z" fill="#CBD5E1"/>
      <path d="M33 6 C48 14 54 30 50 42 L34 42 Z" fill="${L.hull2}" opacity=".9" class="glow"/>
      <path d="M31 10 C18 18 12 30 16 42 L30 42 Z" fill="${L.wing}" opacity=".85" class="glow"/>
      <path d="M20 42 L44 42 L40 50 L24 50 Z" fill="${L.hull}"/>${cockpit(46, 2.5)}`;
    case 'arrow': return `${grad}${flame(27, 3, 16, 46)}${flame(37, 3, 16, 46)}
      <path d="M32 2 L40 26 L60 46 L38 42 L36 48 L28 48 L26 42 L4 46 L24 26 Z" fill="url(#${g})"/>
      <path d="M4 46 L24 26 L26 42 Z M60 46 L40 26 L38 42 Z" fill="${L.wing}"/>${deco}${cockpit(26, 3.5)}`;
    case 'glider': return `${grad}${flame(32, 4, 14, 44)}
      <path d="M32 6 C36 12 37 24 36 44 L28 44 C27 24 28 12 32 6 Z" fill="url(#${g})"/>
      <path d="M30 22 C20 14 8 16 4 24 C14 24 22 28 30 34 Z M34 22 C44 14 56 16 60 24 C50 24 42 28 34 34 Z" fill="${L.wing}" opacity=".9"/>
      <path d="M30 36 C22 36 14 40 12 46 C20 44 26 44 30 42 Z M34 36 C42 36 50 40 52 46 C44 44 38 44 34 42 Z" fill="${L.hull2}"/>${deco}${cockpit(18, 3.5)}`;
    case 'sleigh': return `${flame(20, 3, 10, 46)}${flame(44, 3, 10, 46)}
      <path d="M12 46 Q10 52 16 52 L50 52 Q56 52 54 46" stroke="${L.hull2}" stroke-width="2.5" fill="none"/>
      <path d="M14 44 L14 26 Q14 18 22 18 L24 18 L24 30 L46 30 Q52 30 52 36 L52 44 Z" fill="${L.hull}"/>
      <path d="M14 26 Q14 18 22 18 L24 18" stroke="${L.hull2}" stroke-width="2.5" fill="none"/>
      <path d="M24 30 L46 30 Q52 30 52 36" stroke="${L.hull2}" stroke-width="2" fill="none"/>
      <rect x="28" y="20" width="14" height="10" rx="3" fill="#16A34A"/><path d="M35 20 V30 M28 25 H42" stroke="${L.hull2}" stroke-width="1.6"/>
      <path class="glow" d="M35 20 Q31 15 33 14 Q35 15 35 20 Q39 15 37 14 Q35 15 35 20" stroke="${L.hull2}" stroke-width="1.2" fill="none"/>
      <circle class="glow" cx="18" cy="38" r="1.6" fill="${L.cockpit}"/><circle class="glow" cx="48" cy="40" r="1.6" fill="${L.cockpit}"/>`;
    case 'train': return `${flame(26, 3, 12, 50)}${flame(38, 3, 12, 50)}
      <rect x="18" y="16" width="28" height="34" rx="6" fill="${L.hull}"/>
      <path d="M18 22 Q32 2 46 22 Z" fill="${L.hull}"/>
      <rect x="22" y="22" width="20" height="9" rx="3" fill="${L.cockpit}"/>
      <path d="M18 36 H46 M18 42 H46" stroke="${L.hull2}" stroke-width="2.5"/>
      <rect x="28" y="4" width="8" height="8" rx="2" fill="${L.wing}"/>
      <circle class="glow" cx="32" cy="8" r="2" fill="${L.hull2}"/>
      <path d="M14 46 L18 40 L18 50 Z M50 46 L46 40 L46 50 Z" fill="${L.hull2}"/>`;
    default: return `${grad}${flame(32, 6, 16, 46)}
      <path d="M32 6 C44 16 46 32 42 46 L22 46 C18 32 20 16 32 6 Z" fill="url(#${g})"/>
      <path d="M22 46 L10 52 L16 34 Z M42 46 L54 52 L48 34 Z" fill="${L.wing}"/>${cockpit(30, 5)}${deco}`;
  }
}
