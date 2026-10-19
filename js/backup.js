// Save a progress backup: iPad share sheet ("Save to Files" → iCloud Drive),
// or a download elsewhere.

import { h, toast } from './ui.js';
import { makeBackup } from './store.js';

export async function backupNow() {
  const data = await makeBackup();
  const name = `ivory-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const file = new File([blob], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Keys to the Universe backup' });
      toast('Backup ready ✓', 'ok');
      return true;
    } catch (e) {
      if (e && e.name === 'AbortError') return false;
    }
  }
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a);
  a.click();
  a.remove();
  toast('Backup saved ✓', 'ok');
  return true;
}
