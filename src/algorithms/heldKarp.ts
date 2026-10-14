import { AlgorithmDecisionStep, AlgorithmResult, Customer, Scenario } from '../types';
import { euclideanDistance, evaluateAllRoutes } from './evaluator';
import { runInsertionWithTwoOpt } from './twoOpt';

export const HELD_KARP_MAX_SAFE_N = 14;

/**
 * Held-Karp Exact Dynamic Programming
 * Computes the exact optimal tour for small single-vehicle instances (N <= 14)
 * using bitmask dynamic programming over state (mask, currentVertex).
 * Complexity: O(N² · 2ᴺ), Space: O(N · 2ᴺ)
 */
export function runHeldKarp(scenario: Scenario): AlgorithmResult {
  const n = scenario.customers.length;

  // Safety check: protect browser from freezing on exponential search
  if (n > HELD_KARP_MAX_SAFE_N || scenario.fleetSize > 1) {
    const fallbackResult = runInsertionWithTwoOpt(scenario);
    return {
      ...fallbackResult,
      algorithmId: 'held-karp',
      algorithmName: 'Held-Karp (Exact DP - Exceeded Safe Limit)',
      shortName: 'Held-Karp',
      warning:
        scenario.fleetSize > 1
          ? `Held-Karp exact formulation is single-vehicle TSP DP. For fleet size ${scenario.fleetSize}, exact m-TSP state space is intractable. Showing INS + 2-opt solution instead.`
          : `Instance size (N = ${n}) exceeds the safe exact limit of N ≤ ${HELD_KARP_MAX_SAFE_N}. The Held-Karp state space requires O(N² · 2ᴺ) operations (~${Math.pow(2, n).toLocaleString()} bit states). Computation capped to prevent browser thread freeze; displaying INS + 2-opt benchmark.`,
      theoreticalComplexity: 'O(N² · 2ᴺ)',
    };
  }

  const startTime = performance.now();
  const decisionSteps: AlgorithmDecisionStep[] = [];
  const depot = scenario.depot;
  const customers = scenario.customers;
  const numStates = 1 << n;

  // DP table structures:
  // dpDist[mask][u]: min distance
  // dpOnTime[mask][u]: count of on-time deliveries
  // dpTime[mask][u]: arrival time
  // parent[mask][u]: previous node index (0..n-1, or -1 for depot)
  const dpDist: Float64Array[] = Array.from({ length: numStates }, () => new Float64Array(n).fill(Infinity));
  const dpOnTime: Int32Array[] = Array.from({ length: numStates }, () => new Int32Array(n).fill(-1));
  const dpTime: Float64Array[] = Array.from({ length: numStates }, () => new Float64Array(n).fill(Infinity));
  const parent: Int8Array[] = Array.from({ length: numStates }, () => new Int8Array(n).fill(-1));

  // Base cases: paths of length 1 starting from depot to customer i
  for (let i = 0; i < n; i++) {
    const cust = customers[i];
    const dist = euclideanDistance(depot, cust);
    const arrivalTime = dist / scenario.vehicleSpeed;
    const mask = 1 << i;

    dpDist[mask][i] = dist;
    dpTime[mask][i] = arrivalTime;
    dpOnTime[mask][i] = arrivalTime <= cust.deadline + 1e-6 ? 1 : 0;
    parent[mask][i] = -1; // depot
  }

  // Iterate over subset sizes from 2 to n
  for (let mask = 1; mask < numStates; mask++) {
    // Count bits
    const bitCount = countBits(mask);
    if (bitCount <= 1) continue;

    for (let u = 0; u < n; u++) {
      if ((mask & (1 << u)) === 0) continue; // u must be in mask

      const prevMask = mask ^ (1 << u);
      const custU = customers[u];

      for (let v = 0; v < n; v++) {
        if ((prevMask & (1 << v)) === 0) continue; // v was previous vertex
        if (dpDist[prevMask][v] === Infinity) continue;

        const prevCust = customers[v];
        const stepDist = euclideanDistance(prevCust, custU);
        const totalDist = dpDist[prevMask][v] + stepDist;
        // Travel starts after service duration at v
        const departV = dpTime[prevMask][v] + scenario.serviceDuration;
        const arrivalU = departV + stepDist / scenario.vehicleSpeed;
        const isOnTimeU = arrivalU <= custU.deadline + 1e-6 ? 1 : 0;
        const totalOnTime = dpOnTime[prevMask][v] + isOnTimeU;

        // Lexicographic comparison:
        // Primary: maximize on-time deliveries
        // Secondary: minimize total distance
        const currentBestOnTime = dpOnTime[mask][u];
        const currentBestDist = dpDist[mask][u];

        const isBetter =
          totalOnTime > currentBestOnTime ||
          (totalOnTime === currentBestOnTime && totalDist < currentBestDist);

        if (isBetter) {
          dpDist[mask][u] = totalDist;
          dpOnTime[mask][u] = totalOnTime;
          dpTime[mask][u] = arrivalU;
          parent[mask][u] = v;
        }
      }
    }
  }

  // Complete tour by returning to depot
  const fullMask = numStates - 1;
  let bestLastNode = -1;
  let bestTotalTourDist = Infinity;
  let bestTourOnTime = -1;

  for (let u = 0; u < n; u++) {
    if (dpDist[fullMask][u] === Infinity) continue;
    const returnDist = euclideanDistance(customers[u], depot);
    const tourDist = dpDist[fullMask][u] + returnDist;
    const tourOnTime = dpOnTime[fullMask][u];

    const isBetter =
      tourOnTime > bestTourOnTime ||
      (tourOnTime === bestTourOnTime && tourDist < bestTotalTourDist);

    if (isBetter) {
      bestTourOnTime = tourOnTime;
      bestTotalTourDist = tourDist;
      bestLastNode = u;
    }
  }

  // Reconstruct route order
  const routeCustomerIds: number[] = [];
  if (bestLastNode !== -1) {
    let currMask = fullMask;
    let currNode = bestLastNode;

    while (currNode !== -1) {
      routeCustomerIds.unshift(customers[currNode].id);
      const prevNode = parent[currMask][currNode];
      currMask = currMask ^ (1 << currNode);
      currNode = prevNode;
    }
  }

  decisionSteps.push({
    step: 1,
    action: 'HELD_KARP_DP_OPTIMAL',
    description: `Exact dynamic programming explored ${numStates} bitmask states; found globally optimal order with ${bestTourOnTime}/${n} on-time deliveries and distance ${bestTotalTourDist.toFixed(1)}.`,
    metricValue: Number(bestTotalTourDist.toFixed(2)),
  });

  const evalSummary = evaluateAllRoutes([routeCustomerIds], scenario);
  const endTime = performance.now();

  return {
    algorithmId: 'held-karp',
    algorithmName: 'Held-Karp Exact DP',
    shortName: 'Held-Karp',
    ...evalSummary,
    executionTimeMs: Number((endTime - startTime).toFixed(3)),
    decisionSteps,
    theoreticalComplexity: 'O(N² · 2ᴺ)',
    warning:
      'Exact dynamic programming guarantees mathematical optimality for single-vehicle instances within its state limit.',
  };
}

function countBits(n: number): number {
  let count = 0;
  while (n > 0) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}
