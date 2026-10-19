// Drawn water friends for the fish bowls, in the same chibi style as the land
// pets: round bodies, big shiny eyes, rosy cheeks. 64×64 viewBox.

const EYE = '#1E1B3A';
const eye = (x, y, r = 3.2) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="${EYE}"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.42}" fill="#fff"/><circle cx="${x + r * 0.3}" cy="${y + r * 0.4}" r="${r * 0.16}" fill="#fff"/>`;
const blush = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="2.8" ry="1.7" fill="#FB7185" opacity=".45"/>`;
const smile = (x, y, w = 3) => `<path d="M${x - w} ${y} Q${x} ${y + w * 0.9} ${x + w} ${y}" stroke="${EYE}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
const shine = (id, c1, c2) => `<radialGradient id="${id}" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>`;

const SPECIES = {
  goldfish: (g) => `<defs>${shine(g, '#FFD08A', '#F97316')}</defs>
    <path d="M14 32 L4 22 Q8 32 4 42 Z" fill="#FB923C"/><path d="M28 21 Q34 12 42 20 Z" fill="#FDBA74"/>
    <ellipse cx="32" cy="33" rx="16" ry="12" fill="url(#${g})"/><path d="M30 40 Q34 46 38 41" fill="#FDBA74"/>
    ${eye(40, 30)}${blush(42, 37)}${smile(46, 35, 2.2)}`,
  tropical: (g) => `<defs>${shine(g, '#FEF08A', '#FACC15')}</defs>
    <path d="M14 32 L5 24 L8 32 L5 40 Z" fill="#2563EB"/><path d="M26 22 L34 10 L40 22 Z" fill="#2563EB"/><path d="M28 43 L33 52 L38 43 Z" fill="#2563EB"/>
    <ellipse cx="32" cy="32" rx="16" ry="12" fill="url(#${g})"/>
    <path d="M24 21 Q22 32 24 43" stroke="#2563EB" stroke-width="3.5" fill="none"/><path d="M32 20 Q30 32 32 44" stroke="#FFFFFF" stroke-width="3" fill="none"/>
    ${eye(41, 30)}${blush(43, 37)}${smile(46, 35, 2)}`,
  puffer: (g) => `<defs>${shine(g, '#FEF3C7', '#FBBF24')}</defs>
    ${[...Array(12)].map((_, i) => { const a = (i / 12) * Math.PI * 2; return `<path d="M${32 + 14 * Math.cos(a)} ${32 + 14 * Math.sin(a)} L${32 + 19 * Math.cos(a + 0.12)} ${32 + 19 * Math.sin(a + 0.12)} L${32 + 14 * Math.cos(a + 0.24)} ${32 + 14 * Math.sin(a + 0.24)} Z" fill="#D97706"/>`; }).join('')}
    <circle cx="32" cy="32" r="15" fill="url(#${g})"/><ellipse cx="32" cy="38" rx="9" ry="6" fill="#FFFBEB"/>
    <path d="M17 34 L11 30 L12 38 Z" fill="#F59E0B"/>${eye(26, 28, 3.4)}${eye(38, 28, 3.4)}<circle cx="32" cy="37" r="2.2" fill="#9A3412"/>${blush(22, 34)}${blush(42, 34)}`,
  crab: (g) => `<defs>${shine(g, '#FCA5A5', '#DC2626')}</defs>
    <path d="M18 40 L8 46 M20 44 L12 52 M46 40 L56 46 M44 44 L52 52" stroke="#DC2626" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M20 30 Q12 26 12 16 M44 30 Q52 26 52 16" stroke="#DC2626" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M7 16 Q12 8 18 14 Q14 14 13 18 Z M57 16 Q52 8 46 14 Q50 14 51 18 Z" fill="#EF4444"/>
    <ellipse cx="32" cy="37" rx="16" ry="11" fill="url(#${g})"/>
    <path d="M27 28 V22 M37 28 V22" stroke="#DC2626" stroke-width="2"/>${eye(27, 21, 2.8)}${eye(37, 21, 2.8)}${blush(22, 39)}${blush(42, 39)}${smile(32, 38, 3)}`,
  jelly: (g) => `<defs>${shine(g, '#FBCFE8', '#E879F9')}</defs>
    ${[20, 26, 32, 38, 44].map((x, i) => `<path d="M${x} 34 Q${x + (i % 2 ? 4 : -4)} 44 ${x} 50 Q${x + (i % 2 ? -3 : 3)} 55 ${x} 60" stroke="#F0ABFC" stroke-width="2.2" fill="none" opacity=".85" stroke-linecap="round"/>`).join('')}
    <path d="M14 34 Q14 14 32 14 Q50 14 50 34 Q46 37 41 34 Q37 37 32 34 Q27 37 23 34 Q18 37 14 34 Z" fill="url(#${g})" opacity=".95"/>
    <path d="M20 22 Q24 17 30 17" stroke="#fff" stroke-width="2" opacity=".7" fill="none" stroke-linecap="round"/>${eye(26, 27, 2.8)}${eye(38, 27, 2.8)}${blush(22, 31)}${blush(42, 31)}${smile(32, 30, 2.2)}`,
  octopus: (g) => `<defs>${shine(g, '#DDD6FE', '#8B5CF6')}</defs>
    ${[[14, 1], [21, 1], [28, 1], [36, -1], [43, -1], [50, -1]].map(([x, d]) => `<path d="M${x + 4 * d * -1 + (d > 0 ? 6 : -6)} 38 Q${x} 48 ${x + d * 4} 54 Q${x + d * 8} 58 ${x + d * 5} 50" stroke="#8B5CF6" stroke-width="4.2" fill="none" stroke-linecap="round"/>`).join('')}
    <ellipse cx="32" cy="30" rx="17" ry="16" fill="url(#${g})"/>
    <circle cx="22" cy="20" r="2" fill="#fff" opacity=".5"/><circle cx="40" cy="18" r="1.4" fill="#fff" opacity=".4"/>${eye(26, 31)}${eye(38, 31)}${blush(21, 37)}${blush(43, 37)}${smile(32, 37, 2.4)}`,
  shrimp: (g) => `<defs>${shine(g, '#FECDD3', '#FB7185')}</defs>
    <path d="M46 18 Q60 10 58 4 M44 20 Q54 18 60 14" stroke="#FB7185" stroke-width="1.2" fill="none"/>
    <path d="M14 46 L6 42 L8 50 L4 56 L14 52 Z" fill="#FDA4AF"/>
    ${[[16, 46, 6], [21, 38, 7], [28, 31, 8], [37, 26, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})" stroke="#F43F5E" stroke-width=".6"/>`).join('')}
    <ellipse cx="44" cy="25" rx="8" ry="7" fill="url(#${g})"/><path d="M26 44 l-2 6 M32 40 l-1 6 M38 34 l1 6" stroke="#F43F5E" stroke-width="1.6" stroke-linecap="round"/>
    ${eye(46, 23, 2.6)}${blush(47, 29)}`,
  dolphin: (g) => `<defs>${shine(g, '#BAE6FD', '#38BDF8')}</defs>
    <path d="M10 40 L2 32 Q8 40 4 48 Z" fill="#0EA5E9"/><path d="M28 22 Q32 10 38 20 Z" fill="#0EA5E9"/>
    <path d="M10 40 Q14 22 34 22 Q48 22 52 32 L60 34 Q58 38 52 38 Q44 48 28 46 Q16 46 10 40 Z" fill="url(#${g})"/>
    <path d="M18 42 Q30 48 46 40" stroke="#E0F2FE" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
    ${eye(44, 30, 2.8)}${blush(46, 35)}<path d="M52 37 Q55 39 58 36" stroke="${EYE}" stroke-width="1.2" fill="none"/>`,
  shark: (g) => `<defs>${shine(g, '#CBD5E1', '#64748B')}</defs>
    <path d="M10 36 L2 26 Q6 36 3 46 Z" fill="#475569"/><path d="M28 22 Q30 6 40 22 Z" fill="#475569"/>
    <path d="M10 36 Q16 22 34 22 Q52 22 60 34 Q52 46 34 46 Q16 46 10 36 Z" fill="url(#${g})"/>
    <path d="M18 40 Q34 48 54 38 Q40 44 18 40 Z" fill="#F1F5F9"/>
    <path d="M30 29 v6 M33 28 v7 M36 29 v6" stroke="#475569" stroke-width="1" opacity=".6"/>
    ${eye(46, 30, 2.8)}${blush(48, 35)}<path d="M48 38 Q53 41 58 37" stroke="${EYE}" stroke-width="1.2" fill="none"/><path d="M50 39.5 l1 1.6 l1 -1.6 M53 39.8 l1 1.6 l1 -1.6" fill="#fff"/>`,
  whale: (g) => `<defs>${shine(g, '#93C5FD', '#2563EB')}</defs>
    <path d="M30 14 Q28 6 24 6 M30 14 Q32 6 36 6 M30 14 V8" stroke="#BFDBFE" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M8 34 L2 24 Q6 30 12 30 Z M8 34 L2 44 Q6 38 12 38 Z" fill="#1D4ED8"/>
    <path d="M8 34 Q10 16 32 16 Q56 16 58 36 Q56 50 34 50 Q14 50 8 34 Z" fill="url(#${g})"/>
    <path d="M20 44 Q36 52 54 40 Q48 50 34 50 Q24 50 20 44 Z" fill="#DBEAFE"/>${[26, 32, 38, 44].map((x) => `<path d="M${x} 44 v4" stroke="#93C5FD" stroke-width="1"/>`).join('')}
    ${eye(44, 31, 3)}${blush(46, 37)}${smile(50, 38, 2.4)}`,
};

// The original emoji looks map onto drawn species, so saved pets keep working.
const FROM_EMOJI = { '\u{1F41F}': 'goldfish', '\u{1F420}': 'tropical', '\u{1F421}': 'puffer', '\u{1F980}': 'crab', '\u{1FABC}': 'jelly', '\u{1F419}': 'octopus', '\u{1F990}': 'shrimp', '\u{1F42C}': 'dolphin', '\u{1F988}': 'shark', '\u{1F433}': 'whale' };

export const aquaSpecies = (look) => (typeof look === 'string' ? FROM_EMOJI[look] : look && look.sp) || null;

export function aquaSVG(id, look) {
  const sp = aquaSpecies(look);
  const draw = SPECIES[sp];
  if (!draw) return '';
  return `<svg viewBox="0 0 64 64" class="aqua" aria-hidden="true">${draw(`aq${id.replace(/\W/g, '')}`)}</svg>`;
}
