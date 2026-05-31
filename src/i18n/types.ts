// Shape of the i18n dictionary. Both es.ts and en.ts must satisfy this.

export type Dictionary = {
  brand: {
    name: string;
    tagline: string;
  };
  chrome: {
    undo: string;
    reset: string;
    newMatch: string;
    settings: string;
    ok: string;
    cancel: string;
    confirm: string;
    done: string;
    delete: string;
    add: string;
    customAdd: string;
    leader: string;
    target: string;
    targetChange: string;
    tied: string;
    leadsBy: (name: string, n: number) => string;
    vs: string;
    footerTagline: string;
  };
  team: {
    defaultA: string;
    defaultB: string;
    plusFor: (name: string) => string;
    plusForA11y: (name: string, n: number) => string;
    customForA11y: (name: string) => string;
    addPoints: string;
    arrived: string;
    toWin: (n: number) => string;
  };
  customModal: {
    titleFor: string;
    placeholder: string;
  };
  settings: {
    title: string;
    namesSection: string;
    targetSection: string;
    customLabel: string;
    languageSection: string;
    languageEs: string;
    languageEn: string;
    hapticsSection: string;
    hapticsLabel: string;
    hapticsHint: string;
    resetMatch: string;
  };
  history: {
    sectionTitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    removeRoundConfirm: (n: number, name: string) => string;
  };
  winner: {
    phrases: readonly string[];
    subtitles: readonly string[];
    keepPlaying: string;
    newMatch: string;
    share: string;
    shareMessage: (a: string, b: string, sa: number, sb: number) => string;
  };
  reset: {
    title: string;
    message: string;
    confirm: string;
  };
  newMatchConfirm: {
    title: string;
    message: string;
    confirm: string;
  };
};

export type LanguageCode = 'es' | 'en';
