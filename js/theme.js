// Background themes: only the page background changes; cards, icons, sheet
// music and the keyboard keep their look.

import { settings } from './store.js';

export const THEMES = [
  { id: 'lavender', name: 'Lavender', bg: '#F5F4FB' },
  { id: 'sky', name: 'Sky', bg: '#E9F2FF' },
  { id: 'mint', name: 'Mint', bg: '#E7F6EF' },
  { id: 'peach', name: 'Peach', bg: '#FFF1E7' },
  { id: 'rose', name: 'Rose', bg: '#FCECF2' },
  { id: 'sand', name: 'Sand', bg: '#F4EEE3' },
  { id: 'slate', name: 'Slate', bg: '#2B2F45', dark: true },
  { id: 'midnight', name: 'Midnight', bg: '#16132E', dark: true },
  { id: 'forest', name: 'Forest', bg: '#12291F', dark: true },
  { id: 'cocoa', name: 'Cocoa', bg: '#2A1E1A', dark: true },
];

export function applyTheme(id = settings.get('theme')) {
  const t = THEMES.find((x) => x.id === id) || THEMES[0];
  const root = document.documentElement;
  if (t.id === 'lavender') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', t.id);
  root.toggleAttribute('data-dark', !!t.dark);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t.bg);
  const sb = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (sb) sb.setAttribute('content', t.dark ? 'black-translucent' : 'default');
}
