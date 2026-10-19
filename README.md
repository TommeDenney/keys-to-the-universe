# Ivory: piano practice

A personal, Simply-Piano-style piano learning web app. It listens to your piano through the microphone (or a MIDI / Bluetooth piano), scrolls the sheet music, and waits for you or keeps the beat.

**Open it:** https://tommedenney.github.io/ivory-piano/

## Features
- **Guided course from zero:** C-D-E → F-G → A-B → left hand → hands together → sharps & flats → chords → classics. Each lesson mixes short explanations with "own pace" and "with the beat" practice.
- **Follow-along sheet music:** a scrolling grand staff with finger numbers and optional note names. Notes turn green as you hit them.
- **Listens to your piano:** a polyphonic, low-latency microphone detector built for piano. It handles chords and octaves.
- **MIDI / Bluetooth pianos** via Web MIDI. On iPad, use the free *Web MIDI Browser* app, because Safari doesn't support Web MIDI.
- **20 galaxies, 100+ songs**: built-in public-domain melodies plus 92 graded pieces (Grades 1–10) from the Mutopia Project, each broken into a practice plan.
- **Boss battles**: every galaxy ends with a Guardian; pass (75%, with the beat) to move on.
- **Stardust ✦ economy** (earned only by playing): a Shop with ships, completion effects, keyboard themes, key-press effects and ambience; daily/weekly/monthly challenges; rogue-planet side quests.
- **Import your own sheet music:** MusicXML (.musicxml/.xml/.mxl) and MIDI (.mid). Imports are stored on the device.
- **Chord explorer** with inversions and common progressions.
- **Piano-key navigation:** G3 Back · A3 Up · B3 Left · **C4 Select** · D4 Right · E4 Down · F4 Next tab.
- Installable as a Home Screen app and works offline.

## Run locally
Any static server works, e.g. `python3 -m http.server`, then open http://localhost:8000. The mic needs `localhost` or HTTPS.

## Credits

See [CREDITS.md](CREDITS.md) for every piece's source and licence.

- Piano samples: [Salamander Grand Piano](https://archive.org/details/SalamanderGrandPianoV3) by Alexander Holm, CC BY 3.0 (via the Tone.js audio repository).
- Fonts: Nunito and Noto Music (SIL Open Font License).
- Not affiliated with Simply / JoyTunes. This is a personal practice project.
