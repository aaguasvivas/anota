// Shape of the i18n dictionary. Both es.ts and en.ts must satisfy this.

export type Dictionary = {
  brand: {
    name: string;
    tagline: string;
  };
  chrome: {
    undo: string;
    reset: string;
    settings: string;
    ok: string;
    cancel: string;
    confirm: string;
    done: string;
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
    resetMatch: string;
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
  history: {
    sectionTitle: string;
    emptyTitle: string;
    emptySubtitle: string;
  };
};

export type LanguageCode = 'es' | 'en';
