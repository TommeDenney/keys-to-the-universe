// When the app isn't in front of you (closed, on the Home Screen, another app open
// or focused), it goes quiet: music pauses, a song you're playing pauses, all sound
// stops and the microphone switches off. Coming back resumes the music and the mic.

import { audio } from './audio/engine.js';
import { mic } from './input/mic.js';
import { hold, release } from './audio/bgmusic.js';
import { Player } from './screens/player.js';

let away = false;
let blurred = false;
let micWasOn = false;

function update() {
  const now = document.hidden || blurred;
  if (now === away) return;
  away = now;
  if (away) {
    hold('away');
    if (Player.current && Player.current.running) Player.current.pause();
    micWasOn = mic.state === 'on';
    if (micWasOn) mic.stop();
    if (audio.ctx && audio.ctx.state === 'running') audio.ctx.suspend().catch(() => {});
  } else {
    if (audio.ctx && audio.ctx.state !== 'running') audio.ctx.resume().catch(() => {});
    if (micWasOn) { micWasOn = false; mic.start(); }
    release('away');
  }
}

export function watchFocus() {
  document.addEventListener('visibilitychange', update);
  addEventListener('pagehide', () => { blurred = true; update(); });
  addEventListener('pageshow', () => { blurred = false; update(); });
  addEventListener('blur', () => { blurred = true; update(); });
  addEventListener('focus', () => { blurred = false; update(); });
}
