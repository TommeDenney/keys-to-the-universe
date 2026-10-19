// Pets: companions that travel next to your ship. Land animals are drawn from
// recipes (js/render/critters.js), water friends sit in a little fish bowl, and
// space creatures are drawn here from a few parameters (js/data/rewards.js).

import { PETS } from '../data/rewards.js';
import { EVENT_ITEMS } from '../data/events.js';
import { critterSVG } from './critters.js';
import { aquaSVG } from './aqua.js';

export const petById = (id) => PETS.find((p) => p.id === id) || EVENT_ITEMS.find((p) => p.id === id && p.cat === 'pet') || null;

/** HTML for a pet (empty for none). */
export function petHTML(id) {
  const p = petById(id);
  if (!p || p.type === 'none') return '';
  if (p.type === 'land') return typeof p.look === 'string' ? `<span class="pet pet-land"><span class="pet-emoji">${p.look}</span></span>` : `<span class="pet pet-land pet-drawn">${critterSVG(p.id, p.look)}</span>`;
  if (p.type === 'water') { const art = aquaSVG(p.id, p.look); return `<span class="pet pet-water"><span class="bowl"><i class="water"></i><i class="bubble b1"></i><i class="bubble b2"></i>${art || `<span class="pet-emoji">${p.look}</span>`}</span></span>`; }
  return `<span class="pet pet-space">${creatureSVG(p.id, p.look)}</span>`;
}

function creatureSVG(id, L) {
  const gid = `c${id.replace(/\W/g, '')}`;
  const defs = `<defs><radialGradient id="${gid}" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="${L.body}"/><stop offset="1" stop-color="${L.body}"/></radialGradient></defs>`;
  const fill = `url(#${gid})`;
  const eyes = (cy, spread = 7, r = 3.6) => {
    const xs = L.eyes === 1 ? [32] : L.eyes === 3 ? [32 - spread, 32, 32 + spread] : [32 - spread / 1.4, 32 + spread / 1.4];
    return xs.map((x, i) => {
      const y = L.eyes === 3 && i === 1 ? cy - 4 : cy;
      const rr = L.eyes === 1 ? r * 1.7 : r;
      return `<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${rr * 1.15}" fill="#1E1B3A"/><circle cx="${x - rr / 3}" cy="${y - rr / 3}" r="${rr / 2.6}" fill="#fff"/>`;
    }).join('');
  };
  const mouth = (y) => `<path d="M29 ${y} Q32 ${y + 3} 35 ${y}" stroke="#1E1B3A" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  const cheeks = (y) => `<ellipse cx="22" cy="${y}" rx="3" ry="2" fill="#FB7185" opacity=".45"/><ellipse cx="42" cy="${y}" rx="3" ry="2" fill="#FB7185" opacity=".45"/>`;
  const ears = {
    pointy: `<path d="M18 26 L16 8 L28 20 Z M46 26 L48 8 L36 20 Z" fill="${L.body}"/><path d="M19 22 L18 12 L25 19 Z M45 22 L46 12 L39 19 Z" fill="${L.belly}"/>`,
    leaf: `<path d="M30 16 C24 6 14 6 12 10 C18 10 24 14 30 18 Z" fill="#4ADE80"/><path d="M34 16 C40 4 50 6 52 9 C46 10 40 14 34 18 Z" fill="#22C55E"/>`,
    crown: `<path d="M22 18 L24 8 L28 14 L32 6 L36 14 L40 8 L42 18 Z" fill="#FBBF24" stroke="#B45309" stroke-width="1"/>`,
    floppy: `<path d="M18 22 C8 22 6 36 12 40 C16 34 18 28 22 26 Z M46 22 C56 22 58 36 52 40 C48 34 46 28 42 26 Z" fill="${L.belly}" stroke="${L.body}" stroke-width="2"/>`,
  }[L.ears] || `<path d="M32 14 L32 6" stroke="${L.body}" stroke-width="2"/><circle cx="32" cy="5" r="2.5" fill="${L.glow}" class="glow"/>`;
  let body;
  switch (L.shape) {
    case 'blackhole': // a baby black hole: spinning disk, dark heart, two curious eyes
      return `<svg viewBox="0 0 64 64" aria-hidden="true" class="sp-blackhole" style="--glow:${L.glow}">
        <g class="bh-disk2"><ellipse cx="32" cy="34" rx="29" ry="9" fill="none" stroke="${L.body}" stroke-width="5" opacity=".9"/><ellipse cx="32" cy="34" rx="22" ry="6" fill="none" stroke="${L.belly}" stroke-width="2.5"/></g>
        <circle cx="32" cy="32" r="14" fill="#05030F"/><circle cx="32" cy="32" r="15.5" fill="none" stroke="${L.belly}" stroke-width="1.6" opacity=".9"/>
        <path d="M3 34 A29 9 0 0 0 61 34" fill="none" stroke="${L.body}" stroke-width="5"/>
        <ellipse cx="27" cy="31" rx="2.6" ry="3" fill="#fff"/><ellipse cx="37" cy="31" rx="2.6" ry="3" fill="#fff"/><path d="M29 37 Q32 39 35 37" stroke="#fff" stroke-width="1.4" fill="none"/></svg>`;
    case 'asteroid': // a rocky little buddy with its own pebble moon
      return `<svg viewBox="0 0 64 64" aria-hidden="true" class="sp-asteroid" style="--glow:${L.glow}">
        <path d="M14 30 C12 18 24 10 34 12 C46 10 54 20 52 32 C54 44 44 52 32 52 C20 54 12 42 14 30 Z" fill="${L.body}"/>
        <circle cx="22" cy="22" r="4" fill="${L.belly}" opacity=".5"/><circle cx="44" cy="40" r="5" fill="${L.belly}" opacity=".45"/><circle cx="40" cy="20" r="2.5" fill="${L.belly}" opacity=".5"/>
        ${eyes(31, 8, 3)}${mouth(38)}<g class="ast-orbit"><circle cx="58" cy="32" r="3" fill="${L.belly}"/></g></svg>`;
    case 'star': // a newborn star: soft points that twinkle
      return `<svg viewBox="0 0 64 64" aria-hidden="true" class="sp-star" style="--glow:${L.glow}">${defs}
        <circle cx="32" cy="32" r="24" fill="${L.glow}" opacity=".18" class="star-halo"/>
        <path d="M32 4 L39 23 L59 24 L43 36 L49 56 L32 44 L15 56 L21 36 L5 24 L25 23 Z" fill="${fill}" stroke="${L.body}" stroke-width="3" stroke-linejoin="round" class="star-body"/>
        ${eyes(31, 6, 2.6)}${cheeks(36)}${mouth(37)}</svg>`;
    case 'nebula': // a puff of nebula with sparkles inside
      return `<svg viewBox="0 0 64 64" aria-hidden="true" class="sp-nebula" style="--glow:${L.glow}">
        <g class="neb-puff"><circle cx="22" cy="34" r="13" fill="${L.body}" opacity=".85"/><circle cx="36" cy="26" r="15" fill="${L.belly}" opacity=".85"/><circle cx="44" cy="38" r="12" fill="${L.body}" opacity=".85"/><circle cx="32" cy="40" r="13" fill="${L.belly}" opacity=".7"/></g>
        <circle cx="18" cy="26" r="1.2" fill="#fff" class="glow"/><circle cx="48" cy="28" r="1" fill="#fff" class="glow"/><circle cx="40" cy="48" r="1.2" fill="#fff" class="glow"/>
        ${eyes(34, 7, 2.8)}${mouth(40)}</svg>`;
    case 'pulsar': // a tiny spinning pulsar with two light beams
      return `<svg viewBox="0 0 64 64" aria-hidden="true" class="sp-pulsar" style="--glow:${L.glow}">${defs}
        <g class="pulsar-beams"><path d="M32 32 L26 0 L38 0 Z M32 32 L26 64 L38 64 Z" fill="${L.belly}" opacity=".55"/></g>
        <circle cx="32" cy="32" r="13" fill="${fill}"/>${eyes(31, 5, 2.4)}${mouth(36)}</svg>`;
    case 'moonlet': // a sleepy little moon
      return `<svg viewBox="0 0 64 64" aria-hidden="true" class="sp-moonlet" style="--glow:${L.glow}">${defs}
        <circle cx="32" cy="32" r="20" fill="${fill}"/><circle cx="22" cy="24" r="4" fill="${L.belly}" opacity=".6"/><circle cx="42" cy="42" r="5" fill="${L.belly}" opacity=".5"/><circle cx="43" cy="24" r="2.5" fill="${L.belly}" opacity=".6"/>
        <path d="M23 32 Q27 35 31 32 M33 32 Q37 35 41 32" stroke="#1E1B3A" stroke-width="1.8" fill="none" stroke-linecap="round"/>${cheeks(37)}<text x="48" y="16" font-size="9" fill="#fff" opacity=".8" class="zz">z</text></svg>`;
    case 'bigbang': // super rare: a whole universe being born, over and over
      return `<svg viewBox="0 0 64 64" aria-hidden="true" class="sp-bigbang" style="--glow:${L.glow}">
        <g class="bb-wave"><circle cx="32" cy="32" r="26" fill="none" stroke="${L.body}" stroke-width="2"/><circle cx="32" cy="32" r="18" fill="none" stroke="${L.belly}" stroke-width="1.5"/></g>
        <g class="bb-burst">${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => `<circle cx="${32 + 22 * Math.cos(a * Math.PI / 180)}" cy="${32 + 22 * Math.sin(a * Math.PI / 180)}" r="${1.2 + (i % 3) * 0.6}" fill="${['#FDE68A', '#F472B6', '#60A5FA', '#A78BFA'][i % 4]}"/>`).join('')}</g>
        <g class="bb-galaxy"><path d="M32 32 m-12 0 a12 5 0 1 0 24 0 a12 5 0 1 0 -24 0" fill="none" stroke="${L.belly}" stroke-width="1.2" opacity=".8"/></g>
        <circle cx="32" cy="32" r="6" fill="#fff" class="bb-core"/>
        <g class="bb-face"><circle cx="30" cy="31" r="1" fill="#1E1B3A"/><circle cx="34" cy="31" r="1" fill="#1E1B3A"/><path d="M30.5 33.5 Q32 34.6 33.5 33.5" stroke="#1E1B3A" stroke-width=".8" fill="none"/></g></svg>`;
    case 'squid':
      body = `${[14, 22, 30, 38, 46].map((x, i) => `<path d="M${x} 40 q${i % 2 ? 3 : -3} 8 0 14 q${i % 2 ? -3 : 3} 4 ${i % 2 ? 2 : -2} 6" stroke="${L.body}" stroke-width="4.5" fill="none" stroke-linecap="round" class="tent t${i}"/>`).join('')}
        <path d="M12 40 C10 20 20 8 32 8 C44 8 54 20 52 40 Z" fill="${fill}"/>${eyes(26, 9)}${mouth(34)}`;
      break;
    case 'bug':
      body = `<path d="M20 44 l-6 8 M44 44 l6 8 M18 36 l-8 2 M46 36 l8 2 M22 28 l-6 -4 M42 28 l6 -4" stroke="#1E1B3A" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="32" cy="36" rx="16" ry="15" fill="${fill}"/><path d="M32 22 V50" stroke="#1E1B3A" stroke-opacity=".25" stroke-width="1.5"/>
        <circle cx="25" cy="40" r="2.5" fill="${L.belly}" opacity=".7"/><circle cx="39" cy="42" r="2" fill="${L.belly}" opacity=".7"/>
        <ellipse cx="32" cy="20" rx="11" ry="9" fill="${L.body}"/>${eyes(19, 8, 2.8)}
        <path d="M27 12 Q24 4 20 4 M37 12 Q40 4 44 4" stroke="${L.body}" stroke-width="1.6" fill="none"/><circle cx="20" cy="4" r="2" fill="${L.glow}"/><circle cx="44" cy="4" r="2" fill="${L.glow}"/>`;
      break;
    case 'twins':
      body = `<circle cx="22" cy="36" r="13" fill="${fill}"/><circle cx="42" cy="34" r="13" fill="${L.belly}"/>
        <ellipse cx="18" cy="34" rx="2.6" ry="3" fill="#1E1B3A"/><ellipse cx="26" cy="34" rx="2.6" ry="3" fill="#1E1B3A"/>
        <ellipse cx="38" cy="32" rx="2.6" ry="3" fill="#1E1B3A"/><ellipse cx="46" cy="32" rx="2.6" ry="3" fill="#1E1B3A"/>
        <path d="M19 41 Q22 44 25 41 M39 39 Q42 42 45 39" stroke="#1E1B3A" stroke-width="1.5" fill="none"/>
        <path d="M22 23 L22 16 M42 21 L42 14" stroke="${L.body}" stroke-width="2"/><circle cx="22" cy="15" r="2.5" fill="${L.glow}" class="glow"/><circle cx="42" cy="13" r="2.5" fill="${L.glow}" class="glow"/>`;
      break;
    case 'moth':
      body = `<path d="M30 30 C18 12 4 14 6 28 C8 38 20 38 30 34 Z M34 30 C46 12 60 14 58 28 C56 38 44 38 34 34 Z" fill="${L.body}" opacity=".9" class="wing"/>
        <path d="M30 36 C20 40 12 50 18 54 C24 56 28 46 31 40 Z M34 36 C44 40 52 50 46 54 C40 56 36 46 33 40 Z" fill="${L.glow}" opacity=".75" class="wing"/>
        <circle cx="16" cy="26" r="3.5" fill="${L.belly}"/><circle cx="48" cy="26" r="3.5" fill="${L.belly}"/>
        <ellipse cx="32" cy="34" rx="6" ry="14" fill="${fill}"/>${eyes(26, 5, 2.2)}
        <path d="M30 20 Q26 10 22 9 M34 20 Q38 10 42 9" stroke="${L.body}" stroke-width="1.4" fill="none"/>`;
      break;
    case 'ghost':
      body = `<path d="M14 54 L14 30 C14 16 22 8 32 8 C42 8 50 16 50 30 L50 54 L45 49 L40 54 L35 49 L32 54 L29 49 L24 54 L19 49 Z" fill="${fill}" opacity=".95"/>
        ${eyes(28, 9)}${cheeks(35)}${mouth(37)}`;
      break;
    case 'ringed':
      body = `<ellipse cx="32" cy="34" rx="28" ry="8" fill="none" stroke="${L.glow}" stroke-width="3" opacity=".8"/>
        <circle cx="32" cy="32" r="16" fill="${fill}"/>
        <path d="M4.5 34 A28 8 0 0 0 59.5 34" fill="none" stroke="${L.glow}" stroke-width="3"/>${eyes(28, 8, 2.8)}${cheeks(33)}${mouth(35)}`;
      break;
    default: // blob
      body = `${ears}<path d="M12 44 C10 26 18 14 32 14 C46 14 54 26 52 44 C50 54 14 54 12 44 Z" fill="${fill}"/>
        <ellipse cx="32" cy="44" rx="11" ry="6" fill="${L.belly}" opacity=".8"/>
        <ellipse cx="20" cy="52" rx="5" ry="3" fill="${L.body}"/><ellipse cx="44" cy="52" rx="5" ry="3" fill="${L.body}"/>
        ${eyes(32, 9)}${cheeks(39)}${mouth(40)}`;
  }
  return `<svg viewBox="0 0 64 64" aria-hidden="true" style="--glow:${L.glow}">${defs}${body}</svg>`;
}
