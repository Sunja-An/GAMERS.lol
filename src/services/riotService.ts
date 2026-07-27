import type { Player, ParsedRiotId, Tier, Division } from '@/types/balancer';
import type { Language } from '@/types/i18n';
import { calculatePowerScore } from '@/utils/powerScore';

// Sample 10 players dataset for 1-click testing
export const MOCK_PLAYERS_SAMPLE: Player[] = [
  {
    puuid: 'mock-puuid-1',
    gameName: 'Hide on bush',
    tagLine: 'KR1',
    profileIconId: 548,
    tier: 'CHALLENGER',
    division: 'I',
    leaguePoints: 850,
    powerScore: calculatePowerScore('CHALLENGER', 'I', 850),
    preferences: [
      { lane: 'MID', priority: 1 },
      { lane: 'TOP', priority: 2 },
    ],
    fillOk: false,
  },
  {
    puuid: 'mock-puuid-2',
    gameName: 'Canyon',
    tagLine: 'KR1',
    profileIconId: 1250,
    tier: 'GRANDMASTER',
    division: 'I',
    leaguePoints: 600,
    powerScore: calculatePowerScore('GRANDMASTER', 'I', 600),
    preferences: [
      { lane: 'JUNGLE', priority: 1 },
      { lane: 'MID', priority: 2 },
    ],
    fillOk: true,
  },
  {
    puuid: 'mock-puuid-3',
    gameName: 'Zeus',
    tagLine: 'KR1',
    profileIconId: 980,
    tier: 'MASTER',
    division: 'I',
    leaguePoints: 320,
    powerScore: calculatePowerScore('MASTER', 'I', 320),
    preferences: [
      { lane: 'TOP', priority: 1 },
      { lane: 'ADC', priority: 2 },
    ],
    fillOk: false,
  },
  {
    puuid: 'mock-puuid-4',
    gameName: 'Viper',
    tagLine: 'KR1',
    profileIconId: 1102,
    tier: 'DIAMOND',
    division: 'I',
    leaguePoints: 75,
    powerScore: calculatePowerScore('DIAMOND', 'I', 75),
    preferences: [
      { lane: 'ADC', priority: 1 },
      { lane: 'MID', priority: 2 },
    ],
    fillOk: false,
  },
  {
    puuid: 'mock-puuid-5',
    gameName: 'Keria',
    tagLine: 'KR1',
    profileIconId: 4402,
    tier: 'DIAMOND',
    division: 'II',
    leaguePoints: 40,
    powerScore: calculatePowerScore('DIAMOND', 'II', 40),
    preferences: [
      { lane: 'SUPPORT', priority: 1 },
      { lane: 'ADC', priority: 2 },
    ],
    fillOk: true,
  },
  {
    puuid: 'mock-puuid-6',
    gameName: 'ShowMaker',
    tagLine: 'DK1',
    profileIconId: 3150,
    tier: 'EMERALD',
    division: 'I',
    leaguePoints: 90,
    powerScore: calculatePowerScore('EMERALD', 'I', 90),
    preferences: [
      { lane: 'MID', priority: 1 },
      { lane: 'JUNGLE', priority: 2 },
    ],
    fillOk: false,
  },
  {
    puuid: 'mock-puuid-7',
    gameName: 'Peanut',
    tagLine: 'HLE',
    profileIconId: 2080,
    tier: 'EMERALD',
    division: 'III',
    leaguePoints: 20,
    powerScore: calculatePowerScore('EMERALD', 'III', 20),
    preferences: [
      { lane: 'JUNGLE', priority: 1 },
      { lane: 'SUPPORT', priority: 2 },
    ],
    fillOk: true,
  },
  {
    puuid: 'mock-puuid-8',
    gameName: 'Doran',
    tagLine: 'T1',
    profileIconId: 1600,
    tier: 'GOLD',
    division: 'I',
    leaguePoints: 50,
    powerScore: calculatePowerScore('GOLD', 'I', 50),
    preferences: [
      { lane: 'TOP', priority: 1 },
      { lane: 'JUNGLE', priority: 2 },
    ],
    fillOk: false,
  },
  {
    puuid: 'mock-puuid-9',
    gameName: 'Chovy',
    tagLine: 'GEN',
    profileIconId: 5000,
    tier: 'SILVER',
    division: 'II',
    leaguePoints: 10,
    powerScore: calculatePowerScore('SILVER', 'II', 10),
    preferences: [
      { lane: 'MID', priority: 1 },
      { lane: 'TOP', priority: 2 },
    ],
    fillOk: true,
  },
  {
    puuid: 'mock-puuid-10',
    gameName: 'NewbieGamers',
    tagLine: 'LOL',
    profileIconId: 1,
    tier: 'UNRANKED',
    division: 'II',
    leaguePoints: 0,
    powerScore: calculatePowerScore('UNRANKED', 'II', 0),
    preferences: [
      { lane: 'SUPPORT', priority: 1 },
      { lane: 'ADC', priority: 2 },
    ],
    fillOk: true,
    isUnranked: true,
  },
];

export function getMockSampleLogText(lang: Language = 'ko'): string {
  const suffix = lang === 'ja' ? 'が参加しました。' : '님이 들어왔습니다.';
  return MOCK_PLAYERS_SAMPLE.map((p) => `${p.gameName}#${p.tagLine}${suffix}`).join('\n');
}

/**
 * Resolves parsed Riot IDs. If backend is connected, calls API.
 * Falls back cleanly to generating initial player records with mock tier data or baseline silver.
 */
export async function resolveRiotPlayers(parsedIds: ParsedRiotId[]): Promise<Player[]> {
  const riotApiKey = import.meta.env.VITE_RIOT_API_KEY || '';

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (riotApiKey) {
      headers['X-Riot-Token'] = riotApiKey;
    }

    const response = await fetch('/api/v1/team-balance/resolve', {
      method: 'POST',
      headers,
      body: JSON.stringify({ players: parsedIds }),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.players) && data.players.length === 10) {
        return data.players.map((p: any) => ({
          ...p,
          preferences: p.preferences || [],
          fillOk: p.fillOk ?? true,
        }));
      }
    }
  } catch (_err) {
    // API endpoint unavailable, fallback to client-side resolver
  }

  // Client-side mock resolver fallback
  return parsedIds.map((item, idx) => {
    // Match mock player if name aligns, else assign default mock tier
    const matched = MOCK_PLAYERS_SAMPLE.find(
      (m) => m.gameName.toLowerCase() === item.gameName.toLowerCase()
    );

    if (matched) {
      return {
        ...matched,
        puuid: `puuid-${item.gameName}-${item.tagLine}`,
        gameName: item.gameName,
        tagLine: item.tagLine,
      };
    }

    // Default tiered assignment for unknown custom names
    const fallbackTiers: { tier: Tier; division: Division; lp: number }[] = [
      { tier: 'EMERALD', division: 'I', lp: 50 },
      { tier: 'GOLD', division: 'II', lp: 30 },
      { tier: 'PLATINUM', division: 'III', lp: 10 },
      { tier: 'DIAMOND', division: 'IV', lp: 0 },
      { tier: 'SILVER', division: 'I', lp: 80 },
      { tier: 'BRONZE', division: 'II', lp: 40 },
      { tier: 'MASTER', division: 'I', lp: 150 },
      { tier: 'GOLD', division: 'IV', lp: 20 },
      { tier: 'SILVER', division: 'III', lp: 10 },
      { tier: 'UNRANKED', division: 'II', lp: 0 },
    ];

    const fallback = fallbackTiers[idx % fallbackTiers.length];
    const powerScore = calculatePowerScore(fallback.tier, fallback.division, fallback.lp);

    return {
      puuid: `puuid-${idx}-${item.gameName}`,
      gameName: item.gameName,
      tagLine: item.tagLine || 'KR1',
      profileIconId: 1 + (idx * 50) % 5000,
      tier: fallback.tier,
      division: fallback.division,
      leaguePoints: fallback.lp,
      powerScore,
      preferences: [
        { lane: ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'][idx % 5] as any, priority: 1 },
      ],
      fillOk: true,
      isUnranked: fallback.tier === 'UNRANKED',
    };
  });
}
