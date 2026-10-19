# Ivory: learn piano, free

Ivory is a free, open-source piano course that runs in your browser. It listens to your piano through the microphone (or a MIDI / Bluetooth piano), scrolls the sheet music as you play, and turns practice into a journey through a universe of galaxies, planets and boss battles.

No account, no ads, no payments. Everything stays on your device.

**Open it:** https://tommedenney.github.io/ivory-piano/

## Features
- **A guided course from your first note:** C-D-E → F-G → A-B → left hand → hands together → sharps & flats → chords → gospel organ → classics. Each lesson mixes short explanations with "own pace" and "with the beat" practice.
- **Sheet music that follows you:** a scrolling grand staff with finger numbers and optional note names. Notes turn green as you hit them.
- **Listens to your piano:** a polyphonic, low-latency microphone detector built for piano (chords and octaves included), with a calibration step for your instrument and room.
- **MIDI / Bluetooth pianos** via Web MIDI. On iPad, use a Web MIDI browser app (Safari doesn't support Web MIDI yet).
- **20 galaxies and 100+ songs:** public-domain melodies plus 92 graded pieces (Grades 1–10) from the Mutopia Project, each broken into a practice plan.
- **Guardians (boss battles):** each galaxy ends with one. Pass at 75% with the beat. Already know the basics? Beat a galaxy's Guardian to skip ahead.
- **Stardust ✦, earned only by playing:** a Shop with ships, pets, completion effects, keyboard themes, key-press effects, trails, sheet themes and ambience, plus achievement rewards, 150+ badges, rotating daily/weekly/monthly challenges and rogue-planet side quests.
- **Handbook:** every lesson explanation in one place, plus a chord explorer with inversions.
- **Import your own sheet music:** MusicXML (.musicxml/.xml/.mxl) and MIDI (.mid). Only import music you have the right to use. Imports stay on your device.
- **Piano-key navigation:** G3 Back · A3 Up · B3 Left · **C4 Select** · D4 Right · E4 Down · F4 Next tab.
- Installable as a Home Screen app and works offline. Back up and restore your progress from Settings.

## Privacy
Ivory has no server. Microphone audio is analysed on your device and never recorded or sent anywhere. Progress, imports and private packs are stored in your browser (IndexedDB / localStorage) and in backup files you choose to save.

## Private packs
You can add personal content that never touches this repository: a `.ivorypack.json` file imported in **Settings › Progress › Private packs**.
- `"type": "ivory-constellations"`: photos that become constellations in their galaxies.
- `"type": "ivory-personal"`: your own galaxy names, songs and special bosses (see `js/personal.js` for the fields).

## Run locally
Any static server works, e.g. `python3 -m http.server`, then open http://localhost:8000. The microphone needs `localhost` or HTTPS. There is no build step: the app is plain ES modules.

## Contributing
Issues and pull requests are welcome, especially:
- microphone detection on different pianos and keyboards (recordings help a lot),
- lesson content and music-teaching feedback,
- accessibility and device testing.

New sheet music must be public domain or openly licensed, with its source and licence added to `js/data/pieces.json` / CREDITS.md.

## Licence
The code is under the [MIT License](LICENSE). Bundled content keeps its own licence. See [CREDITS.md](CREDITS.md) for every piece's source and licence.

- Piano samples: [Salamander Grand Piano](https://archive.org/details/SalamanderGrandPianoV3) by Alexander Holm, CC BY 3.0.
- Sheet music: the [Mutopia Project](https://www.mutopiaproject.org/) (Public Domain, CC BY and CC BY-SA, per piece).
- Fonts: Nunito and Noto Music (SIL Open Font License).

Ivory is an independent project and isn't affiliated with any other piano-learning app or company.
