import { AlgorithmResult, Scenario } from '../types';
import { runNearestNeighbour } from './nearestNeighbour';
import { runEarliestDeadlineFirst } from './earliestDeadlineFirst';
import { runInsertionHeuristic } from './insertionHeuristic';
import { runInsertionWithTwoOpt } from './twoOpt';
import { runHeldKarp } from './heldKarp';

export type AlgorithmType = 'nn' | 'edf' | 'ins' | 'ins-2opt' | 'held-karp';

export const ALGORITHM_METADATA = [
  {
    id: 'nn' as AlgorithmType,
    name: 'Nearest Neighbour',
    shortName: 'NN',
    badge: 'Greedy Spatial',
    color: '#3b82f6',
    complexity: 'O(N²)',
    description: 'Greedily selects the closest unserved customer from the vehicle’s current location.',
  },
  {
    id: 'edf' as AlgorithmType,
    name: 'Earliest Deadline First',
    shortName: 'EDF',
    badge: 'Greedy Temporal',
    color: '#f59e0b',
    complexity: 'O(N log N)',
    description: 'Dispatches strictly in increasing order of customer deadlines without spatial lookahead.',
  },
  {
    id: 'ins' as AlgorithmType,
    name: 'Insertion Heuristic',
    shortName: 'INS',
    badge: 'Balanced Heuristic',
    color: '#10b981',
    complexity: 'O(N³)',
    description: 'Sequentially inserts customers in deadline order at min incremental distance positions.',
  },
  {
    id: 'ins-2opt' as AlgorithmType,
    name: 'Insertion + 2-Opt',
    shortName: 'INS + 2-opt',
    badge: 'Local Search Optimized',
    color: '#8b5cf6',
    complexity: 'O(N³)',
    description: 'Refines the insertion route via iterative segment reversals that preserve deadline feasibility.',
  },
  {
    id: 'held-karp' as AlgorithmType,
    name: 'Held-Karp Exact DP',
    shortName: 'Held-Karp',
    badge: 'Exact Benchmark',
    color: '#ec4899',
    complexity: 'O(N² · 2ᴺ)',
    description: 'Guaranteed optimal dynamic programming solver for single-vehicle instances (capped at N ≤ 14).',
  },
];

/**
 * Executes a specific algorithm on the given scenario.
 */
export function executeAlgorithm(type: AlgorithmType, scenario: Scenario): AlgorithmResult {
  switch (type) {
    case 'nn':
      return runNearestNeighbour(scenario);
    case 'edf':
      return runEarliestDeadlineFirst(scenario);
    case 'ins':
      return runInsertionHeuristic(scenario);
    case 'ins-2opt':
      return runInsertionWithTwoOpt(scenario);
    case 'held-karp':
      return runHeldKarp(scenario);
    default:
      return runNearestNeighbour(scenario);
  }
}

/**
 * Executes all 5 algorithms on the identical scenario for direct comparison.
 */
export function executeAllAlgorithms(scenario: Scenario): Record<AlgorithmType, AlgorithmResult> {
  return {
    nn: runNearestNeighbour(scenario),
    edf: runEarliestDeadlineFirst(scenario),
    ins: runInsertionHeuristic(scenario),
    'ins-2opt': runInsertionWithTwoOpt(scenario),
    'held-karp': runHeldKarp(scenario),
  };
}
