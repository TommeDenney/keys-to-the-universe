// About, disclosures, credits and licences (Settings › About & credits).

import { h, icon } from '../ui.js';
import { catalogPieces } from '../data/catalog.js';

const REPO = 'https://github.com/TommeDenney/keys-to-the-universe';
const LICENSE_URLS = {
  'Public Domain': 'https://creativecommons.org/publicdomain/mark/1.0/',
  'Creative Commons Attribution 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'Creative Commons Attribution-ShareAlike 2.5': 'https://creativecommons.org/licenses/by-sa/2.5/',
  'Creative Commons Attribution-ShareAlike 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'Creative Commons Attribution-ShareAlike 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
};
const short = (l) => l.replace('Creative Commons Attribution-ShareAlike', 'CC BY-SA').replace('Creative Commons Attribution', 'CC BY');
const link = (href, text) => h('a', { href, target: '_blank', rel: 'noopener' }, text);

export function renderAbout(root) {
  const pieces = [...catalogPieces()].sort((a, b) => a.grade - b.grade || a.title.localeCompare(b.title));
  const counts = {};
  for (const p of pieces) counts[short(p.license)] = (counts[short(p.license)] || 0) + 1;

  const sec = (title, ...kids) => h('section', { class: 'card about-card' }, [h('h2', {}, title), ...kids]);
  const page = h('div', { class: 'page about-page' }, [
    h('header', { class: 'top' }, [h('div', {}, [h('a', { class: 'back-link', href: '#/settings' }, [icon('back'), 'Settings']), h('div', { class: 'eyebrow' }, 'Keys to the Universe'), h('h1', {}, 'About & credits')])]),

    sec('About Keys to the Universe',
      h('p', {}, 'Keys to the Universe is a free, open-source piano course that runs in your browser. It listens to your piano, follows your playing on the sheet music, and turns practice into a journey through the galaxies.'),
      h('p', {}, ['The source code is public at ', link(REPO, 'github.com/TommeDenney/keys-to-the-universe'), '. Issues and suggestions are welcome.']),
      h('p', {}, [link('privacy.html', 'Privacy Policy'), ' · ', link('terms.html', 'Terms of Service')]),
    ),

    sec('Disclosures',
      h('ul', { class: 'about-list' }, [
        h('li', {}, [h('b', {}, 'For all ages. '), 'Kids often start piano young, so Keys to the Universe is made for learners of every age. It has no chat, no social features, no ads and no purchases, and you never need an account to play. Parental discretion is advised: parents and guardians should supervise younger children, especially when signing in, importing files or following links out of the app. Google accounts are for ages 13+ unless a parent manages them (Family Link).']),
        h('li', {}, [h('b', {}, 'Free, no ads. '), 'Keys to the Universe has no ads and no in-app purchases. Signing in is optional. Stardust is earned only by playing (plus a birthday gift if you\u2019ve signed in).']),
        h('li', {}, [h('b', {}, 'Stardust has no real-world value. '), 'It can’t be bought, sold, traded or cashed out, and seasonal items are cosmetic.']),
        h('li', {}, [h('b', {}, 'Your privacy. '), 'There is no server, and the developer never receives your data. Microphone audio is analysed on your device in real time and is never recorded, stored or sent anywhere. As a guest, progress, imports and private packs stay in this browser (and in backup files you choose to save).']),
        h('li', {}, [h('b', {}, 'If you sign in with Google. '), 'The app uses Google sign-in to get your name, email address and profile picture, and permission to create and update its own files in your Google Drive (the \u201cdrive.file\u201d permission: it can\u2019t see any other files). Your progress and the profile you enter (name, birthday, optional birth year and piano experience) are saved only in a \u201cKeys to the Universe\u201d folder in your own Drive. Photo constellations stay on each device. To stop, sign out, delete that folder, and remove the app at ', link('https://myaccount.google.com/permissions', 'myaccount.google.com/permissions'), '.']),
        h('li', {}, [h('b', {}, 'Microphone and MIDI accuracy. '), 'Note detection works best with a MIDI or Bluetooth piano. Through the microphone it can mishear notes, especially with other sounds in the room. Calibrate it in Handbook › How to play if notes are misheard.']),
        h('li', {}, [h('b', {}, 'Not a replacement for a teacher. '), 'Keys to the Universe is a practice tool. A qualified piano teacher can help with technique, posture and avoiding strain. Take breaks, and stop if anything hurts.']),
        h('li', {}, [h('b', {}, 'Your imports. '), 'Only import sheet music you have the right to use (public domain, your own, or licensed to you). Imports stay on your device and are never uploaded.']),
        h('li', {}, [h('b', {}, 'Independent project. '), 'Keys to the Universe isn’t affiliated with or endorsed by any other piano-learning app, company, TV show or musician. Holiday and awareness themes are decorative.']),
        h('li', {}, [h('b', {}, 'Provided as is. '), 'Keys to the Universe is offered without warranty, as described in its licence.']),
      ]),
    ),

    sec('Licence',
      h('p', {}, ['The app’s code is released under the ', h('b', {}, 'MIT License'), ': you’re free to use, copy, change and share it, as long as the copyright and licence notice stay with it. ', link(`${REPO}/blob/main/LICENSE`, 'Read the full licence'), '.']),
      h('p', {}, 'Bundled content keeps its own licence, listed below. Pieces under CC BY-SA must stay under CC BY-SA, including any changes made to them.'),
    ),

    sec('Credits',
      h('ul', { class: 'about-list' }, [
        h('li', {}, [h('b', {}, 'Piano sound: '), link('https://archive.org/details/SalamanderGrandPianoV3', 'Salamander Grand Piano'), ' by Alexander Holm, ', link(LICENSE_URLS['Creative Commons Attribution 3.0'], 'CC BY 3.0'), '.']),
        h('li', {}, [h('b', {}, 'Sheet music: '), `${pieces.length} pieces from `, link('https://www.mutopiaproject.org/', 'the Mutopia Project'), ', typeset by its volunteers (', Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', '), '). Every piece is listed below.']),
        h('li', {}, [h('b', {}, 'Fonts: '), link('https://fonts.google.com/specimen/Nunito', 'Nunito'), ' and ', link('https://fonts.google.com/noto/specimen/Noto+Music', 'Noto Music'), ', ', link('https://openfontlicense.org/', 'SIL Open Font License'), '.']),
        h('li', {}, [h('b', {}, 'Built-in songs: '), 'traditional and public-domain melodies, with arrangements, exercises and Guardian test pieces written for Keys to the Universe.']),
        h('li', {}, [h('b', {}, 'Emoji: '), 'shown using your device’s own emoji font.']),
      ]),
      h('details', { class: 'about-pieces' }, [
        h('summary', {}, `Show all ${pieces.length} pieces and their licences`),
        h('div', { class: 'piece-table' }, pieces.map((p) => h('div', { class: 'piece-row' }, [
          h('span', { class: 'pr-title' }, [h('b', {}, p.title), h('small', {}, `${p.composer} · Grade ${p.grade}`)]),
          h('span', { class: 'pr-meta' }, [
            LICENSE_URLS[p.license] ? link(LICENSE_URLS[p.license], short(p.license)) : short(p.license),
            p.maintainer ? h('small', {}, `Typeset by ${p.maintainer}`) : null,
            link(p.source, 'Source'),
          ]),
        ]))),
      ]),
    ),
  ]);
  root.append(page);
}
