// English dictionary.

import type { Dictionary } from './types';

export const en: Dictionary = {
  brand: {
    name: 'Anota',
  },
  chrome: {
    undo: 'Undo',
    newMatch: 'New match',
    settings: 'Settings',
    cancel: 'Cancel',
    confirm: 'Confirm',
    done: 'Done',
    delete: 'Delete',
    add: 'Add',
    leader: 'UP',
    target: 'First to',
    targetChange: 'change',
    tied: 'tied up',
    leadsBy: (name, n) => `${name} up by ${n}`,
    vs: 'vs',
  },
  team: {
    defaultA: 'Us',
    defaultB: 'Them',
    plusForA11y: (name, n) => `Add ${n} to ${name}`,
    customForA11y: (name) => `Custom points for ${name}`,
    addPoints: 'Points',
    arrived: 'they got it!',
    toWin: (n) => (n === 1 ? '1 away' : `${n} away`),
  },
  customModal: {
    titleFor: 'Points for',
  },
  settings: {
    title: 'Match settings',
    namesSection: 'Team names',
    targetSection: 'Play to',
    customLabel: 'Other',
    languageSection: 'Language',
    languageEs: 'Español',
    languageEn: 'English',
    hapticsSection: 'Haptics',
    hapticsLabel: 'Vibrate on tap',
    hapticsHint: 'Turn off if it’s bothering the table.',
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
  newMatchConfirm: {
    title: 'Run it back?',
    message: 'Scores reset. Names and target stay.',
    confirm: 'Run it back',
  },
  history: {
    sectionTitle: 'Rounds',
    emptySubtitle: 'Add points and they’ll show up here.',
    removeRoundConfirm: (n, name) => `Remove +${n} from ${name}?`,
  },
};
