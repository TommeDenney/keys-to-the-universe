// Your profile (name, birthday, optional birth year and experience) and the
// birthday gift. The profile is part of your progress, so it syncs to Drive.

import { getState, saveState } from './store.js';
import { earn } from './economy.js';
import { account } from './cloud.js';
import { DEFAULT_AVATAR } from './data/avatar.js';

export const BIRTHDAY_GIFT = 10000;
export const LEVELS = [['new', 'Brand new to piano'], ['little', 'I know a little'], ['some', 'I’ve played for a while'], ['lots', 'I play a lot']];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const profile = () => getState().profile || null;

export function age(p = profile(), now = new Date()) {
  if (!p || !p.birthYear || !p.birthMonth || !p.birthDay) return null;
  let a = now.getFullYear() - p.birthYear;
  if (now.getMonth() + 1 < p.birthMonth || (now.getMonth() + 1 === p.birthMonth && now.getDate() < p.birthDay)) a--;
  return a >= 0 && a < 130 ? a : null;
}

/** The birthday can be set, then changed once more (so it can't be moved around for extra gifts). */
export const birthdayLocked = (p = profile()) => !!(p && p.birthMonth && (p.birthdayChanges || 0) >= 1);

export function saveProfile({ name, birthMonth, birthDay, birthYear, level }) {
  const st = getState();
  const prev = st.profile || {};
  const changedBirthday = prev.birthMonth && (prev.birthMonth !== birthMonth || prev.birthDay !== birthDay);
  if (changedBirthday && birthdayLocked(prev)) { birthMonth = prev.birthMonth; birthDay = prev.birthDay; }
  st.profile = {
    ...prev,
    name: String(name || '').trim().slice(0, 30),
    birthMonth: birthMonth || null, birthDay: birthDay || null,
    birthYear: birthYear || null, level: level || prev.level || null,
    birthdayChanges: (prev.birthdayChanges || 0) + (changedBirthday && !birthdayLocked(prev) ? 1 : 0),
    birthdaySetOn: changedBirthday || !prev.birthMonth ? Date.now() : prev.birthdaySetOn,
    createdAt: prev.createdAt || Date.now(),
  };
  saveState();
  return st.profile;
}

export const displayName = () => (profile() && profile().name) || (account() && account().name) || '';

const isBirthday = (p, d) => {
  if (!p || !p.birthMonth || !p.birthDay) return false;
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (p.birthMonth === m && p.birthDay === day) return true;
  // Leap-day birthdays are celebrated on Feb 28 in other years.
  const leap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  return p.birthMonth === 2 && p.birthDay === 29 && m === 2 && day === 28 && !leap(d.getFullYear());
};

/**
 * Once a year on your birthday (signed in, birthday set before today): +10,000 ✦.
 * Returns true when the gift was just given.
 */
export function claimBirthday(now = new Date()) {
  const p = profile();
  if (!account() || !isBirthday(p, now)) return false;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (!p.birthdaySetOn || p.birthdaySetOn >= startOfToday) return false;
  const st = getState();
  st.birthdayGifts ||= [];
  if (st.birthdayGifts.includes(now.getFullYear())) return false;
  st.birthdayGifts.push(now.getFullYear());
  saveState();
  earn(BIRTHDAY_GIFT, 'Happy birthday!');
  return true;
}

// ---- Explorer look (profile picture) ------------------------------------------------
export const avatar = () => ({ ...DEFAULT_AVATAR, ...(getState().avatar || {}) });
export function setAvatar(changes) {
  const st = getState();
  st.avatar = { ...avatar(), ...changes };
  saveState();
  document.dispatchEvent(new CustomEvent('ivory:avatar'));
}
