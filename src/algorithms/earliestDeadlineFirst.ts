import { AlgorithmDecisionStep, AlgorithmResult, Scenario } from '../types';
import { evaluateAllRoutes } from './evaluator';
import { partitionCustomersForFleet } from './clustering';

/**
 * Earliest Deadline First (EDF) Heuristic
 * Prioritizes customer dispatch strictly by earliest deadline.
 * Complexity: O(N log N)
 */
export function runEarliestDeadlineFirst(scenario: Scenario): AlgorithmResult {
  const startTime = performance.now();
  const decisionSteps: AlgorithmDecisionStep[] = [];
  const partitions = partitionCustomersForFleet(scenario.customers, scenario.depot, scenario.fleetSize);
  const vehicleRoutes: number[][] = [];

  let stepCounter = 1;

  partitions.forEach((partition, vIdx) => {
    const vehicleId = vIdx + 1;
    // Sort strictly by ascending deadline
    const sortedByDeadline = [...partition].sort((a, b) => a.deadline - b.deadline);
    const route = sortedByDeadline.map((c) => c.id);

    sortedByDeadline.forEach((c) => {
      decisionSteps.push({
        step: stepCounter++,
        action: 'EDF_ORDER_SELECT',
        customerId: c.id,
        vehicleId,
        description: `Vehicle ${vehicleId} ordered Customer #${c.id} by deadline: ${c.deadline.toFixed(1)} min`,
        metricValue: c.deadline,
      });
    });

    vehicleRoutes.push(route);
  });

  const evalSummary = evaluateAllRoutes(vehicleRoutes, scenario);
  const endTime = performance.now();

  return {
    algorithmId: 'edf',
    algorithmName: 'Earliest Deadline First',
    shortName: 'EDF',
    ...evalSummary,
    executionTimeMs: Number((endTime - startTime).toFixed(3)),
    decisionSteps,
    theoreticalComplexity: 'O(N log N)',
  };
}
