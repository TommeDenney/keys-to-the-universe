// Challenges page (daily / weekly / monthly + rogue-planet side quests),
// a compact card for the Learn tab, and the side-quest launcher.

import { h, icon, modal, toast } from '../ui.js';
import { current, PERIODS, nextReset, track } from '../challenges.js';
import { QUESTS } from '../data/quests.js';
import { SYMBOL, owns, spend, questDone, completeQuest, walletPill, balance } from '../economy.js';
import { getState, saveState } from '../store.js';
import { getSong } from '../data/catalog.js';
import { playSong } from './songpage.js';
import { specialBossEl, specialBosses } from './specialboss.js';

function countdown(period) {
  const ms = nextReset(period) - Date.now();
  const d = Math.floor(ms / 86400000);
  const hr = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return d ? `${d}d ${hr}h left` : hr ? `${hr}h ${m}m left` : `${m}m left`;
}

function row(ch) {
  const pct = Math.round((ch.value / ch.goal) * 100);
  return h('div', { class: `ch-row ${ch.done ? 'done' : ''}` }, [
    h('div', { class: 'ch-text' }, [h('b', {}, ch.text), h('div', { class: 'ch-bar' }, h('i', { style: { width: `${pct}%` } })), h('small', {}, ch.done ? 'Complete' : `${Math.floor(ch.value)} / ${ch.goal}`)]),
    h('span', { class: 'ch-reward' }, ch.done ? icon('check') : `+${ch.reward} ${SYMBOL}`),
  ]);
}

/** Compact card for the top of the Learn tab. */
export function challengesCard() {
  const daily = current('daily');
  const done = daily.filter((c) => c.done).length;
  return h('a', { class: 'ch-card', href: '#/challenges' }, [
    h('div', { class: 'ch-card-head' }, [h('b', {}, 'Daily challenges'), h('span', {}, `${done}/${daily.length} · ${countdown('daily')}`)]),
    h('div', { class: 'ch-mini' }, daily.map((c) => h('i', { class: c.done ? 'done' : '', style: { '--p': `${Math.round((c.value / c.goal) * 100)}%` }, title: c.text }))),
    h('span', { class: 'ch-more' }, ['Weekly, monthly & side quests', icon('chevron')]),
  ]);
}

const questState = () => { const st = getState(); st.questUnlocked ||= []; return st; };
export const questUnlocked = (id) => questState().questUnlocked.includes(id);

/** Launch (or unlock, then launch) a rogue-planet side quest. */
export function openQuest(q) {
  const done = questDone(q.id);
  const unlocked = questUnlocked(q.id);
  modal((close) => [
    h('div', { class: 'quest-modal' }, [
      h('div', { class: 'eyebrow' }, 'Rogue planet · side quest'),
      h('h2', {}, q.name),
      h('p', {}, q.desc),
      h('div', { class: 'quest-facts' }, [
        h('span', {}, [icon('star'), ` Reward: ${q.reward} ${SYMBOL}${done ? ' (claimed)' : ''}`]),
        unlocked ? h('span', {}, 'Course plotted ✓') : h('span', {}, `Launch fuel: ${q.cost} ${SYMBOL}`),
      ]),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn ghost', onclick: close }, 'Not now'),
        h('button', {
          class: 'btn primary',
          onclick: async () => {
            if (!unlocked) {
              if (!spend(q.cost)) { toast(`You need ${q.cost - balance()} more ${SYMBOL} of fuel.`, 'bad'); return; }
              const st = questState();
              st.questUnlocked.push(q.id);
              saveState();
            }
            close();
            const song = await getSong(q.song);
            const range = q.range ? [song.measures.findIndex((m) => m.number === q.range[0]), song.measures.findIndex((m) => m.number === q.range[1])] : null;
            playSong(song, {
              hands: q.hands, mode: q.mode, tempo: q.tempo, names: q.names, range, hideOther: q.hands !== 'both',
              title: `${q.name}: ${song.title}`, subtitle: `Side quest · need ${q.need}★`,
              onFinish: (r) => {
                if (r.stars >= q.need) {
                  if (completeQuest(q.id, q.reward)) { toast(`Side quest complete! +${q.reward} ${SYMBOL}`, 'ok'); track('quests'); }
                } else toast(`Side quest: you need ${q.need}★. Try again!`, 'bad');
              },
            });
          },
        }, unlocked ? [icon('play'), done ? 'Play again' : 'Launch'] : [`Launch (${q.cost} ${SYMBOL})`]),
      ]),
    ]),
  ]);
}

export function renderChallenges(root) {
  const page = h('div', { class: 'page challenges' });
  root.append(page);
  page.append(
    h('a', { class: 'back-link', href: '#/learn' }, [icon('back'), 'Learn']),
    h('header', { class: 'top' }, [h('div', {}, [h('div', { class: 'eyebrow' }, 'Earn extra Stardust'), h('h1', {}, 'Challenges')]), walletPill('big')]),
    ...PERIODS.map((p) => h('section', { class: `card ch-period ch-${p.id}` }, [
      h('div', { class: 'ch-head' }, [h('h2', {}, `${p.name} challenges`), h('span', { class: 'badge' }, countdown(p.id))]),
      ...current(p.id).map(row),
    ])),
    h('section', { class: 'card ch-period' }, [
      h('div', { class: 'ch-head' }, [h('h2', {}, 'Guardian bounties'), h('span', { class: 'badge' }, countdown('weekly'))]),
      h('p', { class: 'muted' }, `Every Guardian pays its full Stardust reward again once a week (resets Monday). Rematch old bosses to earn more!`),
    ]),
    specialBosses().length ? h('section', { class: 'card ch-period special-boss' }, [
      h('div', { class: 'ch-head' }, [h('h2', {}, 'Special bosses'), h('span', { class: 'badge' }, 'Weekly bounties')]),
      h('div', { class: 'special-row' }, specialBosses().map((f) => specialBossEl(f))),
    ]) : null,
    h('section', { class: 'card ch-period' }, [
      h('div', { class: 'ch-head' }, [h('h2', {}, 'Rogue planets'), h('span', { class: 'badge' }, 'Side quests')]),
      h('p', { class: 'muted' }, 'Special challenges drifting between galaxies. Pay the launch fuel once, then beat the challenge for a big reward.'),
      h('div', { class: 'quest-list' }, QUESTS.map((q) => h('button', { class: `quest-row ${questDone(q.id) ? 'done' : ''}`, onclick: () => openQuest(q) }, [
        h('i', { class: `quest-orb k-${q.kind}` }),
        h('span', { class: 'grow' }, [h('b', {}, q.name), h('small', {}, q.desc)]),
        h('span', { class: 'ch-reward' }, questDone(q.id) ? icon('check') : `+${q.reward} ${SYMBOL}`),
      ]))),
    ]),
  );
}
