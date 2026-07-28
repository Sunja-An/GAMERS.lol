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
 * Hungarian Algorithm (Kuhn-Munkres) for minimum-cost bipartite perfect matching.
 *
 * Solves: given an n×n cost matrix, find the assignment of rows to columns
 * that minimizes total cost. O(n³) — as specified in GAMERS.lol.md §6.2.
 *
 * Implementation: Jonker-Volgenant style with potential (dual variable) approach.
 * For n=5 this is ~125 inner operations — effectively constant time.
 *
 * @param costMatrix - n×n matrix where costMatrix[i][j] = cost of assigning row i to col j
 * @returns assignment array where assignment[i] = column assigned to row i
 */
function hungarianAlgorithm(costMatrix: number[][]): number[] {
  const n = costMatrix.length;

  // u[i] = dual potential for row i (1-indexed, u[0] unused)
  // v[j] = dual potential for col j (1-indexed, v[0] = unmatched sentinel)
  const u = new Array(n + 1).fill(0);
  const v = new Array(n + 1).fill(0);

  // p[j] = which row is matched to column j (1-indexed; p[0] = unmatched col sentinel)
  const p = new Array(n + 1).fill(0);

  // way[j] = which column j was reached from (for path reconstruction)
  const way = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    // Augmenting path for row i
    p[0] = i;
    let j0 = 0; // start from sentinel column 0

    // minDist[j] = min reduced cost to reach column j from current row
    const minDist = new Array(n + 1).fill(Infinity);
    const used = new Array(n + 1).fill(false);

    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = -1;

      for (let j = 1; j <= n; j++) {
        if (!used[j]) {
          // Reduced cost: costMatrix is 0-indexed, potentials are 1-indexed
          const reducedCost = costMatrix[i0 - 1][j - 1] - u[i0] - v[j];
          if (reducedCost < minDist[j]) {
            minDist[j] = reducedCost;
            way[j] = j0;
          }
          if (minDist[j] < delta) {
            delta = minDist[j];
            j1 = j;
          }
        }
      }

      // Update potentials
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minDist[j] -= delta;
        }
      }

      j0 = j1!;
    } while (p[j0] !== 0); // until we reach an unmatched column

    // Augment along the path
    do {
      p[j0] = p[way[j0]];
      j0 = way[j0];
    } while (j0 !== 0);
  }

  // Build result: assignment[row] = col (both 0-indexed)
  const assignment = new Array(n).fill(0);
  for (let j = 1; j <= n; j++) {
    if (p[j] !== 0) {
      assignment[p[j] - 1] = j - 1;
    }
  }

  return assignment;
}

/**
 * Finds the optimal lane assignment for a 5-player team minimizing preference penalty.
 * Uses the Hungarian Algorithm (Kuhn-Munkres) — O(n³) — as specified in §6.2.
 * Replaces the previous brute-force 5! = 120 permutation search.
 */
export function bestLaneAssignment(team: Player[]): {
  assignments: PlayerLaneAssignment[];
  penalty: number;
} {
  const n = team.length; // expected to be 5

  // Build n×n cost matrix: costMatrix[i][j] = penalty of assigning team[i] to LANES[j]
  const costMatrix: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => getPreferencePenalty(team[i], LANES[j] as Lane).penalty)
  );

  // Run Hungarian Algorithm to get optimal assignment
  const laneIndices = hungarianAlgorithm(costMatrix);

  // Build result assignments and compute total penalty
  let totalPenalty = 0;
  const assignments: PlayerLaneAssignment[] = [];

  for (let i = 0; i < n; i++) {
    const lane = LANES[laneIndices[i]] as Lane;
    const { penalty, status } = getPreferencePenalty(team[i], lane);
    totalPenalty += penalty;
    assignments.push({
      player: team[i],
      lane,
      preferenceStatus: status,
    });
  }

  return {
    assignments,
    penalty: totalPenalty,
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
