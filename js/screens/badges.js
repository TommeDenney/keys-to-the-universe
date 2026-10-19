// Badges: everything you've achieved, grouped, with progress toward the next ones.

import { h, icon } from '../ui.js';
import { badges, BADGE_GROUPS, lifetime } from '../achievements.js';
import { saveState } from '../store.js';

export function renderBadges(root) {
  const all = badges();
  const fresh = new Set(lifetime().newBadges || []);
  lifetime().newBadges = [];
  saveState();
  const got = all.filter((b) => b.met).length;
  const fmt = (x) => x.toLocaleString('en-US');
  const badgeEl = (b) => h('div', { class: `badge-card tier-${b.tier} ${b.met ? 'earned' : 'locked'} ${fresh.has(b.id) ? 'fresh' : ''}`, title: b.text }, [
    h('div', { class: 'badge-medal' }, [h('i', { class: 'medal-ring' }), h('span', {}, b.met ? b.icon : '\u{1F512}')]),
    h('b', {}, b.name),
    h('small', {}, b.text),
    b.met ? h('span', { class: 'badge-done' }, fresh.has(b.id) ? 'New!' : 'Earned') : h('div', { class: 'achv-bar' }, h('i', { style: { width: `${(b.value / b.goal) * 100}%` } })),
    b.met ? null : h('small', { class: 'badge-prog' }, `${fmt(b.value)} / ${fmt(b.goal)}`),
  ]);
  const page = h('div', { class: 'page badges-page' }, [
    h('header', { class: 'top' }, [
      h('div', {}, [h('a', { class: 'back-link', href: '#/shop' }, [icon('back'), 'Shop']), h('div', { class: 'eyebrow' }, 'Achievements'), h('h1', {}, 'Badges')]),
      h('div', { class: 'badge-total' }, [h('b', {}, `${got}`), h('span', {}, `of ${all.length}`)]),
    ]),
    h('div', { class: 'badge-tiers' }, ['bronze', 'silver', 'gold', 'cosmic'].map((t) => h('span', { class: `tier-chip tier-${t}` }, `${t[0].toUpperCase()}${t.slice(1)} ${all.filter((b) => b.tier === t && b.met).length}/${all.filter((b) => b.tier === t).length}`))),
    ...BADGE_GROUPS.map((g) => {
      const list = all.filter((b) => b.group === g);
      if (!list.length) return null;
      // Earned first, then closest to done.
      list.sort((a, b) => (b.met - a.met) || (b.value / b.goal - a.value / a.goal));
      return h('section', { class: 'badge-group' }, [
        h('h2', {}, [g, h('small', { class: 'muted' }, ` ${list.filter((b) => b.met).length}/${list.length}`)]),
        h('div', { class: 'badge-grid' }, list.map(badgeEl)),
      ]);
    }),
  ]);
  root.append(page);
}
