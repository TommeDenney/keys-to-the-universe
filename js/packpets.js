// Pets from your personal pack join the Pet shop on this device, as a gift (they're
// never part of the public app). Run once at start-up, before cosmetics apply.

import { personalPets } from './personal.js';
import { PETS } from './data/rewards.js';
import { SHOP } from './data/shop.js';
import { getState, saveState } from './store.js';

export function registerPackPets() {
  const pets = personalPets();
  if (!pets.length) return;
  const w = getState().wallet;
  for (const p of pets) {
    if (PETS.some((x) => x.id === p.id)) continue;
    const it = { id: p.id, cat: 'pet', type: 'land', name: String(p.name || 'Friend').slice(0, 30), desc: String(p.desc || '').slice(0, 160), look: p.look, price: 0, personal: true };
    PETS.push(it);
    SHOP.push(it);
    if (w && !w.owned.includes(p.id)) w.owned.push(p.id);
  }
  saveState();
}
