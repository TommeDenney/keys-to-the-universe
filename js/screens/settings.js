// Settings: input setup (mic test, MIDI / Bluetooth piano), sound, display, progress.

import { h, icon, modal, toast } from '../ui.js';
import { settings, progress } from '../store.js';
import { mic } from '../input/mic.js';
import { input } from '../input/hub.js';
import { audio } from '../audio/engine.js';
import { noteName } from '../music/theory.js';
import { NAV_KEYS } from '../nav.js';
import { openCalibration } from './calibrate.js';
import { THEMES, applyTheme } from '../theme.js';

function seg(key, opts, after) {
  return h('div', { class: 'seg' }, opts.map(([v, l]) => h('button', {
    class: settings.get(key) === v ? 'on' : '',
    onclick: (e) => {
      settings.set(key, v);
      e.target.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === e.target));
      if (after) after(v);
    },
  }, l)));
}

function toggle(key) {
  return h('label', { class: 'switch' }, [
    h('input', { type: 'checkbox', checked: settings.get(key), onchange: (e) => settings.set(key, e.target.checked) }),
    h('i'),
  ]);
}

function slider(key, min, max, step, fmt, onInput) {
  const out = h('span', { class: 'val' }, fmt(settings.get(key)));
  return [h('input', { type: 'range', min, max, step, value: settings.get(key), oninput: (e) => { const v = +e.target.value; settings.set(key, v); out.textContent = fmt(v); if (onInput) onInput(v); } }), out];
}

const rowItem = (title, sub, control) => h('div', { class: 'set-row' }, [h('div', { class: 'grow' }, [h('b', {}, title), sub ? h('span', {}, sub) : null]), control]);

export function midiHelp() {
  const url = location.href.split('#')[0];
  return h('div', { class: 'midi-help' }, [
    h('p', {}, 'A MIDI connection is the most accurate way to play: zero guesswork, perfect chords, and very low delay. Your Williams Legato III supports Bluetooth MIDI.'),
    h('h4', {}, 'On iPad'),
    h('ol', {}, [
      h('li', {}, ['Safari can’t talk to MIDI devices yet, so install the free ', h('a', { href: 'https://apps.apple.com/app/id953846217', target: '_blank', rel: 'noopener' }, 'Web MIDI Browser'), ' app.']),
      h('li', {}, 'Turn on Bluetooth on the piano (see its manual for the Bluetooth/function button).'),
      h('li', {}, ['In Web MIDI Browser, open this address: ', h('code', {}, url), ' ', h('button', { class: 'chip-btn', onclick: () => navigator.clipboard && navigator.clipboard.writeText(url).then(() => toast('Link copied')) }, 'Copy')]),
      h('li', {}, 'Use the app’s Bluetooth/MIDI connect option to pair with the piano. Ivory switches to MIDI automatically when it sees it.'),
    ]),
    h('h4', {}, 'On a Mac or PC'),
    h('p', {}, 'Use Chrome or Edge. Connect with a USB cable, or pair Bluetooth MIDI (Mac: Audio MIDI Setup › Window › Show MIDI Studio › Bluetooth).'),
  ]);
}

export function renderSettings(root) {
  const page = h('div', { class: 'page settings' });
  root.append(page);

  // --- input
  const midiStatus = h('div', { class: 'status' });
  const refreshMidi = () => {
    const names = input.midiInputs.map((i) => i.name);
    midiStatus.replaceChildren(
      input.midiState === 'unsupported'
        ? h('span', { class: 'badge warn' }, 'Not available in this browser')
        : names.length ? h('span', { class: 'badge ok' }, `Connected: ${names.join(', ')}`) : h('span', { class: 'badge' }, 'No MIDI device found'),
    );
  };
  input.initMidi().then(refreshMidi);
  const unsub = input.on((t) => { if (t === 'devices') refreshMidi(); });

  const meter = h('div', { class: 'meter' }, h('i'));
  const heard = h('div', { class: 'heard' }, '—');
  const micBtn = h('button', { class: 'btn primary', onclick: async () => {
    if (mic.state === 'on') { mic.stop(); update(); return; }
    const st = await mic.start();
    if (st === 'denied') toast('Microphone access was blocked. Enable it for this site in Settings.', 'bad');
    update();
  } });
  const update = () => {
    micBtn.replaceChildren(icon('mic'), mic.state === 'on' ? 'Stop test' : 'Test microphone');
  };
  update();
  const offMic = mic.on((e) => { heard.textContent = noteName(e.midi, 0, true); heard.classList.remove('flash'); void heard.offsetWidth; heard.classList.add('flash'); });
  let raf = 0;
  const loop = () => {
    const v = Math.max(0, Math.min(1, (mic.level + 70) / 55));
    meter.firstChild.style.transform = `scaleX(${mic.state === 'on' ? v : 0})`;
    raf = requestAnimationFrame(loop);
  };
  loop();

  page.append(
    h('header', { class: 'top' }, [h('div', {}, [h('div', { class: 'eyebrow' }, 'Preferences'), h('h1', {}, 'Settings')])]),
    h('section', { class: 'card' }, [
      h('h3', {}, [icon('piano'), 'How you play']),
      rowItem('Input', 'Auto uses a MIDI piano when connected, otherwise the microphone.', seg('input', [['auto', 'Auto'], ['mic', 'Microphone'], ['touch', 'On-screen only']])),
      h('div', { class: 'sub-card' }, [
        h('div', { class: 'sub-head' }, [h('b', {}, 'Microphone'), micBtn]),
        h('div', { class: 'mic-test' }, [meter, h('div', {}, [h('small', {}, 'Hearing'), heard])]),
        h('div', { class: 'calib-row' }, [
          h('div', { class: 'grow' }, [
            h('b', {}, 'Calibrate pitch'),
            h('span', {}, settings.get('micPitchOffset') ? `Correction: ${settings.get('micPitchOffset') > 0 ? '+' : ''}${settings.get('micPitchOffset')} semitones` : 'Wrong notes being detected? Play 5 keys to calibrate.'),
          ]),
          settings.get('micPitchOffset') ? h('button', { class: 'btn ghost sm', onclick: () => { settings.set('micPitchOffset', 0); mic.setPitchOffset(0); root.replaceChildren(); renderSettings(root); } }, 'Reset') : null,
          h('button', { class: 'btn primary sm', onclick: () => openCalibration(() => { root.replaceChildren(); renderSettings(root); }) }, 'Calibrate'),
        ]),
        h('label', { class: 'field' }, [h('span', {}, 'Sensitivity'), ...slider('micSensitivity', 0, 1, 0.05, (v) => (v < 0.35 ? 'Strict' : v > 0.65 ? 'Sensitive' : 'Normal'), (v) => mic.setSensitivity(v))]),
        h('label', { class: 'field' }, [h('span', {}, 'Timing compensation'), ...slider('micLatency', 0, 150, 5, (v) => `${v} ms`)]),
        h('p', { class: 'muted small' }, 'Tip: headphones for the app sound let the mic hear only your piano. Turn sensitivity down in a noisy room.'),
      ]),
      h('div', { class: 'sub-card' }, [
        h('div', { class: 'sub-head' }, [h('b', {}, 'MIDI / Bluetooth piano'), midiStatus]),
        midiHelp(),
      ]),
    ]),
    h('section', { class: 'card' }, [
      h('h3', {}, [icon('hand'), 'Piano-key navigation']),
      rowItem('Navigate with your piano', 'Keep your hands on the keys: menus respond to the white keys around Middle C. (Arrow keys, Enter and Esc work too.)', toggle('pianoNav')),
      h('div', { class: 'nav-map' }, NAV_KEYS.map(([m, n, l]) => h('div', { class: m === 60 ? 'c4' : '' }, [h('b', {}, l), h('small', {}, n)]))),
    ]),
    h('section', { class: 'card' }, [
      h('h3', {}, [icon('ear'), 'Sound']),
      rowItem('Piano volume', 'Listen, the auto-played other hand and on-screen keys. Keep it low if your iPad is at full volume.', h('div', { class: 'inline' }, slider('musicVolume', 0, 1, 0.05, (v) => `${Math.round(v * 100)}%`, (v) => { audio.setMusicVolume(v); settings.set('musicVolumeSet', true); }))),
      rowItem('Effects & metronome volume', null, h('div', { class: 'inline' }, slider('volume', 0, 1, 0.05, (v) => `${Math.round(v * 100)}%`, (v) => audio.setVolume(v)))),
      rowItem('Metronome', 'Click along in “with the beat” mode.', toggle('metronome')),
      rowItem('Play the other hand', 'When practising one hand with the beat, the app plays the other.', toggle('otherHand')),
    ]),
    h('section', { class: 'card' }, [
      h('h3', {}, [icon('note'), 'Display']),
      rowItem('Background colour', 'Change the page background. Cards and sheet music stay the same.', h('div', { class: 'swatches' }, THEMES.map((t) => h('button', {
        class: `swatch ${settings.get('theme') === t.id ? 'on' : ''}`,
        'aria-label': `${t.name} background`,
        onclick: (e) => {
          settings.set('theme', t.id);
          applyTheme(t.id);
          e.currentTarget.parentNode.querySelectorAll('.swatch').forEach((b) => b.classList.toggle('on', b === e.currentTarget));
        },
      }, [h('i', { style: { background: t.bg } }), t.name])))),
      rowItem('Note names on notes', 'Auto: shown early in the course, hidden when you’re learning to read.', seg('noteNames', [['auto', 'Auto'], ['always', 'Always'], ['never', 'Never']])),
      rowItem('Keyboard hints', 'Highlight the next keys to play.', toggle('keyHints')),
      rowItem('Key labels', null, seg('keyLabels', [['c', 'C only'], ['all', 'All'], ['none', 'None']])),
    ]),
    h('section', { class: 'card' }, [
      h('h3', {}, [icon('star'), 'Progress']),
      rowItem('Unlock all lessons', 'Skip ahead if you already know the basics.', toggle('unlockAll')),
      rowItem('Reset progress', 'Clears stars, streak and lesson progress on this device.', h('button', { class: 'btn ghost danger', onclick: () => modal((close) => [
        h('h2', {}, 'Reset all progress?'), h('p', {}, 'This can’t be undone.'),
        h('div', { class: 'row' }, [h('button', { class: 'btn ghost', onclick: close }, 'Cancel'), h('button', { class: 'btn primary danger', onclick: () => { progress.reset(); close(); toast('Progress reset'); } }, 'Reset')]),
      ]) }, 'Reset')),
    ]),
    h('section', { class: 'about' }, [
      h('p', {}, 'Ivory is a personal practice app. Piano sound: Salamander Grand Piano by Alexander Holm (CC BY 3.0). Built-in songs are public-domain melodies with simplified arrangements written for this app.'),
      h('p', {}, 'Computer keyboard: A W S E D F T G Y H U J K play C to C (Z / X change octave).'),
    ]),
  );
  return () => { cancelAnimationFrame(raf); unsub(); offMic(); };
}

export function showOnboarding() {
  modal((close) => {
    const choose = (v) => {
      settings.set('input', v === 'midi' ? 'auto' : v);
      settings.set('onboarded', true);
      if (v === 'midi') {
        close();
        modal((c2) => [h('h2', {}, 'Connect your piano'), midiHelp(), h('div', { class: 'row' }, [h('button', { class: 'btn primary', onclick: () => { c2(); location.hash = '#/learn'; } }, 'Got it')])]);
        return;
      }
      if (v === 'auto') mic.start();
      close();
    };
    const opt = (v, ic, title, sub) => h('button', { class: 'onb-opt', onclick: () => choose(v) }, [h('span', { class: 'onb-ic' }, icon(ic)), h('span', {}, [h('b', {}, title), h('small', {}, sub)])]);
    return [
      h('div', { class: 'onb-hero' }, [h('h1', { class: 'brand' }, ['Ivory', h('span', { class: 'dot' })]), h('p', {}, 'Learn piano from your very first note. Play on a real piano and the app listens and follows along.')]),
      h('h3', {}, 'How will you play?'),
      h('div', { class: 'onb-opts' }, [
        opt('auto', 'mic', 'My piano + microphone', 'Any acoustic or digital piano. The app listens.'),
        opt('midi', 'bluetooth', 'Bluetooth / USB MIDI piano', 'Most accurate. Works with the Williams Legato III.'),
        opt('touch', 'hand', 'On-screen keyboard', 'No piano nearby? Tap the keys.'),
      ]),
    ];
  }, { onClose: () => settings.set('onboarded', true) });
}
