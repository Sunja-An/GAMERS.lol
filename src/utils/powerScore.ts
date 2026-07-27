import type { Tier, Division } from '@/types/balancer';

export const TIER_ORDER: Tier[] = [
  'IRON',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'EMERALD',
  'DIAMOND',
  'MASTER',
  'GRANDMASTER',
  'CHALLENGER',
];

export const DIVISION_OFFSET: Record<Division, number> = {
  IV: 0,
  III: 100,
  II: 200,
  I: 300,
};

/**
 * Calculates PowerScore for a player based on Tier, Division, and LP.
 * Unranked defaults to Silver II baseline (1000 PowerScore).
 */
export function calculatePowerScore(
  tier: Tier,
  division: Division = 'II',
  leaguePoints: number = 0
): number {
  if (tier === 'UNRANKED') {
    // Default SILVER II
    return 1000;
  }

  const tierIndex = TIER_ORDER.indexOf(tier);
  if (tierIndex === -1) return 1000;

  const baseScore = tierIndex * 400;

  if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier)) {
    return baseScore + Math.max(0, leaguePoints);
  }

  const divOffset = DIVISION_OFFSET[division] ?? 0;
  const lpOffset = Math.min(Math.max(0, leaguePoints), 99);

  return baseScore + divOffset + lpOffset;
}

/**
 * Returns formatted Tier string (e.g. "GOLD I (45 LP)")
 */
export function formatRankDisplay(tier: Tier, division: Division, lp: number, isUnranked?: boolean): string {
  if (tier === 'UNRANKED' || isUnranked) {
    return 'UNRANKED (Silver II 기준)';
  }
  if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier)) {
    return `${tier} (${lp} LP)`;
  }
  return `${tier} ${division} (${lp} LP)`;
}
