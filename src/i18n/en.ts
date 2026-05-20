// English dictionary.

import type { Dictionary } from './types';

export const en: Dictionary = {
  brand: {
    name: 'Anota',
    tagline: 'Domino Scorekeeper',
  },
  chrome: {
    undo: 'Undo',
    reset: 'Reset',
    settings: 'Settings',
    ok: 'OK',
    cancel: 'Cancel',
    confirm: 'Confirm',
    done: 'Done',
    add: 'Add',
    customAdd: 'Other',
    leader: 'LEAD',
    target: 'To',
    targetChange: 'change',
    tied: 'tied',
    leadsBy: (name, n) => `${name} leads by ${n}`,
    vs: 'vs',
    footerTagline: 'Built for the domino table · tiles, capicúa, and coffee',
  },
  team: {
    defaultA: 'Us',
    defaultB: 'Them',
    plusFor: (name) => `+ for ${name}`,
    arrived: 'they did it!',
    toWin: (n) => (n === 1 ? '1 to win' : `${n} to win`),
  },
  customModal: {
    titleFor: 'Points for',
    placeholder: '0',
  },
  settings: {
    title: 'Match settings',
    namesSection: 'Team names',
    targetSection: 'Play to',
    customLabel: 'Other',
    languageSection: 'Language',
    languageEs: 'Español',
    languageEn: 'English',
    resetMatch: 'Reset match',
  },
  winner: {
    phrases: [
      'Capicúa!',
      'That’s the game!',
      'They got it!',
      'Game over!',
      'Take it home!',
      'All yours!',
    ],
    subtitles: [
      'Pour another coffee.',
      'One more hand?',
      'Easy money.',
      'Match won.',
      'Stack the tiles.',
    ],
    keepPlaying: 'Keep playing',
    newMatch: 'New match',
    share: 'Share',
    shareMessage: (a, b, sa, sb) =>
      `🁢 Anota — Domino Scorekeeper\n${a} ${sa} – ${sb} ${b}\n${a} won!`,
  },
  reset: {
    title: 'Reset the match?',
    message:
      'Scores and rounds are cleared. Team names and target stay the same.',
    confirm: 'Reset',
  },
  history: {
    sectionTitle: 'Rounds',
    emptyTitle: 'No rounds yet',
    emptySubtitle: 'Add points and they’ll show up here.',
  },
};
