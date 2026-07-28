export type Language = 'ko' | 'ja';

export interface Translations {
  header: {
    title: string;
    subtitle: string;
    reset: string;
    navAbout: string;
    regionLabel: string;
  };
  steps: {
    input: string;
    config: string;
    result: string;
  };
  input: {
    regionSectionTitle: string;
    regionSectionSubtitle: string;
    title: string;
    subtitle: string;
    extractTitle: string;
    extractSubtitle: string;
    textareaPlaceholder: string;
    clearBtn: string;
    loadDemoBtn: string;
    readClipboardBtn: string;
    statusReady: string;
    statusTooMany: (count: number) => string;
    statusRequired: (remaining: number) => string;
    distilledTitle: string;
    emptyText: string;
    startBalanceBtn: string;
    helperReady: string;
    helperRequired: string;
    parseBtn: string;
    countValid: (count: number) => string;
    countInvalid: (count: number) => string;
    exceededError: string;
    listTitle: (count: number) => string;
    addPlayer: string;
    nextBtn: string;
    loading: string;
    namePlaceholder: string;
    tagPlaceholder: string;
    verifyingText: (regionName: string) => string;
    verifiedStatus: (count: number, total: number, regionName: string) => string;
    verifiedBadge: string;
    unverifiedBadge: string;
    autoTagBtn: (tag: string) => string;
  };
  config: {
    title: string;
    subtitle: string;
    backBtn: string;
    pref1st: string;
    pref2nd: string;
    fillOk: string;
    editRank: string;
    startMatching: string;
  };
  modal: {
    title: (name: string) => string;
    tierLabel: string;
    divisionLabel: string;
    lpLabel: string;
    cancel: string;
    save: string;
  };
  result: {
    title: string;
    subtitle: string;
    noData: string;
    backToConfig: string;
    copyResult: string;
    copied: string;
    reroll: string;
    recomputedNotice: string;
    progress: string;
    balanceDiff: string;
    penalty: string;
    blueTeam: string;
    redTeam: string;
    viewModeCards: string;
    viewModeMatchup: string;
    lineMatchupTitle: string;
    laneAdvantage: (diff: number, fav: 'BLUE' | 'RED' | 'EQUAL') => string;
    totalPower: (val: number) => string;
    avgPower: (val: number) => string;
    prefBadges: {
      '1st': string;
      '2nd': string;
      fill: string;
      forced: string;
    };
  };
  footer: {
    rights: string;
    disclaimer: string;
    github: string;
    blog: string;
  };
}
