import type { Player, ParsedRiotId, Tier, Division } from '@/types/balancer';
import { calculatePowerScore } from '@/utils/powerScore';

/**
 * Direct Live Riot API Resolution:
 * 1. Account-V1: GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine} -> puuid
 * 2. Summoner-V4: GET /lol/summoner/v4/summoners/by-puuid/{puuid} -> profileIconId
 * 3. League-V4: GET /lol/league/v4/entries/by-puuid/{puuid} -> RANKED_SOLO_5x5 Tier, Division, LP
 */
async function resolveSingleLiveRiotPlayer(
  item: ParsedRiotId,
  idx: number,
  apiKey: string
): Promise<Player | null> {
  const headers = { 'X-Riot-Token': apiKey };

  try {
    // 1. Account-V1
    const accountUrl = `/riot-asia/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      item.gameName
    )}/${encodeURIComponent(item.tagLine)}`;

    const accRes = await fetch(accountUrl, { headers });
    if (!accRes.ok) return null;

    const accData = await accRes.json();
    const puuid = accData.puuid;
    const resolvedName = accData.gameName || item.gameName;
    const resolvedTag = accData.tagLine || item.tagLine;

    // 2. Summoner-V4 & 3. League-V4 in parallel
    const summonerUrl = `/riot-kr/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const leagueUrl = `/riot-kr/lol/league/v4/entries/by-puuid/${puuid}`;

    const [sumRes, leagueRes] = await Promise.all([
      fetch(summonerUrl, { headers }).catch(() => null),
      fetch(leagueUrl, { headers }).catch(() => null),
    ]);

    let profileIconId = 1;
    if (sumRes && sumRes.ok) {
      const sumData = await sumRes.json();
      if (sumData.profileIconId) {
        profileIconId = sumData.profileIconId;
      }
    }

    let tier: Tier = 'UNRANKED';
    let division: Division = 'II';
    let leaguePoints = 0;
    let isUnranked = true;

    if (leagueRes && leagueRes.ok) {
      const leagueEntries = await leagueRes.json();
      if (Array.isArray(leagueEntries)) {
        const soloQueue = leagueEntries.find((e: any) => e.queueType === 'RANKED_SOLO_5x5');
        if (soloQueue) {
          tier = (soloQueue.tier as Tier) || 'UNRANKED';
          division = (soloQueue.rank as Division) || 'II';
          leaguePoints = Number(soloQueue.leaguePoints) || 0;
          isUnranked = tier === 'UNRANKED';
        }
      }
    }

    const powerScore = calculatePowerScore(tier, division, leaguePoints);

    return {
      puuid,
      gameName: resolvedName,
      tagLine: resolvedTag,
      profileIconId,
      tier,
      division,
      leaguePoints,
      powerScore,
      preferences: [
        { lane: ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'][idx % 5] as any, priority: 1 },
      ],
      fillOk: true,
      isUnranked,
    };
  } catch (err) {
    console.warn(`Riot API direct fetch failed for ${item.gameName}#${item.tagLine}:`, err);
    return null;
  }
}

/**
 * Main resolution function:
 * Strictly resolves live player data from Riot API.
 * If a player cannot be resolved or API key is not set, returns UNRANKED player record for that exact name/tag.
 * Mock player datasets are completely removed.
 */
export async function resolveRiotPlayers(parsedIds: ParsedRiotId[]): Promise<Player[]> {
  const riotApiKey = import.meta.env.VITE_RIOT_API_KEY || '';

  const results: Player[] = [];

  for (let idx = 0; idx < parsedIds.length; idx++) {
    const item = parsedIds[idx];
    let resolvedPlayer: Player | null = null;

    if (riotApiKey && !riotApiKey.includes('YOUR_RIOT_API_KEY')) {
      resolvedPlayer = await resolveSingleLiveRiotPlayer(item, idx, riotApiKey);
    }

    if (resolvedPlayer) {
      results.push(resolvedPlayer);
    } else {
      // Create UNRANKED baseline record for the exact user-entered name/tag
      results.push({
        puuid: `puuid-${idx}-${item.gameName}`,
        gameName: item.gameName,
        tagLine: item.tagLine || 'KR1',
        profileIconId: 1,
        tier: 'UNRANKED',
        division: 'II',
        leaguePoints: 0,
        powerScore: calculatePowerScore('UNRANKED', 'II', 0),
        preferences: [
          { lane: ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'][idx % 5] as any, priority: 1 },
        ],
        fillOk: true,
        isUnranked: true,
      });
    }
  }

  return results;
}
