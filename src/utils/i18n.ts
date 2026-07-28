import type { Language, Translations } from '@/types/i18n';

export const TRANSLATIONS: Record<Language, Translations> = {
  ko: {
    header: {
      title: 'GAMERS',
      subtitle: '5vs5 Team Balance',
      reset: '🔄 처음으로',
    },
    steps: {
      input: '1. 소환사 10명 입력',
      config: '2. 라인 선호도 & 티어 설정',
      result: '3. 최적 팀 밸런스 결과',
    },
    input: {
      title: '📋 롤 대기열 채팅 복사 / 소환사 입력',
      subtitle:
        '리그 오브 레전드 대기열 채팅(OOO님이 들어왔습니다.) 또는 이름#태그 목록을 붙여넣으세요.',
      textareaPlaceholder: `예시:\nHide on bush#KR1님이 들어왔습니다.\nCanyon#KR1님이 들어왔습니다.\nZeus#KR1\nViper#KR1\n...`,
      parseBtn: '🔍 소환사 파싱 및 Riot API 데이터 조회 ➔',
      countValid: (count) => `인식된 소환사: ${count} / 10명`,
      countInvalid: (count) => `현재 ${count}명 인식됨 (정확히 10명이 필요합니다)`,
      exceededError: '소환사가 10명을 초과했습니다. 처음 10명만 사용됩니다.',
      listTitle: (count) => `소환사 목록 (${count}/10)`,
      addPlayer: '+ 플레이어 추가',
      nextBtn: '다음: 라인 선호도 & 전력 확인 ➔',
      loading: '소환사 데이터 조회 중...',
      namePlaceholder: '닉네임',
      tagPlaceholder: '태그',
    },
    config: {
      title: '⚙️ 소환사 전력 및 라인 선호도 설정',
      subtitle: '각 플레이어의 1/2지망 주 라인을 선택하거나 라인 무관(Fill)을 설정하세요.',
      backBtn: '← 소환사 목록 수정',
      pref1st: '1지망:',
      pref2nd: '2지망:',
      fillOk: '모든 라인 가능 (Fill OK)',
      editRank: '티어/전력 직접 수정',
      startMatching: '⚔️ 최적 5v5 팀 밸런스 매칭 시작 ➔',
    },
    modal: {
      title: (name) => `✏️ ${name} 티어/전력 직접 수정`,
      tierLabel: '티어 (Tier)',
      divisionLabel: '단계 (Division)',
      lpLabel: '리그 포인트 (LP)',
      cancel: '취소',
      save: '저장',
    },
    result: {
      title: '🏆 5v5 내전 팀 매칭 결과',
      subtitle: '선호 라인 매칭과 전력 밸런스가 균형을 이루는 Top-K 조합입니다.',
      backToConfig: '⚙️ 설정 수정',
      copyResult: '📋 결과 복사',
      copied: '✅ 복사 완료!',
      reroll: '🎲 팀 재분배 (Re-roll)',
      recomputedNotice:
        '✨ 조합 풀을 모두 확인하여, 전력에 미세 무작위 변화(±3% Jitter)를 주어 새로운 최적 조합을 재계산했습니다!',
      progress: '조합 진행도',
      balanceDiff: '팀 전력차 (Balance Diff)',
      penalty: '선호 라인 감점',
      blueTeam: '🔵 BLUE TEAM',
      redTeam: '🔴 RED TEAM',
      viewModeCards: '🎴 팀 카드 뷰',
      viewModeMatchup: '⚔️ 라인별 맞대결 뷰',
      lineMatchupTitle: '🎯 라인(Line)별 1:1 전력 맞대결 분석',
      laneAdvantage: (diff, fav) =>
        fav === 'EQUAL'
          ? '⚖️ 동등'
          : fav === 'BLUE'
          ? `🔵 +${diff} PS 우세`
          : `🔴 +${diff} PS 우세`,
      totalPower: (val) => `총 전력: ${val}`,
      avgPower: (val) => `평균 PS: ${val}`,
      prefBadges: {
        '1st': '⭐ 1지망',
        '2nd': '🔹 2지망',
        fill: '🔄 Fill',
        forced: '⚠️ 강제',
      },
    },
  },
  ja: {
    header: {
      title: 'GAMERS',
      subtitle: '5vs5 Team Balance',
      reset: '🔄 リセット',
    },
    steps: {
      input: '1. 召喚士10名入力',
      config: '2. レーン希望 & ランク設定',
      result: '3. 最適チームバランス結果',
    },
    input: {
      title: '📋 ロビーチャット貼り付け / 召喚士入力',
      subtitle:
        'LoLロビーチャット（OOOが参加しました。）または 名前#タグ のリストを貼り付けてください。',
      textareaPlaceholder: `例:\nHide on bush#KR1が参加しました。\nCanyon#KR1が参加しました。\nZeus#KR1\nViper#KR1\n...`,
      parseBtn: '🔍 召喚士解析 & Riot API データ照会 ➔',
      countValid: (count) => `認識された召喚士: ${count} / 10名`,
      countInvalid: (count) => `現在 ${count}名 認識 (正確に10名必要です)`,
      exceededError: '召喚士が10名を超えています。最初の10名のみ使用されます。',
      listTitle: (count) => `召喚士一覧 (${count}/10)`,
      addPlayer: '+ プレイヤー追加',
      nextBtn: '次へ: レーン希望 & 戦력確認 ➔',
      loading: '召喚士データ照会中...',
      namePlaceholder: 'サモナー名',
      tagPlaceholder: 'タグ',
    },
    config: {
      title: '⚙️ 召喚士戦力 & レーン希望設定',
      subtitle: '各プレイヤーの第1/第2希望レーンを選択するか、おまかせ(Fill)を設定してください。',
      backBtn: '← 召喚士一覧修正',
      pref1st: '第1希望:',
      pref2nd: '第2希望:',
      fillOk: '全レーン可能 (Fill OK)',
      editRank: 'ランク/戦力直接編集',
      startMatching: '⚔️ 最適 5v5 チームマッチング開始 ➔',
    },
    modal: {
      title: (name) => `✏️ ${name} ランク/戦力直接編集`,
      tierLabel: 'ティア (Tier)',
      divisionLabel: 'ディビジョン (Division)',
      lpLabel: 'リーグポイント (LP)',
      cancel: 'キャンセル',
      save: '保存',
    },
    result: {
      title: '🏆 5v5 チームマッチング結果',
      subtitle: '希望レーンと戦力バランスが調整された Top-K 組み合わせです。',
      backToConfig: '⚙️ 設定修正',
      copyResult: '📋 結果コピー',
      copied: '✅ コピー完了!',
      reroll: '🎲 チーム再分配 (Re-roll)',
      recomputedNotice:
        '✨ すべての組み合わせを確認したため、微小ランダム変化(±3% Jitter)を加えて新たな最適組み合せを再計算しました！',
      progress: '組み合わせ進行度',
      balanceDiff: 'チーム戦力差 (Balance Diff)',
      penalty: 'レーン希望ペナルティ',
      blueTeam: '🔵 BLUE TEAM',
      redTeam: '🔴 RED TEAM',
      viewModeCards: '🎴 チームカード表示',
      viewModeMatchup: '⚔️ レーン対決表示',
      lineMatchupTitle: '🎯 レーン(Line)別 1:1 戦力対決分析',
      laneAdvantage: (diff, fav) =>
        fav === 'EQUAL'
          ? '⚖️ イーブン'
          : fav === 'BLUE'
          ? `🔵 +${diff} PS 優勢`
          : `🔴 +${diff} PS 優勢`,
      totalPower: (val) => `総戦力: ${val}`,
      avgPower: (val) => `平均 PS: ${val}`,
      prefBadges: {
        '1st': '⭐ 第1希望',
        '2nd': '🔹 第2希望',
        fill: '🔄 おまかせ',
        forced: '⚠️ 強制',
      },
    },
  },
};

export function t(lang: Language): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.ko;
}
