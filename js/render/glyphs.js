// Drawn icons that stand in for every emoji, so the app never shows Apple's (or
// anyone's) emoji artwork. Flat and colourful, on a 24 × 24 grid, in the same
// style as the rest of the app. A watcher swaps any emoji that reaches the page.

const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
const S = (d, stroke, w = 2, extra = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
const C = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${extra}/>`;
const E = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${extra}/>`;
const R = (x, y, w, hgt, rx, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="${rx}" fill="${fill}"${extra}/>`;
const star = (cx, cy, R1, r1, n = 5, rot = -90) => [...Array(n * 2)].map((_, i) => { const a = ((rot + (i * 180) / n) * Math.PI) / 180; const d = i % 2 ? r1 : R1; return `${(cx + d * Math.cos(a)).toFixed(2)},${(cy + d * Math.sin(a)).toFixed(2)}`; }).join(' ');
const STAR = (cx, cy, R1, r1, fill, n = 5) => `<polygon points="${star(cx, cy, R1, r1, n)}" fill="${fill}"/>`;
const spark = (cx, cy, r, fill) => P(`M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r}Z`, fill);
const petals = (cx, cy, n, dist, rx, ry, fill) => [...Array(n)].map((_, i) => E(cx, cy - dist, rx, ry, fill, ` transform="rotate(${(360 / n) * i} ${cx} ${cy})"`)).join('');
const EYES = (y, x1, x2, r = 1.1) => C(x1, y, r, '#1E1B3A') + C(x2, y, r, '#1E1B3A');

const G = {
  sparkles: spark(10, 11, 7, '#FCD34D') + spark(18.5, 5.5, 3.5, '#FDE68A') + spark(18, 18, 3, '#FBBF24'),
  snowflake: S('M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7', '#7DD3FC', 2) + S('M12 5l-2.5-2M12 5l2.5-2M12 19l-2.5 2M12 19l2.5 2M5.5 8.3l-.6-3.2M5.5 15.7l-.6 3.2M18.5 8.3l.6-3.2M18.5 15.7l.6 3.2', '#7DD3FC', 1.6),
  swords: S('M4 4l12 12M20 4L8 16', '#CBD5E1', 2.6) + S('M14 18l4-4M6 14l4 4', '#F59E0B', 2.4) + S('M17.5 17.5l2.5 2.5M6.5 17.5L4 20', '#92400E', 2.4),
  sun: C(12, 12, 5.5, '#FBBF24') + S('M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1', '#F59E0B', 2),
  daisy: [...Array(10)].map((_, i) => E(12, 6, 2.3, 4.2, '#FFFFFF', ` stroke="#E2E8F0" stroke-width=".8" transform="rotate(${36 * i} 12 12)"`)).join('') + C(12, 12, 3.6, '#FBBF24') + C(12, 12, 3.6, 'none', ' stroke="#F59E0B" stroke-width=".8"'),
  diya: P('M3 13h18q-1.5 6-9 6t-9-6z', '#C2410C') + P('M5 13h14q-1 3.5-7 3.5T5 13z', '#EA580C') + P('M12 3q3 4 0 8q-3-4 0-8z', '#FBBF24') + P('M12 6q1.4 2 0 4q-1.4-2 0-4z', '#FEF3C7'),
  leafFall: P('M4 20C4 9 11 4 20 4c0 9-5 16-16 16z', '#EA580C') + S('M5 19L16 8M10 14l-1-4M13 11l3 1', '#9A3412', 1.4),
  maple: P('M12 2l2 4 3-1-1 4 4-1-2 4 3 1-5 3 1 2-5-1v5h-1v-5l-5 1 1-2-5-3 3-1-2-4 4 1-1-4 3 1z', '#DC2626'),
  candle: R(8.5, 9, 7, 13, 1.5, '#FEF3C7') + R(8.5, 9, 7, 2.5, 1, '#FDE68A') + S('M12 9V7', '#44403C', 1.4) + P('M12 1.5q3 3.2 0 5.5q-3-2.3 0-5.5z', '#F59E0B') + P('M12 3.5q1.2 1.5 0 2.8q-1.2-1.3 0-2.8z', '#FEF9C3'),
  cloud: P('M6.5 19a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.6 1.5A3.8 3.8 0 0 1 17.5 19z', '#E0F2FE') + P('M6.5 19a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.6 1.5A3.8 3.8 0 0 1 17.5 19z', 'none', ' stroke="#7DD3FC" stroke-width="1.2"'),
  gift: R(3, 10, 18, 11, 2, '#7C3AED') + R(2, 7, 20, 4.5, 1.5, '#8B5CF6') + R(10.5, 7, 3, 14, 0, '#FBBF24') + S('M12 7C9 2 5 4 8 7M12 7c3-5 7-3 4 0', '#FBBF24', 2),
  trophy: P('M7 3h10v6a5 5 0 0 1-10 0z', '#FBBF24') + S('M7 5H4q0 5 4 6M17 5h3q0 5-4 6', '#F59E0B', 1.8) + R(10.5, 13.5, 3, 4, 0.5, '#F59E0B') + R(7, 17.5, 10, 3.5, 1, '#B45309') + spark(12, 7.5, 2.2, '#FEF3C7'),
  lock: S('M8 10V7a4 4 0 0 1 8 0v3', '#94A3B8', 2.4) + R(5, 10, 14, 11, 2.5, '#8B5CF6') + C(12, 15, 1.8, '#EDE9FE') + R(11.2, 15, 1.6, 3, 0.8, '#EDE9FE'),
  bow: P('M12 12L3 6v12zM12 12l9-6v12z', '#F472B6') + C(12, 12, 2.6, '#EC4899') + P('M11 13l-3 8 2.5-1 1.5 2 .5-9zM13 13l3 8-2.5-1-1.5 2-.5-9z', '#DB2777'),
  tulip: S('M12 22V12', '#16A34A', 2) + P('M12 17q-6-1-7-6 5 0 7 4zM12 18q5-1 6-5-4 0-6 3z', '#22C55E') + P('M6 4l3 3 3-4 3 4 3-3v5a6 6 0 0 1-12 0z', '#F43F5E'),
  blossom: petals(12, 12, 5, 5, 3.6, 4.4, '#F9A8D4') + C(12, 12, 2.6, '#FDF2F8') + EYES(12, 11, 13, 0.6).replace(/#1E1B3A/g, '#DB2777'),
  bat: P('M11 10.5Q7 5.5 1.5 8q2.2 1.6 1.4 4.8 2-.9 3.3.7 1.3-1.8 3 0 .8-1.6 2.8-.6zM13 10.5q4-5 9.5-2.5-2.2 1.6-1.4 4.8-2-.9-3.3.7-1.3-1.8-3 0-.8-1.6-2.8-.6z', '#5B21B6') + E(12, 12, 2.8, 3.8, '#4C1D95') + P('M10 9l.4-2.6L11.4 8.6zM14 9l-.4-2.6-1 2.2z', '#4C1D95') + EYES(11, 11, 13, 0.75).replace(/#1E1B3A/g, '#FDE68A'),
  galaxy: C(12, 12, 10, '#1E1B4B') + E(12, 12, 9, 3.5, '#8B5CF6', ' opacity=".55" transform="rotate(-25 12 12)"') + E(12, 12, 5, 1.8, '#F0ABFC', ' opacity=".8" transform="rotate(-25 12 12)"') + C(12, 12, 1.6, '#FFF7E6') + C(6, 7, 0.7, '#fff') + C(18, 17, 0.7, '#fff') + C(17, 6, 0.5, '#fff'),
  key: C(7, 12, 4.5, 'none', ' stroke="#F59E0B" stroke-width="2.6"') + S('M11.5 12H21M18 12v3.5M15 12v2.5', '#F59E0B', 2.6),
  egg: E(12, 13, 7, 9, '#C4B5FD') + S('M5.5 12l2.3-2 2.2 2 2-2 2.2 2 2.2-2 2.1 2', '#F9A8D4', 1.6) + C(9, 17, 1, '#FDE68A') + C(15, 17, 1, '#86EFAC'),
  pumpkin: E(12, 14, 9.5, 7.5, '#F97316') + S('M12 7v14M7.5 8Q5 14 7.5 20M16.5 8q2.5 6 0 12', '#EA580C', 1.2) + P('M11 7q0-3 2-4l.5 1q-1.5 1-1.5 3z', '#16A34A') + P('M8 12l2 1.6-2 .8zM16 12l-2 1.6 2 .8zM8.5 16.5h7l-1.2 1.5-1.2-1-1.1 1-1.2-1-1.1 1z', '#7C2D12'),
  fireworks: [...Array(10)].map((_, i) => { const a = (i * 36 * Math.PI) / 180; return S(`M${12 + 3 * Math.cos(a)} ${12 + 3 * Math.sin(a)}L${12 + 9 * Math.cos(a)} ${12 + 9 * Math.sin(a)}`, ['#F472B6', '#FBBF24', '#60A5FA', '#34D399', '#C084FC'][i % 5], 1.8); }).join('') + C(12, 12, 1.8, '#FEF3C7'),
  sparkler: S('M4 21L13 12', '#94A3B8', 1.8) + [...Array(8)].map((_, i) => { const a = (i * 45 * Math.PI) / 180; return S(`M${15 + 2 * Math.cos(a)} ${9 + 2 * Math.sin(a)}L${15 + 6 * Math.cos(a)} ${9 + 6 * Math.sin(a)}`, '#FBBF24', 1.5); }).join('') + C(15, 9, 1.6, '#FEF9C3'),
  butterfly: P('M12 12C8 2 1 4 3 10c1 3 5 3 9 2zM12 12c4-10 11-8 9-2-1 3-5 3-9 2z', '#A855F7') + P('M12 12c-3 1-7 4-5 8 2 2 4-2 5-7zM12 12c3 1 7 4 5 8-2 2-4-2-5-7z', '#F472B6') + R(11.2, 6, 1.6, 14, 0.8, '#3B0764'),
  fire: P('M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z', '#F97316') + P('M12 11c.5 2 3 3 3 6a3 3 0 0 1-6 0c0-2 1.5-3 2-4 .3 1 .7 1.4 1 1.5z', '#FDE047'),
  star: STAR(12, 12.5, 10, 4.4, '#FBBF24') + STAR(12, 12.5, 5, 2.2, '#FDE68A'),
  medal: P('M7 2h4l2 6H9zM13 2h4l-2 6h-4z', '#3B82F6') + C(12, 15, 6.5, '#F59E0B') + C(12, 15, 4.5, '#FBBF24') + STAR(12, 15, 3, 1.3, '#FFFBEB'),
  medalSport: P('M6 2h4l3 7H9zM14 2h4l-3 7h-4z', '#EF4444') + C(12, 15, 6.5, '#FBBF24') + C(12, 15, 4.6, '#FDE68A') + `<text x="12" y="17.6" font-size="7" font-weight="900" text-anchor="middle" fill="#B45309" font-family="system-ui">1</text>`,
  guitar: S('M15 9l6-6', '#78350F', 2.2) + P('M10 9.5a4 4 0 0 1 4.5 4.5 3 3 0 0 1-1 4.8 5 5 0 0 1-8.3-5.3 3 3 0 0 1 4.8-1z', '#F97316') + C(10, 14, 1.6, '#7C2D12') + R(19.5, 1.5, 3, 3, 0.6, '#92400E'),
  bolt: P('M13 2L4 14h7l-2 8 9-12h-7z', '#FBBF24') + P('M13 2L4 14h4z', '#FDE68A'),
  palm: S('M12 22q1-8-1-12', '#92400E', 2.2) + P('M11 10q-6-3-9 1 5-1 9-1zM11 10q-2-6-7-6 4 2 7 6zM11 10q3-6 8-5-4 1-8 5zM11 10q6-2 10 2-5-2-10-2z', '#22C55E'),
  menorah: S('M12 9v11M5 9q0 6 7 6t7-6M8.5 9q0 3.5 3.5 3.5T15.5 9M7 21h10', '#60A5FA', 1.7) + [5, 8.5, 12, 15.5, 19].map((x) => P(`M${x} ${x === 12 ? 3 : 4.5}q1.4 1.7 0 3q-1.4-1.3 0-3z`, '#FBBF24')).join(''),
  tree: P('M12 2l5 6h-2.5l4 5h-3l4.5 6h-16l4.5-6h-3l4-5H7z', '#16A34A') + R(10.5, 19, 3, 3, 0.5, '#92400E') + spark(12, 2.5, 2.4, '#FBBF24') + C(9, 11, 1, '#F43F5E') + C(15, 14, 1, '#60A5FA') + C(10.5, 16.5, 1, '#FBBF24'),
  warning: P('M12 2.5L22.5 21h-21z', '#F59E0B') + R(11, 8.5, 2, 6.5, 1, '#fff') + C(12, 17.6, 1.2, '#fff'),
  hourglass: R(5, 2, 14, 2.4, 1.2, '#7C3AED') + R(5, 19.6, 14, 2.4, 1.2, '#7C3AED') + P('M7 4.4h10q0 5-5 7.6q-5-2.6-5-7.6zM7 19.6h10q0-5-5-7.6q-5 2.6-5 7.6z', '#EDE9FE', ' stroke="#A78BFA" stroke-width="1.2"') + P('M9 19.6h6q-1-3-3-4q-2 1-3 4zM9.5 6.5h5q-.8 2-2.5 3q-1.7-1-2.5-3z', '#FBBF24'),
  hundred: `<text x="12" y="15" font-size="11" font-weight="900" text-anchor="middle" fill="#EF4444" font-family="system-ui" font-style="italic">100</text>` + S('M3 18.5q9-2 18 0M5 21q7-1.4 14 0', '#EF4444', 1.6),
  piano: R(2, 6, 20, 13, 2, '#FFFFFF', ' stroke="#334155" stroke-width="1.4"') + S('M7 6v13M12 6v13M17 6v13', '#CBD5E1', 1) + [5.2, 9.6, 14.6].map((x) => R(x, 6, 2.6, 7.5, 0.6, '#1E293B')).join('') + R(19, 6, 2.2, 7.5, 0.6, '#1E293B'),
  bags: P('M3 8h10l-1 13H4z', '#EC4899') + S('M5.5 8V6a2.5 2.5 0 0 1 5 0v2', '#BE185D', 1.6) + P('M11 10h10l-1.2 11h-7.6z', '#8B5CF6') + S('M13.5 10V8.5a2.5 2.5 0 0 1 5 0V10', '#5B21B6', 1.6),
  score: R(2, 3, 20, 18, 2, '#FFFBEB') + S('M4 8h16M4 11h16M4 14h16M4 17h16', '#CBD5E1', 0.9) + E(9, 15.5, 2, 1.5, '#1E1B3A', ' transform="rotate(-20 9 15.5)"') + S('M10.8 15V6.5l5 1.5', '#1E1B3A', 1.4) + E(15, 13.5, 2, 1.5, '#1E1B3A', ' transform="rotate(-20 15 13.5)"') + S('M16.8 13V8', '#1E1B3A', 1.4),
  infinity: S('M12 12c-2-3-4-4.5-6-4.5a4.5 4.5 0 0 0 0 9c2 0 4-1.5 6-4.5s4-4.5 6-4.5a4.5 4.5 0 0 1 0 9c-2 0-4-1.5-6-4.5z', '#8B5CF6', 2.8),
  person: C(12, 8, 4.4, '#C08A5B') + P('M3.5 21a8.5 7 0 0 1 17 0z', '#8B5CF6') + P('M7.6 7.4q0-4.6 4.4-4.6t4.4 4.6q-1.5-2-4.4-2t-4.4 2z', '#3B2416'),
  family: C(7, 8, 3.2, '#C08A5B') + C(17, 8, 3.2, '#8D5524') + C(12, 13, 2.6, '#A86B3C') + P('M1.5 21a5.5 5 0 0 1 11 0z', '#3B82F6') + P('M11.5 21a5.5 5 0 0 1 11 0z', '#EC4899') + P('M8 22a4 3.6 0 0 1 8 0z', '#22C55E'),
  cake: R(4, 11, 16, 10, 2, '#F9A8D4') + P('M4 14q2 2 4 0t4 0 4 0 4 0v-1H4z', '#FFFFFF') + R(3, 20, 18, 2, 1, '#DB2777') + [8, 12, 16].map((x) => R(x - 0.8, 6, 1.6, 5, 0.6, '#60A5FA') + P(`M${x} 2.5q1.6 1.8 0 3.2q-1.6-1.4 0-3.2z`, '#FBBF24')).join(''),
  tag: P('M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z', '#F59E0B') + C(7.5, 7.5, 1.8, '#FFFBEB') + S('M9 15l6-6', '#B45309', 1.4, ' opacity=".5"'),
  leaves: P('M3 21C3 12 9 7 17 6c0 8-5 14-14 15z', '#22C55E') + S('M4 20l9-9', '#15803D', 1.3) + P('M12 13c1-6 5-9 10-10 0 6-3 10-10 10z', '#4ADE80'),
  chick: P('M3 14q2 7 9 7t9-7l-2 1.5-2-2-2 2-3-2.5-3 2.5-2-2-2 2z', '#F5F5F4', ' stroke="#D6D3D1" stroke-width=".8"') + C(12, 10, 6, '#FDE047') + EYES(9, 10, 14, 0.9) + P('M11 11l1 1.6 1-1.6z', '#F97316') + P('M7 12l-3-1.4 3-.6 3.5-1.8 3.5 1.8 3 .6-3 1.4', '#F5F5F4', ' opacity=".9"'),
  wave: P('M2 16q3-9 9-9 6 0 6 6-4-3-6 0 3 5 11 2v6H2z', '#38BDF8') + P('M11 7q6 0 6 6-4-3-6 0', '#E0F2FE') + S('M2 21q3-2 6 0t6 0 6 0', '#0284C7', 1.4),
  ghost: P('M5 21V10a7 7 0 0 1 14 0v11l-2.4-1.8L14.3 21 12 19.2 9.7 21l-2.3-1.8z', '#F5F3FF', ' stroke="#C4B5FD" stroke-width="1"') + E(9.5, 10.5, 1.3, 1.8, '#1E1B3A') + E(14.5, 10.5, 1.3, 1.8, '#1E1B3A') + E(12, 14.6, 1.4, 1.1, '#1E1B3A'),
  satellite: R(9, 9, 6, 6, 1.2, '#94A3B8', ' transform="rotate(45 12 12)"') + R(1.5, 8.5, 6, 7, 0.8, '#3B82F6', ' transform="rotate(45 12 12)"') + R(16.5, 8.5, 6, 7, 0.8, '#3B82F6', ' transform="rotate(45 12 12)"') + S('M15 15l3 3M19 21q2-.2 2-2', '#CBD5E1', 1.4),
  footprints: E(8, 9, 3, 4.5, '#A78BFA', ' transform="rotate(-12 8 9)"') + E(16, 15, 3, 4.5, '#A78BFA', ' transform="rotate(12 16 15)"') + C(6.2, 3.4, 1.1, '#A78BFA') + C(8.7, 3, 1.1, '#A78BFA') + C(15.3, 9.4, 1.1, '#A78BFA') + C(17.8, 9.8, 1.1, '#A78BFA'),
  planet: E(12, 12, 11, 3.6, 'none', ' stroke="#FDE68A" stroke-width="1.6" transform="rotate(-18 12 12)"') + C(12, 12, 6.5, '#A855F7') + P('M5.7 13.2a11 3.6 -18 0 0 12.6-4.5 6.5 6.5 0 0 1 .1 1.7 11 3.6 -18 0 1-12.6 4.6z', '#FDE68A', ' opacity=".9"'),
  calendar: R(3, 4, 18, 17, 2.5, '#FFFFFF', ' stroke="#CBD5E1" stroke-width="1.2"') + P('M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5V9H3z', '#EF4444') + S('M8 2.5v4M16 2.5v4', '#64748B', 1.8) + [[7, 12.5], [12, 12.5], [17, 12.5], [7, 16.5], [12, 16.5]].map(([x, y]) => R(x - 1.3, y - 1.3, 2.6, 2.6, 0.6, '#C4B5FD')).join(''),
  stopwatch: C(12, 13.5, 8, '#FFFFFF', ' stroke="#8B5CF6" stroke-width="2"') + R(10, 1.8, 4, 2.6, 1, '#8B5CF6') + S('M12 13.5V8.5M12 13.5l3 2', '#1E1B3A', 1.8) + S('M18.5 5.5l1.5-1.5', '#8B5CF6', 2),
  target: C(12, 12, 10, '#EF4444') + C(12, 12, 7, '#FFFFFF') + C(12, 12, 4, '#EF4444') + C(12, 12, 1.6, '#FFFFFF') + S('M12 12l8-8M17 3.5l3.5.5.5 3.5', '#1E293B', 1.6),
  gem: P('M6 3h12l4 6-10 12L2 9z', '#38BDF8') + P('M2 9h20L12 21z', '#0EA5E9') + P('M6 3l3 6 3-6 3 6 3-6', '#BAE6FD', ' opacity=".9"') + S('M2 9h20', '#E0F2FE', 0.8),
  hands: P('M4 21v-7l-2-5 2-1 3 4V4.5a1.3 1.3 0 0 1 2.6 0V10h.4V3.3a1.3 1.3 0 0 1 2.6 0V10h.4V4.5a1.3 1.3 0 0 1 2.6 0V14l-2 7z', '#E0A16E') + S('M16 2l1-1.5M19 4l1.5-1M20 7.5h1.8', '#FBBF24', 1.4),
  moon: P('M15 3a9 9 0 1 0 6.5 13.5A7 7 0 0 1 15 3z', '#FDE68A') + C(10, 10, 1.2, '#FBBF24', ' opacity=".6"') + C(12.5, 16, 0.9, '#FBBF24', ' opacity=".6"'),
  joystick: R(3, 15, 18, 6.5, 3, '#334155') + R(10.8, 6, 2.4, 10, 1.2, '#64748B') + C(12, 6, 3.6, '#EF4444') + C(6.5, 18.2, 1.2, '#FBBF24') + C(17.5, 18.2, 1.2, '#22C55E'),
  mic: R(8.5, 2, 7, 12, 3.5, '#8B5CF6') + S('M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7', '#64748B', 1.8) + S('M10 6h4M10 9h4', '#C4B5FD', 1.2),
  palette: P('M12 2a10 10 0 0 0 0 20c1.6 0 2-1 1.4-2.2-.8-1.6.4-3 2-3H18a4 4 0 0 0 4-4C22 6.5 17.5 2 12 2z', '#FDE68A') + C(7, 11, 1.7, '#EF4444') + C(9, 6.5, 1.7, '#3B82F6') + C(14.5, 6, 1.7, '#22C55E') + C(18, 10, 1.7, '#A855F7'),
  tophat: R(6, 3, 12, 13, 1.5, '#1E293B') + R(6, 12, 12, 2.4, 0, '#7C3AED') + E(12, 17.5, 10, 3, '#0F172A'),
  magnifier: C(10, 10, 6.5, '#E0F2FE', ' stroke="#8B5CF6" stroke-width="2.4"') + S('M15 15l6 6', '#8B5CF6', 3) + P('M7 8a3.5 3.5 0 0 1 3-2.5', 'none', ' stroke="#fff" stroke-width="1.4" stroke-linecap="round"'),
  repeat: S('M4 11V9a3 3 0 0 1 3-3h12l-3-3M20 13v2a3 3 0 0 1-3 3H5l3 3', '#8B5CF6', 2.4),
  hibiscus: petals(12, 12, 5, 5.2, 4.2, 5, '#F43F5E') + C(12, 12, 2.2, '#FDE047') + S('M12 12l5-5', '#FDE047', 1.2),
  dice: R(3, 3, 18, 18, 4, '#FFFFFF', ' stroke="#8B5CF6" stroke-width="1.6"') + [[8, 8], [16, 8], [12, 12], [8, 16], [16, 16]].map(([x, y]) => C(x, y, 1.7, '#8B5CF6')).join(''),
  rocket: P('M12 2q5 4 5 11v4H7v-4q0-7 5-11z', '#F1F5F9', ' stroke="#64748B" stroke-width="1"') + C(12, 10, 2.2, '#60A5FA') + P('M7 13l-3 5h3zM17 13l3 5h-3z', '#EF4444') + P('M9.5 17h5l-1 4h-3z', '#F97316') + P('M11 17h2l-.5 2.5h-1z', '#FDE047'),
  phone: R(6, 2, 12, 20, 2.5, '#1E293B') + R(7.5, 4.5, 9, 14, 1, '#60A5FA') + C(12, 20.2, 0.9, '#94A3B8'),
  forward: P('M3 5l9 7-9 7zM12 5l9 7-9 7z', '#8B5CF6'),
  turkey: [...Array(5)].map((_, i) => E(12, 7, 2.6, 6.5, ['#B45309', '#DC2626', '#F59E0B', '#DC2626', '#B45309'][i], ` transform="rotate(${(i - 2) * 30} 12 14)"`)).join('') + E(12, 15, 5.5, 5.5, '#92400E') + C(12, 11, 3, '#A16207') + EYES(10.5, 11, 13, 0.7) + P('M11.4 11.5l.6 1.4.6-1.4z', '#F59E0B') + P('M12.6 12.4q1 1.6 0 2.4q-.6-.8-.2-2.2z', '#DC2626'),
  web: S('M12 2v20M2 12h20M5 5l14 14M19 5L5 19', '#94A3B8', 0.9) + S('M12 5q3.5 3.5 7 0q-3.5 3.5 0 7q-3.5 3.5 0 7q-3.5-3.5-7 0q-3.5-3.5-7 0q3.5-3.5 0-7q3.5-3.5 0-7q3.5 3.5 7 0z', '#CBD5E1', 0.9) + C(15.5, 15.5, 1.8, '#1E1B3A'),
  sailboat: S('M12 3v14', '#78350F', 1.4) + P('M12 3l7 12h-7z', '#F8FAFC', ' stroke="#CBD5E1" stroke-width=".8"') + P('M11 6L5 15h6z', '#60A5FA') + P('M3 17h18l-3 4H6z', '#B45309') + S('M1 22q3-1.6 6 0t5 0 6 0 5 0', '#38BDF8', 1.2),
  // Sea friends (used only in older saves; the pets themselves are drawn in aqua.js)
  fish: E(11, 12, 7, 5, '#FB923C') + P('M17 12l5-4v8z', '#F97316') + C(8, 11, 1.2, '#1E1B3A'),
};

// Every emoji used in the app (and a few likely ones) → its drawn icon.
const MAP = {
  '✨': 'sparkles', '❄': 'snowflake', '⚔': 'swords', '☀': 'sun', '\u{1F33C}': 'daisy', '\u{1FA94}': 'diya', '\u{1F342}': 'leafFall',
  '\u{1F341}': 'maple', '\u{1F56F}': 'candle', '☁': 'cloud', '\u{1F381}': 'gift', '\u{1F3C6}': 'trophy', '\u{1F512}': 'lock', '\u{1F380}': 'bow',
  '\u{1F337}': 'tulip', '\u{1F338}': 'blossom', '\u{1F987}': 'bat', '\u{1F30C}': 'galaxy', '\u{1F5DD}': 'key', '\u{1F95A}': 'egg', '\u{1F383}': 'pumpkin',
  '\u{1F386}': 'fireworks', '\u{1F987}‍': 'bat', '\u{1F98B}': 'butterfly', '\u{1F525}': 'fire', '⭐': 'star', '\u{1F396}': 'medal', '\u{1F3B8}': 'guitar',
  '⚡': 'bolt', '\u{1F334}': 'palm', '\u{1F54E}': 'menorah', '\u{1F384}': 'tree', '⚠': 'warning', '⏳': 'hourglass', '⌛': 'hourglass', '\u{1F4AF}': 'hundred',
  '\u{1F3B9}': 'piano', '\u{1F6CD}': 'bags', '\u{1F3BC}': 'score', '♾': 'infinity', '\u{1F469}': 'person', '\u{1F468}': 'person', '\u{1F467}': 'person',
  '\u{1F466}': 'person', '\u{1F9D1}': 'person', '\u{1F382}': 'cake', '\u{1F3F7}': 'tag', '\u{1F343}': 'leaves', '\u{1F423}': 'chick', '\u{1F30A}': 'wave',
  '\u{1F47B}': 'ghost', '\u{1F387}': 'sparkler', '\u{1F6F0}': 'satellite', '\u{1F463}': 'footprints', '\u{1FA90}': 'planet', '\u{1F4C5}': 'calendar',
  '\u{1F4C6}': 'calendar', '⏱': 'stopwatch', '\u{1F3AF}': 'target', '\u{1F48E}': 'gem', '\u{1F3C5}': 'medalSport', '\u{1F64C}': 'hands', '\u{1F319}': 'moon',
  '\u{1F579}': 'joystick', '\u{1F3A4}': 'mic', '\u{1F3A8}': 'palette', '\u{1F3A9}': 'tophat', '\u{1F50E}': 'magnifier', '\u{1F50D}': 'magnifier', '\u{1F501}': 'repeat',
  '\u{1F33A}': 'hibiscus', '\u{1F3B2}': 'dice', '\u{1F680}': 'rocket', '\u{1F4F1}': 'phone', '⏩': 'forward', '\u{1F983}': 'turkey', '\u{1F578}': 'web',
  '⛵': 'sailboat', '\u{1F41F}': 'fish', '\u{1F420}': 'fish', '\u{1F421}': 'fish', '\u{1F31F}': 'star', '⭕': 'target', '✅': 'star',
};

/** An emoji (or the name of a drawn icon) as an inline SVG string. */
export function glyph(key, cls = '') {
  const name = G[key] ? key : MAP[key] || MAP[[...key][0]];
  if (!name) return '';
  return `<svg viewBox="0 0 24 24" class="gl ${cls}" aria-hidden="true" focusable="false">${G[name]}</svg>`;
}

// Emoji clusters: a pictograph plus any variation selector / joiner sequence.
const EMOJI_RE = /(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*️?)/gu;
const isFamily = (seq) => seq.includes('‍') && [...seq].filter((c) => /\p{Extended_Pictographic}/u.test(c)).length >= 3;

/** Text with emoji swapped for drawn icons (an HTML string). Unknown emoji are dropped. */
export function deEmojiHTML(text) {
  return String(text).replace(EMOJI_RE, (seq) => (isFamily(seq) ? glyph('family') : glyph(seq)));
}
export const hasEmoji = (text) => { EMOJI_RE.lastIndex = 0; return EMOJI_RE.test(text); };

/** Replace emoji inside a text node with icons (only our own SVG is inserted). */
function fixTextNode(node) {
  const t = node.nodeValue;
  if (!t || !hasEmoji(t)) return;
  const parent = node.parentNode;
  if (!parent || parent.closest?.('svg, script, style, textarea, input, [data-keep-emoji]')) return;
  const tpl = document.createElement('template');
  tpl.innerHTML = t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(EMOJI_RE, (seq) => (isFamily(seq) ? glyph('family') : glyph(seq)));
  parent.replaceChild(tpl.content, node);
}
function fixTree(root) {
  if (root.nodeType === 3) return fixTextNode(root);
  if (root.nodeType !== 1 || root.closest?.('svg')) return;
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  for (let n = walk.nextNode(); n; n = walk.nextNode()) if (hasEmoji(n.nodeValue)) hits.push(n);
  hits.forEach(fixTextNode);
}

/** Watch the whole page and swap any emoji that appears for a drawn icon. */
export function banishEmoji() {
  fixTree(document.body);
  new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === 'characterData') fixTextNode(m.target);
      else m.addedNodes.forEach(fixTree);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
}
