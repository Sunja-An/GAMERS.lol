export type Lane = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

export type Tier =
  | 'IRON'
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'EMERALD'
  | 'DIAMOND'
  | 'MASTER'
  | 'GRANDMASTER'
  | 'CHALLENGER'
  | 'UNRANKED';

export type Division = 'IV' | 'III' | 'II' | 'I';

export interface LanePreference {
  lane: Lane;
  priority: 1 | 2; // 1 = 1st choice, 2 = 2nd choice
}

export interface Player {
  puuid: string;
  gameName: string;
  tagLine: string;
  profileIconId: number;
  tier: Tier;
  division: Division;
  leaguePoints: number;
  powerScore: number;
  preferences: LanePreference[];
  fillOk: boolean;
  isUnranked?: boolean;
}

export interface PlayerLaneAssignment {
  player: Player;
  lane: Lane;
  preferenceStatus: '1st' | '2nd' | 'fill' | 'forced';
}

export interface Candidate {
  id: string;
  teamA: PlayerLaneAssignment[];
  teamB: PlayerLaneAssignment[];
  balanceScore: number;
  preferencePenalty: number;
  totalScore: number;
}

export interface ParsedRiotId {
  gameName: string;
  tagLine: string;
}
