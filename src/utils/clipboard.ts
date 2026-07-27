import type { Candidate } from '@/types/balancer';
import type { Language } from '@/types/i18n';
import { formatRankDisplay } from '@/utils/powerScore';

export function formatTeamSummaryText(candidate: Candidate, lang: Language = 'ko'): string {
  const sumPowerA = candidate.teamA.reduce((acc, a) => acc + a.player.powerScore, 0);
  const sumPowerB = candidate.teamB.reduce((acc, b) => acc + b.player.powerScore, 0);

  const getPrefBadge = (status: '1st' | '2nd' | 'fill' | 'forced') => {
    switch (status) {
      case '1st': return '⭐';
      case '2nd': return '🔹';
      case 'fill': return '🔄';
      case 'forced': return '⚠️';
    }
  };

  const title = lang === 'ja'
    ? `⚔️ [GAMERS.lol 5v5 チームバランス結果] ⚔️\n`
    : `⚔️ [GAMERS.lol 5v5 내전 팀 매칭 결과] ⚔️\n`;

  const totalScoreLabel = lang === 'ja' ? '総戦力' : 'Total Score';
  const diffLabel = lang === 'ja' ? 'チーム戦力差' : '팀 전력차';
  const penaltyLabel = lang === 'ja' ? 'レーン希望ペナルティ' : '선호도 감점';

  let text = title;
  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🔵 [BLUE TEAM] ${totalScoreLabel}: ${sumPowerA}\n`;

  candidate.teamA.forEach((a) => {
    const prefIcon = getPrefBadge(a.preferenceStatus);
    const rankStr = formatRankDisplay(a.player.tier, a.player.division, a.player.leaguePoints, a.player.isUnranked);
    text += `  • ${a.lane.padEnd(7)} | ${a.player.gameName}#${a.player.tagLine} (${rankStr}) ${prefIcon}\n`;
  });

  text += `\n🔴 [RED TEAM] ${totalScoreLabel}: ${sumPowerB}\n`;

  candidate.teamB.forEach((b) => {
    const prefIcon = getPrefBadge(b.preferenceStatus);
    const rankStr = formatRankDisplay(b.player.tier, b.player.division, b.player.leaguePoints, b.player.isUnranked);
    text += `  • ${b.lane.padEnd(7)} | ${b.player.gameName}#${b.player.tagLine} (${rankStr}) ${prefIcon}\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📊 ${diffLabel}: ${candidate.balanceScore} | ${penaltyLabel}: ${candidate.preferencePenalty}\n`;

  return text;
}
