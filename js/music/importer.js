// File import: MusicXML (.musicxml/.xml), compressed MusicXML (.mxl), MIDI (.mid/.midi).

import { parseMusicXML } from './musicxml.js';
import { parseMidiFile } from './midifile.js';

/** Minimal ZIP reader (stored + deflate) using the browser's DecompressionStream. */
async function unzip(buf) {
  const d = new Uint8Array(buf);
  const dv = new DataView(buf);
  // Find End Of Central Directory.
  let eocd = -1;
  for (let i = d.length - 22; i >= Math.max(0, d.length - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Corrupt .mxl file (not a zip).');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const entries = new Map();
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const localOff = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(d.subarray(p + 46, p + 46 + nameLen));
    entries.set(name, { method, csize, localOff });
    p += 46 + nameLen + extraLen + commentLen;
  }
  const read = async (name) => {
    const e = entries.get(name);
    if (!e) return null;
    const lnl = dv.getUint16(e.localOff + 26, true);
    const lel = dv.getUint16(e.localOff + 28, true);
    const start = e.localOff + 30 + lnl + lel;
    const data = d.subarray(start, start + e.csize);
    if (e.method === 0) return new TextDecoder().decode(data);
    if (e.method !== 8) throw new Error('Unsupported compression in .mxl file.');
    if (typeof DecompressionStream === 'undefined') throw new Error('This browser can’t open .mxl files. Export uncompressed MusicXML instead.');
    const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(stream).text();
  };
  return { names: [...entries.keys()], read };
}

export async function importFile(file) {
  const name = file.name || 'score';
  const ext = (name.split('.').pop() || '').toLowerCase();
  const buf = await file.arrayBuffer();
  const head = new Uint8Array(buf.slice(0, 4));
  const magic = String.fromCharCode(...head);
  let song;
  if (magic === 'MThd' || ext === 'mid' || ext === 'midi') {
    song = parseMidiFile(buf, name);
  } else if (magic.startsWith('PK') || ext === 'mxl') {
    const zip = await unzip(buf);
    let path = null;
    const container = await zip.read('META-INF/container.xml');
    if (container) {
      const m = /full-path="([^"]+)"/.exec(container);
      if (m) path = m[1];
    }
    if (!path) path = zip.names.find((n) => !n.startsWith('META-INF') && /\.(xml|musicxml)$/i.test(n));
    if (!path) throw new Error('No score found inside this .mxl file.');
    song = parseMusicXML(await zip.read(path), name);
  } else if (ext === 'pdf' || magic === '%PDF') {
    throw new Error('PDFs are pictures of music, so the app can’t read the notes directly. Convert it to MusicXML first (see “Converting PDFs” below), or look for a MIDI/MusicXML version.');
  } else {
    const text = new TextDecoder().decode(buf);
    if (!/<score-(partwise|timewise)/.test(text)) throw new Error('Unsupported file. Use MusicXML (.musicxml, .xml, .mxl) or MIDI (.mid).');
    song = parseMusicXML(text, name);
  }
  if (!song.notes.length) throw new Error('No playable notes found.');
  return song;
}
