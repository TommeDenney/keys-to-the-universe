// Google account + Google Drive saves. There's still no server: the app signs in
// with Google (a redirect, which works in Home Screen apps where pop-ups don't),
// and saves your progress to a "Keys to the Universe" folder in your own Drive.
//
// Permissions: your name, email and picture, plus `drive.file`, which only lets
// the app see files it created itself (or ones you pick for it). It can't read
// anything else in your Drive.

import { CONFIG } from './config.js';
import { getState, onSave, makeBackup, restoreBackup } from './store.js';

const AUTH_KEY = 'ivory.auth';
const SCOPES = 'openid email profile https://www.googleapis.com/auth/drive.file';
const FOLDER = 'Keys to the Universe';
const FILE = 'progress.json';
const REMEMBER_DAYS = 30;
const API = 'https://www.googleapis.com';

export const cloudConfigured = () => !!CONFIG.googleClientId;

// ---- Saved sign-in ------------------------------------------------------------------
function load() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; } catch { return null; }
}
let auth = load();
function persist() {
  try { if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth)); else localStorage.removeItem(AUTH_KEY); } catch { /* storage blocked */ }
  emit();
}
const subs = new Set();
export const onAccount = (fn) => { subs.add(fn); return () => subs.delete(fn); };
const emit = () => subs.forEach((f) => f(account()));

/** What the UI needs to know about the account. */
export function account() {
  if (!auth || !auth.email) return null;
  return {
    email: auth.email, name: auth.name, picture: auth.picture, remember: !!auth.remember,
    connected: tokenValid(), lastSync: auth.lastSync || null, error: auth.error || null, syncing,
  };
}
const tokenValid = () => !!(auth && auth.token && auth.expires > Date.now() + 30000);
const redirectUri = () => location.origin + location.pathname;

// ---- Sign in / out (OAuth redirect, implicit flow for client-side apps) --------------
/**
 * Go to Google to sign in. `silent` tries without any screens (works when you've
 * signed in before on this device); Google sends you straight back.
 */
export function signIn({ silent = false, remember = auth ? auth.remember : true } = {}) {
  if (!cloudConfigured()) return;
  const nonce = Math.random().toString(36).slice(2);
  sessionStorage.setItem('ivory.oauth', JSON.stringify({ nonce, route: location.hash || '#/learn', remember, silent }));
  const q = new URLSearchParams({
    client_id: CONFIG.googleClientId, redirect_uri: redirectUri(), response_type: 'token', scope: SCOPES,
    include_granted_scopes: 'true', state: nonce, prompt: silent ? 'none' : 'select_account',
  });
  if (auth && auth.email) q.set('login_hint', auth.email);
  location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${q}`);
}

export function signOut() {
  const token = auth && auth.token;
  auth = null;
  persist();
  if (token) fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: 'POST', mode: 'no-cors' }).catch(() => {});
}

export function setRemember(on) {
  if (!auth) return;
  auth.remember = on;
  auth.rememberUntil = on ? Date.now() + REMEMBER_DAYS * 864e5 : 0;
  persist();
}

/**
 * Call first thing on start-up. Finishes a sign-in that just came back from Google,
 * forgets the account if "remember this device" ran out, and quietly renews an
 * expired token for remembered devices. Returns what happened.
 */
export async function startAccount() {
  if (!cloudConfigured()) return { status: 'off' };
  const back = finishRedirect();
  if (back) {
    if (back.error) { if (auth) { auth.error = back.silent ? 'Tap to reconnect to Google Drive.' : `Sign-in didn’t finish (${back.error}).`; persist(); } return { status: back.silent ? 'reconnect' : 'error' }; }
    await loadProfile();
    return { status: 'signed-in', fresh: true };
  }
  if (!auth) return { status: 'guest' };
  // "Remember this device" off: only stay signed in for this session.
  if (!auth.remember && !sessionStorage.getItem('ivory.session')) { auth = null; persist(); return { status: 'guest' }; }
  if (auth.remember && auth.rememberUntil && Date.now() > auth.rememberUntil) { auth = null; persist(); return { status: 'expired' }; }
  sessionStorage.setItem('ivory.session', '1');
  if (!tokenValid()) {
    // Renew quietly, at most once every 10 minutes (avoids loops if Google needs you).
    const last = +sessionStorage.getItem('ivory.silent') || 0;
    if (auth.remember && Date.now() - last > 10 * 60000) { sessionStorage.setItem('ivory.silent', String(Date.now())); signIn({ silent: true }); return { status: 'renewing' }; }
    return { status: 'reconnect' };
  }
  return { status: 'signed-in' };
}

function finishRedirect() {
  const h = location.hash.replace(/^#/, '');
  if (!/(^|&)(access_token|error)=/.test(h)) return null;
  const p = new URLSearchParams(h);
  let pending = {};
  try { pending = JSON.parse(sessionStorage.getItem('ivory.oauth')) || {}; } catch { /* none */ }
  sessionStorage.removeItem('ivory.oauth');
  history.replaceState(null, '', `${location.pathname}${location.search}${pending.route || '#/learn'}`);
  if (!pending.nonce || p.get('state') !== pending.nonce) return { error: 'state_mismatch', silent: pending.silent };
  if (p.get('error')) return { error: p.get('error'), silent: pending.silent };
  const remember = pending.remember !== false;
  auth = {
    ...(auth || {}), token: p.get('access_token'), expires: Date.now() + (+p.get('expires_in') || 3600) * 1000,
    remember, rememberUntil: remember ? (auth && auth.rememberUntil > Date.now() ? auth.rememberUntil : Date.now() + REMEMBER_DAYS * 864e5) : 0, error: null,
  };
  sessionStorage.setItem('ivory.session', '1');
  persist();
  return { ok: true };
}

async function loadProfile() {
  const me = await gfetch(`${API}/oauth2/v3/userinfo`).then((r) => r.json());
  if (auth.email && auth.email !== me.email) { auth.fileId = null; auth.folderId = null; auth.lastSync = null; } // a different account
  Object.assign(auth, { email: me.email, name: me.name || me.given_name || '', givenName: me.given_name || '', picture: me.picture || '' });
  persist();
  return me;
}
export const googleGivenName = () => (auth && (auth.givenName || auth.name)) || '';

// ---- Drive -----------------------------------------------------------------------------
async function gfetch(url, opts = {}) {
  if (!tokenValid()) throw Object.assign(new Error('Reconnect to Google Drive to keep saving.'), { code: 'auth' });
  const res = await fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${auth.token}` } });
  if (res.status === 401) { auth.expires = 0; persist(); throw Object.assign(new Error('Your Google session ended. Tap to reconnect.'), { code: 'auth' }); }
  if (!res.ok) throw new Error(`Google Drive error ${res.status}`);
  return res;
}
const q = (s) => encodeURIComponent(s);
async function list(query) {
  const r = await gfetch(`${API}/drive/v3/files?q=${q(query)}&spaces=drive&fields=files(id,name,parents,trashed,modifiedTime)&orderBy=modifiedTime desc`);
  return (await r.json()).files || [];
}

/** Find (or make) the folder and the save file. */
async function ensureFile({ create = true } = {}) {
  if (auth.fileId) {
    try {
      const f = await (await gfetch(`${API}/drive/v3/files/${auth.fileId}?fields=id,trashed,parents`)).json();
      if (!f.trashed) return auth.fileId;
    } catch (e) { if (e.code === 'auth') throw e; }
    auth.fileId = null;
  }
  // Moved somewhere else in Drive? drive.file still finds files the app made, wherever they are.
  const found = await list(`name='${FILE}' and trashed=false and mimeType='application/json'`);
  if (found.length) { auth.fileId = found[0].id; persist(); return auth.fileId; }
  if (!create) return null;
  auth.folderId = await ensureFolder();
  const meta = { name: FILE, parents: [auth.folderId], mimeType: 'application/json' };
  const res = await multipart('POST', `${API}/upload/drive/v3/files?uploadType=multipart&fields=id`, meta, '{}');
  auth.fileId = (await res.json()).id;
  persist();
  return auth.fileId;
}
async function ensureFolder() {
  if (auth.folderId) return auth.folderId;
  const found = await list(`name='${FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  if (found.length) return found[0].id;
  const res = await gfetch(`${API}/drive/v3/files?fields=id`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: FOLDER, mimeType: 'application/vnd.google-apps.folder' }) });
  return (await res.json()).id;
}
function multipart(method, url, meta, body) {
  const b = `kttu${Math.random().toString(36).slice(2)}`;
  const data = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${b}--`;
  return gfetch(url, { method, headers: { 'Content-Type': `multipart/related; boundary=${b}` }, body: data });
}

/**
 * The save is missing or was moved: look everywhere the app can see, including the
 * trash (and restore it from there). Returns a short message for the user.
 */
export async function locateSave() {
  auth.fileId = null;
  const live = await list(`name='${FILE}' and trashed=false`);
  if (live.length) { auth.fileId = live[0].id; persist(); return 'Found your save in Google Drive.'; }
  const trashed = await list(`name='${FILE}' and trashed=true`);
  if (trashed.length) {
    await gfetch(`${API}/drive/v3/files/${trashed[0].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trashed: false }) });
    auth.fileId = trashed[0].id;
    persist();
    return 'Your save was in the Drive trash. It’s been restored.';
  }
  return null;
}

/** Let the user pick the save file in Drive (Google Picker). Needs an API key in config.js. */
export const pickerAvailable = () => !!CONFIG.googleApiKey;
export async function pickSave() {
  if (!pickerAvailable()) return null;
  await new Promise((ok, fail) => {
    if (window.gapi) return ok();
    const s = document.createElement('script');
    s.src = 'https://apis.google.com/js/api.js';
    s.onload = ok; s.onerror = () => fail(new Error('Couldn’t load Google Picker.'));
    document.head.append(s);
  });
  await new Promise((ok) => window.gapi.load('picker', ok));
  const id = await new Promise((ok) => {
    const P = window.google.picker;
    const view = new P.DocsView(P.ViewId.DOCS).setMimeTypes('application/json').setMode(P.DocsViewMode.LIST);
    new P.PickerBuilder().addView(view).setOAuthToken(auth.token).setDeveloperKey(CONFIG.googleApiKey).setAppId(CONFIG.googleAppId || '')
      .setTitle('Choose your Keys to the Universe save (progress.json)')
      .setCallback((d) => { if (d.action === P.Action.PICKED) ok(d.docs[0].id); else if (d.action === P.Action.CANCEL) ok(null); })
      .build().setVisible(true);
  });
  if (id) { auth.fileId = id; persist(); }
  return id;
}

// ---- Syncing -------------------------------------------------------------------------
let syncing = false;
let applying = false;
let timer = 0;
const hasProgress = (st) => !!st && (Object.keys(st.lessons || {}).length > 0 || ((st.wallet && st.wallet.earned) || 0) > 0);

/**
 * Bring this device and Drive together. `choose(local, remote)` is asked only when
 * both have different progress the first time a device links (returns 'local' | 'remote').
 */
export async function syncNow({ choose } = {}) {
  if (!auth || !tokenValid() || syncing) return { status: 'skipped' };
  syncing = true; emit();
  try {
    const local = getState();
    const fileId = await ensureFile();
    const remote = await (await gfetch(`${API}/drive/v3/files/${fileId}?alt=media`)).json().catch(() => ({}));
    const remoteState = remote && remote.app === 'ivory' ? remote.state : null;
    const rT = (remoteState && remoteState.updatedAt) || 0;
    const lT = local.updatedAt || 0;
    let action = 'upload';
    if (remoteState) {
      if (!auth.lastSync) { // first time this device links to this account
        if (!hasProgress(local)) action = 'download';
        else if (hasProgress(remoteState) && rT !== lT) action = choose ? await choose({ local, remote: remoteState }) === 'remote' ? 'download' : 'upload' : (rT > lT ? 'download' : 'upload');
      } else if (rT > (auth.remoteSeen || 0) && rT > lT) action = 'download'; // changed on another device
    }
    if (action === 'download') {
      applying = true;
      try { await restoreBackup(remote); } finally { applying = false; }
      auth.remoteSeen = rT;
    } else {
      await upload(fileId);
    }
    auth.lastSync = Date.now();
    auth.error = null;
    return { status: action };
  } catch (e) {
    auth.error = e.message;
    return { status: 'error', error: e.message, code: e.code };
  } finally {
    syncing = false;
    persist();
  }
}

async function upload(fileId) {
  const data = await makeBackup({ forCloud: true });
  await multipart('PATCH', `${API}/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id`, { mimeType: 'application/json' }, JSON.stringify(data));
  auth.remoteSeen = data.state.updatedAt || Date.now();
}

/** Auto-save: a little while after anything changes, and whenever the app goes to the background. */
export function startAutoSave() {
  onSave(() => {
    if (applying || !auth || !tokenValid()) return;
    clearTimeout(timer);
    timer = setTimeout(() => syncNow(), 15000);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && timer && auth && tokenValid()) { clearTimeout(timer); timer = 0; syncNow(); }
  });
}
