import { AlgorithmDecisionStep, AlgorithmResult, Scenario } from '../types';
import { euclideanDistance, evaluateAllRoutes } from './evaluator';
import { partitionCustomersForFleet } from './clustering';

/**
 * Nearest Neighbour (NN) Heuristic
 * Greedily selects the unserved customer closest to the vehicle's current location.
 * Complexity: O(N^2)
 */
export function runNearestNeighbour(scenario: Scenario): AlgorithmResult {
  const startTime = performance.now();
  const decisionSteps: AlgorithmDecisionStep[] = [];
  const partitions = partitionCustomersForFleet(scenario.customers, scenario.depot, scenario.fleetSize);
  const vehicleRoutes: number[][] = [];

  let stepCounter = 1;

  partitions.forEach((partition, vIdx) => {
    const vehicleId = vIdx + 1;
    const unvisited = new Map(partition.map((c) => [c.id, c]));
    const route: number[] = [];
    let currentLocation = { x: scenario.depot.x, y: scenario.depot.y };

    while (unvisited.size > 0) {
      let nearestId = -1;
      let minDistance = Infinity;

      for (const [id, cust] of unvisited.entries()) {
        const d = euclideanDistance(currentLocation, cust);
        if (d < minDistance) {
          minDistance = d;
          nearestId = id;
        }
      }

      if (nearestId !== -1) {
        const chosen = unvisited.get(nearestId)!;
        route.push(nearestId);
        unvisited.delete(nearestId);

        decisionSteps.push({
          step: stepCounter++,
          action: 'NEAREST_NEIGHBOUR_SELECT',
          customerId: nearestId,
          vehicleId,
          description: `Vehicle ${vehicleId} dispatched to Customer #${nearestId} at dist ${minDistance.toFixed(1)} (Deadline: ${chosen.deadline.toFixed(1)} min)`,
          metricValue: Number(minDistance.toFixed(2)),
        });

        currentLocation = { x: chosen.x, y: chosen.y };
      }
    }

    vehicleRoutes.push(route);
  });

  const evalSummary = evaluateAllRoutes(vehicleRoutes, scenario);
  const endTime = performance.now();

  return {
    algorithmId: 'nn',
    algorithmName: 'Nearest Neighbour',
    shortName: 'NN',
    ...evalSummary,
    executionTimeMs: Number((endTime - startTime).toFixed(3)),
    decisionSteps,
    theoreticalComplexity: 'O(N²)',
  };
}
