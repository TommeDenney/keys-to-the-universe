// Shop: spend Stardust ✦ on ships, ambience, effects, keyboard themes and key presses.

import { h, icon, toast } from '../ui.js';
import { SHOP, CATEGORIES } from '../data/shop.js';
import { balance, owns, buy, equip, equipped, walletPill, SYMBOL, backpay, REWARD } from '../economy.js';
import { shipSVG } from '../render/ships.js';
import { startAmbient, stopAmbient } from '../audio/ambient.js';
import { Keyboard } from '../render/keyboard.js';
import { applyCosmetics } from '../cosmetics.js';
import { reqProgress, reqText, badges } from '../achievements.js';
import { rewardLook } from '../data/rewards.js';
import { petHTML } from '../render/pets.js';
import { fxRing } from './universe.js';
import { specialBosses } from './specialboss.js';
import { personalItemName } from '../personal.js';

// Exclusive items only show up when a special boss (from a personal pack) offers them.
const offered = (id) => specialBosses().some((b) => b.reward === id);
const displayName = (it) => personalItemName(it.id) || it.name;

export function renderShop(root) {
  const page = h('div', { class: 'page shop' });
  root.append(page);
  const kbs = [];
  let previewT = 0;
  const bp = backpay();

  const draw = () => {
    kbs.splice(0).forEach((k) => k.destroy());
    page.replaceChildren(
      h('header', { class: 'top' }, [
        h('div', {}, [h('div', { class: 'eyebrow' }, 'Spend your Stardust'), h('h1', {}, 'Shop')]),
        walletPill('big'),
      ]),
      bp ? h('div', { class: 'shop-note pop' }, [h('b', {}, `+${bp} ${SYMBOL} credited!`), ` Stardust for the progress you made before the Shop opened.`]) : null,
      (() => {
        const all = badges();
        const got = all.filter((b) => b.met).length;
        const ready = SHOP.filter((it) => it.req && !owns(it.id) && reqProgress(it.req).met);
        return h('div', { class: 'achv-top' }, [
          h('a', { class: 'achv-badges', href: '#/badges' }, [h('span', { class: 'ab-icon' }, '\u{1F396}\uFE0F'), h('span', {}, [h('b', {}, 'Badges'), h('small', {}, `${got} of ${all.length} earned`)]), icon('chevron')]),
          ready.length ? h('div', { class: 'achv-ready' }, [h('b', {}, `\u{1F381} ${ready.length} achievement reward${ready.length === 1 ? '' : 's'} ready to buy`), h('div', { class: 'achv-chips' }, ready.slice(0, 8).map((it) => h('button', { class: 'chip-btn', onclick: () => { const c = page.querySelector(`[data-item="${it.id}"]`); if (c) { c.scrollIntoView({ block: 'center', behavior: 'smooth' }); c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); } } }, it.name)))]) : null,
        ]);
      })(),
      h('div', { class: 'earn-card' }, [
        h('b', {}, `How to earn ${SYMBOL}`),
        h('div', { class: 'earn-grid' }, [
          earnRow('Complete a world', `${REWARD.lessonBase}–${REWARD.lessonBase + 3 * REWARD.lessonPerStar}`),
          earnRow('Defeat a Guardian', `${REWARD.bossBase}–${REWARD.bossBase + 3 * REWARD.bossPerStar}`),
          earnRow('Song practice steps', `${REWARD.songStepPerStar} per star`),
          earnRow('Master a song (3★ with the beat)', `+${REWARD.songMastered}`),
          earnRow('Daily streak', `${REWARD.dailyPerStreakDay}–70`),
          earnRow('Rogue-planet side quests', 'big rewards'),
        ]),
      ]),
      ...CATEGORIES.map((c) => h('section', { class: 'shop-cat' }, [
        h('h2', {}, c.name),
        h('p', { class: 'muted' }, c.blurb),
        h('div', { class: 'shop-grid' }, SHOP.filter((it) => it.cat === c.id && !it.req && (!it.exclusive || owns(it.id) || offered(it.id))).map(card)),
        SHOP.some((it) => it.cat === c.id && it.req) ? h('h3', { class: 'achv-head' }, [h('span', {}, '\u{1F3C6}'), ' Achievement rewards ', h('small', { class: 'muted' }, 'Earn the right, then buy with Stardust')]) : null,
        h('div', { class: 'shop-grid' }, SHOP.filter((it) => it.cat === c.id && it.req).map(card)),
      ])),
    );
  };

  function earnRow(what, amt) {
    return h('div', { class: 'earn-row' }, [h('span', {}, what), h('b', {}, [amt, ' ', SYMBOL])]);
  }

  function card(it) {
    const have = owns(it.id);
    const on = equipped(it.cat) === it.id;
    const afford = balance() >= it.price;
    const preview = h('div', { class: `shop-preview prev-${it.cat}` });
    fillPreview(it, preview);
    if (it.req && !have) {
      const rp = reqProgress(it.req);
      const tag = h('span', { class: 'achv-tag' }, rp.met ? '\u2713 Unlocked' : '\u{1F512} Achievement');
      const req = h('div', { class: 'achv-req' }, [h('span', {}, `${reqText(it.req)} (${rp.value.toLocaleString('en-US')}/${rp.goal.toLocaleString('en-US')})`), h('div', { class: 'achv-bar' }, h('i', { style: { width: `${(rp.value / rp.goal) * 100}%` } }))]);
      const buyBtn = rp.met
        ? h('button', { class: `btn ${afford ? 'primary' : 'ghost'} sm`, onclick: () => {
          if (!buy(it)) { toast(`You need ${it.price - balance()} more ${SYMBOL}. Keep playing!`, 'bad'); return; }
          equip(it.cat, it.id); applyCosmetics(); toast(`${it.name} unlocked and equipped!`, 'ok'); draw();
        } }, [h('span', { class: 'sd' }, SYMBOL), String(it.price)])
        : h('button', { class: 'btn ghost sm', disabled: true }, [icon('lock'), h('span', { class: 'sd' }, SYMBOL), String(it.price)]);
      return h('div', { class: `shop-item achv ${rp.met ? 'met' : 'locked'}`, 'data-item': it.id }, [preview, h('div', { class: 'shop-meta' }, [tag, h('b', {}, displayName(it)), h('span', {}, it.desc), req]), h('div', { class: 'shop-buy' }, [buyBtn])]);
    }
    if (it.exclusive && !have) {
      const preview = h('div', { class: `shop-preview prev-${it.cat}` });
      fillPreview(it, preview);
      return h('div', { class: 'shop-item exclusive' }, [preview, h('div', { class: 'shop-meta' }, [h('b', {}, displayName(it)), h('span', {}, it.desc)]), h('div', { class: 'shop-buy' }, [h('span', { class: 'badge warn' }, [icon('lock'), ` ${it.exclusive}`])])]);
    }
    const btn = on
      ? h('button', { class: 'btn ghost sm', disabled: true }, [icon('check'), 'Equipped'])
      : have
        ? h('button', { class: 'btn primary sm', onclick: () => { equip(it.cat, it.id); applyCosmetics(); toast(`${it.name} equipped`, 'ok'); draw(); } }, 'Equip')
        : h('button', {
          class: `btn ${afford ? 'primary' : 'ghost'} sm`,
          onclick: () => {
            if (!buy(it)) { toast(`You need ${it.price - balance()} more ${SYMBOL}. Keep playing!`, 'bad'); return; }
            equip(it.cat, it.id);
            applyCosmetics();
            toast(`${it.name} unlocked and equipped!`, 'ok');
            draw();
          },
        }, [h('span', { class: 'sd' }, SYMBOL), String(it.price)]);
    return h('div', { class: `shop-item ${on ? 'on' : ''} ${have ? 'owned' : ''} ${it.req ? 'achv met' : ''}`, 'data-item': it.id }, [
      preview,
      h('div', { class: 'shop-meta' }, [h('b', {}, displayName(it)), h('span', {}, it.desc)]),
      h('div', { class: 'shop-buy' }, [it.price === 0 && !have ? h('span', { class: 'muted small' }, 'Free') : null, btn]),
    ]);
  }

  function fillPreview(it, el) {
    if (it.cat === 'ship') {
      el.innerHTML = `<div class="ship-demo">${shipSVG(it.id)}</div>`;
    } else if (it.cat === 'pet') {
      el.append(h('div', { class: 'pet-demo', html: petHTML(it.id) || '<span class="pet-none">Solo</span>' }));
    } else if (it.cat === 'fx') {
      const L = rewardLook(it.id);
      el.append(h('div', { class: `fx-demo ${it.id}`, style: L ? { '--size': '70px' } : {} }, L ? [h('i', { class: 'demo-orb', style: { boxShadow: L.eclipse ? '0 0 0 2px #fff, 0 0 20px 6px #fff' : `0 0 20px ${L.aura}, inset -8px -8px 18px rgba(0,0,0,.5)`, filter: L.eclipse ? 'brightness(.3)' : '' } }), ...fxRing(L)] : [h('i', { class: 'demo-orb' }), h('i', { class: 'demo-fx' })]));
    } else if (it.cat === 'amb') {
      const b = h('button', { class: 'chip-btn', onclick: () => {
        clearTimeout(previewT);
        if (b.classList.contains('on')) { stopAmbient(); b.classList.remove('on'); return; }
        page.querySelectorAll('.prev-amb .chip-btn.on').forEach((x) => x.classList.remove('on'));
        startAmbient(it.id);
        b.classList.add('on');
        previewT = setTimeout(() => { stopAmbient(); b.classList.remove('on'); }, 12000);
      } }, [icon('ear'), it.id === 'amb-none' ? 'Silence' : 'Preview']);
      el.append(h('div', { class: `amb-art ${it.id}` }), b);
    } else if (it.cat === 'starc') {
      const d = h('div', { class: `star-demo starc-${it.id.slice(5)}`, html: '<span class="star on"><svg viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="currentColor"/></svg></span>'.repeat(3) });
      el.append(d);
    } else if (it.cat === 'trail') {
      const glyph = it.id === 'trail-notes' ? '\u266A \u266B \u2669 ' : it.id === 'trail-stars' ? '\u2726 ' : (rewardLook(it.id) || {}).glyph || '';
      el.innerHTML = `<svg viewBox="0 0 200 90" class="route ${it.id}" style="width:100%;height:100%"><path id="p-${it.id}" d="M10 70 C60 70 60 20 110 20 S170 70 190 30" class="route-glow"/><path d="M10 70 C60 70 60 20 110 20 S170 70 190 30" class="route-dash"/>${glyph ? `<text class="route-text"><textPath href="#p-${it.id}">${glyph.repeat(12)}</textPath></text>` : ''}</svg>`;
    } else if (it.cat === 'sheet') {
      const L = rewardLook(it.id);
      const th = L ? [L.paper, L.ink, L.line] : { 'sheet-classic': ['#fff', '#262340', '#B9B6CC'], 'sheet-parchment': ['#F6ECD6', '#3B2F25', '#C9B79A'], 'sheet-night': ['#17152E', '#ECEAF8', '#4C4874'], 'sheet-blueprint': ['#0F3D70', '#EAF3FF', '#5E8EC4'] }[it.id];
      el.innerHTML = `<svg viewBox="0 0 200 90" style="width:100%;height:100%"><rect width="200" height="90" fill="${th[0]}"/>${[25, 35, 45, 55, 65].map((y) => `<line x1="10" x2="190" y1="${y}" y2="${y}" stroke="${th[2]}"/>`).join('')}${[[50, 50], [80, 40], [110, 45], [140, 30], [170, 55]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4.5" fill="${th[1]}" transform="rotate(-20 ${x} ${y})"/><line x1="${x + 5.5}" x2="${x + 5.5}" y1="${y}" y2="${y - 28}" stroke="${th[1]}" stroke-width="1.6"/>`).join('')}</svg>`;
    } else if (it.cat === 'kb') {
      const k = h('div', { class: `kb-demo kbt-${it.id.slice(3)}` });
      el.append(k);
      requestAnimationFrame(() => kbs.push(new Keyboard(k, { lo: 60, hi: 71, labels: 'none', interactive: false })));
    } else if (it.cat === 'press') {
      const k = h('div', { class: `kb-demo press-${it.id.slice(6)}` });
      el.append(k);
      requestAnimationFrame(() => {
        const kb = new Keyboard(k, { lo: 60, hi: 71, labels: 'none', interactive: false, press: it.id });
        kbs.push(kb);
        let n = 0;
        const loop = () => { if (!document.contains(k)) return; kb.flash([60, 64, 67, 72, 62, 65][n++ % 6], 'good', 380); setTimeout(loop, 700); };
        setTimeout(loop, 300 + Math.random() * 400);
      });
    }
  }

  draw();
  return () => { kbs.forEach((k) => k.destroy()); stopAmbient(); clearTimeout(previewT); };
}
