// Divinae, the Nature Goddess: a flat 2D portrait (SVG) shown inside her world.
// Warm light-brown skin, long dark braided hair, glowing pupil-less eyes,
// a crown of leaves and blossoms, vines over her shoulders.

export function divinaeArt(ascended = false) {
  const skin = '#C99372';
  const skinShade = '#B07B5C';
  const hair = '#2B1A14';
  const hairHi = '#4A2E22';
  const eye = ascended ? '#FFF2B3' : '#E8FFF0';
  const eyeGlow = ascended ? '#FDE68A' : '#86EFAC';
  const leaf = ascended ? '#EAB308' : '#22C55E';
  const leaf2 = ascended ? '#FDE68A' : '#4ADE80';
  const bloom = '#F9A8D4';
  const n = (v) => +v.toFixed(2);
  const leafPath = (x, y, r, s = 1) => `<path d="M0 0 C${n(6 * s)} ${n(-5 * s)} ${n(12 * s)} ${n(-2 * s)} ${n(14 * s)} 0 C${n(12 * s)} ${n(2 * s)} ${n(6 * s)} ${n(5 * s)} 0 0 Z" transform="translate(${x} ${y}) rotate(${r})"/>`;
  const flower = (x, y, s = 1, c = bloom) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-3.2" rx="2.2" ry="3.4" fill="${c}" transform="rotate(${a})"/>`).join('')}<circle r="1.8" fill="#FDE68A"/></g>`;
  return `
<svg viewBox="0 0 100 100" class="divinae-art" aria-hidden="true">
  <defs>
    <radialGradient id="dv-bg${ascended ? 'a' : ''}" cx="50%" cy="40%" r="65%">
      <stop offset="0" stop-color="${ascended ? '#FFF7D6' : '#ECFDF5'}"/>
      <stop offset=".45" stop-color="${ascended ? '#86EFAC' : '#6EE7B7'}"/>
      <stop offset="1" stop-color="${ascended ? '#14532D' : '#065F46'}"/>
    </radialGradient>
    <filter id="dv-glow${ascended ? 'a' : ''}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
    <clipPath id="dv-clip${ascended ? 'a' : ''}"><circle cx="50" cy="50" r="50"/></clipPath>
  </defs>
  <g clip-path="url(#dv-clip${ascended ? 'a' : ''})">
    <rect width="100" height="100" fill="url(#dv-bg${ascended ? 'a' : ''})"/>
    <!-- light rays behind her -->
    <g opacity=".35" fill="#fff">${[0, 30, 60, 90, 120, 150].map((a) => `<path d="M50 40 L46 -20 L54 -20 Z" transform="rotate(${a - 75} 50 40)"/>`).join('')}</g>
    <!-- long braided hair behind -->
    <path d="M27 40 C24 62 22 80 26 104 L74 104 C78 80 76 62 73 40 C70 22 30 22 27 40 Z" fill="${hair}"/>
    <g stroke="${hairHi}" stroke-width="1.2" fill="none" opacity=".9">
      <path d="M30 52 C28 66 29 80 31 100"/><path d="M35 56 C34 70 34 84 35 100"/><path d="M65 56 C66 70 66 84 65 100"/><path d="M70 52 C72 66 71 80 69 100"/>
      <path d="M30 60 l2 2 M30 68 l2 2 M30 76 l2 2 M30 84 l2 2 M70 60 l-2 2 M70 68 l-2 2 M70 76 l-2 2 M70 84 l-2 2"/>
    </g>
    <!-- shoulders and neck -->
    <path d="M18 104 C20 86 32 80 42 78 L58 78 C68 80 80 86 82 104 Z" fill="${skin}"/>
    <path d="M43 66 L57 66 L58 80 C54 83 46 83 42 80 Z" fill="${skinShade}"/>
    <!-- face -->
    <path d="M35 44 C35 30 65 30 65 44 C65 58 58 68 50 69 C42 68 35 58 35 44 Z" fill="${skin}"/>
    <!-- hair framing the face -->
    <path d="M33 46 C31 30 42 24 50 24 C58 24 69 30 67 46 C63 36 58 33 50 33 C42 33 37 36 33 46 Z" fill="${hair}"/>
    <!-- glowing, pupil-less eyes -->
    <g filter="url(#dv-glow${ascended ? 'a' : ''})" fill="${eyeGlow}" opacity=".9"><ellipse cx="43.5" cy="47" rx="4.2" ry="2"/><ellipse cx="56.5" cy="47" rx="4.2" ry="2"/></g>
    <path d="M39.5 47.2 C41 45 46 45 47.6 46.8 C46 48.6 41 48.8 39.5 47.2 Z" fill="${eye}"/>
    <path d="M52.4 46.8 C54 45 59 45 60.5 47.2 C59 48.8 54 48.6 52.4 46.8 Z" fill="${eye}"/>
    <path d="M39 43.6 C41.5 42.2 45 42.2 47.5 43.4 M52.5 43.4 C55 42.2 58.5 42.2 61 43.6" stroke="${hair}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M50 49 C49.4 53 49 55 50.8 55.6" stroke="${skinShade}" stroke-width=".9" fill="none" stroke-linecap="round"/>
    <path d="M45.5 60 C48 61.6 52 61.6 54.5 60 C52.5 63.2 47.5 63.2 45.5 60 Z" fill="#9A4B5A"/>
    <circle cx="40.5" cy="54" r="2.4" fill="#E9A089" opacity=".35"/><circle cx="59.5" cy="54" r="2.4" fill="#E9A089" opacity=".35"/>
    <!-- crown of leaves and blossoms -->
    <g fill="${leaf}">${leafPath(30, 33, -150)}${leafPath(35, 27, -125)}${leafPath(42, 23, -100)}${leafPath(58, 23, -80, -1)}${leafPath(65, 27, -55, -1)}${leafPath(70, 33, -30, -1)}</g>
    <g fill="${leaf2}">${leafPath(38, 25, -112, .8)}${leafPath(62, 25, -68, -.8)}${leafPath(50, 21, -90, .9)}</g>
    ${flower(50, 24, 1.1, ascended ? '#FDE68A' : bloom)}${flower(39, 27, .8)}${flower(61, 27, .8)}${ascended ? flower(32, 32, .7, '#FDE68A') + flower(68, 32, .7, '#FDE68A') : ''}
    <!-- vines over the shoulders -->
    <path d="M22 100 C26 90 34 88 38 82 C40 79 44 79 45 82" stroke="${leaf}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M78 100 C74 90 66 88 62 82 C60 79 56 79 55 82" stroke="${leaf}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <g fill="${leaf2}">${leafPath(27, 92, -40, .7)}${leafPath(33, 86, -70, .6)}${leafPath(73, 92, -140, -.7)}${leafPath(67, 86, -110, -.6)}</g>
    ${flower(36, 84, .6)}${flower(64, 84, .6)}
  </g>
  <circle cx="50" cy="50" r="49" fill="none" stroke="${ascended ? '#FDE68A' : '#BBF7D0'}" stroke-width="1.5" opacity=".8"/>
</svg>`;
}
