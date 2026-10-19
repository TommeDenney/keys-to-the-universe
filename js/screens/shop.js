// Shop: spend Stardust ✦ on ships, ambience, effects, keyboard themes and key presses.

import { h, icon, toast } from '../ui.js';
import { SHOP, CATEGORIES } from '../data/shop.js';
import { balance, owns, buy, equip, equipped, walletPill, SYMBOL, backpay, REWARD } from '../economy.js';
import { shipSVG } from '../render/ships.js';
import { startAmbient, stopAmbient } from '../audio/ambient.js';
import { Keyboard } from '../render/keyboard.js';
import { applyCosmetics } from '../cosmetics.js';

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
        h('div', { class: 'shop-grid' }, SHOP.filter((it) => it.cat === c.id).map(card)),
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
    if (it.exclusive && !have) {
      const preview = h('div', { class: `shop-preview prev-${it.cat}` });
      fillPreview(it, preview);
      return h('div', { class: 'shop-item exclusive' }, [preview, h('div', { class: 'shop-meta' }, [h('b', {}, it.name), h('span', {}, it.desc)]), h('div', { class: 'shop-buy' }, [h('span', { class: 'badge warn' }, [icon('lock'), ` ${it.exclusive}`])])]);
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
    return h('div', { class: `shop-item ${on ? 'on' : ''} ${have ? 'owned' : ''}` }, [
      preview,
      h('div', { class: 'shop-meta' }, [h('b', {}, it.name), h('span', {}, it.desc)]),
      h('div', { class: 'shop-buy' }, [it.price === 0 && !have ? h('span', { class: 'muted small' }, 'Free') : null, btn]),
    ]);
  }

  function fillPreview(it, el) {
    if (it.cat === 'ship') {
      el.innerHTML = `<div class="ship-demo">${shipSVG(it.id)}</div>`;
    } else if (it.cat === 'fx') {
      el.append(h('div', { class: `fx-demo ${it.id}` }, [h('i', { class: 'demo-orb' }), h('i', { class: 'demo-fx' })]));
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
