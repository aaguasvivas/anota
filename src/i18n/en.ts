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
    newMatch: 'New match',
    settings: 'Settings',
    ok: 'OK',
    cancel: 'Cancel',
    confirm: 'Confirm',
    done: 'Done',
    add: 'Add',
    customAdd: 'Other',
    leader: 'UP',
    target: 'First to',
    targetChange: 'change',
    tied: 'tied up',
    leadsBy: (name, n) => `${name} up by ${n}`,
    vs: 'vs',
    footerTagline: 'Made for the table · tiles, capicúa, café',
  },
  team: {
    defaultA: 'Us',
    defaultB: 'Them',
    plusFor: (name) => `+ for ${name}`,
    plusForA11y: (name, n) => `Add ${n} to ${name}`,
    customForA11y: (name) => `Custom points for ${name}`,
    arrived: 'they got it!',
    toWin: (n) => (n === 1 ? '1 away' : `${n} away`),
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
      'That’s a wrap!',
      'Run it!',
      'Money!',
      'Lights out!',
      'Game!',
    ],
    subtitles: [
      'Run it back?',
      'Easy money.',
      'Stack ’em up.',
      'Take the W.',
      'Off the table.',
    ],
    keepPlaying: 'Keep playing',
    newMatch: 'New match',
    share: 'Share',
    shareMessage: (a, b, sa, sb) =>
      `🁢 Anota\n${a} ${sa} – ${sb} ${b}\n${a} took it. Capicúa!`,
  },
  reset: {
    title: 'Reset the match?',
    message:
      'Scores and rounds are cleared. Team names and target stay the same.',
    confirm: 'Reset',
  },
  newMatchConfirm: {
    title: 'Run it back?',
    message: 'Scores reset. Names and target stay.',
    confirm: 'Run it back',
  },
  history: {
    sectionTitle: 'Rounds',
    emptyTitle: 'No rounds yet',
    emptySubtitle: 'Add points and they’ll show up here.',
  },
};
