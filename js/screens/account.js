// Account screens: the sign-in welcome, the profile form, the "which save?" choice,
// the birthday celebration, and the Account card in Settings.

import { h, icon, modal, toast } from '../ui.js';
import { getState, saveState } from '../store.js';
import {
  cloudConfigured, account, onAccount, signIn, signOut, setRemember, syncNow, locateSave,
  pickerAvailable, pickSave, googleGivenName, summarize, olderSaves, useSave, undoInfo, undoLastSync,
} from '../cloud.js';
import { profile, saveProfile, age, birthdayLocked, LEVELS, MONTHS, BIRTHDAY_GIFT, displayName } from '../profile.js';
import { SYMBOL } from '../economy.js';

const G_LOGO = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

function googleButton(label = 'Sign in with Google', remember) {
  return h('button', { class: 'gsi-btn', onclick: () => signIn({ remember: remember ? remember() : true }) }, [h('span', { class: 'gsi-logo', html: G_LOGO }), h('span', {}, label)]);
}

/** The welcome screen offered on first launch (once), when accounts are switched on. */
export function maybeOfferSignIn() {
  if (!cloudConfigured() || account()) return;
  const st = getState();
  // Ask again about once a week (existing players too), until you sign in or say "don't ask".
  if (st.settings.signInNever) return;
  if (st.settings.signInOfferedAt && Date.now() - st.settings.signInOfferedAt < 7 * 864e5) return;
  st.settings.signInOfferedAt = Date.now();
  saveState();
  openSignIn();
}

const hasLocalProgress = () => { const s = getState(); return Object.keys(s.lessons || {}).length > 0 || ((s.wallet && s.wallet.earned) || 0) > 0; };

export function openSignIn() {
  let remember = true;
  modal((close) => [h('div', { class: 'signin-modal' }, [
    h('div', { class: 'signin-emblem' }, '\u{1F30C}'),
    h('h2', {}, 'Save your journey'),
    h('p', {}, 'Sign in with Google to keep your progress, Stardust and collection safe in your own Google Drive, and pick up where you left off on any device. No password for this app: Google signs you in.'),
    googleButton('Sign in with Google', () => remember),
    h('label', { class: 'signin-remember' }, [h('input', { type: 'checkbox', checked: true, onchange: (e) => { remember = e.target.checked; } }), ' Remember this device for 30 days']),
    hasLocalProgress() ? h('p', { class: 'signin-note' }, '\u2728 Your progress on this device comes with you: it\u2019s saved to your Drive when you sign in.') : null,
    h('div', { class: 'row' }, [
      h('button', { class: 'btn ghost', onclick: close }, 'Continue as a guest'),
      h('button', { class: 'btn ghost sm', onclick: () => { getState().settings.signInNever = true; saveState(); close(); } }, 'Don\u2019t ask again'),
    ]),
    h('p', { class: 'muted small' }, 'Playing as a guest saves on this device only. Under 13? Ask a parent or guardian to help you sign in. Your saves go to a "Keys to the Universe" folder in your Drive; the app can only see files it creates there.'),
    h('p', { class: 'muted small legal-note' }, ['By signing in you agree to the ', h('a', { href: 'terms.html', target: '_blank', rel: 'noopener' }, 'Terms of Service'), ' and ', h('a', { href: 'privacy.html', target: '_blank', rel: 'noopener' }, 'Privacy Policy'), '.']),
  ])]);
}

/** Name, birthday and a little about you. `first` = right after the first sign-in. */
export function openProfile({ first = false, done } = {}) {
  const p = profile() || {};
  const locked = birthdayLocked(p);
  modal((close) => {
    const name = h('input', { type: 'text', class: 'pf-input', maxlength: 30, value: p.name || googleGivenName(), placeholder: 'Your name' });
    const month = h('select', { class: 'pf-input', disabled: locked }, [h('option', { value: '' }, 'Month'), ...MONTHS.map((m, i) => h('option', { value: i + 1, selected: p.birthMonth === i + 1 }, m))]);
    const day = h('select', { class: 'pf-input', disabled: locked }, [h('option', { value: '' }, 'Day'), ...Array.from({ length: 31 }, (_, i) => h('option', { value: i + 1, selected: p.birthDay === i + 1 }, String(i + 1)))]);
    const year = h('input', { type: 'number', class: 'pf-input', min: 1900, max: new Date().getFullYear(), value: p.birthYear || '', placeholder: 'Birth year (optional)' });
    let level = p.level || null;
    const levels = h('div', { class: 'pf-levels' }, LEVELS.map(([id, label]) => h('button', { class: `chip-btn ${level === id ? 'on' : ''}`, onclick: (e) => { level = id; e.target.parentNode.querySelectorAll('.chip-btn').forEach((b) => b.classList.toggle('on', b === e.target)); } }, label)));
    const save = () => {
      if (!name.value.trim()) { toast('Add a name (a nickname is fine).', 'bad'); return; }
      saveProfile({ name: name.value, birthMonth: +month.value || null, birthDay: +day.value || null, birthYear: +year.value || null, level });
      close();
      toast(`Nice to meet you, ${profile().name}!`, 'ok');
      if (done) done();
    };
    const a = age(p);
    return [h('div', { class: 'profile-modal' }, [
      h('h2', {}, first ? 'Tell us about you' : 'Your profile'),
      h('p', { class: 'muted' }, `Only you can see this. It’s saved with your progress in your own Google Drive. On your birthday you get a gift of ${BIRTHDAY_GIFT.toLocaleString('en-US')} ${SYMBOL}!`),
      h('label', { class: 'field' }, [h('span', {}, 'Name'), name]),
      h('div', { class: 'field' }, [h('span', {}, ['Birthday', locked ? h('small', { class: 'muted' }, '  (already changed once, so it’s locked)') : null]), h('div', { class: 'pf-row' }, [month, day])]),
      h('label', { class: 'field' }, [h('span', {}, ['Birth year ', h('small', { class: 'muted' }, 'optional, for your age')]), year]),
      a != null && a < 13 ? h('p', { class: 'pf-kid' }, '\u{1F468}‍\u{1F469}‍\u{1F467} Please make sure a parent or guardian knows you’re using this account.') : null,
      h('div', { class: 'field' }, [h('span', {}, 'Your piano experience'), levels]),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn ghost', onclick: () => { close(); if (done) done(); } }, first ? 'Skip for now' : 'Cancel'),
        h('button', { class: 'btn primary', onclick: save }, 'Save'),
      ]),
    ])];
  });
}

/** Both this device and Drive have progress: which one wins? */
/** One save, described so you can recognise it: stars, Stardust, explorer and when. */
function saveLine(sm) {
  const when = sm.updatedAt ? new Date(sm.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'unknown time';
  return `${sm.stars} stars · ${sm.stardust.toLocaleString('en-US')} ${SYMBOL} · ${sm.worlds} worlds · ${sm.avatar ? 'custom explorer' : 'default explorer'} · ${when}`;
}

/** What one save is missing compared with the other (to spot a stale or wrong save). */
function lacks(x, y) {
  const out = [];
  if (x.stars < y.stars) out.push(`${y.stars - x.stars} fewer stars`);
  if (x.worlds < y.worlds) out.push(`${y.worlds - x.worlds} fewer planets completed`);
  if (x.earned < y.earned - 1) out.push(`${(y.earned - x.earned).toLocaleString('en-US')} less ${SYMBOL} earned`);
  if (!x.avatar && y.avatar) out.push('default explorer');
  return out;
}

/**
 * Two different saves: you choose, and nothing is lost. A copy of both is already
 * kept in Drive. "Combine both" keeps the best of each. Closing changes nothing.
 */
export function chooseSave({ local, remote }) {
  const L = summarize(local), R = summarize(remote);
  const lLacks = lacks(L, R), rLacks = lacks(R, L);
  const best = lLacks.length && rLacks.length ? 'combine' : lLacks.length ? 'remote' : rLacks.length ? 'local' : 'combine';
  const opt = (key, title, sm, missing, extra) => h('button', { class: `choose-opt ${best === key ? 'more' : ''}`, onclick: () => ok(key) }, [
    h('b', {}, [title, best === key ? h('span', { class: 'rec' }, 'Recommended') : null]),
    sm ? h('small', {}, saveLine(sm)) : null,
    extra ? h('small', {}, extra) : null,
    missing && missing.length ? h('small', { class: 'warn' }, `Looks behind: ${missing.join(', ')}`) : null,
  ]);
  let ok, close;
  return new Promise((resolve) => modal((c) => {
    close = c;
    ok = (v) => { resolve(v); close(); };
    return [h('div', { class: 'choose-modal' }, [
      h('h2', {}, 'Your saves don’t match'),
      h('p', { class: 'muted' }, 'This device and your Google Drive have different progress. A copy of both has been kept in your Drive, so nothing is lost whichever you pick.'),
      opt('combine', 'Combine both', null, null, `Best of each: ${Math.max(L.stars, R.stars)}+ stars, the higher ${SYMBOL} balance, everything you own on either device, and your custom explorer.`),
      opt('remote', 'Use Google Drive', R, rLacks),
      opt('local', 'Use this device', L, lLacks),
      h('p', { class: 'muted small' }, 'Not sure? Close this: nothing changes until you choose. Older versions and the kept copies are in Settings › Account › Find an older save.'),
    ])];
  }, { onClose: () => resolve(null) }));
}

/** Older versions of your Drive save (and any duplicate save files): bring one back. */
export async function openOlderSaves() {
  let list = null, error = null;
  const m = modal((close) => {
    const body = h('div', { class: 'older-saves' }, [h('p', { class: 'muted' }, 'Looking through your Google Drive…')]);
    olderSaves().then((l) => { list = l; draw(); }).catch((e) => { error = e.message; draw(); });
    function draw() {
      if (error) { body.replaceChildren(h('p', {}, error)); return; }
      if (!list.length) { body.replaceChildren(h('p', {}, 'No older saves found.')); return; }
      body.replaceChildren(...list.map((v) => h('div', { class: 'older-save' }, [
        h('div', { class: 'grow' }, [h('b', {}, new Date(v.at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })), h('small', {}, `${v.kind === 'version' ? 'Drive version' : 'Another save file'} · ${saveLine(v.summary)}`)]),
        h('button', { class: 'btn primary sm', onclick: () => {
          modal((c2) => [h('h2', {}, 'Use this save?'), h('p', {}, saveLine(v.summary)), h('p', { class: 'muted small' }, 'It replaces the progress on this device and in Google Drive. Your current progress is kept so you can undo.'), h('div', { class: 'row' }, [
            h('button', { class: 'btn ghost', onclick: c2 }, 'Cancel'),
            h('button', { class: 'btn primary', onclick: async () => { c2(); close(); try { await useSave(v.data); toast('Save restored ✓', 'ok'); setTimeout(() => location.reload(), 700); } catch (e) { toast(e.message, 'bad'); } } }, 'Use this save'),
          ])]);
        } }, 'Use this save'),
      ])));
    }
    return [h('div', { class: 'older-modal' }, [h('h2', {}, 'Find an older save'), h('p', { class: 'muted small' }, 'Google Drive keeps earlier versions of your save for about 30 days. Pick the one you want back.'), body, h('div', { class: 'row' }, [h('button', { class: 'btn ghost', onclick: close }, 'Close')])])];
  });
  return m;
}

export function celebrateBirthday() {
  const name = displayName();
  modal((close) => [h('div', { class: 'bday-modal' }, [
    h('div', { class: 'bday-cake' }, '\u{1F382}'),
    h('h2', {}, `Happy birthday${name ? `, ${name}` : ''}!`),
    h('p', {}, ['Here’s a gift from the universe: ', h('b', {}, `${BIRTHDAY_GIFT.toLocaleString('en-US')} ${SYMBOL}`), '. Treat yourself in the Shop!']),
    h('button', { class: 'btn primary', onclick: close }, 'Thank you!'),
  ])]);
}

/** Settings › Account. */
export function accountCard() {
  if (!cloudConfigured()) return null;
  const card = h('section', { class: 'card account-card' });
  const draw = () => {
    const a = account();
    if (!a) {
      card.replaceChildren(
        h('h3', {}, [icon('star'), 'Account']),
        h('p', { class: 'muted' }, 'You’re playing as a guest: progress is saved on this device only. Sign in with Google to save it in your own Google Drive and use it on any device.'),
        googleButton(),
      );
      return;
    }
    const p = profile();
    const when = a.lastSync ? new Date(a.lastSync).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'not yet';
    card.replaceChildren(
      h('h3', {}, [icon('star'), 'Account']),
      h('div', { class: 'acct-row' }, [
        a.picture ? h('img', { class: 'acct-pic', src: a.picture, alt: '', referrerpolicy: 'no-referrer' }) : h('span', { class: 'acct-pic' }, (displayName() || a.email)[0].toUpperCase()),
        h('div', { class: 'grow' }, [h('b', {}, displayName() || a.name || a.email), h('small', {}, a.email)]),
        h('button', { class: 'btn ghost sm', onclick: () => openProfile({ done: draw }) }, ['✎ ', p ? 'Edit profile' : 'Add profile']),
      ]),
      h('div', { class: `acct-status ${a.connected ? 'ok' : 'warn'}` }, a.syncing ? '☁️ Saving to Google Drive…' : a.connected ? `☁️ Auto-saving to Google Drive · last saved ${when}` : `⚠️ ${a.error || 'Not connected to Google Drive.'}`),
      a.conflict ? h('div', { class: 'acct-conflict' }, [
        h('b', {}, 'Two different saves'),
        h('small', {}, `This device: ${saveLine(a.conflict.local)}`),
        h('small', {}, `Google Drive: ${saveLine(a.conflict.remote)}`),
        h('button', { class: 'btn primary sm', onclick: async () => { const r = await syncNow({ choose: chooseSave }); if (r.status === 'download') { toast('Using your Google Drive save ✓', 'ok'); setTimeout(() => location.reload(), 600); } else if (r.status === 'upload') toast('Saved this device to Google Drive ✓', 'ok'); } }, 'Choose which to keep'),
      ]) : a.error && a.connected ? h('p', { class: 'muted small' }, a.error) : null,
      h('div', { class: 'row', style: { justifyContent: 'flex-start', flexWrap: 'wrap' } }, [
        a.connected
          ? h('button', { class: 'btn primary sm', onclick: async () => { const r = await syncNow({ choose: chooseSave }); toast(r.status === 'error' ? r.error : 'Saved to Google Drive ✓', r.status === 'error' ? 'bad' : 'ok'); } }, 'Save now')
          : h('button', { class: 'btn primary sm', onclick: () => signIn() }, 'Reconnect'),
        a.connected ? h('button', { class: 'btn ghost sm', onclick: async () => {
          try {
            const msg = await locateSave();
            if (msg) { toast(msg, 'ok'); await syncNow({ choose: chooseSave }); return; }
            if (pickerAvailable()) { const id = await pickSave(); if (id) { toast('Using the file you picked.', 'ok'); await syncNow({ choose: chooseSave }); return; } }
            toast('No save found in your Drive. A new one will be made the next time it saves.', 'bad');
          } catch (e) { toast(e.message, 'bad'); }
        } }, 'Find my save') : null,
        a.connected ? h('button', { class: 'btn ghost sm', onclick: () => openOlderSaves() }, 'Find an older save') : null,
        a.connected && undoInfo() ? h('button', { class: 'btn ghost sm', title: `Before the last download: ${saveLine(undoInfo().summary)}`, onclick: async () => {
          try { await undoLastSync(); toast('Undone: your previous progress is back ✓', 'ok'); setTimeout(() => location.reload(), 600); } catch (e) { toast(e.message, 'bad'); }
        } }, 'Undo last download') : null,
        h('button', { class: 'btn ghost sm danger', onclick: () => { signOut(); toast('Signed out. Your progress stays on this device too.'); } }, 'Sign out'),
      ]),
      h('label', { class: 'signin-remember' }, [h('input', { type: 'checkbox', checked: a.remember, onchange: (e) => setRemember(e.target.checked) }), ' Remember this device for 30 days']),
      h('p', { class: 'muted small' }, ['Saves go to the "Keys to the Universe" folder in your Google Drive (moved it? "Find my save" will look for it). Remove access any time at ', h('a', { href: 'https://myaccount.google.com/permissions', target: '_blank', rel: 'noopener' }, 'myaccount.google.com/permissions'), '.']),
    );
  };
  draw();
  const off = onAccount(draw);
  card._cleanup = off;
  return card;
}
