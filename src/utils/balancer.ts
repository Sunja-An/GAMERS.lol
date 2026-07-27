import type {
  Player,
  Candidate,
  PlayerLaneAssignment,
  Lane,
} from '@/types/balancer';

export const LANES: Lane[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

/**
 * Returns preference penalty for a player assigned to a given lane.
 * 1st choice = 0 penalty
 * 2nd choice = 1 penalty
 * Fill OK = 3 penalty
 * Forced into unwanted lane = 10 penalty
 */
export function getPreferencePenalty(
  player: Player,
  lane: Lane
): { penalty: number; status: '1st' | '2nd' | 'fill' | 'forced' } {
  const pref1 = player.preferences.find((p) => p.priority === 1);
  if (pref1 && pref1.lane === lane) {
    return { penalty: 0, status: '1st' };
  }

  const pref2 = player.preferences.find((p) => p.priority === 2);
  if (pref2 && pref2.lane === lane) {
    return { penalty: 1, status: '2nd' };
  }

  if (player.fillOk) {
    return { penalty: 3, status: 'fill' };
  }

  return { penalty: 10, status: 'forced' };
}

/**
 * Generates all 5! = 120 permutations of lanes
 */

function generatePermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const perms = generatePermutations(remaining);
    for (const p of perms) {
      result.push([current, ...p]);
    }
  }
  return result;
}

const LANE_PERMUTATIONS = generatePermutations(LANES);

/**
 * Finds the optimal lane assignment for a 5-player team minimizing preference penalty.
 */
export function bestLaneAssignment(team: Player[]): {
  assignments: PlayerLaneAssignment[];
  penalty: number;
} {
  let bestAssignments: PlayerLaneAssignment[] | null = null;
  let minPenalty = Infinity;

  for (const perm of LANE_PERMUTATIONS) {
    let currentPenalty = 0;
    const currentAssignments: PlayerLaneAssignment[] = [];

    for (let i = 0; i < 5; i++) {
      const player = team[i];
      const lane = perm[i];
      const { penalty, status } = getPreferencePenalty(player, lane);

      currentPenalty += penalty;
      currentAssignments.push({
        player,
        lane,
        preferenceStatus: status,
      });
    }

    if (currentPenalty < minPenalty) {
      minPenalty = currentPenalty;
      bestAssignments = currentAssignments;
    }
  }

  return {
    assignments: bestAssignments ?? [],
    penalty: minPenalty,
  };
}

/**
 * Generates combinations of k elements from array
 */
function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  const head = arr[0];
  const tail = arr.slice(1);
  const withHead = combinations(tail, k - 1).map((c) => [head, ...c]);
  const withoutHead = combinations(tail, k);
  return [...withHead, ...withoutHead];
}

/**
 * Core Algorithm: Enumerates C(9,4) = 126 rosters, computes optimal lane assignments & total scores,
 * and returns top-K lowest total score candidates.
 */
export function generateTopKTeams(
  players: Player[],
  K: number = 10,
  wBalance: number = 1.0,
  wPreference: number = 20.0
): Candidate[] {
  if (players.length !== 10) {
    return [];
  }

  const fixed = players[0];
  const rest = players.slice(1); // 9 players

  const candidateList: Candidate[] = [];
  const combo4List = combinations(rest, 4); // 126 combinations

  let idCounter = 1;

  for (const combo of combo4List) {
    const teamAPlayers = [fixed, ...combo];
    const teamBPlayers = rest.filter((p) => !combo.includes(p));

    const assignA = bestLaneAssignment(teamAPlayers);
    const assignB = bestLaneAssignment(teamBPlayers);

    const sumPowerA = teamAPlayers.reduce((acc, p) => acc + p.powerScore, 0);
    const sumPowerB = teamBPlayers.reduce((acc, p) => acc + p.powerScore, 0);

    const balanceScore = Math.abs(sumPowerA - sumPowerB);
    const preferencePenalty = assignA.penalty + assignB.penalty;

    const totalScore = wBalance * balanceScore + wPreference * preferencePenalty;

    // Order assignments by LANE order (TOP -> JUNGLE -> MID -> ADC -> SUPPORT)
    const sortedTeamA = LANES.map(
      (lane) => assignA.assignments.find((a) => a.lane === lane)!
    );
    const sortedTeamB = LANES.map(
      (lane) => assignB.assignments.find((a) => a.lane === lane)!
    );

    candidateList.push({
      id: `candidate-${idCounter++}`,
      teamA: sortedTeamA,
      teamB: sortedTeamB,
      balanceScore,
      preferencePenalty,
      totalScore,
    });
  }

  // Sort ascending by totalScore
  candidateList.sort((a, b) => a.totalScore - b.totalScore);

  return candidateList.slice(0, K);
}

/**
 * Recompute Top-K with +/-3% jitter on base powerScore
 */
export function jitteredRecompute(
  originalPlayers: Player[],
  K: number = 10
): Candidate[] {
  const jitteredPlayers: Player[] = originalPlayers.map((p) => {
    // Jitter between 0.97 and 1.03
    const jitterFactor = 0.97 + Math.random() * 0.06;
    return {
      ...p,
      powerScore: Math.round(p.powerScore * jitterFactor),
    };
  });

  return generateTopKTeams(jitteredPlayers, K);
}

/**
 * Weighted random choice without replacement from candidate set.
 */
export function pickNextCandidate(
  candidates: Candidate[],
  shownIndices: Set<number>,
  originalPlayers: Player[]
): {
  chosenCandidate: Candidate;
  candidatePool: Candidate[];
  updatedShownIndices: Set<number>;
  wasRecomputed: boolean;
} {
  let currentCandidates = candidates;
  let currentShown = new Set(shownIndices);
  let wasRecomputed = false;

  let availableIndices = currentCandidates
    .map((_, idx) => idx)
    .filter((idx) => !currentShown.has(idx));

  if (availableIndices.length === 0) {
    // Exhaustion handling: automatic jittered recompute
    currentCandidates = jitteredRecompute(originalPlayers, candidates.length);
    currentShown = new Set();
    availableIndices = currentCandidates.map((_, idx) => idx);
    wasRecomputed = true;
  }

  // Weighted selection: weight = 1 / (rank + 1)
  const weights = availableIndices.map((idx) => 1 / (idx + 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let randomVal = Math.random() * totalWeight;
  let selectedIdx = availableIndices[0];

  for (let i = 0; i < availableIndices.length; i++) {
    randomVal -= weights[i];
    if (randomVal <= 0) {
      selectedIdx = availableIndices[i];
      break;
    }
  }

  currentShown.add(selectedIdx);

  return {
    chosenCandidate: currentCandidates[selectedIdx],
    candidatePool: currentCandidates,
    updatedShownIndices: currentShown,
    wasRecomputed,
  };
}
