// Tiny DOM helpers + icon set.

export function h(tag, attrs = {}, children = []) {
  const el = tag === 'svg' || tag === 'path' ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'class') el.setAttribute('class', v);
    else if (k === 'style' && typeof v === 'object') {
      for (const [sk, sv] of Object.entries(v)) {
        if (sk.startsWith('--')) el.style.setProperty(sk, sv);
        else el.style[sk] = sv;
      }
    }
    else if (k === 'value' && 'value' in el) el.value = v;
    else if (k === 'checked') el.checked = !!v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const P = {
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke-linejoin="round"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="3.2"/>',
  restart: '<path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v4.5h4.5"/>',
  ear: '<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5.6 1.5"/><path d="M10 9.5a2 2 0 0 1 4 0"/>',
  metronome: '<path d="M9 3h6l3.5 18h-13z" stroke-linejoin="round"/><path d="M12 15l5-8"/><path d="M7 17h10"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  piano: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M13 5v14M18 5v14"/><path d="M6.5 5v7M11.5 5v7M16.5 5v7" stroke-width="2.8"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6.5 7S5 19 4 16l-1-3a1.5 1.5 0 0 1 2.7-1.2L8 15"/>',
  learn: '<path d="M4 19c3-6 5 2 8-4s5 2 8-4"/><circle cx="4" cy="19" r="1.6" fill="currentColor"/><circle cx="20" cy="11" r="1.6" fill="currentColor"/><path d="M14 4l2 2-2 2"/>',
  library: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  chords: '<circle cx="7" cy="17" r="2.6"/><circle cx="12" cy="12" r="2.6"/><circle cx="17" cy="7" r="2.6"/><path d="M9.6 17V5M14.6 12V3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 6.5l2.6 1.5M17.2 16l2.6 1.5M4.2 17.5l2.6-1.5M17.2 8l2.6-1.5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
  flame: '<path d="M12 21c4 0 7-2.7 7-6.5 0-4-3-6-4-9.5-2 1.5-3 3.5-3 5.5-1-1-1.5-2-1.5-3.5C7 9 5 11.5 5 14.5 5 18.3 8 21 12 21z" fill="currentColor" stroke="none"/>',
  star: '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="currentColor" stroke-linejoin="round"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  bluetooth: '<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',
  shop: '<path d="M4 8h16l-1.5 11a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7z"/><path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8"/><path d="M12 12.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.5-1.4 2-.3z" fill="currentColor" stroke="none"/>',
  arcade: '<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="15.5" cy="11.5" r="1" fill="currentColor" stroke="none"/><circle cx="17.8" cy="13.8" r="1" fill="currentColor" stroke="none"/>',
  backpack: '<path d="M6 9a6 6 0 0 1 12 0v10.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5z"/><path d="M9.5 4.5V3.5a2.5 2.5 0 0 1 5 0v1"/><path d="M9 13h6v4H9z"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7.5h8M8 11h6"/>',
  volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke-linejoin="round"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  note: '<path d="M9 18V5l10-2v13"/><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="16.5" cy="16" r="2.5" fill="currentColor"/>',
};

export function icon(name, cls = '') {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('class', `ico ${cls}`);
  s.setAttribute('fill', 'none');
  s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', '2');
  s.setAttribute('stroke-linecap', 'round');
  s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = P[name] || P.note;
  return s;
}

/**
 * Stars out of 5, dance-game style: three small stars tucked together, a bigger
 * fourth, and a big fifth "mega star" that shines and spins its rays when earned.
 */
const STAR_PATH = 'M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z';
export function starsHTML(n, max = 5, animate = false) {
  let out = '';
  for (let i = 0; i < max; i++) {
    const tier = max === 5 ? (i < 3 ? 'sm' : i === 3 ? 'big' : 'mega') : '';
    const delay = animate ? `animation-delay:${(0.25 + i * 0.24 + (i === 4 ? 0.3 : 0)).toFixed(2)}s` : '';
    const mega = tier === 'mega';
    out += `<span class="star ${tier} s${i + 1} ${i < n ? 'on' : ''}" style="${delay}">${mega ? '<i class="mega-rays"></i>' : ''}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}" fill="currentColor"/></svg>${mega ? '<i class="mega-shine"></i>' : ''}</span>`;
  }
  return out;
}

/**
 * Notifications: small glowing "transmissions" that slide down from the top.
 * kind: '' (info), 'ok' (good news), 'bad' (a problem). A leading emoji in the
 * message becomes the icon. Tap to dismiss; at most three are shown at once.
 */
const TOAST_ICONS = { ok: '✦', bad: '⚠️', '': '\u{1F6F0}️' };
export function toast(msg, kind = '') {
  let host = document.querySelector('.toast-host');
  if (!host) {
    host = h('div', { class: 'toast-host', role: 'status', 'aria-live': 'polite' });
    document.body.appendChild(host);
  }
  let text = String(msg);
  let ico = TOAST_ICONS[kind] ?? TOAST_ICONS[''];
  const lead = text.match(/^(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*|[✦✨⏳☁])️?\s*/u);
  if (lead) { ico = lead[1]; text = text.slice(lead[0].length); }
  const ms = Math.min(6000, 2600 + text.length * 25);
  const bar = h('i');
  const t = h('div', { class: `toast ${kind}`, onclick: () => hide() }, [h('span', { class: 'toast-ico' }, ico), h('span', { class: 'toast-msg' }, text), h('span', { class: 'toast-time' }, bar)]);
  host.appendChild(t);
  while (host.children.length > 3) host.firstElementChild.remove();
  requestAnimationFrame(() => { t.classList.add('show'); bar.style.transitionDuration = `${ms}ms`; bar.style.transform = 'scaleX(0)'; });
  let gone = false;
  const hide = () => { if (gone) return; gone = true; t.classList.remove('show'); t.classList.add('hide'); setTimeout(() => t.remove(), 400); };
  setTimeout(hide, ms);
}

export function modal(content, { onClose } = {}) {
  const back = h('div', { class: 'modal-back' });
  const close = () => {
    back.classList.remove('open');
    setTimeout(() => back.remove(), 250);
    if (onClose) onClose();
  };
  back.addEventListener('click', (e) => { if (e.target === back) close(); });
  const card = h('div', { class: 'card modal pop' }, typeof content === 'function' ? content(close) : content);
  back.appendChild(card);
  document.body.appendChild(back);
  requestAnimationFrame(() => back.classList.add('open'));
  return close;
}

/** Deterministic pleasant gradient for a song cover. */
export function coverGradient(seed) {
  let x = 0;
  for (const c of seed) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  const palettes = [
    ['#6C4DF6', '#3D7BFF'], ['#F04461', '#FF8A5B'], ['#17B26A', '#0EA5E9'], ['#F0821E', '#FFC43D'],
    ['#8B5CF6', '#EC4899'], ['#0EA5E9', '#6366F1'], ['#14B8A6', '#84CC16'], ['#E11D48', '#8B5CF6'],
  ];
  const [a, b] = palettes[x % palettes.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}
