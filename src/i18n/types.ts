// Shape of the i18n dictionary. Both es.ts and en.ts must satisfy this.

export type Dictionary = {
  brand: {
    name: string;
  };
  chrome: {
    undo: string;
    undoLast: (n: number) => string;
    undoA11y: (n: number, name: string) => string;
    newMatch: string;
    settings: string;
    cancel: string;
    confirm: string;
    done: string;
    delete: string;
    add: string;
    leader: string;
    target: string;
    targetChange: string;
    tied: string;
    leadsBy: (name: string, n: number) => string;
    vs: string;
  };
  team: {
    defaultA: string;
    defaultB: string;
    plusForA11y: (name: string, n: number) => string;
    customForA11y: (name: string) => string;
    addPoints: string;
    arrived: string;
    toWin: (n: number) => string;
    // left is the visible remaining text (toWin or arrived), so VoiceOver says what the card shows.
    scoreA11y: (name: string, score: number, target: number, left: string, leading: boolean) => string;
    renameHint: string;
  };
  customModal: {
    titleFor: string;
    // The team's total under the entry: alone before digits, then with the result.
    total: (score: number, next: number | null) => string;
    totalA11y: (score: number, next: number | null) => string;
  };
  settings: {
    namesSection: string;
    nameFirstA11y: string;
    nameSecondA11y: string;
    targetSection: string;
    customLabel: string;
    customTargetA11y: string;
    languageSection: string;
    languageEs: string;
    languageEn: string;
    hapticsLabel: string;
    hapticsHint: string;
    themeSection: string;
    themeNames: { classic: string; midnight: string; mahogany: string; casino: string; bone: string; carbon: string };
    themeLockedTag: string;
    themeLockedA11y: string;
    themeLockedHint: string;
    purchasesSection: string;
    removeAdsRow: string;
  };
  history: {
    emptySubtitle: string;
    removeRoundConfirm: (n: number, name: string) => string;
    removeHint: string;
    removeButton: string;
  };
  winner: {
    phrases: readonly string[];
    subtitles: readonly string[];
    keepPlaying: string;
    newMatch: string;
    share: string;
    shareMessage: (a: string, b: string, sa: number, sb: number) => string;
  };
  newMatchConfirm: {
    title: string;
    message: string;
    confirm: string;
  };
  pro: {
    title: string;
    blurb: string;
    themeContext: (themeName: string) => string;
    buyPro: string;
    proIncludes: string;
    proIncludesAdsOff: string;
    buyRemoveAds: string;
    buying: string;
    restore: string;
    restored: string;
    notFound: string;
    restoreFailed: string;
    thanks: string;
    thanksNoAds: string;
    close: string;
    errorTitle: string;
    storeError: string;
    unavailable: string;
  };
};

export type LanguageCode = 'es' | 'en';
