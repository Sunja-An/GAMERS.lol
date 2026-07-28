import type { Region } from './region';

export type VerificationStatus = 'idle' | 'verifying' | 'verified' | 'unverified';

export interface VerifiedUserResult {
  id: string;
  gameName: string;
  tagLine: string;
  status: VerificationStatus;
  region: Region;
  puuid?: string;
  summonerLevel?: number;
  profileIconId?: number;
  message?: string;
}
