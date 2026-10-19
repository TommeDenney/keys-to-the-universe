// Explorer editor: build your profile picture from parts and colours.
// Free parts are always available; others are bought with Stardust, earned by
// achievements, or arrive with seasonal packs.

import { h, icon, toast } from '../ui.js';
import { avatarSVG } from '../render/avatar.js';
import { PARTS, AVATAR_ITEMS, HAIR_COLORS, CLOTHES_COLORS, BG_COLORS, HIGHLIGHT_COLORS } from '../data/avatar.js';
import { EVENT_ITEMS, eventItemAvailable, eventOf } from '../data/events.js';
import { avatar, setAvatar, displayName } from '../profile.js';
import { owns, buy, balance, walletPill, SYMBOL } from '../economy.js';
import { reqProgress, reqText } from '../achievements.js';

let uidN = 0;
const allItems = () => [...AVATAR_ITEMS, ...EVENT_ITEMS.filter((it) => it.cat === 'avatar')];
/** Free basics are always yours; the rest once bought (or granted). */
export const avatarOwned = (it) => (!it.price && !it.req && !it.event) || owns(it.id);

/** The round profile picture shown top-left on Learn and Settings (taps through to the editor). */
export function avatarBadge(size = 56) {
  const el = h('a', { class: 'avatar-badge', href: '#/avatar', title: 'Your explorer: tap to customise', html: avatarSVG(avatar(), { size, uid: `ab${uidN++}` }) });
  const redraw = () => {
    if (!el.isConnected) { document.removeEventListener('ivory:avatar', redraw); return; }
    el.innerHTML = avatarSVG(avatar(), { size, uid: `ab${uidN++}` });
  };
  document.addEventListener('ivory:avatar', redraw);
  return el;
}

export function renderAvatar(root) {
  let part = 'skin';
  const page = h('div', { class: 'page avatar-page' });
  root.append(page);
  const preview = h('div', { class: 'av-preview' });
  const tabs = h('div', { class: 'av-tabs' });
  const grid = h('div', { class: 'av-grid' });
  const colours = h('div', { class: 'av-colours' });

  const drawPreview = () => { preview.innerHTML = avatarSVG(avatar(), { size: 220, uid: 'avbig' }); };
  const drawTabs = () => tabs.replaceChildren(...PARTS.map((p) => h('button', { class: `chip-btn ${p.id === part ? 'on' : ''}`, onclick: () => { part = p.id; drawAll(); } }, p.name)));

  function option(it) {
    const mine = avatarOwned(it);
    const on = avatar()[it.part] === it.id;
    const ev = it.event ? eventOf(it) : null;
    if (ev && !mine && !eventItemAvailable(it)) return null; // unreleased or gone seasonal rares stay hidden
    const rp = it.req && !mine ? reqProgress(it.req) : null;
    const thumb = h('span', { class: 'av-thumb', html: avatarSVG({ ...avatar(), [it.part]: it.id }, { size: 78, uid: `avt${uidN++}` }) });
    // Not yours yet: a slightly darker preview that says how to get it.
    const tag = mine ? null : rp && !rp.met ? h('span', { class: 'av-tag lock' }, ['\u{1F512} ', reqText(it.req)])
      : h('span', { class: `av-tag ${ev ? 'rare' : ''}`, style: ev ? { '--ev': ev.tint } : {} }, `${ev ? `${ev.emoji} ` : '\u{1F6CD}\uFE0F '}Buy in the Shop \u00b7 ${it.price.toLocaleString('en-US')} ${SYMBOL}`);
    return h('button', {
      class: `av-opt ${on ? 'on' : ''} ${mine ? '' : 'locked'}`,
      title: it.name,
      onclick: () => {
        if (mine) { setAvatar({ [it.part]: it.id }); drawAll(); return; }
        if (rp && !rp.met) { toast(`\u{1F512} ${it.name}: ${reqText(it.req)} to unlock it, then buy it in the Shop.`); return; }
        // Take them to it in the Shop.
        try { sessionStorage.setItem('ivory.shopFocus', it.id); } catch { /* storage blocked */ }
        location.hash = '#/shop';
      },
    }, [thumb, h('small', {}, it.name), tag]);
  }

  function swatches(label, key, list) {
    const cur = avatar()[key];
    return h('div', { class: 'av-swatch-row' }, [h('b', {}, label), h('div', { class: 'swatches' }, list.map((c) => h('button', { class: `swatch ${cur === c ? 'on' : ''}`, style: { background: c }, 'aria-label': `${label} ${c}`, onclick: () => { setAvatar({ [key]: c }); drawAll(); } })))]);
  }

  /** Highlights: none, from the tips up, or from the roots down, with how far they go. */
  function highlights() {
    const a = avatar();
    const mode = a.hlMode || 'off';
    const seg = h('div', { class: 'seg av-hl-mode' }, [['off', 'No highlights'], ['tips', 'From the tips'], ['roots', 'From the roots']].map(([v, l]) => h('button', { class: mode === v ? 'on' : '', onclick: () => { setAvatar({ hlMode: v }); drawAll(); } }, l)));
    const lenOut = h('output', {}, `${a.hlLen ?? 40}%`);
    const slider = h('input', { type: 'range', min: 5, max: 100, step: 5, value: a.hlLen ?? 40, disabled: mode === 'off', oninput: (e) => { lenOut.textContent = `${e.target.value}%`; setAvatar({ hlLen: +e.target.value }); drawPreview(); }, onchange: () => drawAll() });
    return h('div', { class: 'av-hl' }, [
      h('div', { class: 'av-swatch-row' }, [h('b', {}, 'Highlights'), seg]),
      mode === 'off' ? null : swatches('Highlight colour', 'hlColor', HIGHLIGHT_COLORS),
      mode === 'off' ? null : h('label', { class: 'av-swatch-row av-hl-len' }, [h('b', {}, mode === 'tips' ? 'How far up' : 'How far down'), slider, lenOut]),
    ]);
  }

  function drawAll() {
    drawPreview();
    drawTabs();
    const items = allItems().filter((it) => it.part === part);
    // Yours first, then everything else.
    items.sort((x, y) => avatarOwned(y) - avatarOwned(x));
    grid.replaceChildren(...items.map(option).filter(Boolean));
    colours.replaceChildren(
      ...(part === 'hair' || part === 'facial' ? [swatches('Hair colour', 'hairColor', HAIR_COLORS)] : []),
      ...(part === 'hair' ? [highlights()] : []),
      ...(part === 'clothes' || part === 'hat' ? [swatches('Clothes colour', 'clothesColor', CLOTHES_COLORS)] : []),
      swatches('Background', 'bg', BG_COLORS),
    );
  }

  const randomize = () => {
    const pick = (p) => { const mine = allItems().filter((it) => it.part === p && avatarOwned(it)); return mine[Math.floor(Math.random() * mine.length)].id; };
    const r = (l) => l[Math.floor(Math.random() * l.length)];
    setAvatar({ skin: pick('skin'), hair: pick('hair'), eyes: pick('eyes'), ears: pick('ears'), facial: Math.random() < 0.7 ? 'facial-none' : pick('facial'), clothes: pick('clothes'), hat: Math.random() < 0.6 ? 'hat-none' : pick('hat'), hairColor: r(HAIR_COLORS.slice(0, 12)), clothesColor: r(CLOTHES_COLORS), bg: r(BG_COLORS) });
    drawAll();
  };

  page.append(
    h('header', { class: 'top' }, [
      h('div', {}, [h('a', { class: 'back-link', href: '#/learn' }, [icon('back'), 'Learn']), h('div', { class: 'eyebrow' }, 'Your explorer'), h('h1', {}, displayName() || 'Explorer')]),
      walletPill('big'),
    ]),
    h('div', { class: 'av-layout' }, [
      h('div', { class: 'av-side' }, [preview, h('button', { class: 'btn ghost', onclick: randomize }, '\u{1F3B2} Surprise me'), h('p', { class: 'muted small' }, 'Every look is for everyone. Changes save automatically.')]),
      h('div', { class: 'av-main' }, [tabs, colours, grid]),
    ]),
  );
  drawAll();
}
