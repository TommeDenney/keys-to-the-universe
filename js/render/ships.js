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
  'ship-gold': `
    <path class="flame" d="M26 46 Q32 66 38 46 Z" fill="#FDE68A"/>
    <path d="M32 4 C44 14 46 30 42 44 L22 44 C18 30 20 14 32 4 Z" fill="url(#gold)"/>
    <path d="M22 44 L12 54 L15 36 Z M42 44 L52 54 L49 36 Z" fill="#B45309"/>
    <circle cx="32" cy="22" r="6" fill="#FFFBEB" stroke="#92400E" stroke-width="2"/>
    <path class="glow" d="M32 0 L33.5 4 L37 4 L34 6.5 L35 10 L32 8 L29 10 L30 6.5 L27 4 L30.5 4 Z" fill="#FFF7D6"/>
    <defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FDE68A"/><stop offset=".5" stop-color="#F59E0B"/><stop offset="1" stop-color="#B45309"/></linearGradient></defs>`,
};

export function shipSVG(id = 'ship-classic') {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><g class="ship-body">${SHIPS[id] || SHIPS['ship-classic']}</g></svg>`;
}
