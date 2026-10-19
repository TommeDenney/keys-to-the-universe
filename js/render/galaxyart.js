// Galaxy emblems next to each galaxy's name: real galaxy shapes in the galaxy's
// colours, gently moving. Spirals turn; mergers drift through their phases.
//   spiral2 / spiral3 / barred / elliptical / merge-approach / merge-tails /
//   merge-coalesce / merge-shells

const f = (v) => +v.toFixed(2);

/** Stars along a logarithmic spiral arm. */
function arm(cx, cy, rot, { a = 2.2, b = 0.28, turns = 1.7, n = 26, size = 1.6, col = '#fff' } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * turns * Math.PI * 2;
    const r = a * Math.exp(b * t);
    if (r > 30) break;
    const x = cx + r * Math.cos(t + rot);
    const y = cy + r * Math.sin(t + rot) * 0.62; // tilted disc
    const k = 1 - i / n;
    out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(size * (0.5 + k * 0.9))}" fill="${col}" opacity="${f(0.3 + k * 0.7)}"/>`);
  }
  return out.join('');
}
/** A smooth arm stroke under the stars (the glowing dust lane). */
function lane(cx, cy, rot, col, { a = 2.2, b = 0.28, turns = 1.6 } = {}) {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * turns * Math.PI * 2;
    const r = a * Math.exp(b * t);
    if (r > 30) break;
    pts.push(`${f(cx + r * Math.cos(t + rot))} ${f(cy + r * Math.sin(t + rot) * 0.62)}`);
  }
  return `<path d="M${pts.join(' L')}" stroke="${col}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".45"/>`;
}
const core = (cx, cy, r, c1, c2) => `<circle cx="${cx}" cy="${cy}" r="${r * 2.4}" fill="url(#gcore)" opacity=".7"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFF7E6"/><circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="#fff"/>`;

function spiral(cx, cy, arms, g, scale = 1, cls = 'gx-spin') {
  const s = (v) => v * scale;
  let out = '';
  for (let k = 0; k < arms; k++) out += lane(cx, cy, (k / arms) * Math.PI * 2, k % 2 ? g[1] : g[0], { a: s(2.2), b: 0.28 });
  for (let k = 0; k < arms; k++) out += arm(cx, cy, (k / arms) * Math.PI * 2, { a: s(2.2), size: 1.5 * scale, col: k % 2 ? '#E0E7FF' : '#FDF4FF', n: Math.round(24 * scale) });
  return `<g class="${cls}" style="transform-origin:${cx}px ${cy}px">${out}${core(cx, cy, 3.2 * scale)}</g>`;
}

const DRAW = {
  spiral2: (g) => spiral(40, 40, 2, g),
  spiral3: (g) => spiral(40, 40, 3, g),
  barred: (g) => `<g class="gx-spin" style="transform-origin:40px 40px"><ellipse cx="40" cy="40" rx="13" ry="3.6" fill="${g[2]}" opacity=".85"/><ellipse cx="40" cy="40" rx="9" ry="2.2" fill="#FDF4FF" opacity=".7"/>${spiral(40, 40, 2, g, 1.15, '')}</g>`,
  elliptical: (g) => `<g class="gx-breathe" style="transform-origin:40px 40px"><ellipse cx="40" cy="40" rx="26" ry="17" fill="url(#gcore)" opacity=".8"/><ellipse cx="40" cy="40" rx="16" ry="10" fill="${g[0]}" opacity=".35"/>${[[28, 36], [52, 44], [44, 30], [34, 48], [56, 34], [24, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#fff" opacity=".8"/>`).join('')}${core(40, 40, 3.6)}</g>`,
  // Mergers: the two galaxies circle each other (the whole group turns slowly).
  'merge-approach': (g) => `<g class="gx-orbit" style="transform-origin:40px 40px">${spiral(22, 30, 2, g, 0.55)}${spiral(58, 50, 2, [g[1], g[2], g[0]], 0.5, 'gx-spin r')}</g>`,
  'merge-tails': (g) => `<g class="gx-orbit slow" style="transform-origin:40px 40px"><path d="M30 36 Q10 20 4 6" stroke="${g[0]}" stroke-width="3.6" fill="none" stroke-linecap="round" opacity=".55"/><path d="M50 44 Q70 60 76 74" stroke="${g[1]}" stroke-width="3.6" fill="none" stroke-linecap="round" opacity=".55"/>${arm(30, 36, 3.4, { a: 2, b: 0.35, turns: 1, n: 14 })}${arm(50, 44, 0.3, { a: 2, b: 0.35, turns: 1, n: 14 })}${core(31, 36, 2.6)}${core(49, 44, 2.6)}</g>`,
  'merge-coalesce': (g) => `<g class="gx-orbit fast" style="transform-origin:40px 40px"><ellipse cx="40" cy="40" rx="20" ry="12" fill="${g[2]}" opacity=".3"/><path d="M36 38 Q14 30 8 14" stroke="${g[0]}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/><path d="M44 42 Q66 50 72 66" stroke="${g[1]}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>${core(36, 39, 2.4)}${core(44, 41, 2.4)}</g>`,
  'merge-shells': (g) => `<g class="gx-breathe" style="transform-origin:40px 40px">${[30, 23, 16].map((r, i) => `<ellipse cx="40" cy="40" rx="${r}" ry="${r * 0.66}" fill="none" stroke="${g[i % 3]}" stroke-width="1.6" opacity="${0.35 + i * 0.15}" stroke-dasharray="${i % 2 ? '3 5' : '8 4'}"/>`).join('')}<ellipse cx="40" cy="40" rx="14" ry="9" fill="url(#gcore)" opacity=".9"/>${core(40, 40, 3.8)}</g>`,
};
export const GALAXY_KINDS = Object.keys(DRAW);

export function galaxyEmblem(kind, colours) {
  const g = colours && colours.length >= 3 ? colours : ['#8B5CF6', '#EC4899', '#60A5FA'];
  const draw = DRAW[kind] || DRAW.spiral2;
  const id = `gc${Math.random().toString(36).slice(2, 7)}`;
  return `<svg viewBox="0 0 80 80" class="gx-art" aria-hidden="true"><defs><radialGradient id="${id}"><stop offset="0" stop-color="#FFF7E6" stop-opacity=".9"/><stop offset=".4" stop-color="${g[0]}" stop-opacity=".5"/><stop offset="1" stop-color="${g[0]}" stop-opacity="0"/></radialGradient></defs>${draw(g).replace(/url\(#gcore\)/g, `url(#${id})`)}</svg>`;
}
